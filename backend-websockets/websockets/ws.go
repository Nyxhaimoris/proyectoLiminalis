package main

import (
	"encoding/json"
	"log"
	"net/http"

	"github.com/gorilla/websocket"
)

// Structs

type IncomingMessage struct {
	Type      string `json:"type"`
	ChatID    int    `json:"chat_id"`
	Content   string `json:"content"`
	MessageID int64  `json:"message_id"`
}

type OutgoingMessage struct {
	ID       int64  `json:"id"`
	Type     string `json:"type"`
	ChatID   int    `json:"chat_id"`
	UserID   int    `json:"user_id"`
	UserName string `json:"user_name"`
	Content  string `json:"content"`
}

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool { return true },
}

// Note: Assumes global variables 'db', 'hub' exist in your main package
func wsHandler(w http.ResponseWriter, r *http.Request) {
	tokenStr := r.URL.Query().Get("token")

	userID, err := validateWithPHP(tokenStr)
	if err != nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println("WS upgrade error:", err)
		return
	}

	client := &Client{
		UserID: userID,
		Conn:   conn,
		Send:   make(chan []byte, 256),
	}

	go writer(client)

	defer func() {
		removeClientFromAllRooms(client)
		conn.Close()
	}()

	for {
		_, raw, err := conn.ReadMessage()
		if err != nil {
			break
		}

		var msg IncomingMessage
		if err := json.Unmarshal(raw, &msg); err != nil {
			log.Printf("Unmarshal Error: %v", err)
			continue
		}

		// Verify membership for every action
		if !isMember(msg.ChatID, client.UserID) {
			log.Printf("User %d tried to access Chat %d without membership", client.UserID, msg.ChatID)
			continue
		}

		room := hub.getRoom(msg.ChatID)

		switch msg.Type {
		case "join":
			client.RoomID = msg.ChatID
			room.Mutex.Lock()
			room.Clients[client] = true
			room.Mutex.Unlock()
			log.Printf("User %d joined Chat %d", client.UserID, msg.ChatID)

		case "delete_message":
			if msg.MessageID == 0 {
				continue
			}

			// Ownership/Permission Check
			var ownerID int
			err := db.QueryRow(
				"SELECT user_id FROM messages WHERE id=? AND chat_id=?",
				msg.MessageID, msg.ChatID,
			).Scan(&ownerID)

			if err != nil {
				log.Printf("Delete Check Failed: Message %d not found in Chat %d", msg.MessageID, msg.ChatID)
				continue
			}

			role := getRole(msg.ChatID, client.UserID)
			if ownerID != client.UserID && role != "admin" {
				log.Printf("Delete Forbidden: User %d is not owner or admin", client.UserID)
				continue
			}

			// Database Deletion
			_, err = db.Exec("DELETE FROM messages WHERE id=? AND chat_id=?", msg.MessageID, msg.ChatID)
			if err != nil {
				log.Printf("SQL Delete Error: %v", err)
				continue
			}

			// Global Broadcast
			out := map[string]any{
				"type":    "delete_message",
				"id":      msg.MessageID,
				"chat_id": msg.ChatID,
			}
			payload, _ := json.Marshal(out)

			room.Mutex.RLock()
			for c := range room.Clients {
				select {
				case c.Send <- payload:
				default:
				}
			}
			room.Mutex.RUnlock()

		case "message":
			res, err := db.Exec(
				"INSERT INTO messages (chat_id, user_id, message) VALUES (?, ?, ?)",
				msg.ChatID, userID, msg.Content,
			)
			if err != nil {
				log.Println("DB error:", err)
				continue
			}

			id, _ := res.LastInsertId()
			username, _ := getUsername(userID)

			out := OutgoingMessage{
				ID:       id,
				Type:     "message",
				ChatID:   msg.ChatID,
				UserID:   userID,
				UserName: username,
				Content:  msg.Content,
			}

			payload, _ := json.Marshal(out)

			room.Mutex.RLock()
			for c := range room.Clients {
				select {
				case c.Send <- payload:
				default:
				}
			}
			room.Mutex.RUnlock()
		}
	}
}
