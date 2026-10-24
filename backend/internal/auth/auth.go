package auth

import (
	"context"
	"database/sql"
	"encoding/json"
	"net/http"
	"os"
	"strings"
	"time"

	"trail-india/backend/internal/database"
	"trail-india/backend/internal/models"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

type contextKey string

const UserContextKey contextKey = "user"

type Claims struct {
	UserID string `json:"user_id"`
	Email  string `json:"email"`
	Role   string `json:"role"`
	jwt.RegisteredClaims
}

func getJWTSecret() []byte {
	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		secret = "trail_india_super_secure_secret_key_2026_dev"
	}
	return []byte(secret)
}

func GenerateToken(user *models.User) (string, error) {
	claims := Claims{
		UserID: user.ID,
		Email:  user.Email,
		Role:   user.Role,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(7 * 24 * time.Hour)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(getJWTSecret())
}

func AuthMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		authHeader := r.Header.Get("Authorization")
		if authHeader == "" {
			http.Error(w, `{"error":"Authorization header required"}`, http.StatusUnauthorized)
			return
		}

		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			http.Error(w, `{"error":"Invalid authorization header format"}`, http.StatusUnauthorized)
			return
		}

		claims := &Claims{}
		token, err := jwt.ParseWithClaims(parts[1], claims, func(t *jwt.Token) (interface{}, error) {
			return getJWTSecret(), nil
		})

		if err != nil || !token.Valid {
			http.Error(w, `{"error":"Invalid or expired token"}`, http.StatusUnauthorized)
			return
		}

		ctx := context.WithValue(r.Context(), UserContextKey, claims)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

func OptionalAuthMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		authHeader := r.Header.Get("Authorization")
		if authHeader != "" {
			parts := strings.Split(authHeader, " ")
			if len(parts) == 2 && parts[0] == "Bearer" {
				claims := &Claims{}
				token, err := jwt.ParseWithClaims(parts[1], claims, func(t *jwt.Token) (interface{}, error) {
					return getJWTSecret(), nil
				})
				if err == nil && token.Valid {
					ctx := context.WithValue(r.Context(), UserContextKey, claims)
					next.ServeHTTP(w, r.WithContext(ctx))
					return
				}
			}
		}
		next.ServeHTTP(w, r)
	})
}

func GetUserFromContext(ctx context.Context) *Claims {
	claims, ok := ctx.Value(UserContextKey).(*Claims)
	if !ok {
		return nil
	}
	return claims
}

type RegisterRequest struct {
	Email       string   `json:"email"`
	Password    string   `json:"password"`
	DisplayName string   `json:"display_name"`
	Location    string   `json:"location"`
	Bio         string   `json:"bio"`
	Interests   []string `json:"travel_interests"`
}

type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

func RegisterHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	var req RegisterRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error":"Invalid request payload"}`, http.StatusBadRequest)
		return
	}

	req.Email = strings.TrimSpace(strings.ToLower(req.Email))
	if req.Email == "" || len(req.Password) < 6 || strings.TrimSpace(req.DisplayName) == "" {
		http.Error(w, `{"error":"Valid email, password (min 6 chars), and display name are required"}`, http.StatusBadRequest)
		return
	}

	var existingID string
	err := database.DB.QueryRow("SELECT id FROM users WHERE email = ?", req.Email).Scan(&existingID)
	if err != nil && err != sql.ErrNoRows {
		// Try postgres syntax
		_ = database.DB.QueryRow("SELECT id FROM users WHERE email = $1", req.Email).Scan(&existingID)
	}
	if existingID != "" {
		http.Error(w, `{"error":"An account with this email already exists"}`, http.StatusConflict)
		return
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		http.Error(w, `{"error":"Failed to hash password"}`, http.StatusInternalServerError)
		return
	}

	userID := "usr-" + uuid.New().String()
	user := models.User{
		ID:        userID,
		Email:     req.Email,
		Role:      "traveler",
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
		Profile: &models.Profile{
			UserID:          userID,
			DisplayName:     req.DisplayName,
			Bio:             req.Bio,
			Location:        req.Location,
			TravelInterests: req.Interests,
			UpdatedAt:       time.Now(),
		},
	}

	interestsJSON, _ := json.Marshal(req.Interests)
	if database.DriverName == "postgres" {
		_, err = database.DB.Exec("INSERT INTO users (id, email, password_hash, role) VALUES ($1, $2, $3, $4)",
			user.ID, user.Email, string(hash), user.Role)
		if err == nil {
			_, err = database.DB.Exec("INSERT INTO user_profiles (user_id, display_name, bio, location, travel_interests) VALUES ($1, $2, $3, $4, $5)",
				user.ID, user.Profile.DisplayName, user.Profile.Bio, user.Profile.Location, string(interestsJSON))
		}
	} else {
		_, err = database.DB.Exec("INSERT INTO users (id, email, password_hash, role) VALUES (?, ?, ?, ?)",
			user.ID, user.Email, string(hash), user.Role)
		if err == nil {
			_, err = database.DB.Exec("INSERT INTO user_profiles (user_id, display_name, bio, location, travel_interests) VALUES (?, ?, ?, ?, ?)",
				user.ID, user.Profile.DisplayName, user.Profile.Bio, user.Profile.Location, string(interestsJSON))
		}
	}

	if err != nil {
		http.Error(w, `{"error":"Failed to create user account"}`, http.StatusInternalServerError)
		return
	}

	token, err := GenerateToken(&user)
	if err != nil {
		http.Error(w, `{"error":"Failed to generate auth token"}`, http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(models.AuthResponse{Token: token, User: user})
}

func LoginHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	var req LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error":"Invalid request payload"}`, http.StatusBadRequest)
		return
	}

	req.Email = strings.TrimSpace(strings.ToLower(req.Email))

	var user models.User
	var hash string
	var err error

	if database.DriverName == "postgres" {
		err = database.DB.QueryRow("SELECT id, email, password_hash, role, created_at, updated_at FROM users WHERE email = $1", req.Email).
			Scan(&user.ID, &user.Email, &hash, &user.Role, &user.CreatedAt, &user.UpdatedAt)
	} else {
		err = database.DB.QueryRow("SELECT id, email, password_hash, role, created_at, updated_at FROM users WHERE email = ?", req.Email).
			Scan(&user.ID, &user.Email, &hash, &user.Role, &user.CreatedAt, &user.UpdatedAt)
	}

	if err != nil {
		http.Error(w, `{"error":"Invalid email or password"}`, http.StatusUnauthorized)
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(req.Password)); err != nil {
		http.Error(w, `{"error":"Invalid email or password"}`, http.StatusUnauthorized)
		return
	}

	// Fetch profile
	var profile models.Profile
	var interestsRaw string
	var isContributor int

	if database.DriverName == "postgres" {
		_ = database.DB.QueryRow(`SELECT display_name, bio, avatar_url, location, travel_interests, is_local_contributor, updated_at 
			FROM user_profiles WHERE user_id = $1`, user.ID).
			Scan(&profile.DisplayName, &profile.Bio, &profile.AvatarURL, &profile.Location, &interestsRaw, &profile.IsLocalContributor, &profile.UpdatedAt)
	} else {
		_ = database.DB.QueryRow(`SELECT display_name, bio, avatar_url, location, travel_interests, is_local_contributor, updated_at 
			FROM user_profiles WHERE user_id = ?`, user.ID).
			Scan(&profile.DisplayName, &profile.Bio, &profile.AvatarURL, &profile.Location, &interestsRaw, &isContributor, &profile.UpdatedAt)
		profile.IsLocalContributor = (isContributor == 1)
	}
	profile.UserID = user.ID
	_ = json.Unmarshal([]byte(interestsRaw), &profile.TravelInterests)
	user.Profile = &profile

	token, err := GenerateToken(&user)
	if err != nil {
		http.Error(w, `{"error":"Failed to generate auth token"}`, http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(models.AuthResponse{Token: token, User: user})
}

func MeHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	claims := GetUserFromContext(r.Context())
	if claims == nil {
		http.Error(w, `{"error":"Unauthorized"}`, http.StatusUnauthorized)
		return
	}

	var user models.User
	user.ID = claims.UserID
	user.Email = claims.Email
	user.Role = claims.Role

	var profile models.Profile
	var interestsRaw string
	var isContributor int

	if database.DriverName == "postgres" {
		_ = database.DB.QueryRow(`SELECT display_name, bio, avatar_url, location, travel_interests, is_local_contributor, updated_at 
			FROM user_profiles WHERE user_id = $1`, user.ID).
			Scan(&profile.DisplayName, &profile.Bio, &profile.AvatarURL, &profile.Location, &interestsRaw, &profile.IsLocalContributor, &profile.UpdatedAt)
	} else {
		_ = database.DB.QueryRow(`SELECT display_name, bio, avatar_url, location, travel_interests, is_local_contributor, updated_at 
			FROM user_profiles WHERE user_id = ?`, user.ID).
			Scan(&profile.DisplayName, &profile.Bio, &profile.AvatarURL, &profile.Location, &interestsRaw, &isContributor, &profile.UpdatedAt)
		profile.IsLocalContributor = (isContributor == 1)
	}
	profile.UserID = user.ID
	_ = json.Unmarshal([]byte(interestsRaw), &profile.TravelInterests)
	user.Profile = &profile

	json.NewEncoder(w).Encode(user)
}
