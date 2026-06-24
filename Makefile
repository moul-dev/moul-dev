.PHONY: run dev build test-go test-flow clean-db

# Start the Echo server locally
run:
	go run cmd/moul-dev/main.go

# Start the watcher for live-reload development
dev:
	air -c .air.toml

# Build for production with stripped debug symbols and metadata
build:
	mkdir -p bin
	go build -ldflags="-s -w" -o bin/moul-dev cmd/moul-dev/main.go

# Run the Go unit and integration tests
test-go:
	go test -v ./...

# Remove SQLite database
clean-db:
	rm -f moul-local.db

# Run the complete API testing flow (dynamic mouls, auth, records CRUD, rule enforcement)
test-flow:
	@curl -s http://localhost:8090/api/mouls >/dev/null || (echo "ERROR: Server is not running on http://localhost:8090.\n\nPlease start the server by running 'make run' in a separate terminal window first, then run 'make test-flow' again.\n" && exit 1)
	@echo "=== 1. Creating 'users' auth moul ==="
	curl -s -X POST http://localhost:8090/api/mouls \
		-H "Content-Type: application/json" \
		-d '{"name": "users", "type": "auth", "rules": {"listRule": "", "viewRule": "auth.id == id", "createRule": "", "updateRule": "auth.id == id", "deleteRule": "auth.id == id"}}'
	@echo "\n"

	@echo "=== 2. Creating 'posts' base moul ==="
	curl -s -X POST http://localhost:8090/api/mouls \
		-H "Content-Type: application/json" \
		-d '{"name": "posts", "type": "base", "fields": [{"name": "title", "type": "text"}, {"name": "body", "type": "text"}, {"name": "author_id", "type": "text"}], "rules": {"listRule": "", "viewRule": "", "createRule": "auth.id != nil", "updateRule": "auth.id == author_id", "deleteRule": "auth.id == author_id"}}'
	@echo "\n"

	@echo "=== 3. Listing all registered mouls ==="
	curl -s http://localhost:8090/api/mouls
	@echo "\n"

	@echo "=== 4-11. Executing Record CRUD and Authentication Flow ==="
	@USER_RESP=$$(curl -s -X POST http://localhost:8090/api/mouls/users/records \
		-H "Content-Type: application/json" \
		-d '{"username": "usera", "email": "usera@example.com", "password": "password123", "passwordConfirm": "password123"}'); \
	echo "=== 4. Registering a new user (User A) ==="; \
	echo "$$USER_RESP"; \
	USER_ID=$$(echo "$$USER_RESP" | grep -o '"id":"[^"]*' | cut -d'"' -f4); \
	echo "Registered User ID: $$USER_ID\n"; \
	\
	echo "=== 5. Logging in User A to get JWT ==="; \
	AUTH_RESP=$$(curl -s -X POST http://localhost:8090/api/mouls/users/auth-with-password \
		-H "Content-Type: application/json" \
		-d '{"identity": "usera@example.com", "password": "password123"}'); \
	echo "$$AUTH_RESP"; \
	TOKEN=$$(echo "$$AUTH_RESP" | grep -o '"token":"[^"]*' | cut -d'"' -f4); \
	echo "JWT Token: $$TOKEN\n"; \
	\
	echo "=== 6. Attempting to create a post without JWT (Should fail with 401) ==="; \
	curl -i -s -X POST http://localhost:8090/api/mouls/posts/records \
		-H "Content-Type: application/json" \
		-d '{"title": "Unauthenticated Post", "body": "This should fail", "author_id": "'$$USER_ID'"}'; \
	echo "\n"; \
	\
	echo "=== 7. Creating a post with JWT (Should succeed) ==="; \
	POST_RESP=$$(curl -s -X POST http://localhost:8090/api/mouls/posts/records \
		-H "Authorization: Bearer $$TOKEN" \
		-H "Content-Type: application/json" \
		-d '{"title": "Hello Moul World!", "body": "Dynamic collections are awesome.", "author_id": "'$$USER_ID'"}'); \
	echo "$$POST_RESP"; \
	POST_ID=$$(echo "$$POST_RESP" | grep -o '"id":"[^"]*' | cut -d'"' -f4); \
	echo "Created Post ID: $$POST_ID\n"; \
	\
	echo "=== 8. Listing posts ==="; \
	curl -s http://localhost:8090/api/mouls/posts/records; \
	echo "\n"; \
	\
	echo "=== 9. Attempting to update post as an anonymous user (Should fail with 401) ==="; \
	curl -i -s -X PATCH http://localhost:8090/api/mouls/posts/records/$$POST_ID \
		-H "Content-Type: application/json" \
		-d '{"title": "Updated Title (Anon)"}'; \
	echo "\n"; \
	\
	echo "=== 10. Updating the post as User A (Should succeed) ==="; \
	curl -s -X PATCH http://localhost:8090/api/mouls/posts/records/$$POST_ID \
		-H "Authorization: Bearer $$TOKEN" \
		-H "Content-Type: application/json" \
		-d '{"title": "Updated Title (Owner)"}'; \
	echo "\n"; \
	\
	echo "=== 11. Deleting the post as User A (Should succeed) ==="; \
	curl -i -s -X DELETE http://localhost:8090/api/mouls/posts/records/$$POST_ID \
		-H "Authorization: Bearer $$TOKEN"; \
	echo "\n"

	@echo "=== 12. Cleaning up: Deleting 'posts' and 'users' mouls ==="
	curl -i -s -X DELETE http://localhost:8090/api/mouls/posts
	@echo "\n"
	curl -i -s -X DELETE http://localhost:8090/api/mouls/users
	@echo "\n"
	@echo "=== Flow Test Complete! ==="
