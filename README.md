# Liminalis

Liminalis is a full-stack social web application built as part of a **Grado Superior en Desarrollo de Aplicaciones Web (DAW)** project. It combines a REST API, a WebSocket server, and a modern React frontend to deliver real-time communication, user interaction, and content creation features.

> This project was developed for educational purposes. Some architectural decisions and implementation details may be simplified or experimental compared to production-grade systems.

---

## Tech Stack

### Backend

* **Go** - WebSocket server for real-time communication
* **PHP (CodeIgniter 4)** - REST API and business logic
* **MySQL** - Relational database

### Frontend

* **React**
* **React Router**
* **Custom-built rich text editor**

---

## Features

### Authentication

* User registration and login
* JWT-based authentication with token refresh
* Protected routes (user and admin levels)

### User Profiles

* View and update profile information
* Follow and unfollow users
* View followers and following lists

### Posts

* Create and retrieve posts
* Feed system
* Image uploads
* Like and unlike functionality

### Real-Time Chat

* WebSocket-based messaging
* Multi-room chat support
* Join and leave chat rooms
* Message broadcasting
* Message deletion with permission checks (owner or admin)

### Rich Text Editor

* Line-based formatting system
* Bold, italic, underline, strike-through, alignment
* Inline link parsing
* Image token system
* Conversion to structured document format for storage

### Admin Tools

* User management (ban/unban, promote)
* Post moderation

---

## Architecture

The application is divided into three main components:

* **Frontend (React)** Handles UI, routing, and user interaction
* **Backend API (CodeIgniter 4)** Provides REST API, authentication, and business logic
* **WebSocket Server (Go)** Handles real-time communication

---

## WebSocket Connection

Clients connect to the WebSocket server using a JWT token:

```
ws://<server>/ws?token=<JWT>
```

---

## Setup

### PHP Backend

```bash
composer install
cp .env.example .env
php spark serve
```

### Go WebSocket Server

```bash
go mod tidy
go run main.go
```

### Frontend

```bash
npm install
cp .env.example .env
npm run dev
```

---

## License

This project is licensed under the **Apache License 2.0**.
