package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"

	"trail-india/backend/internal/admin"
	"trail-india/backend/internal/auth"
	"trail-india/backend/internal/blog"
	"trail-india/backend/internal/database"
	"trail-india/backend/internal/destinations"
	"trail-india/backend/internal/favorites"
	"trail-india/backend/internal/festivals"
	"trail-india/backend/internal/places"
	"trail-india/backend/internal/reviews"
	"trail-india/backend/internal/trips"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
)

func main() {
	log.Println("==================================================")
	log.Println("     Starting Trail India REST API Server         ")
	log.Println("     Discover India, One Trail at a Time          ")
	log.Println("==================================================")

	// Initialize Database
	db, err := database.InitDB()
	if err != nil {
		log.Fatalf("Fatal: Database initialization failed: %v", err)
	}
	defer db.Close()

	// Port & Host
	port := os.Getenv("APP_PORT")
	if port == "" {
		port = "8080"
	}
	frontendOrigin := os.Getenv("FRONTEND_ORIGIN")
	if frontendOrigin == "" {
		frontendOrigin = "http://localhost:5173"
	}

	r := chi.NewRouter()

	// Base Middlewares
	r.Use(middleware.RequestID)
	r.Use(middleware.RealIP)
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)

	// CORS Configuration
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173", frontendOrigin},
		AllowedMethods:   []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token"},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: true,
		MaxAge:           300,
	}))

	// Health Check
	r.Get("/api/v1/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]interface{}{
			"status":   "ok",
			"project":  "Trail India",
			"database": database.DriverName,
		})
	})

	// API Routes
	r.Route("/api/v1", func(api chi.Router) {
		// 1. Auth routes
		api.Post("/auth/register", auth.RegisterHandler)
		api.Post("/auth/login", auth.LoginHandler)
		api.With(auth.AuthMiddleware).Get("/auth/me", auth.MeHandler)

		// 2. Destinations
		api.Get("/destinations", destinations.ListDestinations)
		api.Get("/destinations/{slug}", destinations.GetDestinationBySlug)

		// 3. Places
		api.Get("/places", places.ListPlaces)
		api.Get("/places/{id}", places.GetPlaceByID)

		// 4. Reviews
		api.Get("/places/{id}/reviews", reviews.ListPlaceReviews)
		api.With(auth.AuthMiddleware).Post("/places/{id}/reviews", reviews.CreateReview)
		api.With(auth.AuthMiddleware).Patch("/reviews/{id}", reviews.UpdateReview)
		api.With(auth.AuthMiddleware).Delete("/reviews/{id}", reviews.DeleteReview)
		api.Post("/reviews/{id}/report", reviews.ReportReview)

		// 5. Festivals & Events
		api.Get("/festivals", festivals.ListFestivals)
		api.Get("/festivals/{slug}", festivals.GetFestivalBySlug)

		// 6. Blog & Articles
		api.With(auth.OptionalAuthMiddleware).Get("/blog/posts", blog.ListBlogPosts)
		api.Get("/blog/posts/{slug}", blog.GetBlogPostBySlug)
		api.With(auth.AuthMiddleware).Post("/blog/posts", blog.CreateBlogPost)
		api.With(auth.AuthMiddleware).Patch("/blog/posts/{id}", blog.UpdateBlogPost)
		api.With(auth.AuthMiddleware).Post("/blog/posts/{id}/bookmark", blog.BookmarkPost)
		api.With(auth.AuthMiddleware).Delete("/blog/posts/{id}/bookmark", blog.UnbookmarkPost)

		// 7. Favorites
		api.With(auth.AuthMiddleware).Get("/favorites", favorites.ListFavorites)
		api.With(auth.AuthMiddleware).Post("/favorites", favorites.AddFavorite)
		api.With(auth.AuthMiddleware).Delete("/favorites/{placeId}", favorites.RemoveFavorite)

		// 8. Trip Planner
		api.With(auth.AuthMiddleware).Get("/trips", trips.ListTrips)
		api.With(auth.AuthMiddleware).Post("/trips", trips.CreateTrip)
		api.With(auth.AuthMiddleware).Get("/trips/{id}", trips.GetTripByID)
		api.With(auth.AuthMiddleware).Put("/trips/{id}", trips.UpdateTrip)
		api.With(auth.AuthMiddleware).Delete("/trips/{id}", trips.DeleteTrip)

		// 9. Admin Moderation
		api.Group(func(adm chi.Router) {
			adm.Use(auth.AuthMiddleware)
			adm.Use(admin.AdminMiddleware)
			adm.Get("/admin/pending-articles", admin.ListPendingArticles)
			adm.Post("/admin/articles/{id}/review", admin.ReviewArticle)
			adm.Get("/admin/reported-reviews", admin.ListReportedReviews)
		})
	})

	serverAddr := fmt.Sprintf(":%s", port)
	log.Printf("[Server] Server listening on http://localhost%s\n", serverAddr)
	if err := http.ListenAndServe(serverAddr, r); err != nil {
		log.Fatalf("Server failed: %v", err)
	}
}
