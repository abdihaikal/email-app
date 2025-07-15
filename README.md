# Email-App: A Scalable & Modular Email Management System

The `email-app` is a robust, NestJS-based application designed for efficient user and email message management. It features a modular architecture, integrating PostgreSQL for persistent data, Redis for high-performance caching, and BullMQ for reliable asynchronous job processing, ensuring scalability and responsiveness.

## Author

Abdi Haikal

## Technologies Used

  * **NestJS**: A progressive Node.js framework for building scalable, efficient, and reliable server-side applications.
  * **TypeORM**: An ORM for TypeScript, simplifying database interactions by mapping entities to classes.
  * **BullMQ**: A fast, reliable Redis-based queue system for handling background jobs asynchronously.
  * **PostgreSQL**: A powerful, reliable relational database system for data persistence.
  * **Redis**: An in-memory data store utilized for caching, message brokering, and queue management.
  * **Luxon**: A modern library for robust date and time manipulation.
  * **Axios**: A promise-based HTTP client for external API communication.
  * **Jest**: A JavaScript testing framework for comprehensive unit and integration tests.
  * **ESLint & Prettier**: Tools for maintaining code quality, consistency, and formatting.

## Project Structure

The project follows a modular, separation-of-concerns architecture with the following detailed structure, sorted in folder-first order:

```
email-app/
├── openapi/                      # OpenAPI (Swagger) specification files
│   └── openapi-spec.json         # Generated OpenAPI specification
├── postman/                      # Postman collections and environments
│   ├── Email Message API by Abdi Haikal.postman_collection.json
│   └── Email Message API Environment by Abdi Haikal.postman_environment.json
├── scripts/                      # Utility scripts
│   └── generate-openapi-spec.ts  # Script to generate OpenAPI specification
├── src/                          # Application source code
│   ├── config/                   # Application configuration files
│   │   ├── postgres.config.ts    # PostgreSQL database configuration
│   │   └── redis.config.ts       # Redis server configuration
│   ├── core/                     # Core business logic modules
│   │   ├── messages/             # Message management module
│   │   │   ├── domains/          # Domain entities and business rules for messages
│   │   │   │   └── message.entity.ts
│   │   │   ├── dtos/             # Data Transfer Objects for message operations
│   │   │   │   ├── create-message.dto.ts
│   │   │   │   ├── message-response.dto.ts
│   │   │   │   └── update-message.dto.ts
│   │   │   ├── providers/        # Service providers for message-related tasks
│   │   │   │   ├── anniversary-message.service.ts
│   │   │   │   ├── birthday-message.service.ts
│   │   │   │   └── regular-message.service.ts
│   │   │   ├── message.controller.ts # REST API endpoints for messages
│   │   │   ├── message.module.ts # NestJS module definition for messages
│   │   │   └── message.service.ts # Business logic for message operations
│   │   ├── users/                # User management module
│   │   │   ├── domains/          # Domain entities and business rules for users
│   │   │   │   └── user.entity.ts
│   │   │   ├── dtos/             # Data Transfer Objects for user operations
│   │   │   │   ├── create-user.dto.ts
│   │   │   │   ├── update-user.dto.ts
│   │   │   │   └── user-response.dto.ts
│   │   │   ├── utils/            # Utility pipes for core modules
│   │   │   │   ├── custom-parse-uuid.pipe.ts
│   │   │   │   └── parse-email.pipe.ts
│   │   │   ├── user.controller.ts # REST API endpoints for users
│   │   │   ├── user.module.ts    # NestJS module definition for users
│   │   │   └── user.service.ts   # Business logic for user operations
│   │   └── core.module.ts        # Aggregates core modules
│   ├── infra/                    # Infrastructure concerns (database, external services, queue)
│   │   ├── database/             # Database configuration and migrations
│   │   │   ├── migrations/       # Database migration scripts
│   │   │   │   └── 1672531200000-CreateUsersAndMessagesTables.ts
│   │   │   └── database.module.ts # NestJS module for database integration
│   │   ├── external/             # Integrations with external services
│   │   │   ├── email-service.client.ts # Client for interacting with external email APIs
│   │   │   └── external.module.ts # NestJS module for external service integrations
│   │   └── queue/                # Message queueing system configuration
│   │       ├── message.consumer.ts # Consumer for processing messages from the queue
│   │       ├── message.producer.ts # Producer for adding messages to the queue
│   │       ├── queue.constant.ts # Constants related to queue names and types
│   │       └── queue.module.ts   # NestJS module for BullMQ integration
│   ├── utils/                    # Common utility functions and helpers
│   │   ├── luxon-date.spec.ts    # Tests for Luxon date utilities
│   │   └── luxon-date.ts         # Luxon date utility functions
│   ├── app.module.ts             # Root application module
│   ├── infra.module.ts           # Aggregates infrastructure modules
│   ├── main.ts                   # Application entry point
│   └── swagger.ts                # Swagger API documentation setup
├── test/                         # End-to-end and unit tests
│   └── jest-e2e.json             # Jest configuration for e2e tests
├── .env                          # Environment variables for local setup
├── .env.example                  # Example environment variables
├── .prettierrc                   # Prettier configuration file
├── docker-compose.yaml           # Docker Compose configuration for multi-service setup
├── Dockerfile                    # Docker build instructions for the application
├── eslint.config.mjs             # ESLint configuration file
├── nest-cli.json                 # NestJS CLI configuration
├── package-lock.json             # npm dependency lock file
├── package.json                  # Project dependencies and scripts
├── README.md                     # Project documentation
├── tsconfig.build.json           # TypeScript build configuration
└── tsconfig.json                 # TypeScript compiler configuration
```

## Features

The `email-app` offers comprehensive user and message management with advanced capabilities:

  * **User Management**: Full CRUD operations for user profiles including email, name, location, and key dates. Retrieval by ID or email is supported.
  * **Message Management**: Full CRUD operations for messages, tied to users. Messages include critical fields such as `subject`, `content`, `schedule_date`, and `status`. The application supports three distinct message types: **regular**, **birthday**, and **anniversary**.
  * **Scheduling & Reliable Delivery**: Messages can be scheduled for future delivery. The system tracks message status (`pending`, `sent`, `failed`), last attempt timestamps, and retry counts for robust delivery guarantees.
  * **Asynchronous Background Processing**: Utilizes Redis and BullMQ to handle message sending asynchronously, enhancing performance and scalability.
  * **Data Persistence**: Employs PostgreSQL with a well-defined relational schema for users and messages, including indexing for efficient querying. Soft deletion (`deleted_at`) is implemented.
  * **Modular Architecture**: Built with NestJS, ensuring maintainability, testability, and scalability.
  * **API Documentation**: Integrated Swagger for interactive API documentation and testing.

## API Endpoints

The API provides RESTful endpoints accepting and returning JSON data, all prefixed with `/api/v1`.

### Users

  * **`POST /api/v1/users`**: Create a new user.
  * **`PUT /api/v1/users/:id`**: Update an existing user.
  * **`DELETE /api/v1/users/:id`**: Delete an existing user (HTTP 204 No Content).
  * **`GET /api/v1/users/:id`**: Get a user by ID.
  * **`GET /api/v1/users/email/:email`**: Get a user by email.
  * **`GET /api/v1/users`**: Get all users.

### Messages

  * **`POST /api/v1/messages`**: Create a new message.
  * **`PUT /api/v1/messages/:id`**: Update an existing message.
  * **`DELETE /api/v1/messages/:id`**: Delete an existing message (HTTP 204 No Content).
  * **`GET /api/v1/messages/:id`**: Get a message by ID.
  * **`GET /api/v1/messages/user/:id`**: Get all messages by user ID.
  * **`GET /api/v1/messages`**: Get all messages.

## Database Schema

Features `users` and `messages` tables with a foreign key relationship.

### `users` Table

  * **`id`**: `uuid`, Primary Key, Unique identifier.
  * **`email`**: `varchar(255)`, Unique, Not Null.
  * **`first_name`**: `varchar(50)`, Not Null.
  * **`middle_name`**: `varchar(50)`, Nullable.
  * **`last_name`**: `varchar(50)`, Not Null.
  * **`location`**: `varchar(100)`, Not Null, Default 'Asia/Jakarta'.
  * **`birthday_date`**: `date`, Nullable.
  * **`anniversary_date`**: `date`, Nullable.
  * **`created_at`**: `timestamp with time zone`, Not Null, Default now().
  * **`updated_at`**: `timestamp with time zone`, Not Null, Default now().
  * **`deleted_at`**: `timestamp with time zone`, Nullable (soft delete).

### `messages` Table

  * **`id`**: `uuid`, Primary Key, Unique identifier.
  * **`user_id`**: `uuid`, Foreign Key references `users(id)`.
  * **`subject`**: `varchar(255)`, Not Null.
  * **`content`**: `text`, Nullable.
  * **`schedule_date`**: `date`, Nullable.
  * **`status`**: `varchar`, Not Null, Default 'pending'.
  * **`last_attempt_at`**: `timestamp with time zone`, Nullable.
  * **`retries_attempted`**: `integer`, Not Null, Default 0.
  * **`type`**: `varchar`, Not Null, Default 'regular'
      * Defines the type of message: **`regular`**, **`birthday`**, or **`anniversary`**.
  * **`created_at`**: `timestamp with time zone`, Not Null, Default now().
  * **`updated_at`**: `timestamp with time zone`, Not Null, Default now().
  * **`deleted_at`**: `timestamp with time zone`, Nullable (soft delete).

## Additional Details

  * **Background Job Processing**: Redis and BullMQ handle message sending asynchronously, improving performance and scalability through decoupled processing.
  * **Scheduling & Status Tracking**: Messages are scheduled via `schedule_date` and their lifecycle tracked using `status`, `last_attempt_at`, and `retries_attempted` for robust delivery.

## Setup and Installation

### Prerequisites

  * Node.js (v16 or higher recommended)
  * PostgreSQL database
  * Redis server
  * Docker & Docker Compose (recommended)

### Installation

1.  Clone repository: `git clone <repository-url> && cd email-app`
2.  Install dependencies: `npm install`
3.  Configure environment variables: Create `.env` file (refer to `.env.example` for structure).

### Build and Run

1.  Build project: `npm run build`
2.  Start application: `npm start` (production).
3.  Start development with hot reload: `npm run start:dev`

### Running Tests

  * Run all tests: `npm test`
  * Run e2e tests: `npm run test:e2e`
  * Run unit tests: `npm run test:unit`

### Docker

  * Start backend services (app, Postgres, Redis): `docker compose up --profile backend -d`
      * The backend application will be accessible at: `http://localhost:3000/api/v1`
  * Start backend with RedisInsight: `docker compose up --profile backend --profile redisinsight -d`
      * RedisInsight will be accessible at: `http://localhost:5540`
  * Stop containers: `docker compose down`
  * View logs: `docker compose logs -f`

## Contributing

Refer to standard GitHub practices: Fork, create branch, commit, push, and open a Pull Request.

## License

This project is licensed under the MIT License.
