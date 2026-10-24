package reviews

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"strings"
	"time"

	"trail-india/backend/internal/auth"
	"trail-india/backend/internal/database"
	"trail-india/backend/internal/models"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
)

func ListPlaceReviews(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	placeID := chi.URLParam(r, "id")

	query := `SELECT r.id, r.place_id, r.user_id, COALESCE(up.display_name, 'Anonymous Traveler') as author_name,
		r.rating, r.title, r.comment, r.visit_date, r.is_reported, r.created_at, r.updated_at
		FROM reviews r
		LEFT JOIN user_profiles up ON r.user_id = up.user_id
		WHERE r.place_id = ?
		ORDER BY r.created_at DESC`
	if database.DriverName == "postgres" {
		query = `SELECT r.id, r.place_id, r.user_id, COALESCE(up.display_name, 'Anonymous Traveler') as author_name,
			r.rating, r.title, r.comment, r.visit_date, r.is_reported, r.created_at, r.updated_at
			FROM reviews r
			LEFT JOIN user_profiles up ON r.user_id = up.user_id
			WHERE r.place_id = $1
			ORDER BY r.created_at DESC`
	}

	rows, err := database.DB.Query(query, placeID)
	if err != nil {
		http.Error(w, `{"error":"Failed to retrieve reviews"}`, http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	reviewsList := []models.Review{}
	for rows.Next() {
		var rev models.Review
		var isRep int
		if database.DriverName == "postgres" {
			var isRepBool bool
			_ = rows.Scan(&rev.ID, &rev.PlaceID, &rev.UserID, &rev.AuthorName, &rev.Rating, &rev.Title,
				&rev.Comment, &rev.VisitDate, &isRepBool, &rev.CreatedAt, &rev.UpdatedAt)
			rev.IsReported = isRepBool
		} else {
			_ = rows.Scan(&rev.ID, &rev.PlaceID, &rev.UserID, &rev.AuthorName, &rev.Rating, &rev.Title,
				&rev.Comment, &rev.VisitDate, &isRep, &rev.CreatedAt, &rev.UpdatedAt)
			rev.IsReported = (isRep == 1)
		}
		reviewsList = append(reviewsList, rev)
	}

	json.NewEncoder(w).Encode(reviewsList)
}

type CreateReviewRequest struct {
	Rating    int    `json:"rating"`
	Title     string `json:"title"`
	Comment   string `json:"comment"`
	VisitDate string `json:"visit_date"`
}

func CreateReview(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	claims := auth.GetUserFromContext(r.Context())
	if claims == nil {
		http.Error(w, `{"error":"Authentication required to submit a review"}`, http.StatusUnauthorized)
		return
	}

	placeID := chi.URLParam(r, "id")
	var req CreateReviewRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error":"Invalid request payload"}`, http.StatusBadRequest)
		return
	}

	if req.Rating < 1 || req.Rating > 5 || strings.TrimSpace(req.Title) == "" || strings.TrimSpace(req.Comment) == "" {
		http.Error(w, `{"error":"Rating between 1 and 5, title, and comment are required"}`, http.StatusBadRequest)
		return
	}

	// Check for existing review by this user on this place (enforces one active review rule)
	var existingID string
	checkQuery := "SELECT id FROM reviews WHERE place_id = ? AND user_id = ?"
	if database.DriverName == "postgres" {
		checkQuery = "SELECT id FROM reviews WHERE place_id = $1 AND user_id = $2"
	}
	err := database.DB.QueryRow(checkQuery, placeID, claims.UserID).Scan(&existingID)
	if err == nil && existingID != "" {
		http.Error(w, `{"error":"You have already reviewed this place. You can edit your existing review."}`, http.StatusConflict)
		return
	}

	reviewID := "rev-" + uuid.New().String()
	insertQuery := `INSERT INTO reviews (id, place_id, user_id, rating, title, comment, visit_date, created_at, updated_at) 
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
	if database.DriverName == "postgres" {
		insertQuery = `INSERT INTO reviews (id, place_id, user_id, rating, title, comment, visit_date, created_at, updated_at) 
			VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`
	}

	now := time.Now()
	_, err = database.DB.Exec(insertQuery, reviewID, placeID, claims.UserID, req.Rating, req.Title, req.Comment, req.VisitDate, now, now)
	if err != nil {
		http.Error(w, `{"error":"Failed to save review"}`, http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"id":         reviewID,
		"place_id":   placeID,
		"rating":     req.Rating,
		"title":      req.Title,
		"comment":    req.Comment,
		"visit_date": req.VisitDate,
		"created_at": now,
	})
}

func UpdateReview(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	claims := auth.GetUserFromContext(r.Context())
	if claims == nil {
		http.Error(w, `{"error":"Unauthorized"}`, http.StatusUnauthorized)
		return
	}

	reviewID := chi.URLParam(r, "id")
	var req CreateReviewRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error":"Invalid request payload"}`, http.StatusBadRequest)
		return
	}

	// Verify ownership
	var ownerID string
	checkQuery := "SELECT user_id FROM reviews WHERE id = ?"
	if database.DriverName == "postgres" {
		checkQuery = "SELECT user_id FROM reviews WHERE id = $1"
	}
	err := database.DB.QueryRow(checkQuery, reviewID).Scan(&ownerID)
	if err == sql.ErrNoRows {
		http.Error(w, `{"error":"Review not found"}`, http.StatusNotFound)
		return
	}
	if ownerID != claims.UserID && claims.Role != "admin" {
		http.Error(w, `{"error":"You can only edit your own reviews"}`, http.StatusForbidden)
		return
	}

	updateQuery := `UPDATE reviews SET rating = ?, title = ?, comment = ?, visit_date = ?, updated_at = ? WHERE id = ?`
	if database.DriverName == "postgres" {
		updateQuery = `UPDATE reviews SET rating = $1, title = $2, comment = $3, visit_date = $4, updated_at = $5 WHERE id = $6`
	}

	_, err = database.DB.Exec(updateQuery, req.Rating, req.Title, req.Comment, req.VisitDate, time.Now(), reviewID)
	if err != nil {
		http.Error(w, `{"error":"Failed to update review"}`, http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(map[string]string{"message": "Review updated successfully"})
}

func DeleteReview(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	claims := auth.GetUserFromContext(r.Context())
	if claims == nil {
		http.Error(w, `{"error":"Unauthorized"}`, http.StatusUnauthorized)
		return
	}

	reviewID := chi.URLParam(r, "id")

	// Verify ownership
	var ownerID string
	checkQuery := "SELECT user_id FROM reviews WHERE id = ?"
	if database.DriverName == "postgres" {
		checkQuery = "SELECT user_id FROM reviews WHERE id = $1"
	}
	err := database.DB.QueryRow(checkQuery, reviewID).Scan(&ownerID)
	if err == sql.ErrNoRows {
		http.Error(w, `{"error":"Review not found"}`, http.StatusNotFound)
		return
	}
	if ownerID != claims.UserID && claims.Role != "admin" {
		http.Error(w, `{"error":"You can only delete your own reviews"}`, http.StatusForbidden)
		return
	}

	deleteQuery := "DELETE FROM reviews WHERE id = ?"
	if database.DriverName == "postgres" {
		deleteQuery = "DELETE FROM reviews WHERE id = $1"
	}
	_, err = database.DB.Exec(deleteQuery, reviewID)
	if err != nil {
		http.Error(w, `{"error":"Failed to delete review"}`, http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(map[string]string{"message": "Review deleted successfully"})
}

func ReportReview(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	reviewID := chi.URLParam(r, "id")

	reportQuery := "UPDATE reviews SET is_reported = 1 WHERE id = ?"
	if database.DriverName == "postgres" {
		reportQuery = "UPDATE reviews SET is_reported = TRUE WHERE id = $1"
	}
	_, err := database.DB.Exec(reportQuery, reviewID)
	if err != nil {
		http.Error(w, `{"error":"Failed to report review"}`, http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(map[string]string{"message": "Review reported for moderation"})
}
