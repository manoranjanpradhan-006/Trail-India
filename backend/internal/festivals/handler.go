package festivals

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"strings"

	"trail-india/backend/internal/database"
	"trail-india/backend/internal/models"

	"github.com/go-chi/chi/v5"
)

func ListFestivals(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	month := r.URL.Query().Get("month")
	destID := r.URL.Query().Get("destination_id")
	search := r.URL.Query().Get("search")

	var conditions []string
	var args []interface{}
	paramIdx := 1

	if month != "" && month != "all" {
		if database.DriverName == "postgres" {
			conditions = append(conditions, "LOWER(f.celebration_month) LIKE $"+string(rune('0'+paramIdx)))
			paramIdx++
		} else {
			conditions = append(conditions, "LOWER(f.celebration_month) LIKE ?")
		}
		args = append(args, "%"+strings.ToLower(month)+"%")
	}

	if destID != "" && destID != "all" {
		if database.DriverName == "postgres" {
			conditions = append(conditions, "f.destination_id = $"+string(rune('0'+paramIdx)))
			paramIdx++
		} else {
			conditions = append(conditions, "f.destination_id = ?")
		}
		args = append(args, destID)
	}

	if search != "" {
		pattern := "%" + strings.ToLower(search) + "%"
		if database.DriverName == "postgres" {
			conditions = append(conditions, "(LOWER(f.name) LIKE $"+string(rune('0'+paramIdx))+" OR LOWER(f.description) LIKE $"+string(rune('0'+paramIdx))+")")
			paramIdx++
		} else {
			conditions = append(conditions, "(LOWER(f.name) LIKE ? OR LOWER(f.description) LIKE ?)")
			args = append(args, pattern)
		}
		args = append(args, pattern)
	}

	whereClause := ""
	if len(conditions) > 0 {
		whereClause = "WHERE " + strings.Join(conditions, " AND ")
	}

	query := `SELECT f.id, f.destination_id, COALESCE(d.name, 'Odisha') as destination_name,
		f.name, f.slug, f.description, f.celebration_month, f.typical_season, f.confirmed_date_info,
		f.location_summary, f.cultural_significance, f.visitor_tips, f.image_url, f.created_at
		FROM festivals f
		LEFT JOIN destinations d ON f.destination_id = d.id
		` + whereClause + `
		ORDER BY f.name ASC`

	rows, err := database.DB.Query(query, args...)
	if err != nil {
		http.Error(w, `{"error":"Failed to query festivals"}`, http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	festivals := []models.Festival{}
	for rows.Next() {
		var f models.Festival
		var destIDNull sql.NullString
		err := rows.Scan(&f.ID, &destIDNull, &f.DestinationName, &f.Name, &f.Slug, &f.Description,
			&f.CelebrationMonth, &f.TypicalSeason, &f.ConfirmedDateInfo, &f.LocationSummary,
			&f.CulturalSignificance, &f.VisitorTips, &f.ImageURL, &f.CreatedAt)
		if err != nil {
			continue
		}
		if destIDNull.Valid {
			f.DestinationID = &destIDNull.String
		}
		festivals = append(festivals, f)
	}

	json.NewEncoder(w).Encode(festivals)
}

func GetFestivalBySlug(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	slug := chi.URLParam(r, "slug")

	query := `SELECT f.id, f.destination_id, COALESCE(d.name, 'Odisha') as destination_name,
		f.name, f.slug, f.description, f.celebration_month, f.typical_season, f.confirmed_date_info,
		f.location_summary, f.cultural_significance, f.visitor_tips, f.image_url, f.created_at
		FROM festivals f
		LEFT JOIN destinations d ON f.destination_id = d.id
		WHERE f.slug = ? OR f.id = ?`
	if database.DriverName == "postgres" {
		query = `SELECT f.id, f.destination_id, COALESCE(d.name, 'Odisha') as destination_name,
			f.name, f.slug, f.description, f.celebration_month, f.typical_season, f.confirmed_date_info,
			f.location_summary, f.cultural_significance, f.visitor_tips, f.image_url, f.created_at
			FROM festivals f
			LEFT JOIN destinations d ON f.destination_id = d.id
			WHERE f.slug = $1 OR f.id = $2`
	}

	var f models.Festival
	var destIDNull sql.NullString
	err := database.DB.QueryRow(query, slug, slug).Scan(&f.ID, &destIDNull, &f.DestinationName,
		&f.Name, &f.Slug, &f.Description, &f.CelebrationMonth, &f.TypicalSeason, &f.ConfirmedDateInfo,
		&f.LocationSummary, &f.CulturalSignificance, &f.VisitorTips, &f.ImageURL, &f.CreatedAt)
	if err != nil {
		http.Error(w, `{"error":"Festival not found"}`, http.StatusNotFound)
		return
	}
	if destIDNull.Valid {
		f.DestinationID = &destIDNull.String
	}

	json.NewEncoder(w).Encode(f)
}
