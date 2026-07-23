export MOUL_ENV ?= development
export MOUL_JWT_SECRET ?= test-secret-key-for-unit-tests-1234
export MOUL_ADMIN_KEY ?= test-admin-key-1234

.PHONY: run restore dev build test-go test-flow clean-db test-worker test-analytics test-coverage run-tui build-tui minio-start minio-setup test-tui

# Start the Echo server locally
run:
	go run cmd/moul-dev/main.go start

# Restore database from Litestream S3 backup
restore:
	go run cmd/moul-dev/main.go restore

# Start the watcher for live-reload development
dev:
	air -c .air.toml

# Build for production with stripped debug symbols and metadata
build:
	mkdir -p bin
	go build -ldflags="-s -w" -o bin/moul-dev cmd/moul-dev/main.go

# Run the Go unit and integration tests
test-go:
	GOTOOLCHAIN=go1.25.8 go test -v -cover ./internal/...

# Run tests and output coverage report
test-coverage:
	GOTOOLCHAIN=go1.25.8 go test -v -coverprofile=coverage.out ./internal/...
	GOTOOLCHAIN=go1.25.8 go tool cover -func=coverage.out

# Remove SQLite database
clean-db:
	rm -f moul-local.db

# Run the complete API testing flow (dynamic moul, auth, records CRUD, rule enforcement)
test-flow:
	@curl -s http://localhost:8090/api/moul >/dev/null || (echo "ERROR: Server is not running on http://localhost:8090.\n\nPlease start the server by running 'make run' in a separate terminal window first, then run 'make test-flow' again.\n" && exit 1)
	@echo "=== 1. Creating 'users' auth moul ==="
	curl -s -X POST http://localhost:8090/api/moul \
		-H "X-Admin-Key: $(MOUL_ADMIN_KEY)" \
		-H "Content-Type: application/json" \
		-d '{"name": "users", "type": "auth", "rules": {"listRule": "", "viewRule": "auth.id == id", "createRule": "", "updateRule": "auth.id == id", "deleteRule": "auth.id == id"}}'
	@echo "\n"

	@echo "=== 2. Creating 'posts' base moul ==="
	curl -s -X POST http://localhost:8090/api/moul \
		-H "X-Admin-Key: $(MOUL_ADMIN_KEY)" \
		-H "Content-Type: application/json" \
		-d '{"name": "posts", "type": "base", "fields": [{"name": "title", "type": "text"}, {"name": "body", "type": "text"}, {"name": "author_id", "type": "text"}, {"name": "files", "type": "file"}], "rules": {"listRule": "", "viewRule": "", "createRule": "auth.id != nil", "updateRule": "auth.id == author_id", "deleteRule": "auth.id == author_id"}}'
	@echo "\n"

	@echo "=== 3. Listing all registered moul ==="
	curl -s http://localhost:8090/api/moul
	@echo "\n"

	@echo "=== 4-11. Executing Record CRUD and Authentication Flow ==="
	@USER_RESP=$$(curl -s -X POST http://localhost:8090/api/moul/users/records \
		-H "Content-Type: application/json" \
		-d '{"username": "usera", "email": "usera@example.com", "password": "Password1", "passwordConfirm": "Password1"}'); \
	echo "=== 4. Registering a new user (User A) ==="; \
	echo "$$USER_RESP"; \
	USER_ID=$$(echo "$$USER_RESP" | grep -o '"id":"[^"]*' | cut -d'"' -f4); \
	echo "Registered User ID: $$USER_ID\n"; \
	\
	echo "=== 5. Logging in User A to get JWT ==="; \
	AUTH_RESP=$$(curl -s -X POST http://localhost:8090/api/moul/users/auth-with-password \
		-H "Content-Type: application/json" \
		-d '{"identity": "usera@example.com", "password": "Password1"}'); \
	echo "$$AUTH_RESP"; \
	TOKEN=$$(echo "$$AUTH_RESP" | grep -o '"token":"[^"]*' | cut -d'"' -f4); \
	echo "JWT Token: $$TOKEN\n"; \
	\
	echo "=== 6. Attempting to create a post without JWT (Should fail with 401) ==="; \
	curl -i -s -X POST http://localhost:8090/api/moul/posts/records \
		-H "Content-Type: application/json" \
		-d '{"title": "Unauthenticated Post", "body": "This should fail", "author_id": "'$$USER_ID'"}'; \
	echo "\n"; \
	\
	echo "=== 7. Uploading an attachment (Should succeed) ==="; \
	echo "test file contents" > test_doc.txt; \
	UPLOAD_RESP=$$(curl -s -X POST http://localhost:8090/api/upload \
		-H "Authorization: Bearer $$TOKEN" \
		-F "file=@test_doc.txt"); \
	echo "Upload Response: $$UPLOAD_RESP\n"; \
	rm test_doc.txt; \
	\
	echo "=== 7b. Creating a post with JWT and file attachments (Should succeed) ==="; \
	POST_RESP=$$(curl -s -X POST http://localhost:8090/api/moul/posts/records \
		-H "Authorization: Bearer $$TOKEN" \
		-H "Content-Type: application/json" \
		-d '{"title": "Hello Moul World!", "body": "Dynamic collections are awesome.", "author_id": "'$$USER_ID'", "files": '$$UPLOAD_RESP'}'); \
	echo "$$POST_RESP"; \
	POST_ID=$$(echo "$$POST_RESP" | grep -o '"id":"[^"]*' | cut -d'"' -f4); \
	echo "Created Post ID: $$POST_ID\n"; \
	\
	echo "=== 8. Listing posts ==="; \
	curl -s http://localhost:8090/api/moul/posts/records; \
	echo "\n"; \
	\
	echo "=== 9. Attempting to update post as an anonymous user (Should fail with 401) ==="; \
	curl -i -s -X PATCH http://localhost:8090/api/moul/posts/records/$$POST_ID \
		-H "Content-Type: application/json" \
		-d '{"title": "Updated Title (Anon)"}'; \
	echo "\n"; \
	\
	echo "=== 10. Updating the post as User A (Should succeed) ==="; \
	curl -s -X PATCH http://localhost:8090/api/moul/posts/records/$$POST_ID \
		-H "Authorization: Bearer $$TOKEN" \
		-H "Content-Type: application/json" \
		-d '{"title": "Updated Title (Owner)"}'; \
	echo "\n"; \
	\
	echo "=== 11. Deleting the post as User A (Should succeed) ==="; \
	curl -i -s -X DELETE http://localhost:8090/api/moul/posts/records/$$POST_ID \
		-H "Authorization: Bearer $$TOKEN"; \
	echo "\n"

	@echo "=== 12. Cleaning up: Deleting 'posts' and 'users' moul ==="
	curl -i -s -X DELETE http://localhost:8090/api/moul/posts \
		-H "X-Admin-Key: $(MOUL_ADMIN_KEY)"
	@echo "\n"
	curl -i -s -X DELETE http://localhost:8090/api/moul/users \
		-H "X-Admin-Key: $(MOUL_ADMIN_KEY)"
	@echo "\n"
	@echo "=== Flow Test Complete! ==="

# Run the background job processing flow tests
test-worker:
	@curl -s http://localhost:8090/api/moul >/dev/null || (echo "ERROR: Server is not running on http://localhost:8090.\n\nPlease start the server by running 'make run' in a separate terminal window first, then run 'make test-worker' again.\n" && exit 1)
	@echo "=== 1. Creating 'background_tasks' worker moul ==="
	curl -s -X POST http://localhost:8090/api/moul \
		-H "X-Admin-Key: $(MOUL_ADMIN_KEY)" \
		-H "Content-Type: application/json" \
		-d '{"name": "background_tasks", "type": "worker"}'
	@echo "\n"

	@echo "=== 2. Enqueuing 'SendEmail' job (Should be processed immediately) ==="
	curl -s -X POST http://localhost:8090/api/moul/background_tasks/records \
		-H "Content-Type: application/json" \
		-d '{"worker": "SendEmail", "args": {"to": "user@example.com", "subject": "Hello background worker!"}, "priority": 1}'
	@echo "\n"

	@echo "=== 3. Waiting for worker to process job... ==="
	@sleep 1.5
	@echo "\n"

	@echo "=== 4. Querying 'background_tasks' records (Should be completed) ==="
	curl -s http://localhost:8090/api/moul/background_tasks/records
	@echo "\n"

	@echo "=== 5. Cleaning up: Deleting 'background_tasks' worker moul ==="
	curl -i -s -X DELETE http://localhost:8090/api/moul/background_tasks \
		-H "X-Admin-Key: $(MOUL_ADMIN_KEY)"
	@echo "\n"
	@echo "=== Worker Test Complete! ==="

# Run the analytics and visits flow tests
test-analytics:
	@curl -s http://localhost:8090/api/moul >/dev/null || (echo "ERROR: Server is not running on http://localhost:8090.\n\nPlease start the server by running 'make run' in a separate terminal window first, then run 'make test-analytics' again.\n" && exit 1)
	@echo "=== 1. Creating 'users' auth moul ==="
	curl -s -X POST http://localhost:8090/api/moul \
		-H "X-Admin-Key: $(MOUL_ADMIN_KEY)" \
		-H "Content-Type: application/json" \
		-d '{"name": "users", "type": "auth"}'
	@echo "\n"

	@echo "=== 2. Creating 'events' analytic moul ==="
	curl -s -X POST http://localhost:8090/api/moul \
		-H "X-Admin-Key: $(MOUL_ADMIN_KEY)" \
		-H "Content-Type: application/json" \
		-d '{"name": "events", "type": "analytic"}'
	@echo "\n"

	@echo "=== 3. Registering admin user ==="
	@USER_RESP=$$(curl -s -X POST http://localhost:8090/api/moul/users/records \
		-H "Content-Type: application/json" \
		-d '{"username": "admin", "email": "admin@example.com", "password": "Password1", "passwordConfirm": "Password1"}'); \
	echo "$$USER_RESP"; \
	echo "\n"; \
	\
	echo "=== 4. Logging in to get JWT ==="; \
	AUTH_RESP=$$(curl -s -X POST http://localhost:8090/api/moul/users/auth-with-password \
		-H "Content-Type: application/json" \
		-d '{"identity": "admin@example.com", "password": "Password1"}'); \
	echo "$$AUTH_RESP"; \
	TOKEN=$$(echo "$$AUTH_RESP" | grep -o '"token":"[^"]*' | cut -d'"' -f4); \
	echo "JWT Token: $$TOKEN\n"; \
	\
	echo "=== 5. Tracking an event (page_view) ==="; \
	TRACK_RESP=$$(curl -i -s -X POST http://localhost:8090/api/moul/events/records \
		-H "Content-Type: application/json" \
		-H "User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36" \
		-d '{"name": "page_view", "path": "/dashboard", "landing_page": "https://moul.dev/dashboard?utm_source=newsletter&utm_medium=email"}'); \
	echo "$$TRACK_RESP"; \
	echo "\n"; \
	\
	echo "=== 6. Querying visits log (Authenticated) ==="; \
	curl -s -X GET http://localhost:8090/api/visits \
		-H "Authorization: Bearer $$TOKEN"; \
	echo "\n"; \
	\
	echo "=== 7. Querying visits log (Anonymous - Should fail with 401) ==="; \
	curl -i -s -X GET http://localhost:8090/api/visits; \
	echo "\n"

	@echo "=== 8. Cleaning up: Deleting 'events' and 'users' moul ==="
	curl -i -s -X DELETE http://localhost:8090/api/moul/events \
		-H "X-Admin-Key: $(MOUL_ADMIN_KEY)"
	@echo "\n"
	curl -i -s -X DELETE http://localhost:8090/api/moul/users \
		-H "X-Admin-Key: $(MOUL_ADMIN_KEY)"
	@echo "\n"
	@echo "=== Analytics Flow Test Complete! ==="

# Run the TUI client
tui:
	go run cmd/moul/main.go

# Build the TUI client binary
build-tui:
	mkdir -p bin
	go build -ldflags="-s -w" -o bin/moul cmd/moul/main.go

# Start local MinIO server with local data directory
minio-start:
	@mkdir -p tmp/minio
	@echo "Starting local MinIO server (Console: http://localhost:9001)..."
	MINIO_ROOT_USER=minioadmin MINIO_ROOT_PASSWORD=minioadmin minio server tmp/minio --console-address :9001

# Setup mc alias for local MinIO server
minio-setup:
	@echo "Setting up MinIO client alias 'moul-local'..."
	mc alias set moul-local http://localhost:9000 minioadmin minioadmin

# Run the TUI E2E and unit tests
test-tui:
	@mkdir -p tmp
	MOUL_TEST_ARTIFACT_DIR=$(shell pwd)/tmp go test -v ./internal/tui/...


