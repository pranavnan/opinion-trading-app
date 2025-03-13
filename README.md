# Opinion Trading Backend

A backend system for an opinion trading platform, built with Node.js, TypeScript, MongoDB, and WebSockets. This project allows users to place trades on events, showcasing real-time updates using Socket.io, and implements proper API design with role-based access control.

## Features

- **Authentication:** JWT-based authentication with user and admin roles
- **Real-time Updates:** WebSocket implementation for real-time trade updates
- **Event Management:** Create, list, and settle events with multiple options
- **Trade Execution:** Place, cancel, and settle trades with proper balance management
- **Admin Panel APIs:** Secure APIs for managing events, trades, and users
- **External API Integration:** Fetch events from external sources

## Tech Stack

- **Backend:** Node.js with Express
- **Language:** TypeScript
- **Database:** MongoDB
- **Architecture:** SOLID principles with Dependency Injection (Inversify)
- **Real-time:** Socket.io for WebSocket communication
- **Authentication:** JWT
- **Logging:** Winston

## Getting Started

### Prerequisites

- Node.js (v14+)
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/pranavnan/opinion-trading-app.git
cd opinion-trading
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
Create a `.env` file in the root directory with the following variables:
```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/opinion-trading
JWT_SECRET=your-secret-key
EXTERNAL_API_URL=https://your-external-api-url.com
NODE_ENV=development
```

4. Build the project
```bash
npm run build
```

5. Start the server
```bash
npm start
```

For development with hot-reload:
```bash
npm run dev
```

## API Documentation

### Authentication Endpoints

- **POST /api/auth/register** - Register a new user
- **POST /api/auth/login** - Login and get JWT token
- **POST /api/auth/change-password** - Change user password (requires auth)

### Event Endpoints

- **GET /api/events** - Get all events
- **GET /api/events/:id** - Get event by ID
- **POST /api/events** - Create a new event (admin only)
- **PUT /api/events/:id/settle** - Settle an event with winning option (admin only)

### Trade Endpoints

- **GET /api/trades** - Get all trades (admin only)
- **GET /api/trades/:id** - Get trade by ID (user or admin)
- **GET /api/trades/user/:userId** - Get trades by user ID (own trades or admin)
- **GET /api/trades/event/:eventId** - Get trades by event ID
- **POST /api/trades** - Create a new trade
- **PUT /api/trades/:id/cancel** - Cancel a trade
- **PUT /api/trades/settle/:eventId** - Settle all trades for an event (admin only)

## WebSocket Events

### Client -> Server

- **join_room** - Join a room to receive specific updates (event-{eventId}, user-{userId})
- **leave_room** - Leave a room

### Server -> Client

- **event_created** - When a new event is created
- **event_updated** - When an event is updated
- **event_settled** - When an event is settled
- **trade_created** - When a new trade is placed
- **trade_cancelled** - When a trade is cancelled
- **trade_settled** - When a trade is settled

## Architecture

The project follows a clean architecture with SOLID principles:

- **Domain Layer:** Contains the core business models and repository interfaces
- **Infrastructure Layer:** Implements repositories, external services, and database access
- **Application Layer:** Contains the business logic in services
- **Presentation Layer:** Contains the controllers, routes, and WebSocket handlers

Dependency Injection using Inversify provides loose coupling between components.

## Testing

Run tests using:
```bash
npm test
```

## CI/CD Pipeline

The project includes a CI/CD pipeline implemented with GitHub Actions:

- **Automated Testing:** Runs all tests automatically on pull requests
- **Continuous Deployment:** Automatically builds and deploys Docker images to Docker Hub when code is pushed to the main branch

The workflow files are located in the `.github/workflows` directory:
- `tests.yml` - Handles automated testing on pull requests
- `deploy.yml` - Handles Docker image building and deployment on pushes to main branch