# Go Repository Pattern Template

This project demonstrates the use of the repository pattern in a Go application. It uses Echo for the web framework and GORM for database interactions.

## Project Structure

## Getting Started

### Prerequisites

- Go 1.22.8 or later
- Docker (for running PostgreSQL)

### Running the Application

1. **Clone the repository:**

   ```sh
   git clone https://github.com/yourusername/gorepositorytest.git
   cd gorepositorytest
   ```

2. **Start PostgreSQL using Docker:**

   ```sh
   docker-compose up -d
   ```

3. **Run the application:**

   ```sh
   go run cmd/server/main.go
   ```

The server will start on [http://localhost:8080](http://_vscodecontentref_/13).

### API Endpoints

#### Users

- `GET /users` - Get all users
- `POST /users` - Add a new user

#### Products

- `GET /products` - Get all products
- `POST /products` - Add a new product

### Environment Variables

- `DATABASE_DSN` - Database connection string (optional, defaults to `host=localhost user=devuser password=devpassword dbname=devdb port=5432 sslmode=disable`)

## Project Details

### Repository Pattern

The repository pattern is used to abstract the data access layer. This helps in decoupling the business logic from the data access logic, making the code more maintainable and testable.

### Middleware

The project includes middleware for logging, recovery, and authentication.

### Handlers

Handlers are responsible for handling HTTP requests and responses. They interact with the repositories to perform CRUD operations.

### Models

Models represent the data structures used in the application.

### Routes

Routes define the API endpoints and associate them with the appropriate handlers and middleware.

## License

This project is licensed under the MIT License.
