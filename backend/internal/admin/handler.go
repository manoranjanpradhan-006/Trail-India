package admin

import (
	"database/sql"
	"encoding/json"
	"net/http"

	"trail-india/backend/internal/auth"
	"trail-india/backend/internal/database"
	"trail-india/backend/internal/models"

	"github.com/go-chi/chi/v5"
)

func AdminMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		claims := auth.GetUserFromContext(r.Context())
		if claims == nil || claims.Role != "admin" {
			http.Error(w, `{"error":"Admin access required"}`, http.StatusForbidden)
			return
		}
		next.ServeHTTP(w, r)
	})
}

func ListPendingArticles(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	query := `SELECT b.id, b.author_id, COALESCE(up.display_name, 'Contributor') as author_name,
		b.destination_id, COALESCE(d.name, '') as destination_name,
		b.title, b.slug, b.excerpt, b.cover_image, b.content, b.category, b.tags, b.status,
		b.read_time_minutes, b.views_count, b.created_at, b.updated_at
		FROM blog_posts b
		LEFT JOIN user_profiles up ON b.author_id = up.user_id
		LEFT JOIN destinations d ON b.destination_id = d.id
		WHERE b.status = 'pending_review'
		ORDER BY b.created_at ASC`

	rows, err := database.DB.Query(query)
	if err != nil {
		http.Error(w, `{"error":"Failed to query pending articles"}`, http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	posts := []models.BlogPost{}
	for rows.Next() {
		var p models.BlogPost
		var tagsRaw string
		var destIDNull sql.NullString
		err := rows.Scan(&p.ID, &p.AuthorID, &p.AuthorName, &destIDNull, &p.DestinationName,
			&p.Title, &p.Slug, &p.Excerpt, &p.CoverImage, &p.Content, &p.Category, &tagsRaw, &p.Status,
			&p.ReadTimeMinutes, &p.ViewsCount, &p.CreatedAt, &p.UpdatedAt)
		if err != nil {
			continue
		}
		if destIDNull.Valid {
			p.DestinationID = &destIDNull.String
		}
		_ = json.Unmarshal([]byte(tagsRaw), &p.Tags)
		posts = append(posts, p)
	}

	json.NewEncoder(w).Encode(posts)
}

type ArticleReviewRequest struct {
	Action string `json:"action"` // "approve" or "reject"
}

func ReviewArticle(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	postID := chi.URLParam(r, "id")

	var req ArticleReviewRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error":"Invalid payload"}`, http.StatusBadRequest)
		return
	}

	newStatus := "published"
	if req.Action == "reject" {
		newStatus = "rejected"
	}

	updateQuery := "UPDATE blog_posts SET status = ? WHERE id = ?"
	if database.DriverName == "postgres" {
		updateQuery = "UPDATE blog_posts SET status = $1 WHERE id = $2"
	}

	_, err := database.DB.Exec(updateQuery, newStatus, postID)
	if err != nil {
		http.Error(w, `{"error":"Failed to update article status"}`, http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(map[string]string{"message": "Article status updated to " + newStatus})
}

func ListReportedReviews(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	query := `SELECT r.id, r.place_id, p.name as place_name, r.user_id, COALESCE(up.display_name, 'Anonymous') as author_name,
		r.rating, r.title, r.comment, r.visit_date, r.is_reported, r.created_at, r.updated_at
		FROM reviews r
		JOIN places p ON r.place_id = p.id
		LEFT JOIN user_profiles up ON r.user_id = up.user_id
		WHERE r.is_reported = 1 OR r.is_reported = TRUE
		ORDER BY r.created_at DESC`

	rows, err := database.DB.Query(query)
	if err != nil {
		http.Error(w, `{"error":"Failed to query reported reviews"}`, http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	reviewsList := []models.Review{}
	for rows.Next() {
		var rev models.Review
		var isRep int
		if database.DriverName == "postgres" {
			var isRepBool bool
			_ = rows.Scan(&rev.ID, &rev.PlaceID, &rev.PlaceName, &rev.UserID, &rev.AuthorName,
				&rev.Rating, &rev.Title, &rev.Comment, &rev.VisitDate, &isRepBool, &rev.CreatedAt, &rev.UpdatedAt)
			rev.IsReported = isRepBool
		} else {
			_ = rows.Scan(&rev.ID, &rev.PlaceID, &rev.PlaceName, &rev.UserID, &rev.AuthorName,
				&rev.Rating, &rev.Title, &rev.Comment, &rev.VisitDate, &isRep, &rev.CreatedAt, &rev.UpdatedAt)
			rev.IsReported = (isRep == 1)
		}
		reviewsList = append(reviewsList, rev)
	}

	json.NewEncoder(w).Encode(reviewsList)
}
