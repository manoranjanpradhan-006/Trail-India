package favorites

import (
	"encoding/json"
	"net/http"

	"trail-india/backend/internal/auth"
	"trail-india/backend/internal/database"
	"trail-india/backend/internal/models"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
)

func ListFavorites(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	claims := auth.GetUserFromContext(r.Context())
	if claims == nil {
		http.Error(w, `{"error":"Unauthorized"}`, http.StatusUnauthorized)
		return
	}

	query := `SELECT f.id, f.user_id, f.place_id, f.created_at,
		p.name, p.slug, p.category, p.description, p.address, p.latitude, p.longitude, 
		p.entry_fee, p.opening_hours, p.image_url, d.name as destination_name
		FROM favorites f
		JOIN places p ON f.place_id = p.id
		JOIN destinations d ON p.destination_id = d.id
		WHERE f.user_id = ?
		ORDER BY f.created_at DESC`
	if database.DriverName == "postgres" {
		query = `SELECT f.id, f.user_id, f.place_id, f.created_at,
			p.name, p.slug, p.category, p.description, p.address, p.latitude, p.longitude, 
			p.entry_fee, p.opening_hours, p.image_url, d.name as destination_name
			FROM favorites f
			JOIN places p ON f.place_id = p.id
			JOIN destinations d ON p.destination_id = d.id
			WHERE f.user_id = $1
			ORDER BY f.created_at DESC`
	}

	rows, err := database.DB.Query(query, claims.UserID)
	if err != nil {
		http.Error(w, `{"error":"Failed to retrieve favorites"}`, http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	favs := []models.Favorite{}
	for rows.Next() {
		var f models.Favorite
		var p models.Place
		err := rows.Scan(&f.ID, &f.UserID, &f.PlaceID, &f.CreatedAt,
			&p.Name, &p.Slug, &p.Category, &p.Description, &p.Address, &p.Latitude, &p.Longitude,
			&p.EntryFee, &p.OpeningHours, &p.ImageURL, &p.Destination)
		if err != nil {
			continue
		}
		p.ID = f.PlaceID
		f.Place = &p
		favs = append(favs, f)
	}

	json.NewEncoder(w).Encode(favs)
}

type AddFavoriteRequest struct {
	PlaceID string `json:"place_id"`
}

func AddFavorite(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	claims := auth.GetUserFromContext(r.Context())
	if claims == nil {
		http.Error(w, `{"error":"Unauthorized"}`, http.StatusUnauthorized)
		return
	}

	var req AddFavoriteRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil || req.PlaceID == "" {
		http.Error(w, `{"error":"Valid place_id is required"}`, http.StatusBadRequest)
		return
	}

	id := "fav-" + uuid.New().String()
	insertQuery := "INSERT INTO favorites (id, user_id, place_id) VALUES (?, ?, ?)"
	if database.DriverName == "postgres" {
		insertQuery = "INSERT INTO favorites (id, user_id, place_id) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING"
	}

	_, err := database.DB.Exec(insertQuery, id, claims.UserID, req.PlaceID)
	if err != nil {
		// Could already be favorite or ignore
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]string{"message": "Place saved to favorites", "place_id": req.PlaceID})
}

func RemoveFavorite(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	claims := auth.GetUserFromContext(r.Context())
	if claims == nil {
		http.Error(w, `{"error":"Unauthorized"}`, http.StatusUnauthorized)
		return
	}

	placeID := chi.URLParam(r, "placeId")
	deleteQuery := "DELETE FROM favorites WHERE user_id = ? AND place_id = ?"
	if database.DriverName == "postgres" {
		deleteQuery = "DELETE FROM favorites WHERE user_id = $1 AND place_id = $2"
	}

	_, err := database.DB.Exec(deleteQuery, claims.UserID, placeID)
	if err != nil {
		http.Error(w, `{"error":"Failed to remove favorite"}`, http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(map[string]string{"message": "Place removed from favorites"})
}
