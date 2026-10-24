package trips

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"time"

	"trail-india/backend/internal/auth"
	"trail-india/backend/internal/database"
	"trail-india/backend/internal/models"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
)

func ListTrips(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	claims := auth.GetUserFromContext(r.Context())
	if claims == nil {
		http.Error(w, `{"error":"Unauthorized"}`, http.StatusUnauthorized)
		return
	}

	query := `SELECT id, user_id, title, description, start_date, end_date, budget_estimate, itinerary_data, created_at, updated_at 
		FROM trips WHERE user_id = ? ORDER BY created_at DESC`
	if database.DriverName == "postgres" {
		query = `SELECT id, user_id, title, description, start_date, end_date, budget_estimate, itinerary_data, created_at, updated_at 
			FROM trips WHERE user_id = $1 ORDER BY created_at DESC`
	}

	rows, err := database.DB.Query(query, claims.UserID)
	if err != nil {
		http.Error(w, `{"error":"Failed to retrieve trips"}`, http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	tripsList := []models.Trip{}
	for rows.Next() {
		var t models.Trip
		var itinRaw string
		err := rows.Scan(&t.ID, &t.UserID, &t.Title, &t.Description, &t.StartDate, &t.EndDate, &t.BudgetEstimate, &itinRaw, &t.CreatedAt, &t.UpdatedAt)
		if err != nil {
			continue
		}
		_ = json.Unmarshal([]byte(itinRaw), &t.ItineraryData)
		tripsList = append(tripsList, t)
	}

	json.NewEncoder(w).Encode(tripsList)
}

func GetTripByID(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	claims := auth.GetUserFromContext(r.Context())
	if claims == nil {
		http.Error(w, `{"error":"Unauthorized"}`, http.StatusUnauthorized)
		return
	}

	tripID := chi.URLParam(r, "id")
	query := `SELECT id, user_id, title, description, start_date, end_date, budget_estimate, itinerary_data, created_at, updated_at 
		FROM trips WHERE id = ?`
	if database.DriverName == "postgres" {
		query = `SELECT id, user_id, title, description, start_date, end_date, budget_estimate, itinerary_data, created_at, updated_at 
			FROM trips WHERE id = $1`
	}

	var t models.Trip
	var itinRaw string
	err := database.DB.QueryRow(query, tripID).Scan(&t.ID, &t.UserID, &t.Title, &t.Description, &t.StartDate, &t.EndDate, &t.BudgetEstimate, &itinRaw, &t.CreatedAt, &t.UpdatedAt)
	if err != nil {
		http.Error(w, `{"error":"Trip not found"}`, http.StatusNotFound)
		return
	}

	if t.UserID != claims.UserID && claims.Role != "admin" {
		http.Error(w, `{"error":"Access denied to this itinerary"}`, http.StatusForbidden)
		return
	}

	_ = json.Unmarshal([]byte(itinRaw), &t.ItineraryData)
	json.NewEncoder(w).Encode(t)
}

type TripRequest struct {
	Title          string               `json:"title"`
	Description    string               `json:"description"`
	StartDate      string               `json:"start_date"`
	EndDate        string               `json:"end_date"`
	BudgetEstimate float64              `json:"budget_estimate"`
	ItineraryData  []models.TripDay     `json:"itinerary_data"`
}

func CreateTrip(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	claims := auth.GetUserFromContext(r.Context())
	if claims == nil {
		http.Error(w, `{"error":"Unauthorized"}`, http.StatusUnauthorized)
		return
	}

	var req TripRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil || req.Title == "" {
		http.Error(w, `{"error":"Valid trip title is required"}`, http.StatusBadRequest)
		return
	}

	id := "trip-" + uuid.New().String()
	itinJSON, _ := json.Marshal(req.ItineraryData)
	now := time.Now()

	insertQuery := `INSERT INTO trips (id, user_id, title, description, start_date, end_date, budget_estimate, itinerary_data, created_at, updated_at)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
	if database.DriverName == "postgres" {
		insertQuery = `INSERT INTO trips (id, user_id, title, description, start_date, end_date, budget_estimate, itinerary_data, created_at, updated_at)
			VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`
	}

	_, err := database.DB.Exec(insertQuery, id, claims.UserID, req.Title, req.Description, req.StartDate, req.EndDate, req.BudgetEstimate, string(itinJSON), now, now)
	if err != nil {
		http.Error(w, `{"error":"Failed to save trip"}`, http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"id":      id,
		"message": "Trip itinerary created successfully",
	})
}

func UpdateTrip(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	claims := auth.GetUserFromContext(r.Context())
	if claims == nil {
		http.Error(w, `{"error":"Unauthorized"}`, http.StatusUnauthorized)
		return
	}

	tripID := chi.URLParam(r, "id")

	// Ownership check
	var ownerID string
	checkQuery := "SELECT user_id FROM trips WHERE id = ?"
	if database.DriverName == "postgres" {
		checkQuery = "SELECT user_id FROM trips WHERE id = $1"
	}
	err := database.DB.QueryRow(checkQuery, tripID).Scan(&ownerID)
	if err == sql.ErrNoRows {
		http.Error(w, `{"error":"Trip not found"}`, http.StatusNotFound)
		return
	}
	if ownerID != claims.UserID && claims.Role != "admin" {
		http.Error(w, `{"error":"Forbidden"}`, http.StatusForbidden)
		return
	}

	var req TripRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error":"Invalid payload"}`, http.StatusBadRequest)
		return
	}

	itinJSON, _ := json.Marshal(req.ItineraryData)
	updateQuery := `UPDATE trips SET title = ?, description = ?, start_date = ?, end_date = ?, budget_estimate = ?, itinerary_data = ?, updated_at = ? WHERE id = ?`
	if database.DriverName == "postgres" {
		updateQuery = `UPDATE trips SET title = $1, description = $2, start_date = $3, end_date = $4, budget_estimate = $5, itinerary_data = $6, updated_at = $7 WHERE id = $8`
	}

	_, err = database.DB.Exec(updateQuery, req.Title, req.Description, req.StartDate, req.EndDate, req.BudgetEstimate, string(itinJSON), time.Now(), tripID)
	if err != nil {
		http.Error(w, `{"error":"Failed to update trip"}`, http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(map[string]string{"message": "Trip itinerary updated"})
}

func DeleteTrip(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	claims := auth.GetUserFromContext(r.Context())
	if claims == nil {
		http.Error(w, `{"error":"Unauthorized"}`, http.StatusUnauthorized)
		return
	}

	tripID := chi.URLParam(r, "id")
	deleteQuery := "DELETE FROM trips WHERE id = ? AND (user_id = ? OR ? = 'admin')"
	if database.DriverName == "postgres" {
		deleteQuery = "DELETE FROM trips WHERE id = $1 AND (user_id = $2 OR $3 = 'admin')"
	}

	_, err := database.DB.Exec(deleteQuery, tripID, claims.UserID, claims.Role)
	if err != nil {
		http.Error(w, `{"error":"Failed to delete trip"}`, http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(map[string]string{"message": "Trip deleted"})
}
