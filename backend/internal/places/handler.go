package places

import (
	"encoding/json"
	"net/http"
	"strings"

	"trail-india/backend/internal/database"
	"trail-india/backend/internal/models"

	"github.com/go-chi/chi/v5"
)

func ListPlaces(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	category := r.URL.Query().Get("category")
	destID := r.URL.Query().Get("destination_id")
	search := r.URL.Query().Get("search")
	featured := r.URL.Query().Get("featured")

	var conditions []string
	var args []interface{}
	paramIdx := 1

	if category != "" && category != "all" {
		if database.DriverName == "postgres" {
			conditions = append(conditions, "p.category = $"+string(rune('0'+paramIdx)))
			paramIdx++
		} else {
			conditions = append(conditions, "p.category = ?")
		}
		args = append(args, category)
	}

	if destID != "" && destID != "all" {
		if database.DriverName == "postgres" {
			conditions = append(conditions, "p.destination_id = $"+string(rune('0'+paramIdx)))
			paramIdx++
		} else {
			conditions = append(conditions, "p.destination_id = ?")
		}
		args = append(args, destID)
	}

	if search != "" {
		searchPattern := "%" + strings.ToLower(search) + "%"
		if database.DriverName == "postgres" {
			conditions = append(conditions, "(LOWER(p.name) LIKE $"+string(rune('0'+paramIdx))+" OR LOWER(p.description) LIKE $"+string(rune('0'+paramIdx))+")")
			paramIdx++
		} else {
			conditions = append(conditions, "(LOWER(p.name) LIKE ? OR LOWER(p.description) LIKE ?)")
			args = append(args, searchPattern)
		}
		args = append(args, searchPattern)
	}

	if featured == "true" {
		if database.DriverName == "postgres" {
			conditions = append(conditions, "p.is_featured = TRUE")
		} else {
			conditions = append(conditions, "p.is_featured = 1")
		}
	}

	whereClause := ""
	if len(conditions) > 0 {
		whereClause = "WHERE " + strings.Join(conditions, " AND ")
	}

	query := `SELECT p.id, p.destination_id, d.name as destination_name, p.name, p.slug, p.category, 
		p.description, p.address, p.latitude, p.longitude, p.entry_fee, p.opening_hours, p.image_url, 
		p.highlights, p.is_featured, p.created_at,
		COALESCE(AVG(r.rating), 0.0) as avg_rating,
		COUNT(r.id) as review_count
		FROM places p
		LEFT JOIN destinations d ON p.destination_id = d.id
		LEFT JOIN reviews r ON p.id = r.place_id
		` + whereClause + `
		GROUP BY p.id
		ORDER BY p.is_featured DESC, avg_rating DESC, p.name ASC`

	rows, err := database.DB.Query(query, args...)
	if err != nil {
		http.Error(w, `{"error":"Failed to query places"}`, http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	places := []models.Place{}
	for rows.Next() {
		var p models.Place
		var hlRaw string
		var isFeat int
		var avgRating float64
		var revCount int

		if database.DriverName == "postgres" {
			var featBool bool
			err := rows.Scan(&p.ID, &p.DestinationID, &p.Destination, &p.Name, &p.Slug, &p.Category,
				&p.Description, &p.Address, &p.Latitude, &p.Longitude, &p.EntryFee, &p.OpeningHours, &p.ImageURL,
				&hlRaw, &featBool, &p.CreatedAt, &avgRating, &revCount)
			if err != nil {
				continue
			}
			p.IsFeatured = featBool
		} else {
			err := rows.Scan(&p.ID, &p.DestinationID, &p.Destination, &p.Name, &p.Slug, &p.Category,
				&p.Description, &p.Address, &p.Latitude, &p.Longitude, &p.EntryFee, &p.OpeningHours, &p.ImageURL,
				&hlRaw, &isFeat, &p.CreatedAt, &avgRating, &revCount)
			if err != nil {
				continue
			}
			p.IsFeatured = (isFeat == 1)
		}

		p.Rating = avgRating
		p.ReviewCount = revCount
		_ = json.Unmarshal([]byte(hlRaw), &p.Highlights)
		places = append(places, p)
	}

	json.NewEncoder(w).Encode(places)
}

func GetPlaceByID(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	id := chi.URLParam(r, "id")

	query := `SELECT p.id, p.destination_id, d.name as destination_name, p.name, p.slug, p.category, 
		p.description, p.address, p.latitude, p.longitude, p.entry_fee, p.opening_hours, p.image_url, 
		p.highlights, p.is_featured, p.created_at,
		COALESCE(AVG(r.rating), 0.0) as avg_rating,
		COUNT(r.id) as review_count
		FROM places p
		LEFT JOIN destinations d ON p.destination_id = d.id
		LEFT JOIN reviews r ON p.id = r.place_id
		WHERE p.id = ? OR p.slug = ?
		GROUP BY p.id`
	if database.DriverName == "postgres" {
		query = `SELECT p.id, p.destination_id, d.name as destination_name, p.name, p.slug, p.category, 
			p.description, p.address, p.latitude, p.longitude, p.entry_fee, p.opening_hours, p.image_url, 
			p.highlights, p.is_featured, p.created_at,
			COALESCE(AVG(r.rating), 0.0) as avg_rating,
			COUNT(r.id) as review_count
			FROM places p
			LEFT JOIN destinations d ON p.destination_id = d.id
			LEFT JOIN reviews r ON p.id = r.place_id
			WHERE p.id = $1 OR p.slug = $2
			GROUP BY p.id`
	}

	var p models.Place
	var hlRaw string
	var isFeat int
	var avgRating float64
	var revCount int

	var err error
	if database.DriverName == "postgres" {
		var featBool bool
		err = database.DB.QueryRow(query, id, id).Scan(&p.ID, &p.DestinationID, &p.Destination, &p.Name, &p.Slug, &p.Category,
			&p.Description, &p.Address, &p.Latitude, &p.Longitude, &p.EntryFee, &p.OpeningHours, &p.ImageURL,
			&hlRaw, &featBool, &p.CreatedAt, &avgRating, &revCount)
		p.IsFeatured = featBool
	} else {
		err = database.DB.QueryRow(query, id, id).Scan(&p.ID, &p.DestinationID, &p.Destination, &p.Name, &p.Slug, &p.Category,
			&p.Description, &p.Address, &p.Latitude, &p.Longitude, &p.EntryFee, &p.OpeningHours, &p.ImageURL,
			&hlRaw, &isFeat, &p.CreatedAt, &avgRating, &revCount)
		p.IsFeatured = (isFeat == 1)
	}

	if err != nil {
		http.Error(w, `{"error":"Place not found"}`, http.StatusNotFound)
		return
	}

	p.Rating = avgRating
	p.ReviewCount = revCount
	_ = json.Unmarshal([]byte(hlRaw), &p.Highlights)

	json.NewEncoder(w).Encode(p)
}
