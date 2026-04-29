package main

import (
	"log"
	"net/http"
)

// Main func, starting point
func main() {
	// Calls db.initDB
	initDB()

	// Any requests to "/ws" will be handled by wsHandler in ws.go
	http.HandleFunc("/ws", wsHandler)

	// Prints that the server is running on the port 8080
	log.Println("Server running on :8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}
