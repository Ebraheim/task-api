# Task API

A simple CRUD API built with Node.js and Express for managing a to-do list.

## Features

- Create a task
- View all tasks
- View one task by ID
- Update a task
- Delete a task
- Input validation
- Correct HTTP status codes
- Swagger UI documentation

## Technologies

- Node.js
- Express
- Swagger UI
- Git and GitHub

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

## Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | Show API information |
| GET | `/health` | Check server health |
| GET | `/tasks` | Get all tasks |
| GET | `/tasks/:id` | Get one task |
| POST | `/tasks` | Create a task |
| PUT | `/tasks/:id` | Update a task |
| DELETE | `/tasks/:id` | Delete a task |

## Example curl request

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

## Status codes

- `200 OK` — successful request
- `201 Created` — task created successfully
- `204 No Content` — task deleted successfully
- `400 Bad Request` — invalid request data
- `404 Not Found` — task does not exist

## Data storage

Tasks are stored in memory. This means newly created or updated tasks disappear when the server restarts.

## Swagger UI

![Swagger UI](swagger-ui.png)