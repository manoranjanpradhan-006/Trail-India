package blog

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"regexp"
	"strings"
	"time"

	"trail-india/backend/internal/auth"
	"trail-india/backend/internal/database"
	"trail-india/backend/internal/models"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
)

func slugify(title string) string {
	slug := strings.ToLower(title)
	reg := regexp.MustCompile("[^a-z0-9]+")
	slug = reg.ReplaceAllString(slug, "-")
	return strings.Trim(slug, "-")
}

func ListBlogPosts(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	category := r.URL.Query().Get("category")
	destID := r.URL.Query().Get("destination_id")
	search := r.URL.Query().Get("search")
	statusFilter := r.URL.Query().Get("status")

	claims := auth.GetUserFromContext(r.Context())

	// Default to published articles only for public
	if statusFilter == "" {
		statusFilter = "published"
	} else if statusFilter != "published" {
		// Non-published posts require logged in user
		if claims == nil {
			statusFilter = "published"
		}
	}

	var conditions []string
	var args []interface{}
	paramIdx := 1

	if statusFilter == "my_drafts" && claims != nil {
		if database.DriverName == "postgres" {
			conditions = append(conditions, "b.author_id = $"+string(rune('0'+paramIdx)))
			paramIdx++
			conditions = append(conditions, "b.status IN ('draft', 'pending_review')")
		} else {
			conditions = append(conditions, "b.author_id = ? AND b.status IN ('draft', 'pending_review')")
		}
		args = append(args, claims.UserID)
	} else {
		if database.DriverName == "postgres" {
			conditions = append(conditions, "b.status = $"+string(rune('0'+paramIdx)))
			paramIdx++
		} else {
			conditions = append(conditions, "b.status = ?")
		}
		args = append(args, statusFilter)
	}

	if category != "" && category != "all" {
		if database.DriverName == "postgres" {
			conditions = append(conditions, "b.category = $"+string(rune('0'+paramIdx)))
			paramIdx++
		} else {
			conditions = append(conditions, "b.category = ?")
		}
		args = append(args, category)
	}

	if destID != "" && destID != "all" {
		if database.DriverName == "postgres" {
			conditions = append(conditions, "b.destination_id = $"+string(rune('0'+paramIdx)))
			paramIdx++
		} else {
			conditions = append(conditions, "b.destination_id = ?")
		}
		args = append(args, destID)
	}

	if search != "" {
		pattern := "%" + strings.ToLower(search) + "%"
		if database.DriverName == "postgres" {
			conditions = append(conditions, "(LOWER(b.title) LIKE $"+string(rune('0'+paramIdx))+" OR LOWER(b.excerpt) LIKE $"+string(rune('0'+paramIdx))+")")
			paramIdx++
		} else {
			conditions = append(conditions, "(LOWER(b.title) LIKE ? OR LOWER(b.excerpt) LIKE ?)")
			args = append(args, pattern)
		}
		args = append(args, pattern)
	}

	whereClause := ""
	if len(conditions) > 0 {
		whereClause = "WHERE " + strings.Join(conditions, " AND ")
	}

	query := `SELECT b.id, b.author_id, COALESCE(up.display_name, 'Contributor') as author_name,
		b.destination_id, COALESCE(d.name, '') as destination_name,
		b.title, b.slug, b.excerpt, b.cover_image, b.content, b.category, b.tags, b.status,
		b.read_time_minutes, b.views_count, b.created_at, b.updated_at
		FROM blog_posts b
		LEFT JOIN user_profiles up ON b.author_id = up.user_id
		LEFT JOIN destinations d ON b.destination_id = d.id
		` + whereClause + `
		ORDER BY b.created_at DESC`

	rows, err := database.DB.Query(query, args...)
	if err != nil {
		http.Error(w, `{"error":"Failed to retrieve blog posts"}`, http.StatusInternalServerError)
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

func GetBlogPostBySlug(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	slug := chi.URLParam(r, "slug")

	query := `SELECT b.id, b.author_id, COALESCE(up.display_name, 'Contributor') as author_name,
		b.destination_id, COALESCE(d.name, '') as destination_name,
		b.title, b.slug, b.excerpt, b.cover_image, b.content, b.category, b.tags, b.status,
		b.read_time_minutes, b.views_count, b.created_at, b.updated_at
		FROM blog_posts b
		LEFT JOIN user_profiles up ON b.author_id = up.user_id
		LEFT JOIN destinations d ON b.destination_id = d.id
		WHERE b.slug = ? OR b.id = ?`
	if database.DriverName == "postgres" {
		query = `SELECT b.id, b.author_id, COALESCE(up.display_name, 'Contributor') as author_name,
			b.destination_id, COALESCE(d.name, '') as destination_name,
			b.title, b.slug, b.excerpt, b.cover_image, b.content, b.category, b.tags, b.status,
			b.read_time_minutes, b.views_count, b.created_at, b.updated_at
			FROM blog_posts b
			LEFT JOIN user_profiles up ON b.author_id = up.user_id
			LEFT JOIN destinations d ON b.destination_id = d.id
			WHERE b.slug = $1 OR b.id = $2`
	}

	var p models.BlogPost
	var tagsRaw string
	var destIDNull sql.NullString
	err := database.DB.QueryRow(query, slug, slug).Scan(&p.ID, &p.AuthorID, &p.AuthorName, &destIDNull, &p.DestinationName,
		&p.Title, &p.Slug, &p.Excerpt, &p.CoverImage, &p.Content, &p.Category, &tagsRaw, &p.Status,
		&p.ReadTimeMinutes, &p.ViewsCount, &p.CreatedAt, &p.UpdatedAt)
	if err != nil {
		http.Error(w, `{"error":"Blog post not found"}`, http.StatusNotFound)
		return
	}
	if destIDNull.Valid {
		p.DestinationID = &destIDNull.String
	}
	_ = json.Unmarshal([]byte(tagsRaw), &p.Tags)

	// Increment view count
	if database.DriverName == "postgres" {
		_, _ = database.DB.Exec("UPDATE blog_posts SET views_count = views_count + 1 WHERE id = $1", p.ID)
	} else {
		_, _ = database.DB.Exec("UPDATE blog_posts SET views_count = views_count + 1 WHERE id = ?", p.ID)
	}
	p.ViewsCount++

	json.NewEncoder(w).Encode(p)
}

type CreateBlogRequest struct {
	Title         string   `json:"title"`
	DestinationID *string  `json:"destination_id"`
	Excerpt       string   `json:"excerpt"`
	CoverImage    string   `json:"cover_image"`
	Content       string   `json:"content"`
	Category      string   `json:"category"`
	Tags          []string `json:"tags"`
	Status        string   `json:"status"` // draft or pending_review or published
}

func CreateBlogPost(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	claims := auth.GetUserFromContext(r.Context())
	if claims == nil {
		http.Error(w, `{"error":"Unauthorized"}`, http.StatusUnauthorized)
		return
	}

	var req CreateBlogRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error":"Invalid request payload"}`, http.StatusBadRequest)
		return
	}

	if strings.TrimSpace(req.Title) == "" || strings.TrimSpace(req.Content) == "" {
		http.Error(w, `{"error":"Title and content are required"}`, http.StatusBadRequest)
		return
	}

	if req.Category == "" {
		req.Category = "Travel Guides"
	}
	if req.CoverImage == "" {
		req.CoverImage = "https://images.unsplash.com/photo-1609137144813-7d9921338f24?auto=format&fit=crop&w=1200&q=80"
	}
	if req.Excerpt == "" {
		if len(req.Content) > 150 {
			req.Excerpt = req.Content[:150] + "..."
		} else {
			req.Excerpt = req.Content
		}
	}

	// Status defaults
	status := "draft"
	if req.Status == "pending_review" || req.Status == "draft" {
		status = req.Status
	}
	if claims.Role == "admin" || claims.Role == "contributor" {
		if req.Status == "published" {
			status = "published"
		}
	}

	id := "post-" + uuid.New().String()
	slug := slugify(req.Title) + "-" + id[5:10]
	tagsJSON, _ := json.Marshal(req.Tags)
	readTime := len(strings.Fields(req.Content))/200 + 1

	now := time.Now()
	insertQuery := `INSERT INTO blog_posts (id, author_id, destination_id, title, slug, excerpt, cover_image, content, category, tags, status, read_time_minutes, views_count, created_at, updated_at)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
	if database.DriverName == "postgres" {
		insertQuery = `INSERT INTO blog_posts (id, author_id, destination_id, title, slug, excerpt, cover_image, content, category, tags, status, read_time_minutes, views_count, created_at, updated_at)
			VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`
	}

	_, err := database.DB.Exec(insertQuery, id, claims.UserID, req.DestinationID, req.Title, slug, req.Excerpt,
		req.CoverImage, req.Content, req.Category, string(tagsJSON), status, readTime, 0, now, now)
	if err != nil {
		http.Error(w, `{"error":"Failed to save blog post"}`, http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"id":      id,
		"slug":    slug,
		"status":  status,
		"message": "Blog post created successfully",
	})
}

func UpdateBlogPost(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	claims := auth.GetUserFromContext(r.Context())
	if claims == nil {
		http.Error(w, `{"error":"Unauthorized"}`, http.StatusUnauthorized)
		return
	}

	postID := chi.URLParam(r, "id")

	// Ownership check
	var authorID string
	checkQuery := "SELECT author_id FROM blog_posts WHERE id = ?"
	if database.DriverName == "postgres" {
		checkQuery = "SELECT author_id FROM blog_posts WHERE id = $1"
	}
	err := database.DB.QueryRow(checkQuery, postID).Scan(&authorID)
	if err == sql.ErrNoRows {
		http.Error(w, `{"error":"Blog post not found"}`, http.StatusNotFound)
		return
	}
	if authorID != claims.UserID && claims.Role != "admin" {
		http.Error(w, `{"error":"You can only edit your own blog posts"}`, http.StatusForbidden)
		return
	}

	var req CreateBlogRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error":"Invalid request payload"}`, http.StatusBadRequest)
		return
	}

	tagsJSON, _ := json.Marshal(req.Tags)
	readTime := len(strings.Fields(req.Content))/200 + 1

	updateQuery := `UPDATE blog_posts SET title = ?, destination_id = ?, excerpt = ?, cover_image = ?, content = ?, category = ?, tags = ?, status = ?, read_time_minutes = ?, updated_at = ? WHERE id = ?`
	if database.DriverName == "postgres" {
		updateQuery = `UPDATE blog_posts SET title = $1, destination_id = $2, excerpt = $3, cover_image = $4, content = $5, category = $6, tags = $7, status = $8, read_time_minutes = $9, updated_at = $10 WHERE id = $11`
	}

	_, err = database.DB.Exec(updateQuery, req.Title, req.DestinationID, req.Excerpt, req.CoverImage, req.Content,
		req.Category, string(tagsJSON), req.Status, readTime, time.Now(), postID)
	if err != nil {
		http.Error(w, `{"error":"Failed to update blog post"}`, http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(map[string]string{"message": "Blog post updated successfully"})
}

func BookmarkPost(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	claims := auth.GetUserFromContext(r.Context())
	if claims == nil {
		http.Error(w, `{"error":"Unauthorized"}`, http.StatusUnauthorized)
		return
	}

	postID := chi.URLParam(r, "id")
	bookmarkID := "bm-" + uuid.New().String()

	insertQuery := "INSERT INTO blog_bookmarks (id, user_id, post_id) VALUES (?, ?, ?)"
	if database.DriverName == "postgres" {
		insertQuery = "INSERT INTO blog_bookmarks (id, user_id, post_id) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING"
	}
	_, _ = database.DB.Exec(insertQuery, bookmarkID, claims.UserID, postID)

	json.NewEncoder(w).Encode(map[string]string{"message": "Article bookmarked"})
}

func UnbookmarkPost(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	claims := auth.GetUserFromContext(r.Context())
	if claims == nil {
		http.Error(w, `{"error":"Unauthorized"}`, http.StatusUnauthorized)
		return
	}

	postID := chi.URLParam(r, "id")
	deleteQuery := "DELETE FROM blog_bookmarks WHERE user_id = ? AND post_id = ?"
	if database.DriverName == "postgres" {
		deleteQuery = "DELETE FROM blog_bookmarks WHERE user_id = $1 AND post_id = $2"
	}
	_, _ = database.DB.Exec(deleteQuery, claims.UserID, postID)

	json.NewEncoder(w).Encode(map[string]string{"message": "Bookmark removed"})
}
