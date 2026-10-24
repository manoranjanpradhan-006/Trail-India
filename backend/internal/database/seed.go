package database

import (
	"encoding/json"
	"log"

	"golang.org/x/crypto/bcrypt"
)

func SeedDataIfEmpty() {
	var count int
	err := DB.QueryRow("SELECT COUNT(*) FROM destinations").Scan(&count)
	if err != nil {
		log.Printf("[Database] Check seed error: %v\n", err)
		return
	}
	if count > 0 {
		log.Println("[Database] Data already seeded.")
		return
	}

	log.Println("[Database] Seeding initial curated Odisha dataset...")

	// 1. Seed Users
	defaultPw, _ := bcrypt.GenerateFromPassword([]byte("password123"), bcrypt.DefaultCost)
	users := []struct {
		id, email, role, name, bio, location string
		interests                             []string
		isContributor                         bool
	}{
		{
			id: "usr-traveler-01", email: "traveler@trailindia.org", role: "traveler",
			name: "Aarav Sharma", bio: "Backpacker exploring ancient temple architecture and coastal trails.",
			location: "Bhubaneswar, Odisha", interests: []string{"Heritage", "Temples", "Photography"}, isContributor: false,
		},
		{
			id: "usr-contrib-01", email: "contributor@trailindia.org", role: "contributor",
			name: "Dr. Priyambada Mohapatra", bio: "Historian and folklorist living in Puri. Documenting Odia culinary heritage and rituals.",
			location: "Puri, Odisha", interests: []string{"Cuisine", "Festivals", "Art & Crafts"}, isContributor: true,
		},
		{
			id: "usr-admin-01", email: "admin@trailindia.org", role: "admin",
			name: "Trail India Editorial Team", bio: "Curators and moderators of the Trail India community platform.",
			location: "Odisha Tourism Hub", interests: []string{"Eco-tourism", "Culture", "Preservation"}, isContributor: true,
		},
	}

	for _, u := range users {
		interestsJSON, _ := json.Marshal(u.interests)
		DB.Exec(`INSERT INTO users (id, email, password_hash, role) VALUES (?, ?, ?, ?)`, u.id, u.email, string(defaultPw), u.role)
		contribVal := 0
		if u.isContributor {
			contribVal = 1
		}
		if DriverName == "postgres" {
			DB.Exec(`INSERT INTO user_profiles (user_id, display_name, bio, location, travel_interests, is_local_contributor) 
				VALUES ($1, $2, $3, $4, $5, $6)`, u.id, u.name, u.bio, u.location, string(interestsJSON), u.isContributor)
		} else {
			DB.Exec(`INSERT INTO user_profiles (user_id, display_name, bio, location, travel_interests, is_local_contributor) 
				VALUES (?, ?, ?, ?, ?, ?)`, u.id, u.name, u.bio, u.location, string(interestsJSON), contribVal)
		}
	}

	// 2. Seed Destinations
	type DestSeed struct {
		id, name, slug, district, tagline, description, overview, bannerImage, bestTime, weather, howToReach string
		lat, lng                                                                                             float64
	}

	dests := []DestSeed{
		{
			id: "dest-puri", name: "Puri", slug: "puri", district: "Puri",
			tagline: "The Abode of Lord Jagannath & Blue Flag Golden Sands",
			description: "One of the Char Dham pilgrimage sites, Puri captivates travelers with centuries of spiritual mysticism, the grandeur of the Jagannath Temple, and the mesmerizing coastal breeze of the Bay of Bengal.",
			overview: "Puri sits on the eastern coast of Odisha. Famous worldwide for the grand Ratha Yatra (Chariot Festival), its ancient seaside lanes are brimming with pilgrim lodges, sacred maths, sweet confectioneries making Khaja, and golden sandy beaches with world-renowned sand art.",
			bannerImage: "https://images.unsplash.com/photo-1628085446059-e93cb101ee63?auto=format&fit=crop&w=1200&q=80",
			bestTime: "October to March", weather: "Tropical coastal; pleasant winter nights around 18°C, warm tropical summers.",
			howToReach: "Direct train connections to Puri Terminal (PURI) from all major Indian cities. Biju Patnaik Airport (Bhubaneswar) is 60 km away via NH 316.",
			lat: 19.8135, lng: 85.8312,
		},
		{
			id: "dest-bhubaneswar", name: "Bhubaneswar", slug: "bhubaneswar", district: "Khordha",
			tagline: "Ekamra Kshetra: The City of 1,000 Temples & Smart Capital",
			description: "Odisha's capital seamlessly bridges two millennia of Kalinga stone architecture with contemporary green boulevards, vibrant cafe culture, and world-class craft museums.",
			overview: "Historic Bhubaneswar once held over 7,000 sandstone shrines dating from the 6th to 13th century CE. Today, majestic temple spires like Lingaraj and Mukteswar stand gracefully alongside the peace stupa at Dhauli and the Jain rock-cut caves of Udayagiri.",
			bannerImage: "https://images.unsplash.com/photo-1609137144813-7d9921338f24?auto=format&fit=crop&w=1200&q=80",
			bestTime: "October to February", weather: "Mild winters with sunny days (24°C); summer can be humid.",
			howToReach: "Biju Patnaik International Airport (BBI) with direct flights across India. Bhubaneswar Central Railway Junction connects across national rail corridors.",
			lat: 20.2961, lng: 85.8245,
		},
		{
			id: "dest-konark", name: "Konark", slug: "konark", district: "Puri",
			tagline: "Poetry in Stone: The 13th-Century Sun Temple & Marine Drive",
			description: "Famous for the monumental 13th-century Sun Temple built like a colossal chariot drawn by seven horses, Konark is a UNESCO World Heritage marvel by the serene Chandrabhaga beach.",
			overview: "Conceived by King Narasimhadeva I of the Eastern Ganga dynasty, the Sun Temple at Konark was called the 'Black Pagoda' by European sailors. Its intricate chariot wheels double as precision sundials, celebrating celestial cycles with breathtaking artistic genius.",
			bannerImage: "https://images.unsplash.com/photo-1599423300746-b62533397364?auto=format&fit=crop&w=1200&q=80",
			bestTime: "November to February", weather: "Sea breezes keep winter days enjoyable around 22°C.",
			howToReach: "35 km from Puri via the scenic Puri-Konark Marine Drive; 65 km from Bhubaneswar.",
			lat: 19.8876, lng: 86.0945,
		},
		{
			id: "dest-chilika", name: "Chilika Lake", slug: "chilika-lake", district: "Puri / Khordha / Ganjam",
			tagline: "Asia's Largest Brackish Water Lagoon & Haven of Irrawaddy Dolphins",
			description: "Spanning over 1,100 sq km, Chilika is a biological paradise sheltering over a million migratory birds each winter, rare Irrawaddy dolphins, and peaceful island communities.",
			overview: "Chilika's unique mix of freshwater from 52 rivers and saltwater from the Bay of Bengal makes it an ecological wonder. From the bird sanctuary at Mangalajodi to the playful dolphins of Satapada, Chilika offers tranquil boat safaris against panoramic sunset horizons.",
			bannerImage: "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=1200&q=80",
			bestTime: "November to March (Peak Migratory Bird Season)", weather: "Pleasant breezes with morning mist over tranquil lagoon waters.",
			howToReach: "Satapada is 50 km from Puri. Mangalajodi is accessible from Kalupara Ghat railway station on the Bhubaneswar-Howrah line.",
			lat: 19.7167, lng: 85.3167,
		},
		{
			id: "dest-similipal", name: "Similipal National Park", slug: "similipal", district: "Mayurbhanj",
			tagline: "Untamed Wilderness, Roaring Waterfalls & Tiger Biosphere",
			description: "A sprawling UNESCO Biosphere Reserve in northern Odisha, renowned for misty sal forests, Bengal tigers, Asian elephants, and the cascading Barehipani and Joranda waterfalls.",
			overview: "Taking its name from the vibrant red silk cotton 'Semul' trees, Similipal covers 2,750 sq km of lush hills and plateau rivers. It represents one of eastern India's richest biodiversity corridors with indigenous Santal, Kolha, and Ho tribal cultures.",
			bannerImage: "https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1200&q=80",
			bestTime: "November to April (Park closed during monsoons)", weather: "Cool mountain temperatures in winter dropping below 10°C in dense valleys.",
			howToReach: "Entry gates via Baripada or Jashipur. Nearest airport is Bhubaneswar (270 km) or Kolkata (240 km).",
			lat: 21.9333, lng: 86.3500,
		},
		{
			id: "dest-raghurajpur", name: "Raghurajpur", slug: "raghurajpur", district: "Puri",
			tagline: "Heritage Crafts Village & Living Cradle of Pattachitra Art",
			description: "A picturesque village where every single household is home to an artisan creating traditional palm-leaf engravings, Pattachitra scrolls, wooden toys, and Gotipua classical dance.",
			overview: "Nestled amidst coconut groves near the Bhargavi river, Raghurajpur is an open-air art museum. Walk through village paths where veranda murals greet visitors and master craftsmen demonstrate centuries-old natural stone pigment painting techniques.",
			bannerImage: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1200&q=80",
			bestTime: "October to March", weather: "Lush green tropical surroundings with breezy winter days.",
			howToReach: "14 km from Puri and 55 km from Bhubaneswar via NH 316. Auto-rickshaws and cabs easily available.",
			lat: 19.8667, lng: 85.8333,
		},
		{
			id: "dest-daringbadi", name: "Daringbadi", slug: "daringbadi", district: "Kandhamal",
			tagline: "The Kashmir of Odisha: Pine Forests, Coffee Gardens & Cool Mist",
			description: "Perched at 3,000 feet in the Eastern Ghats, Daringbadi enchants with fragrant coffee plantations, pine forests, cascading hill streams, and occasional winter frost.",
			overview: "Named after Daring Sahib, a British officer who oversaw the hill tracts, this tranquil hill station provides an idyllic retreat from coastal heat. Trek through pepper and turmeric farms, visit Midubanda waterfall, and unwind in secluded valleys.",
			bannerImage: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80",
			bestTime: "September to March", weather: "Chilly winters with temperatures dropping to 0°-4°C in late December.",
			howToReach: "250 km from Bhubaneswar via Nayagarh and Bhanjanagar. Berhampur railway station is 125 km away.",
			lat: 19.9077, lng: 84.1332,
		},
	}

	for _, d := range dests {
		if DriverName == "postgres" {
			DB.Exec(`INSERT INTO destinations (id, name, slug, district, tagline, description, overview, banner_image, best_time_to_visit, weather_info, how_to_reach, latitude, longitude)
				VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
				d.id, d.name, d.slug, d.district, d.tagline, d.description, d.overview, d.bannerImage, d.bestTime, d.weather, d.howToReach, d.lat, d.lng)
		} else {
			DB.Exec(`INSERT INTO destinations (id, name, slug, district, tagline, description, overview, banner_image, best_time_to_visit, weather_info, how_to_reach, latitude, longitude)
				VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
				d.id, d.name, d.slug, d.district, d.tagline, d.description, d.overview, d.bannerImage, d.bestTime, d.weather, d.howToReach, d.lat, d.lng)
		}
	}

	// 3. Seed Places (Attractions, Food Spots, Heritage, Nature)
	type PlaceSeed struct {
		id, destID, name, slug, cat, desc, addr, fee, hours, img string
		lat, lng                                                 float64
		highlights                                               []string
		featured                                                 bool
	}

	places := []PlaceSeed{
		{
			id: "plc-puri-jagannath", destID: "dest-puri", name: "Shree Jagannath Temple", slug: "shree-jagannath-temple",
			cat: "temple", desc: "A sacred 12th-century Kalinga architecture masterpiece honoring Lord Jagannath, Balabhadra, and Subhadra. Renowned for its mysterious kitchen producing Mahaprasad for 100,000 pilgrims daily.",
			addr: "Grand Road, Puri, Odisha 752001", fee: "Free Entry (Non-Hindus can view from Raghunandan Library roof)", hours: "5:00 AM – 11:00 PM",
			img: "https://images.unsplash.com/photo-1628085446059-e93cb101ee63?auto=format&fit=crop&w=800&q=80",
			lat: 19.8048, lng: 85.8179, highlights: []string{"Char Dham pilgrimage", "World's largest traditional kitchen", "Ananda Bazar Mahaprasad", "Aruna Stambha monolithic pillar"}, featured: true,
		},
		{
			id: "plc-puri-beach", destID: "dest-puri", name: "Puri Golden Beach", slug: "puri-golden-beach",
			cat: "beach", desc: "Prestigious Blue Flag-certified clean beach stretch with designated swimming zones, watchtowers, palm promenades, and stunning sunrises over the Bay of Bengal.",
			addr: "Chakratirtha Road to Swargadwar, Puri", fee: "Free (Nominal ₹20 for Blue Flag secure promenade)", hours: "Open 24 Hours",
			img: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
			lat: 19.7983, lng: 85.8249, highlights: []string{"Blue Flag eco-label certification", "Fine golden sand", "Sunset camel rides", "Fresh seafood counters"}, featured: true,
		},
		{
			id: "plc-konark-sun-temple", destID: "dest-konark", name: "Konark Sun Temple", slug: "konark-sun-temple",
			cat: "heritage", desc: "UNESCO World Heritage Site fashioned as a gigantic 24-wheeled chariot of Surya, the Sun God. A zenith of ancient Indian stone carving, cosmology, and erotic sculptures.",
			addr: "Konark, Puri District, Odisha 752111", fee: "₹40 for Indians, ₹600 for foreigners", hours: "6:00 AM – 8:00 PM (Light & Sound show at 7:00 PM)",
			img: "https://images.unsplash.com/photo-1599423300746-b62533397364?auto=format&fit=crop&w=800&q=80",
			lat: 19.8876, lng: 86.0945, highlights: []string{"UNESCO World Heritage Site", "Astronomical sundial wheels", "Natya Mandapa dance hall", "Evening light & sound show"}, featured: true,
		},
		{
			id: "plc-bhubaneswar-lingaraj", destID: "dest-bhubaneswar", name: "Lingaraj Temple", slug: "lingaraj-temple",
			cat: "temple", desc: "The supreme example of mature Kalinga temple architecture, dedicated to Harihara (combined Shiva and Vishnu). The 180-foot towering deula dominates Old Bhubaneswar's skyline.",
			addr: "Lingaraj Nagar, Old Town, Bhubaneswar 751002", fee: "Free Entry", hours: "6:00 AM – 12:30 PM, 3:30 PM – 9:00 PM",
			img: "https://images.unsplash.com/photo-1609137144813-7d9921338f24?auto=format&fit=crop&w=800&q=80",
			lat: 20.2382, lng: 85.8338, highlights: []string{"11th-century architectural masterpiece", "Bindusagar holy lake nearby", "Finely carved sandstone friezes", "Spiritual center of Ekamra Kshetra"}, featured: true,
		},
		{
			id: "plc-bhubaneswar-dhauli", destID: "dest-bhubaneswar", name: "Dhauli Shanti Stupa", slug: "dhauli-shanti-stupa",
			cat: "heritage", desc: "The white Peace Pagoda perched on the hill where Emperor Ashoka renounced bloodshed after the cataclysmic Kalinga War in 261 BCE, embracing Buddhist teachings of Ahimsa.",
			addr: "Dhauli Hills, Bhubaneswar, Odisha 752104", fee: "Free Entry (Parking ₹20)", hours: "6:00 AM – 7:30 PM",
			img: "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=800&q=80",
			lat: 20.1923, lng: 85.8394, highlights: []string{"Ashokan Rock Edicts (261 BCE)", "Indo-Japanese Peace Pagoda", "Daya River views", "Panoramic 360-degree countryside landscape"}, featured: false,
		},
		{
			id: "plc-chilika-mangalajodi", destID: "dest-chilika", name: "Mangalajodi Birding Eco-Trail", slug: "mangalajodi-birding",
			cat: "nature", desc: "An inspiring community conservation success story where former bird poachers are now master boatmen and bird guides. Spot over 150 species of migratory waterfowl at arm's length.",
			addr: "Mangalajodi, Tangi Block, Khordha District, Odisha", fee: "Boat safari approx ₹1200 per wooden boat (up to 4 people)", hours: "5:30 AM – 5:30 PM",
			img: "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=800&q=80",
			lat: 19.9142, lng: 85.4244, highlights: []string{"Eco-tourism led by reformed poachers", "Northern pintails, glossy ibises, godwits", "Silent non-motorized wooden canoes", "Unparalleled nature photography"}, featured: true,
		},
		{
			id: "plc-chilika-satapada", destID: "dest-chilika", name: "Satapada Dolphin Sanctuary", slug: "satapada-dolphin-sanctuary",
			cat: "nature", desc: "Where the lake meets the Bay of Bengal. Take an OTDC motorized boat tour to spot playful, endangered Irrawaddy dolphins and visit the natural sea mouth island.",
			addr: "Satapada, Krushnaprasad Block, Puri District", fee: "OTDC boat rides ₹1,400 to ₹2,500 depending on boat size", hours: "6:00 AM – 5:00 PM",
			img: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80",
			lat: 19.6738, lng: 85.4346, highlights: []string{"Rare Irrawaddy dolphins", "Chilika sea mouth bar", "Rajhans Island red crab beach", "Fresh crab and prawn food stalls"}, featured: false,
		},
		{
			id: "plc-similipal-barehipani", destID: "dest-similipal", name: "Barehipani Waterfall", slug: "barehipani-waterfall",
			cat: "nature", desc: "India's second highest two-tiered waterfall, plunging 399 meters through sheer granite cliffs inside the core forest of Similipal Tiger Reserve.",
			addr: "Similipal National Park, Mayurbhanj District", fee: "Park entry permit ₹100 per person + vehicle fee", hours: "7:00 AM – 3:00 PM (Entry hours)",
			img: "https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=800&q=80",
			lat: 21.9333, lng: 86.3500, highlights: []string{"399-meter cascading waterfall", "Budhabalanga river source", "Virgin sal forest canopy", "Wild elephant and deer sightings"}, featured: true,
		},
		{
			id: "plc-raghurajpur-village", destID: "dest-raghurajpur", name: "Raghurajpur Crafts Trail", slug: "raghurajpur-crafts-trail",
			cat: "craft_village", desc: "Stroll along traditional terracotta houses painted with vivid mythological murals. Watch national award-winning artisans engrave intricate scenes on treated palm leaves (Tala Pattachitra).",
			addr: "Raghurajpur, near Chandanpur, Puri District 752012", fee: "Free to visit (Support local artisans by buying authentic art)", hours: "8:00 AM – 7:00 PM",
			img: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=800&q=80",
			lat: 19.8667, lng: 85.8333, highlights: []string{"Traditional palm-leaf engraving", "Tussar silk paintings", "Gotipua dance gurukuls", "Direct interaction with master craftspersons"}, featured: true,
		},
		{
			id: "plc-food-chhena-poda", destID: "dest-puri", name: "Nayagarh & Puri Chhena Poda Heritage", slug: "chhena-poda-heritage",
			cat: "food_spot", desc: "The crowning glory of Odia sweet making: fresh cottage cheese kneaded with sugar, cardamom, and ghee, then baked wrapped in sal leaves until caramelized to a golden brown crust.",
			addr: "Swargadwar & Bada Danda, Puri", fee: "₹50 - ₹120 per portion", hours: "7:00 AM – 10:30 PM",
			img: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80",
			lat: 19.8055, lng: 85.8201, highlights: []string{"Invented in Nayagarh, Odisha", "Baked inside sal leaves", "Smoky caramelized cheese flavor", "Warm melt-in-mouth texture"}, featured: true,
		},
		{
			id: "plc-food-dalma", destID: "dest-bhubaneswar", name: "Odia Thali & Dalma Kitchen", slug: "odia-thali-dalma-kitchen",
			cat: "food_spot", desc: "Traditional slow-cooked lentil stew simmered with pumpkin, raw banana, brinjal, and colocasia, tempered in aromatic panch phoron and pure desi ghee.",
			addr: "Madhusudan Nagar & Saheed Nagar, Bhubaneswar", fee: "₹180 - ₹350 per thali", hours: "11:30 AM – 3:30 PM, 7:00 PM – 10:30 PM",
			img: "https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?auto=format&fit=crop&w=800&q=80",
			lat: 20.2910, lng: 85.8360, highlights: []string{"Authentic Dalma with roasted cumin chili powder", "Pakhala Bhata on hot days", "Kanika sweet rice", "Chenna Tarkari & Badi Chura"}, featured: true,
		},
		{
			id: "plc-food-baripada-mudhi-mansa", destID: "dest-similipal", name: "Baripada Royal Mudhi Mansa", slug: "baripada-mudhi-mansa",
			cat: "food_spot", desc: "The iconic northern Odisha specialty: crunchy puffed rice soaked in slow-cooked mutton gravy loaded with garlic, mustard oil, and fiery whole spices.",
			addr: "Kachery Road, Baripada, Mayurbhanj District", fee: "₹150 - ₹250 per plate", hours: "12:00 PM – 4:00 PM",
			img: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80",
			lat: 21.9338, lng: 86.7258, highlights: []string{"Mayurbhanj royal cuisine heritage", "Crisp hand-roasted local mudhi", "Rich aromatic goat curry", "Accompanied by sliced raw onions & green chilies"}, featured: false,
		},
		{
			id: "plc-daringbadi-pine", destID: "dest-daringbadi", name: "Daringbadi Pine Forest & Hill View", slug: "daringbadi-pine-forest",
			cat: "hidden_gem", desc: "A serene highland sanctuary covered in dense chir pine plantations and coffee shrubs. Perfect for morning nature walks under whispering needles with views of misty mountain ridges.",
			addr: "Hill View Park Road, Daringbadi, Kandhamal 762104", fee: "₹20 entrance ticket", hours: "6:00 AM – 6:00 PM",
			img: "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=800&q=80",
			lat: 19.9122, lng: 84.1299, highlights: []string{"Rare pine groves in Eastern Ghats", "Adjacent organic coffee estates", "Hill View watchtower", "Crisp mountain air & winter dew"}, featured: true,
		},
	}

	for _, p := range places {
		hlJSON, _ := json.Marshal(p.highlights)
		featVal := 0
		if p.featured {
			featVal = 1
		}
		if DriverName == "postgres" {
			DB.Exec(`INSERT INTO places (id, destination_id, name, slug, category, description, address, latitude, longitude, entry_fee, opening_hours, image_url, highlights, is_featured)
				VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
				p.id, p.destID, p.name, p.slug, p.cat, p.desc, p.addr, p.lat, p.lng, p.fee, p.hours, p.img, string(hlJSON), p.featured)
		} else {
			DB.Exec(`INSERT INTO places (id, destination_id, name, slug, category, description, address, latitude, longitude, entry_fee, opening_hours, image_url, highlights, is_featured)
				VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
				p.id, p.destID, p.name, p.slug, p.cat, p.desc, p.addr, p.lat, p.lng, p.fee, p.hours, p.img, string(hlJSON), featVal)
		}
	}

	// 4. Seed Festivals
	type FestSeed struct {
		id, destID, name, slug, desc, month, season, dateInfo, loc, cult, tips, img string
	}

	fests := []FestSeed{
		{
			id: "fest-rath-yatra", destID: "dest-puri", name: "Ratha Yatra (Puri Chariot Festival)", slug: "puri-rath-yatra",
			desc: "The world's most spectacular chariot procession. Lord Jagannath, Balabhadra, and Subhadra journey 3 km on monumental multistoried wooden chariots pulled by millions of fervent devotees.",
			month: "June - July", season: "Monsoon (Ashadha Shukla Paksha Dwitiya)", dateInfo: "Typically late June or early July (confirmed annually as per Hindu lunar calendar)",
			loc: "Grand Road (Bada Danda), Puri",
			cult: "The only occasion when the deities leave the sanctum sanctorum to meet everyone irrespective of caste, creed, or nationality. Represents supreme egalitarian devotion.",
			tips: "Book accommodation at least 4 months in advance. Use water stations, wear comfortable cotton clothing, and be prepared for massive devotional crowds.",
			img: "https://images.unsplash.com/photo-1628085446059-e93cb101ee63?auto=format&fit=crop&w=800&q=80",
		},
		{
			id: "fest-konark-dance", destID: "dest-konark", name: "Konark Dance & International Sand Art Festival", slug: "konark-dance-festival",
			desc: "A five-day celebration of classical Indian dance against the floodlit backdrop of the Sun Temple, alongside master sand sculptors from around the globe at Chandrabhaga beach.",
			month: "December", season: "Winter (December 1 to 5 annually)", dateInfo: "Confirmed annually from December 1st to 5th",
			loc: "Sun Temple Open Air Amphitheatre & Chandrabhaga Beach",
			cult: "Celebrates Odissi, Bharatanatyam, Kathak, Manipuri, and Kathakali forms in communion with Kalinga stone heritage. Sand artists craft transient masterpieces on social and environmental themes.",
			tips: "Evenings can get chilly by the sea; bring a light shawl. Ticket counters open daily at OTDC venues.",
			img: "https://images.unsplash.com/photo-1599423300746-b62533397364?auto=format&fit=crop&w=800&q=80",
		},
		{
			id: "fest-raja-parba", destID: "dest-bhubaneswar", name: "Raja Parba (Festival of Womanhood & Earth)", slug: "raja-parba",
			desc: "A joyous three-day agricultural celebration heralding the arrival of monsoon showers and celebrating the rejuvenation of Mother Earth with decorated rope swings (doli), pitha sweets, and games.",
			month: "June", season: "Early Monsoon (Mid-June, 14-16 June)", dateInfo: "Typically starts June 14th across all regions of Odisha",
			loc: "Celebrated across villages and towns throughout Odisha",
			cult: "Reveres feminine energy and fertility. All agricultural plowing is suspended for three days to give the Earth rest. Young women wear traditional attire and enjoy folk swings.",
			tips: "Try traditional Odia pithas: Poda Pitha, Manda Pitha, and Kakara made specially during Raja.",
			img: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=800&q=80",
		},
		{
			id: "fest-bali-jatra", destID: "dest-bhubaneswar", name: "Bali Jatra & Boita Bandana", slug: "bali-jatra-cuttack",
			desc: "Asia's largest open-air trade and cultural fair on the banks of the Mahanadi river in Cuttack, commemorating ancient Odia maritime merchants (Sadhabas) who sailed to Bali, Java, and Sumatra.",
			month: "November", season: "Winter (Kartika Purnima)", dateInfo: "Commences on Kartika Purnima (full moon in November)",
			loc: "Gadagadia Ghat & Barabati Fort Grounds, Cuttack (25 km from Bhubaneswar)",
			cult: "Devotees float miniature boats made of banana bark, cork, and paper with tiny lamps and betel leaves at dawn, echoing ancient sea voyage blessings.",
			tips: "Plan at least 4-5 hours to explore the endless craft stalls, famous Dahibara Aloo Dum food alleys, and traditional open-air theaters.",
			img: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80",
		},
	}

	for _, f := range fests {
		destIDPtr := f.destID
		if DriverName == "postgres" {
			DB.Exec(`INSERT INTO festivals (id, destination_id, name, slug, description, celebration_month, typical_season, confirmed_date_info, location_summary, cultural_significance, visitor_tips, image_url)
				VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
				f.id, destIDPtr, f.name, f.slug, f.desc, f.month, f.season, f.dateInfo, f.loc, f.cult, f.tips, f.img)
		} else {
			DB.Exec(`INSERT INTO festivals (id, destination_id, name, slug, description, celebration_month, typical_season, confirmed_date_info, location_summary, cultural_significance, visitor_tips, image_url)
				VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
				f.id, destIDPtr, f.name, f.slug, f.desc, f.month, f.season, f.dateInfo, f.loc, f.cult, f.tips, f.img)
		}
	}

	// 5. Seed Reviews
	reviews := []struct {
		id, placeID, userID, title, comment, visitDate string
		rating                                        int
	}{
		{
			id: "rev-01", placeID: "plc-puri-jagannath", userID: "usr-traveler-01",
			rating: 5, title: "Spiritual aura like nowhere else on Earth",
			comment: "Stepping inside the temple complex at dawn was breathtaking. The stone carvings, the chanting, and tasting the sacred Mahaprasad from Ananda Bazar is an experience that stays with you forever.",
			visitDate: "January 2026",
		},
		{
			id: "rev-02", placeID: "plc-konark-sun-temple", userID: "usr-contrib-01",
			rating: 5, title: "An architectural marvel every traveler must see",
			comment: "Having visited Konark over 20 times as a historian, the sheer ingenuity of the solar alignment and chariot wheels continues to amaze me. Visit early morning before crowds arrive for magical light on the sandstone.",
			visitDate: "February 2026",
		},
		{
			id: "rev-03", placeID: "plc-chilika-mangalajodi", userID: "usr-traveler-01",
			rating: 5, title: "Photographer's paradise in serene silence",
			comment: "The wooden boat glided through lily pads without a whisper of engine noise. We were able to get within 10 feet of glossy ibises, godwits, and jacanas. The guides are extremely knowledgeable.",
			visitDate: "December 2025",
		},
		{
			id: "rev-04", placeID: "plc-food-chhena-poda", userID: "usr-traveler-01",
			rating: 5, title: "Warm, caramelized perfection",
			comment: "Never had anything like this dessert before. The burnt crust gives it a subtle smokiness while the interior is soft, sweet, and fragrant with cardamom. Must try when fresh out of the sal leaves!",
			visitDate: "January 2026",
		},
	}

	for _, r := range reviews {
		if DriverName == "postgres" {
			DB.Exec(`INSERT INTO reviews (id, place_id, user_id, rating, title, comment, visit_date)
				VALUES ($1, $2, $3, $4, $5, $6, $7)`, r.id, r.placeID, r.userID, r.rating, r.title, r.comment, r.visitDate)
		} else {
			DB.Exec(`INSERT INTO reviews (id, place_id, user_id, rating, title, comment, visit_date)
				VALUES (?, ?, ?, ?, ?, ?, ?)`, r.id, r.placeID, r.userID, r.rating, r.title, r.comment, r.visitDate)
		}
	}

	// 6. Seed Blog Posts
	type BlogSeed struct {
		id, authorID, destID, title, slug, excerpt, img, content, cat string
		tags                                                          []string
		readTime                                                      int
	}

	blogs := []BlogSeed{
		{
			id: "post-golden-triangle", authorID: "usr-contrib-01", destID: "dest-puri",
			title: "The Golden Triangle of Odisha: Puri, Konark, and Bhubaneswar in 4 Days",
			slug: "golden-triangle-odisha-4-days",
			excerpt: "How to experience 2,000 years of Kalinga heritage, sacred coastline, and culinary secrets across Eastern India's most iconic circuit.",
			img: "https://images.unsplash.com/photo-1609137144813-7d9921338f24?auto=format&fit=crop&w=1200&q=80",
			content: `# The Golden Triangle of Odisha: Puri, Konark, and Bhubaneswar

For anyone looking to experience the spiritual depth, stone craftsmanship, and coastal rhythm of Eastern India, the circuit connecting Bhubaneswar, Konark, and Puri is unmissable.

## Day 1: The Temple City of Bhubaneswar
Start your journey in Old Town Bhubaneswar. The Lingaraj Temple commands the horizon with 11th-century grandeur. Stroll around the sacred Bindusagar lake and marvel at Mukteswar Temple, often described as the 'Gem of Odia Architecture' with its signature arched torana gateway.

For lunch, head to a traditional mess for **Dalma** and aromatic kanika rice. In the afternoon, visit the rock-cut Jain caves at Udayagiri and Khandagiri, followed by sunset at the peaceful Dhauli Shanti Stupa.

## Day 2: Poetry in Stone at Konark
Take the scenic Marine Drive towards Konark. The 13th-century Sun Temple reveals itself as a colossal chariot conceived in sandstone and chlorite. Take time to study the 24 astronomical wheels—each rim and spoke holds precise sundial timekeeping capabilities.

Spend your late afternoon at Chandrabhaga beach where the horizon meets wild, refreshing sea breezes.

## Day 3 & 4: Puri's Mysticism and Heritage
Puri is an assault on the senses in the most uplifting way. Wake up to the chant of temple hymns. Watch the ritual changing of the sacred Patita Pavana flag on top of the Jagannath Temple spire. 

Do not miss tasting the **Chhena Poda** freshly baked in sal leaves, and spend an evening walking along the Blue Flag certified Golden Beach.`,
			cat: "Travel Guides", tags: []string{"Golden Triangle", "Heritage", "Puri", "Konark", "Bhubaneswar", "Itinerary"},
			readTime: 6,
		},
		{
			id: "post-culinary-trails", authorID: "usr-contrib-01", destID: "dest-bhubaneswar",
			title: "Culinary Trails: Why Odisha's Chhena Poda and Dalma Define East Indian Comfort Food",
			slug: "culinary-trails-chhena-poda-dalma",
			excerpt: "Delving into the subtle, slow-cooked genius of Odia culinary philosophy—from roasted cottage cheese to temple-style lentil stews.",
			img: "https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?auto=format&fit=crop&w=1200&q=80",
			content: `# Culinary Trails of Odisha

While neighboring regions often claim the spotlight with fiery gravies and sweet syrup, Odia cuisine practices an art of understated balance, subtle mustard temperings, and deep respect for seasonal produce.

## The Story of Chhena Poda
Legend holds that in the 1940s in Nayagarh, a confectioner named Sudarshana Sahoo accidentally left sweetened fresh cottage cheese (chhena) in an oven with dying embers. The next morning, a heavenly roasted aroma greeted him. The burnt crust had caramelized the sugars while sealing in a delicate, cardamom-scented center. Thus, Chhena Poda—literally 'burnt cheese'—was born.

## Dalma: Wholesome Simplicity
Dalma is the ultimate comfort food. Split yellow peas (toor dal or moong dal) are cooked gently with a symphony of vegetables: raw papaya, sweet pumpkin, colocasia (saru), and eggplant. The magic happens during the chhunka (tempering)—panch phoron, dried red chilies, crushed ginger, and generous dollops of pure cow ghee, finished with freshly roasted cumin and chili powder.

Paired with steaming rice or fermented Pakhala on warm afternoons, it represents nourishment in its purest form.`,
			cat: "Food & Culture", tags: []string{"Odia Food", "Chhena Poda", "Dalma", "Gastronomy", "Culture"},
			readTime: 5,
		},
		{
			id: "post-mangalajodi-poachers", authorID: "usr-traveler-01", destID: "dest-chilika",
			title: "Mangalajodi: How Former Poachers Became Guardians of Chilika's Migratory Birds",
			slug: "mangalajodi-guardians-of-chilika",
			excerpt: "A remarkable conservation journey in a quiet wetland village where illegal bird hunting transformed into world-renowned community eco-tourism.",
			img: "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=1200&q=80",
			content: `# Mangalajodi: Guardians of Chilika

Twenty-five years ago, the marshes of Mangalajodi on the northern edge of Chilika Lake were notorious. During the winter migration, tens of thousands of migratory waterfowl flying down from Siberia, Mongolia, and the Caspian Sea were poisoned and snared each season for urban meat markets.

## The Transformation
Through the persistent grassroots intervention of local environmentalists and the formation of the **Sri Sri Mahavir Pakshi Suraksha Samiti**, village elders began dialogue with the hunters. 

Slowly, the community realized that a living bird in the marsh brought tourists, respectful admiration, and sustainable long-term income, while a dead bird brought only fleeting coins and environmental devastation.

Today, those very same hunters operate handcrafted wooden punts. With an uncanny ability to spot a camouflaged bittern among reeds and identify waterfowl calls from hundreds of meters away, they have turned Mangalajodi into one of Asia's most celebrated eco-tourism models.`,
			cat: "Eco Tourism", tags: []string{"Chilika", "Birdwatching", "Conservation", "Eco Tourism", "Wildlife"},
			readTime: 4,
		},
	}

	for _, b := range blogs {
		tagsJSON, _ := json.Marshal(b.tags)
		destIDPtr := b.destID
		if DriverName == "postgres" {
			DB.Exec(`INSERT INTO blog_posts (id, author_id, destination_id, title, slug, excerpt, cover_image, content, category, tags, status, read_time_minutes, views_count)
				VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'published', $11, 142)`,
				b.id, b.authorID, destIDPtr, b.title, b.slug, b.excerpt, b.img, b.content, b.cat, string(tagsJSON), b.readTime)
		} else {
			DB.Exec(`INSERT INTO blog_posts (id, author_id, destination_id, title, slug, excerpt, cover_image, content, category, tags, status, read_time_minutes, views_count)
				VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'published', ?, 142)`,
				b.id, b.authorID, destIDPtr, b.title, b.slug, b.excerpt, b.img, b.content, b.cat, string(tagsJSON), b.readTime)
		}
	}

	// 7. Seed Sample Trip Planner Itinerary
	sampleItinerary := []map[string]interface{}{
		{
			"day_number": 1,
			"title":      "Arrival in Bhubaneswar & Ekamra Kshetra Temples",
			"items": []map[string]interface{}{
				{"place_id": "plc-bhubaneswar-lingaraj", "place_name": "Lingaraj Temple", "category": "temple", "time_slot": "09:00 AM", "estimated_cost": 50, "notes": "Modest clothing required; lockers outside for phones"},
				{"place_id": "plc-food-dalma", "place_name": "Odia Thali & Dalma Kitchen", "category": "food_spot", "time_slot": "01:00 PM", "estimated_cost": 300, "notes": "Order the traditional veg thali with Dalma and Chenna Tarkari"},
				{"place_id": "plc-bhubaneswar-dhauli", "place_name": "Dhauli Shanti Stupa", "category": "heritage", "time_slot": "04:30 PM", "estimated_cost": 100, "notes": "Enjoy sunset overlooking the serene Daya River"},
			},
		},
		{
			"day_number": 2,
			"title":      "Marine Drive, Sun Temple & Coastal Puri",
			"items": []map[string]interface{}{
				{"place_id": "plc-konark-sun-temple", "place_name": "Konark Sun Temple", "category": "heritage", "time_slot": "08:30 AM", "estimated_cost": 250, "notes": "Hire an authorized ASI guide to decode the sundial wheels"},
				{"place_id": "plc-puri-beach", "place_name": "Puri Golden Beach", "category": "beach", "time_slot": "04:00 PM", "estimated_cost": 150, "notes": "Relax along the Blue Flag promenade"},
				{"place_id": "plc-food-chhena-poda", "place_name": "Chhena Poda Heritage Stall", "category": "food_spot", "time_slot": "07:30 PM", "estimated_cost": 100, "notes": "Taste fresh hot Chhena Poda wrapped in sal leaves"},
			},
		},
	}
	itineraryJSON, _ := json.Marshal(sampleItinerary)
	if DriverName == "postgres" {
		DB.Exec(`INSERT INTO trips (id, user_id, title, description, start_date, end_date, budget_estimate, itinerary_data)
			VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
			"trip-demo-01", "usr-traveler-01", "Spiritual & Coastal Odisha Explorer",
			"A balanced 2-day itinerary through temple heritage, ancient crafts, and coastal sunsets.",
			"2026-11-10", "2026-11-12", 4500.00, string(itineraryJSON))
	} else {
		DB.Exec(`INSERT INTO trips (id, user_id, title, description, start_date, end_date, budget_estimate, itinerary_data)
			VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
			"trip-demo-01", "usr-traveler-01", "Spiritual & Coastal Odisha Explorer",
			"A balanced 2-day itinerary through temple heritage, ancient crafts, and coastal sunsets.",
			"2026-11-10", "2026-11-12", 4500.00, string(itineraryJSON))
	}

	log.Printf("[Database] Seeding complete! Added %d destinations, %d places, %d festivals, %d blog posts.\n",
		len(dests), len(places), len(fests), len(blogs))
}
