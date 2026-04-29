# Liminalis WebSocket Server

Lightweight real-time chat backend built in Go using WebSockets, MySQL, and PHP-based authentication. Made specifically for my project called Liminalis.

---

## Features

- WebSocket-based real-time messaging
- Room-based chat system
- MySQL message persistence
- PHP token validation (JWT external auth endpoint)
- Role-based permissions (admin support)
- Message deletion support with security checks
- Concurrent-safe room management (sync.RWMutex)

---

## Tech Stack

- Go (Golang)
- Gorilla WebSocket
- MySQL
- PHP authentication service

---

## Project Structure (Core Logic)

- `wsHandler` → WebSocket connection handler
- `Hub` → Manages all chat rooms
- `Room` → Holds connected clients per chat
- `Client` → Represents a connected user
- `DB layer` → MySQL queries for messages/users
- `writer goroutine` → Handles outgoing WebSocket messages

---

## Setup

### Install dependencies

```bash
go mod tidy
```

### Configure MySQL
```bash
CREATE DATABASE liminalis;
```

#### Update connection string in initDB():
```bash
root:@tcp(127.0.0.1:3306)/liminalis
```

### Run server
```bash
go run .
```

## WebSocket Endpoint
```bash
ws://localhost:PORT/ws?token=YOUR_TOKEN
```