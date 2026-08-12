package app_test

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/http/httptest"
	"path/filepath"
	"sync"
	"testing"
	"time"

	"github.com/gobuffalo/envy"
	"github.com/labstack/echo/v5"
	"github.com/moul-dev/moul-dev/internal/db"
	"github.com/moul-dev/moul-dev/internal/schema"
	"github.com/moul-dev/moul-dev/internal/worker"
	"github.com/moul-dev/moul-dev/pkg/app"
	"github.com/pocketbase/dbx"
)

func initTestEnv() {
	envy.Set("MOUL_JWT_SECRET", "test-jwt-secret-key-32-bytes-minimum!!")
	envy.Set("MOUL_ADMIN_KEY", "test-admin-key")
}

func newTestApp(t *testing.T) *app.App {
	initTestEnv()
	dbPath := filepath.Join(t.TempDir(), "moul-test.db")
	return app.New(app.Config{
		DBPath:    dbPath,
		Env:       "test",
		Version:   "test-integration-1.0",
		JWTSecret: "test-jwt-secret-key-32-bytes-minimum!!",
		AdminKey:  "test-admin-key",
	})
}

func setupWorkerMoulTable(dbConn *dbx.DB, tableName string) error {
	moul := &schema.Moul{
		ID:   "moul-" + tableName,
		Name: tableName,
		Type: "worker",
	}
	if err := db.CreateMoulTable(dbConn, moul); err != nil {
		return err
	}
	return db.SaveMoulMetadata(dbConn, moul)
}

func waitForWaitGroup(t *testing.T, wg *sync.WaitGroup, timeout time.Duration) {
	t.Helper()
	done := make(chan struct{})
	go func() {
		defer close(done)
		wg.Wait()
	}()
	select {
	case <-done:
		// Completed within timeout
	case <-time.After(timeout):
		t.Fatalf("timed out waiting for worker execution after %v", timeout)
	}
}

func TestHooksIntegration_ExecutionOrderingAndMultiHooks(t *testing.T) {
	a := newTestApp(t)

	var executionLog []string

	a.OnWorkerInit(func(engine *worker.Engine) error {
		executionLog = append(executionLog, "worker-1")
		return nil
	})
	a.OnWorkerInit(func(engine *worker.Engine) error {
		executionLog = append(executionLog, "worker-2")
		return nil
	})

	a.OnRouterInit(func(r *echo.Echo) error {
		executionLog = append(executionLog, "router-1")
		return nil
	})
	a.OnRouterInit(func(r *echo.Echo) error {
		executionLog = append(executionLog, "router-2")
		return nil
	})

	a.OnBeforeStart(func(moulApp *app.App) error {
		executionLog = append(executionLog, "beforeStart-1")
		return nil
	})
	a.OnBeforeStart(func(moulApp *app.App) error {
		executionLog = append(executionLog, "beforeStart-2")
		return nil
	})

	if err := a.Bootstrap(); err != nil {
		t.Fatalf("Bootstrap failed: %v", err)
	}

	expectedOrder := []string{
		"worker-1",
		"worker-2",
		"router-1",
		"router-2",
		"beforeStart-1",
		"beforeStart-2",
	}

	if len(executionLog) != len(expectedOrder) {
		t.Fatalf("Expected %d execution logs, got %d: %v", len(expectedOrder), len(executionLog), executionLog)
	}

	for i, expected := range expectedOrder {
		if executionLog[i] != expected {
			t.Errorf("At step %d, expected %q, got %q (full log: %v)", i, expected, executionLog[i], executionLog)
		}
	}
}

func TestHooksIntegration_OnBeforeStart(t *testing.T) {
	a := newTestApp(t)

	beforeStartExecuted := false

	a.OnBeforeStart(func(moulApp *app.App) error {
		// 1. Ensure all services are fully initialized
		if moulApp.DB() == nil {
			return fmt.Errorf("app.DB() is nil in OnBeforeStart")
		}
		if moulApp.Router() == nil {
			return fmt.Errorf("app.Router() is nil in OnBeforeStart")
		}
		if moulApp.WorkerEngine() == nil {
			return fmt.Errorf("app.WorkerEngine() is nil in OnBeforeStart")
		}
		if moulApp.AnalyticsEngine() == nil {
			return fmt.Errorf("app.AnalyticsEngine() is nil in OnBeforeStart")
		}

		// 2. Perform custom DB DDL and initial data seeding
		_, err := moulApp.DB().NewQuery(`
			CREATE TABLE IF NOT EXISTS system_config (
				key TEXT PRIMARY KEY,
				value TEXT NOT NULL
			)
		`).Execute()
		if err != nil {
			return fmt.Errorf("failed to create system_config table: %w", err)
		}

		_, err = moulApp.DB().NewQuery(`
			INSERT INTO system_config (key, value) VALUES ('theme', 'dark'), ('maintenance', 'false')
		`).Execute()
		if err != nil {
			return fmt.Errorf("failed to insert system_config data: %w", err)
		}

		beforeStartExecuted = true
		return nil
	})

	if err := a.Bootstrap(); err != nil {
		t.Fatalf("Bootstrap failed: %v", err)
	}

	if !beforeStartExecuted {
		t.Fatalf("OnBeforeStart hook was not executed")
	}

	// Verify that table and data persisted in DB
	var value string
	err := a.DB().Select("value").From("system_config").Where(dbx.HashExp{"key": "theme"}).Row(&value)
	if err != nil {
		t.Fatalf("Failed to query system_config table: %v", err)
	}
	if value != "dark" {
		t.Errorf("Expected theme 'dark', got %q", value)
	}
}

func TestHooksIntegration_OnRouterInit(t *testing.T) {
	a := newTestApp(t)

	// Use OnBeforeStart to prepare table
	a.OnBeforeStart(func(moulApp *app.App) error {
		_, err := moulApp.DB().NewQuery(`
			CREATE TABLE IF NOT EXISTS custom_products (
				id TEXT PRIMARY KEY,
				name TEXT NOT NULL,
				price INT NOT NULL
			)
		`).Execute()
		if err != nil {
			return err
		}
		_, err = moulApp.DB().NewQuery(`
			INSERT INTO custom_products (id, name, price) VALUES ('p-100', 'Gadget', 99)
		`).Execute()
		return err
	})

	// Use OnRouterInit to configure custom router group, custom middleware, and custom route
	a.OnRouterInit(func(router *echo.Echo) error {
		// Custom middleware on router
		router.Use(func(next echo.HandlerFunc) echo.HandlerFunc {
			return func(c *echo.Context) error {
				c.Response().Header().Set("X-Custom-Framework-Plugin", "v1")
				return next(c)
			}
		})

		v1Group := router.Group("/api/v1/plugin")
		v1Group.GET("/products/:id", func(c *echo.Context) error {
			id := c.Param("id")
			var item struct {
				ID    string `db:"id" json:"id"`
				Name  string `db:"name" json:"name"`
				Price int    `db:"price" json:"price"`
			}
			err := a.DB().Select("id", "name", "price").From("custom_products").Where(dbx.HashExp{"id": id}).One(&item)
			if err != nil {
				return c.JSON(http.StatusNotFound, map[string]string{"error": "product not found"})
			}
			return c.JSON(http.StatusOK, item)
		})

		return nil
	})

	if err := a.Bootstrap(); err != nil {
		t.Fatalf("Bootstrap failed: %v", err)
	}

	server := httptest.NewServer(a.Router())
	defer server.Close()

	// Test HTTP GET /api/v1/plugin/products/p-100
	resp, err := http.Get(server.URL + "/api/v1/plugin/products/p-100")
	if err != nil {
		t.Fatalf("HTTP request failed: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		t.Errorf("Expected status 200, got %d", resp.StatusCode)
	}

	if headerVal := resp.Header.Get("X-Custom-Framework-Plugin"); headerVal != "v1" {
		t.Errorf("Expected X-Custom-Framework-Plugin header 'v1', got %q", headerVal)
	}

	body, _ := io.ReadAll(resp.Body)
	var prod struct {
		ID    string `json:"id"`
		Name  string `json:"name"`
		Price int    `json:"price"`
	}
	if err := json.Unmarshal(body, &prod); err != nil {
		t.Fatalf("Failed to parse JSON body: %v", err)
	}

	if prod.ID != "p-100" || prod.Name != "Gadget" || prod.Price != 99 {
		t.Errorf("Unexpected product response payload: %+v", prod)
	}

	// Test 404 case
	resp404, err := http.Get(server.URL + "/api/v1/plugin/products/non-existent")
	if err != nil {
		t.Fatalf("HTTP 404 request failed: %v", err)
	}
	defer resp404.Body.Close()
	if resp404.StatusCode != http.StatusNotFound {
		t.Errorf("Expected status 404 for missing item, got %d", resp404.StatusCode)
	}
}

func TestHooksIntegration_OnWorkerInit(t *testing.T) {
	a := newTestApp(t)

	var wg sync.WaitGroup
	wg.Add(1)

	// Table for worker execution recording & worker moul setup
	a.OnBeforeStart(func(moulApp *app.App) error {
		if err := setupWorkerMoulTable(moulApp.DB(), "notification_tasks"); err != nil {
			return err
		}

		_, err := moulApp.DB().NewQuery(`
			CREATE TABLE IF NOT EXISTS processed_notifications (
				id TEXT PRIMARY KEY,
				recipient TEXT NOT NULL,
				status TEXT NOT NULL
			)
		`).Execute()
		return err
	})

	// OnWorkerInit registers a worker that writes to processed_notifications
	a.OnWorkerInit(func(engine *worker.Engine) error {
		engine.Register("SendNotificationWorker", func(ctx context.Context, job *worker.Job) error {
			defer wg.Done()
			id, _ := job.Args["id"].(string)
			recipient, _ := job.Args["recipient"].(string)

			_, err := a.DB().NewQuery(`
				INSERT INTO processed_notifications (id, recipient, status) VALUES ({:id}, {:recipient}, 'SENT')
			`).Bind(map[string]interface{}{
				"id":        id,
				"recipient": recipient,
			}).Execute()
			return err
		})
		return nil
	})

	if err := a.Bootstrap(); err != nil {
		t.Fatalf("Bootstrap failed: %v", err)
	}

	// Start worker engine in background
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	a.WorkerEngine().Start(ctx)
	defer a.WorkerEngine().Stop()

	// Enqueue job via worker engine
	jobOpts := map[string]interface{}{
		"worker": "SendNotificationWorker",
		"args": map[string]interface{}{
			"id":        "notif-1",
			"recipient": "user@example.com",
		},
	}
	_, err := a.WorkerEngine().Enqueue(ctx, "notification_tasks", jobOpts)
	if err != nil {
		t.Fatalf("Failed to enqueue job: %v", err)
	}
	a.WorkerEngine().Trigger("notification_tasks", "")

	// Wait for worker handler execution with 5s safety timeout
	waitForWaitGroup(t, &wg, 5*time.Second)

	// Verify database record
	var recipient, status string
	err = a.DB().Select("recipient", "status").From("processed_notifications").Where(dbx.HashExp{"id": "notif-1"}).Row(&recipient, &status)
	if err != nil {
		t.Fatalf("Failed to query processed_notifications: %v", err)
	}

	if recipient != "user@example.com" || status != "SENT" {
		t.Errorf("Unexpected record state: recipient=%q, status=%q", recipient, status)
	}
}

func TestHooksIntegration_FullEmbeddedAppE2E(t *testing.T) {
	a := newTestApp(t)

	var wg sync.WaitGroup
	wg.Add(1)

	// 1. OnBeforeStart setup database tables & worker moul
	a.OnBeforeStart(func(moulApp *app.App) error {
		if err := setupWorkerMoulTable(moulApp.DB(), "order_tasks"); err != nil {
			return err
		}

		_, err := moulApp.DB().NewQuery(`
			CREATE TABLE IF NOT EXISTS orders (
				id TEXT PRIMARY KEY,
				item TEXT NOT NULL,
				status TEXT NOT NULL
			)
		`).Execute()
		return err
	})

	// 2. OnWorkerInit register job to update order status
	a.OnWorkerInit(func(engine *worker.Engine) error {
		engine.Register("ProcessOrderJob", func(ctx context.Context, job *worker.Job) error {
			defer wg.Done()
			orderID, _ := job.Args["order_id"].(string)

			_, err := a.DB().NewQuery(`
				UPDATE orders SET status = 'COMPLETED' WHERE id = {:id}
			`).Bind(map[string]interface{}{"id": orderID}).Execute()
			return err
		})
		return nil
	})

	// 3. OnRouterInit register POST endpoint that creates order and enqueues worker job
	a.OnRouterInit(func(router *echo.Echo) error {
		router.POST("/api/orders", func(c *echo.Context) error {
			var body struct {
				ID   string `json:"id"`
				Item string `json:"item"`
			}
			if err := c.Bind(&body); err != nil {
				return c.JSON(http.StatusBadRequest, map[string]string{"error": err.Error()})
			}

			// Insert pending order
			_, err := a.DB().NewQuery(`
				INSERT INTO orders (id, item, status) VALUES ({:id}, {:item}, 'PENDING')
			`).Bind(map[string]interface{}{
				"id":   body.ID,
				"item": body.Item,
			}).Execute()
			if err != nil {
				return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
			}

			// Enqueue background processing job
			jobOpts := map[string]interface{}{
				"worker": "ProcessOrderJob",
				"args": map[string]interface{}{
					"order_id": body.ID,
				},
			}
			_, err = a.WorkerEngine().Enqueue(c.Request().Context(), "order_tasks", jobOpts)
			if err != nil {
				return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
			}
			a.WorkerEngine().Trigger("order_tasks", "")

			return c.JSON(http.StatusCreated, map[string]string{
				"id":     body.ID,
				"status": "PENDING",
			})
		})
		return nil
	})

	if err := a.Bootstrap(); err != nil {
		t.Fatalf("Bootstrap failed: %v", err)
	}

	// Start HTTP server & Worker Engine
	server := httptest.NewServer(a.Router())
	defer server.Close()

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	a.WorkerEngine().Start(ctx)
	defer a.WorkerEngine().Stop()

	// Perform HTTP POST /api/orders
	orderPayload := map[string]string{
		"id":   "ord-999",
		"item": "Embedded Framework License",
	}
	payloadBytes, _ := json.Marshal(orderPayload)

	resp, err := http.Post(server.URL+"/api/orders", "application/json", bytes.NewBuffer(payloadBytes))
	if err != nil {
		t.Fatalf("POST /api/orders failed: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusCreated {
		respBody, _ := io.ReadAll(resp.Body)
		t.Fatalf("Expected status 201 Created, got %d: %s", resp.StatusCode, string(respBody))
	}

	// Wait for background worker handler execution with 5s safety timeout
	waitForWaitGroup(t, &wg, 5*time.Second)

	// Verify order status in DB was updated to COMPLETED
	var status string
	err = a.DB().Select("status").From("orders").Where(dbx.HashExp{"id": "ord-999"}).Row(&status)
	if err != nil {
		t.Fatalf("Failed to query order status from DB: %v", err)
	}

	if status != "COMPLETED" {
		t.Errorf("Order status was not updated to COMPLETED, got %q", status)
	}
}

func TestHooksIntegration_ErrorHandling(t *testing.T) {
	// 1. Worker hook error
	a1 := newTestApp(t)
	a1.OnWorkerInit(func(engine *worker.Engine) error {
		return fmt.Errorf("custom worker init failure")
	})
	err1 := a1.Bootstrap()
	if err1 == nil || err1.Error() != "worker init hook failed: custom worker init failure" {
		t.Errorf("Unexpected error for worker hook failure: %v", err1)
	}

	// 2. Router hook error
	a2 := newTestApp(t)
	a2.OnRouterInit(func(router *echo.Echo) error {
		return fmt.Errorf("custom router init failure")
	})
	err2 := a2.Bootstrap()
	if err2 == nil || err2.Error() != "router init hook failed: custom router init failure" {
		t.Errorf("Unexpected error for router hook failure: %v", err2)
	}

	// 3. BeforeStart hook error
	a3 := newTestApp(t)
	a3.OnBeforeStart(func(moulApp *app.App) error {
		return fmt.Errorf("custom before start failure")
	})
	err3 := a3.Bootstrap()
	if err3 == nil || err3.Error() != "before start hook failed: custom before start failure" {
		t.Errorf("Unexpected error for before start hook failure: %v", err3)
	}
}
