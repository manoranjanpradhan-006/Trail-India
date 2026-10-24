package models

import "time"

type User struct {
	ID           string    `json:"id"`
	Email        string    `json:"email"`
	PasswordHash string    `json:"-"`
	Role         string    `json:"role"` // traveler, contributor, admin
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
	Profile      *Profile  `json:"profile,omitempty"`
}

type Profile struct {
	UserID             string    `json:"user_id"`
	DisplayName        string    `json:"display_name"`
	Bio                string    `json:"bio"`
	AvatarURL          string    `json:"avatar_url"`
	Location           string    `json:"location"`
	TravelInterests    []string  `json:"travel_interests"`
	IsLocalContributor bool      `json:"is_local_contributor"`
	UpdatedAt          time.Time `json:"updated_at"`
}

type Destination struct {
	ID              string    `json:"id"`
	Name            string    `json:"name"`
	Slug            string    `json:"slug"`
	State           string    `json:"state"`
	District        string    `json:"district"`
	Tagline         string    `json:"tagline"`
	Description     string    `json:"description"`
	Overview        string    `json:"overview"`
	BannerImage     string    `json:"banner_image"`
	BestTimeToVisit string    `json:"best_time_to_visit"`
	WeatherInfo     string    `json:"weather_info"`
	HowToReach      string    `json:"how_to_reach"`
	Latitude        float64   `json:"latitude"`
	Longitude       float64   `json:"longitude"`
	PlaceCount      int       `json:"place_count,omitempty"`
	Places          []Place   `json:"places,omitempty"`
	CreatedAt       time.Time `json:"created_at"`
}

type Place struct {
	ID            string    `json:"id"`
	DestinationID string    `json:"destination_id"`
	Destination   string    `json:"destination_name,omitempty"`
	Name          string    `json:"name"`
	Slug          string    `json:"slug"`
	Category      string    `json:"category"` // attraction, temple, beach, heritage, nature, food_spot, hidden_gem, craft_village
	Description   string    `json:"description"`
	Address       string    `json:"address"`
	Latitude      float64   `json:"latitude"`
	Longitude     float64   `json:"longitude"`
	EntryFee      string    `json:"entry_fee"`
	OpeningHours  string    `json:"opening_hours"`
	ImageURL      string    `json:"image_url"`
	Highlights    []string  `json:"highlights"`
	IsFeatured    bool      `json:"is_featured"`
	Rating        float64   `json:"rating,omitempty"`
	ReviewCount   int       `json:"review_count,omitempty"`
	CreatedAt     time.Time `json:"created_at"`
}

type Festival struct {
	ID                   string    `json:"id"`
	DestinationID        *string   `json:"destination_id,omitempty"`
	DestinationName      string    `json:"destination_name,omitempty"`
	Name                 string    `json:"name"`
	Slug                 string    `json:"slug"`
	Description          string    `json:"description"`
	CelebrationMonth     string    `json:"celebration_month"`
	TypicalSeason        string    `json:"typical_season"`
	ConfirmedDateInfo    string    `json:"confirmed_date_info"`
	LocationSummary      string    `json:"location_summary"`
	CulturalSignificance string    `json:"cultural_significance"`
	VisitorTips          string    `json:"visitor_tips"`
	ImageURL             string    `json:"image_url"`
	CreatedAt            time.Time `json:"created_at"`
}

type Review struct {
	ID          string    `json:"id"`
	PlaceID     string    `json:"place_id"`
	PlaceName   string    `json:"place_name,omitempty"`
	UserID      string    `json:"user_id"`
	AuthorName  string    `json:"author_name,omitempty"`
	Rating      int       `json:"rating"` // 1 to 5
	Title       string    `json:"title"`
	Comment     string    `json:"comment"`
	VisitDate   string    `json:"visit_date"`
	IsReported  bool      `json:"is_reported"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

type BlogPost struct {
	ID              string    `json:"id"`
	AuthorID        string    `json:"author_id"`
	AuthorName      string    `json:"author_name,omitempty"`
	DestinationID   *string   `json:"destination_id,omitempty"`
	DestinationName string    `json:"destination_name,omitempty"`
	Title           string    `json:"title"`
	Slug            string    `json:"slug"`
	Excerpt         string    `json:"excerpt"`
	CoverImage      string    `json:"cover_image"`
	Content         string    `json:"content"`
	Category        string    `json:"category"`
	Tags            []string  `json:"tags"`
	Status          string    `json:"status"` // draft, pending_review, published, rejected
	ReadTimeMinutes int       `json:"read_time_minutes"`
	ViewsCount      int       `json:"views_count"`
	CreatedAt       time.Time `json:"created_at"`
	UpdatedAt       time.Time `json:"updated_at"`
}

type Favorite struct {
	ID        string    `json:"id"`
	UserID    string    `json:"user_id"`
	PlaceID   string    `json:"place_id"`
	Place     *Place    `json:"place,omitempty"`
	CreatedAt time.Time `json:"created_at"`
}

type TripDayItem struct {
	PlaceID     string `json:"place_id"`
	PlaceName   string `json:"place_name"`
	Category    string `json:"category"`
	TimeSlot    string `json:"time_slot"`
	EstimatedCost float64 `json:"estimated_cost"`
	Notes       string `json:"notes"`
}

type TripDay struct {
	DayNumber int           `json:"day_number"`
	Title     string        `json:"title"`
	Items     []TripDayItem `json:"items"`
}

type Trip struct {
	ID             string    `json:"id"`
	UserID         string    `json:"user_id"`
	Title          string    `json:"title"`
	Description    string    `json:"description"`
	StartDate      string    `json:"start_date"`
	EndDate        string    `json:"end_date"`
	BudgetEstimate float64   `json:"budget_estimate"`
	ItineraryData  []TripDay `json:"itinerary_data"`
	CreatedAt      time.Time `json:"created_at"`
	UpdatedAt      time.Time `json:"updated_at"`
}

type AuthResponse struct {
	Token string `json:"token"`
	User  User   `json:"user"`
}
