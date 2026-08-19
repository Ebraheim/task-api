# Task API

A simple CRUD API built with Node.js, Express, and SQLite for managing a to-do list.

This project is a continuation of my previous **Task API assignment**.

The previous version was completed as **Assignment 1 / Task 1**, where tasks were stored temporarily in an in-memory JavaScript array.

This version is **Week 3 — Assignment 1: Connecting CRUD to the Database**.

The API endpoints and request/response structure remain the same, but the storage layer has been upgraded from in-memory storage to a real SQLite database.

## Features

* Create a task
* View all tasks
* View one task by ID
* Update a task
* Delete a task
* Input validation
* Correct HTTP status codes
* Swagger UI documentation
* SQLite database storage
* Persistent data after server restarts
* Automatic database and table creation
* Three example tasks added only when the database is empty

## Technologies

* Node.js
* Express.js
* SQLite
* better-sqlite3
* Swagger UI
* Git and GitHub

## Why SQLite?

SQLite was chosen because it is lightweight, simple to use, and does not require a separate database server.

It stores the entire database in a single file, which makes it suitable for a small project like this.

The database file is:

```text
tasks.db
```

It is stored in the root folder of the project.

## How to install and run

Install the project dependencies:

```bash
npm install
```

Start the server:

```bash
node server.js
```

The API will run at:

```text
http://localhost:3000
```

Swagger UI will be available at:

```text
http://localhost:3000/docs
```

When the application starts, it automatically creates the SQLite database and the `tasks` table if they do not already exist.

If the table is empty, three example tasks are inserted automatically.

## Database Structure

The SQLite database contains a table called:

```text
tasks
```

The table contains the following columns:

| Column  | Type              | Description                         |
| ------- | ----------------- | ----------------------------------- |
| `id`    | INTEGER           | Primary key for each task           |
| `title` | TEXT              | Task title                          |
| `done`  | INTEGER / Boolean | Shows whether the task is completed |

## Endpoints

| Method | Endpoint     | Description          |
| ------ | ------------ | -------------------- |
| GET    | `/`          | Show API information |
| GET    | `/health`    | Check server health  |
| GET    | `/tasks`     | Get all tasks        |
| GET    | `/tasks/:id` | Get one task         |
| POST   | `/tasks`     | Create a task        |
| PUT    | `/tasks/:id` | Update a task        |
| DELETE | `/tasks/:id` | Delete a task        |

## Example POST Request

```bash
curl -i -X POST http://localhost:3000/tasks \
-H "Content-Type: application/json" \
-d '{"title":"Buy milk"}'
```

Example response:

```text
HTTP/1.1 201 Created
Content-Type: application/json

{"id":4,"title":"Buy milk","done":false}
```

## Status Codes

* `200 OK` — successful request
* `201 Created` — task created successfully
* `204 No Content` — task deleted successfully
* `400 Bad Request` — invalid request data
* `404 Not Found` — task does not exist

## Data Storage

In the previous **Assignment 1 / Task 1**, tasks were stored in memory. This meant that newly created or updated tasks disappeared whenever the server restarted.

For **Week 3 — Assignment 1**, the in-memory array was replaced with SQLite.

Tasks are now stored permanently inside:

```text
tasks.db
```

This means the data remains available even after the server is stopped and restarted.

## SQL Queries Tested

During the assignment, the database was opened using SQLite and several SQL queries were tested manually.

List every task:

```sql
SELECT * FROM tasks;
```

Show only completed tasks:

```sql
SELECT * FROM tasks WHERE done = 1;
```

Count all tasks:

```sql
SELECT COUNT(*) FROM tasks;
```

Mark every task as completed:

```sql
UPDATE tasks SET done = 1;
```

Delete all completed tasks:

```sql
DELETE FROM tasks WHERE done = 1;
```

Changes made directly in SQLite are also reflected through the API.

## Database Screenshot

![SQLite Database](sqlite-database.png)

## Swagger UI

![Swagger UI](swagger-ui.png)

## Assignment Progression

### Previous Assignment — Assignment 1 / Task 1

The first version of the Task API introduced CRUD operations using an in-memory JavaScript array.

Architecture:

```text
Client -> API -> In-memory Array
```

### Current Assignment — Week 3 Assignment 1

The current version replaces the temporary array with a real SQLite database while keeping the same API endpoints.

Architecture:

```text
Client -> API -> SQLite Database
```

The main lesson from this assignment is that the API describes what the application does, while the database determines where the data is stored.


## A3 — Containerize Your Stack

This project has now been extended for **A3 — Containerize Your Stack (Week 3)**.

### Assignment progression

The project has been developed across multiple assignments:

1. **Assignment 1 / Task 1** — CRUD Task API using an in-memory JavaScript array.
2. **Week 3 — Assignment 1** — replaced the in-memory storage with SQLite so tasks persisted after restarting the Node.js application.
3. **A3 — Containerize Your Stack** — replaced SQLite with PostgreSQL running in Docker and containerized the Node.js application.

The current architecture is:

```text
Client
  |
  v
Express API
  |
  v
Task Service
  |
  v
Postgres Repository
  |
  v
PostgreSQL Docker Container
```

## PostgreSQL

The current version uses **PostgreSQL 16** instead of SQLite.

PostgreSQL runs inside a Docker container and stores its data in a named Docker volume:

```text
postgres_data
```

This allows task data to remain available when the containers are stopped and restarted.

## Environment Configuration

Database configuration is loaded from a local `.env` file.

The `.env` file is excluded from Git using `.gitignore`.

A safe example configuration is included in:

```text
.env.example
```

The application uses the following connection variable:

```text
DATABASE_URL
```

## Database Initialization

The database schema is created using:

```text
init.sql
```

The script creates the `tasks` table:

```sql
CREATE TABLE IF NOT EXISTS tasks (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  done BOOLEAN NOT NULL DEFAULT FALSE
);
```

Example tasks are also inserted when the database is initialized.

## Repository Layer

Database queries are isolated inside:

```text
repositories/postgresRepository.js
```

The application accesses the repository through:

```text
services/taskService.js
```

The HTTP API remains the same:

* `GET /tasks`
* `GET /tasks/:id`
* `POST /tasks`
* `PUT /tasks/:id`
* `DELETE /tasks/:id`

### Architecture note

The previous version of this project did not already have a separate service and repository architecture.

For A3, I introduced the `taskService` and `postgresRepository` layers while keeping the existing API endpoints and request/response behaviour unchanged.

The storage implementation is now isolated inside the repository so future database changes can be made without changing the API routes.

## Docker

The application and PostgreSQL database are defined in:

```text
docker-compose.yml
```

The Node.js application is containerized using:

```text
Dockerfile
```

To start the complete stack:

```bash
docker compose up --build
```

After the first build, it can also be started with:

```bash
docker compose up
```

The API is available at:

```text
http://localhost:3000
```

Swagger UI is available at:

```text
http://localhost:3000/docs
```

To stop the stack:

```bash
docker compose down
```

Do not use `docker compose down -v` if you want to preserve the PostgreSQL data because `-v` removes the Docker volume.

## Persistence Test

Persistence was tested by creating a task through the API:

```json
{
  "title": "Persistence test"
}
```

The containers were then stopped using:

```bash
docker compose down
```

and started again using:

```bash
docker compose up
```

After the restart, the `Persistence test` task was still returned by the API.

This confirms that PostgreSQL data is persisted using the `postgres_data` Docker volume.


# Week 4 — Auth: Login & Protect

This assignment extends the existing Task API by adding authentication using **Supabase Auth**.

The existing CRUD API, PostgreSQL database, Docker setup, service layer, and repository layer remain unchanged. This task focuses only on adding login, JWT verification, protected routes, logout, reusable authentication middleware, and Swagger Bearer Token authorization.

## What Was Added

- User signup
- User login
- Access token
- Refresh token
- JWT verification
- Public route
- Protected profile route
- Protected dashboard route
- Reusable authentication middleware
- Logout endpoint
- Swagger Bearer authentication

## Technologies Used

- Node.js
- Express.js
- Supabase Auth
- `@supabase/supabase-js`
- JWT / Bearer Tokens
- Swagger UI
- OpenAPI 3.0

## Supabase Setup

The Supabase client is configured in:

```text
config/supabaseClient.js

User
  |
  | email + password
  v
POST /auth/login
  |
  v
Supabase Auth
  |
  | access token + refresh token
  v
Client
  |
  | Authorization: Bearer <token>
  v
Auth Middleware
  |
  | verifies token with Supabase
  v
Protected Route

Authentication Endpoints
Method	Endpoint	Authentication	Description
POST	/auth/signup	No	Create a new user account
POST	/auth/login	No	Login and receive tokens
POST	/auth/logout	Yes	Logout authenticated user
GET	/public/info	No	Public route
GET	/protected/profile	Yes	View authenticated user profile
GET	/protected/dashboard	Yes	View protected dashboard
Signup

Endpoint:

POST /auth/signup

Example request:

{
  "email": "user@example.com",
  "password": "password123"
}

Successful signup returns:

201 Created

Missing email or password returns:

400 Bad Request
Login

Endpoint:

POST /auth/login

Example request:

{
  "email": "user@example.com",
  "password": "password123"
}

Successful login returns:

access_token
refresh_token
user information

Successful login:

200 OK

Invalid credentials:

401 Unauthorized
Public Route

Endpoint:

GET /public/info

This route does not require authentication.

Example response:

{
  "message": "Welcome stranger! This info is public."
}
Protected Profile

Endpoint:

GET /protected/profile

Requires:

Authorization: Bearer <access_token>

A valid token returns the authenticated user.

Example:

{
  "id": "user-id",
  "email": "user@example.com",
  "created_at": "..."
}

Missing, invalid, or expired tokens return:

401 Unauthorized
Protected Dashboard

Endpoint:

GET /protected/dashboard

This route also uses the reusable authentication middleware.

Example response:

{
  "message": "Welcome to the protected dashboard",
  "user": "user@example.com"
}
Authentication Middleware

Authentication logic is stored in:

middleware/authMiddleware.js

The middleware:

Reads the Authorization header.
Checks for the Bearer token format.
Extracts the token.
Verifies the token using Supabase.
Returns 401 for missing or invalid tokens.
Adds the authenticated user to req.user.
Calls next() to continue to the protected route.
Logout

Endpoint:

POST /auth/logout

The route is protected by the authentication middleware.

Successful logout returns:

204 No Content
Swagger Bearer Authentication

Swagger UI is available at:

http://localhost:3000/docs

Swagger now includes Bearer Token authorization.

To test a protected route:

Run POST /auth/login
Copy the returned access_token
Click Authorize
Paste the JWT token
Click Authorize
Open GET /protected/profile
Click Try it out
Click Execute

A successful authenticated request returns:

200 OK
Swagger Authentication Screenshot

The screenshot shows successful Bearer Token authorization and access to the protected profile endpoint.

Files Added or Updated
config/supabaseClient.js
middleware/authMiddleware.js
server.js
openapi.json
.env.example
package.json
package-lock.json
README.md
Security

Real Supabase credentials are stored only in:

.env

The .env file is ignored by Git.

Access tokens and real credentials are not committed to GitHub.

Supabase manages user authentication and passwords.

What I Learned

This assignment helped me understand how authentication works in a backend API.

I learned how to:

create users
log users in
receive access and refresh tokens
send JWTs in the Authorization header
verify tokens with Supabase
create reusable authentication middleware
protect API routes
implement logout
configure Swagger Bearer authentication