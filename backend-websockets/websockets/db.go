package main

import (
	"database/sql"
	"log"
	"time"

	_ "github.com/go-sql-driver/mysql"
)

// Global database connection pool
var db *sql.DB

// Open a connection to the MySQL database
func initDB() {
	var err error
	db, err = sql.Open("mysql", "root:@tcp(127.0.0.1:3306)/liminalis")
	if err != nil {
		log.Fatalf("DB ERROR: %v", err)
	}

	// Configure connection pool settings
	db.SetMaxOpenConns(25)
	db.SetMaxIdleConns(25)
	db.SetConnMaxLifetime(time.Hour)
	// Verify that the database connection is alive>
	if err = db.Ping(); err != nil {
		log.Fatalf("DB PING ERROR: %v", err)
	}

	log.Println("DB connected")
}

// isMember checks whether a user is a member of a specific chat.
func isMember(chatID, userID int) bool {
	var id int
	// Query to check membership existence
	err := db.QueryRow(
		"SELECT id FROM chat_members WHERE chat_id=? AND user_id=?",
		chatID, userID,
	).Scan(&id)
	// If no error, the user is a member
	return err == nil
}

func getUsername(userID int) (string, error) {
	var username string

	err := db.QueryRow(
		"SELECT name FROM users WHERE id = ?",
		userID,
	).Scan(&username)

	return username, err
}

// getRole retrieves the role of a user inside a specific chat.
func getRole(chatID int, userID int) string {
	var role string
	// Query the role from the chat_members table
	err := db.QueryRow(
		"SELECT role FROM chat_members WHERE chat_id=? AND user_id=?",
		chatID, userID,
	).Scan(&role)
	// Return empty string if query fails
	if err != nil {
		return ""
	}

	return role
}
