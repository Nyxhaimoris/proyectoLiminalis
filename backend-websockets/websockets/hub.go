package main

import "sync"

// Room represents a chat room containing connected clients.
// Uses a mutex to safely manage concurrent access to the Clients map.
type Room struct {
	Clients map[*Client]bool
	Mutex   sync.RWMutex
}

// Hub manages all chat rooms.
// It stores rooms indexed by chat ID and protects access with a mutex.
type Hub struct {
	Rooms map[int]*Room
	Mutex sync.RWMutex
}

// Global hub instance holding all active rooms.
var hub = Hub{Rooms: make(map[int]*Room)}

// getRoom retrieves an existing room by chatID or creates a new one if it does not exist.
// It ensures thread-safe access to the hub's room map.
func (h *Hub) getRoom(chatID int) *Room {
	h.Mutex.Lock()
	defer h.Mutex.Unlock()

	room, ok := h.Rooms[chatID] // Check if room already exists
	if ok {
		return room
	}

	// Create a new room if it does not exist
	room = &Room{
		Clients: make(map[*Client]bool),
	}
	h.Rooms[chatID] = room
	return room
}

// removeClientFromAllRooms removes a client from every room in the hub.
// It iterates through all rooms and deletes the client safely.
func removeClientFromAllRooms(client *Client) {
	hub.Mutex.RLock()
	defer hub.Mutex.RUnlock()

	// Iterate over all rooms in the hub
	for _, room := range hub.Rooms {
		room.Mutex.Lock()
		delete(room.Clients, client)
		room.Mutex.Unlock()
	}
}
