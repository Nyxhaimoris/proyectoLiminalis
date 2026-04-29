package main

import (
	"time"

	"github.com/gorilla/websocket"
)

// It stores the user's ID, their WebSocket connection,
// a send channel for outgoing messages, and the room they are in.
type Client struct {
	UserID int
	Conn   *websocket.Conn
	Send   chan []byte
	RoomID int
}

// writer handles outgoing messages for a client.
// It continuously reads from the Send channel and writes messages
// to the WebSocket connection.
func writer(c *Client) {
	defer func() {
		c.Conn.Close()
		close(c.Send)
	}()

	// Loop over messages sent to the client
	for msg := range c.Send {
		c.Conn.SetWriteDeadline(time.Now().Add(10 * time.Second))

		if err := c.Conn.WriteMessage(websocket.TextMessage, msg); err != nil {
			return // Exit the writer if an error occurs
		}
	}
}
