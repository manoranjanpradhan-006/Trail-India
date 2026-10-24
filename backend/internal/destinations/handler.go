package destinations

import (
	"encoding/json"
	"net/http"

	"trail-india/backend/internal/database"
	"trail-india/backend/internal/models"

	"github.com/go-chi/chi/v5"
)

func ListDestinations(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	query := `SELECT d.id, d.name, d.slug, d.state, d.district, d.tagline, d.description, d.overview, 
		d.banner_image, d.best_time_to_visit, d.weather_info, d.how_to_reach, d.latitude, d.longitude, d.created_at,
		COUNT(p.id) as place_count
		FROM destinations d
		LEFT JOIN places p ON d.id = p.destination_id
		GROUP BY d.id
		ORDER BY d.name ASC`

	rows, err := database.DB.Query(query)
	if err != nil {
		http.Error(w, `{"error":"Failed to retrieve destinations"}`, http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	destinations := []models.Destination{}
	for rows.Next() {
		var d models.Destination
		err := rows.Scan(&d.ID, &d.Name, &d.Slug, &d.State, &d.District, &d.Tagline, &d.Description, &d.Overview,
			&d.BannerImage, &d.BestTimeToVisit, &d.WeatherInfo, &d.HowToReach, &d.Latitude, &d.Longitude, &d.CreatedAt, &d.PlaceCount)
		if err != nil {
			continue
		}
		destinations = append(destinations, d)
	}

	json.NewEncoder(w).Encode(destinations)
}

func GetDestinationBySlug(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	slug := chi.URLParam(r, "slug")

	var d models.Destination
	query := `SELECT id, name, slug, state, district, tagline, description, overview, banner_image, 
		best_time_to_visit, weather_info, how_to_reach, latitude, longitude, created_at
		FROM destinations WHERE slug = ? OR id = ?`
	if database.DriverName == "postgres" {
		query = `SELECT id, name, slug, state, district, tagline, description, overview, banner_image, 
			best_time_to_visit, weather_info, how_to_reach, latitude, longitude, created_at
			FROM destinations WHERE slug = $1 OR id = $2`
	}

	err := database.DB.QueryRow(query, slug, slug).Scan(&d.ID, &d.Name, &d.Slug, &d.State, &d.District, &d.Tagline,
		&d.Description, &d.Overview, &d.BannerImage, &d.BestTimeToVisit, &d.WeatherInfo, &d.HowToReach, &d.Latitude, &d.Longitude, &d.CreatedAt)
	if err != nil {
		http.Error(w, `{"error":"Destination not found"}`, http.StatusNotFound)
		return
	}

	// Fetch places for this destination
	placeQuery := `SELECT p.id, p.destination_id, p.name, p.slug, p.category, p.description, p.address,
		p.latitude, p.longitude, p.entry_fee, p.opening_hours, p.image_url, p.highlights, p.is_featured,
		COALESCE(AVG(r.rating), 0.0) as avg_rating,
		COUNT(r.id) as review_count
		FROM places p
		LEFT JOIN reviews r ON p.id = r.place_id
		WHERE p.destination_id = ?
		GROUP BY p.id
		ORDER BY p.is_featured DESC, p.name ASC`
	if database.DriverName == "postgres" {
		placeQuery = `SELECT p.id, p.destination_id, p.name, p.slug, p.category, p.description, p.address,
			p.latitude, p.longitude, p.entry_fee, p.opening_hours, p.image_url, p.highlights, p.is_featured,
			COALESCE(AVG(r.rating), 0.0) as avg_rating,
			COUNT(r.id) as review_count
			FROM places p
			LEFT JOIN reviews r ON p.id = r.place_id
			WHERE p.destination_id = $1
			GROUP BY p.id
			ORDER BY p.is_featured DESC, p.name ASC`
	}

	pRows, err := database.DB.Query(placeQuery, d.ID)
	if err == nil {
		defer pRows.Close()
		for pRows.Next() {
			var p models.Place
			var hlRaw string
			var isFeat int
			var avgRating float64
			var revCount int
			if database.DriverName == "postgres" {
				var featBool bool
				_ = pRows.Scan(&p.ID, &p.DestinationID, &p.Name, &p.Slug, &p.Category, &p.Description, &p.Address,
					&p.Latitude, &p.Longitude, &p.EntryFee, &p.OpeningHours, &p.ImageURL, &hlRaw, &featBool, &avgRating, &revCount)
				p.IsFeatured = featBool
			} else {
				_ = pRows.Scan(&p.ID, &p.DestinationID, &p.Name, &p.Slug, &p.Category, &p.Description, &p.Address,
					&p.Latitude, &p.Longitude, &p.EntryFee, &p.OpeningHours, &p.ImageURL, &hlRaw, &isFeat, &avgRating, &revCount)
				p.IsFeatured = (isFeat == 1)
			}
			p.Rating = avgRating
			p.ReviewCount = revCount
			_ = json.Unmarshal([]byte(hlRaw), &p.Highlights)
			p.Destination = d.Name
			d.Places = append(d.Places, p)
		}
	}
	d.PlaceCount = len(d.Places)

	json.NewEncoder(w).Encode(d)
}
