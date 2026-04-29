package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"time"
)

// validateWithPHP sends a request to a PHP backend to validate a token
// and returns the associated user ID if the token is valid.
func validateWithPHP(tokenStr string) (int, error) {
	// Create an HTTP client with a timeout to avoid hanging requests
	client := &http.Client{Timeout: 5 * time.Second}

	req, _ := http.NewRequest(
		"GET",
		"http://localhost/liminalis/public/index.php/auth/ws-validate",
		nil,
	)

	// Attach the token in the Authorization header using Bearer scheme
	req.Header.Set("Authorization", "Bearer "+tokenStr)

	resp, err := client.Do(req) // Execute the HTTP request
	if err != nil {
		return 0, err
	}
	defer resp.Body.Close()

	// Check if the response indicates a successful authentication
	if resp.StatusCode != 200 {
		return 0, fmt.Errorf("auth failed: %d", resp.StatusCode) // If not, return an error
	}

	var data struct {
		UID int `json:"uid"`
	}

	// Decode the JSON response body into the struct
	if err := json.NewDecoder(resp.Body).Decode(&data); err != nil {
		return 0, err
	}
	// Return the user ID extracted from the response
	return data.UID, nil
}
