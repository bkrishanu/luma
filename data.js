/* ============================================================
   DATA.JS — Mock data: users, products, categories
   All hardcoded in-memory data lives here.
   ============================================================ */

// ─── USERS ────────────────────────────────────────────────
const USERS = [
  {
    // ── Core identity ──────────────────────────────────────
    customerId:  'CUST-001',
    firstName:   'Alex',
    lastName:    'Jordan',
    email:       'alex.jordan@email.com',
    phone:       '+1 (555) 123-4567',
    password:    'alex123',                         // never sent to analytics

    // ── Address ────────────────────────────────────────────
    address:     '123 Main Street',
    city:        'New York',
    zip:         '10001',
    country:     'United States',

    // ── Personal ───────────────────────────────────────────
    dob:         '1988-03-15',                      // "YYYY-MM-DD"
    gender:      'M',                               // M | F | O | N | P | null
    language:    'en',                              // ISO 639-1
    time_zone:   'America/New_York',

    // ── Location ───────────────────────────────────────────
    current_location: { longitude: -73.991443, latitude: 40.753824 },

    // ── Preferences ────────────────────────────────────────
    email_subscribe: 'opted_in',                    // opted_in | subscribed | unsubscribed
    interests:       ['fashion', 'travel', 'art'],

    // ── Loyalty ────────────────────────────────────────────
    loyaltyTier:        'Gold',
    loyaltyPoints:      4750,
    loyaltyLastUpdated: '2025-04-10T09:30:00',     // yyyy-MM-ddTHH:mm:ss

    // ── Session ────────────────────────────────────────────
    date_of_first_session: '2023-06-01T14:22:00Z', // ISO 8601
  },

  {
    // ── Core identity ──────────────────────────────────────
    customerId:  'CUST-002',
    firstName:   'Priya',
    lastName:    'Sharma',
    email:       'priya.sharma@email.com',
    phone:       '+91 98765 43210',
    password:    'priya123',

    // ── Address ────────────────────────────────────────────
    address:     '456 Park Avenue',
    city:        'San Francisco',
    zip:         '94102',
    country:     'United States',

    // ── Personal ───────────────────────────────────────────
    dob:         '1994-07-22',
    gender:      'F',
    language:    'en',
    time_zone:   'America/Los_Angeles',

    // ── Location ───────────────────────────────────────────
    current_location: { longitude: -122.419416, latitude: 37.774929 },

    // ── Preferences ────────────────────────────────────────
    email_subscribe: 'subscribed',
    interests:       ['yoga', 'sustainability', 'home-decor', 'cooking'],

    // ── Loyalty ────────────────────────────────────────────
    loyaltyTier:        'Silver',
    loyaltyPoints:      1820,
    loyaltyLastUpdated: '2025-03-28T16:45:00',

    // ── Session ────────────────────────────────────────────
    date_of_first_session: '2024-01-15T08:10:00Z',
  },

  {
    // ── Core identity ──────────────────────────────────────
    customerId:  'CUST-003',
    firstName:   'James',
    lastName:    'Kimani',
    email:       'james.kimani@email.com',
    phone:       '+44 7700 900123',
    password:    'james123',

    // ── Address ────────────────────────────────────────────
    address:     '78 Oxford Street',
    city:        'London',
    zip:         'W1D 1BS',
    country:     'United Kingdom',

    // ── Personal ───────────────────────────────────────────
    dob:         '1990-11-05',
    gender:      'M',
    language:    'en',
    time_zone:   'Europe/London',

    // ── Location ───────────────────────────────────────────
    current_location: { longitude: -0.127758, latitude: 51.507351 },

    // ── Preferences ────────────────────────────────────────
    email_subscribe: 'opted_in',
    interests:       ['hiking', 'cycling', 'photography', 'technology'],

    // ── Loyalty ────────────────────────────────────────────
    loyaltyTier:        'Silver',
    loyaltyPoints:      2310,
    loyaltyLastUpdated: '2025-05-01T11:00:00',

    // ── Session ────────────────────────────────────────────
    date_of_first_session: '2023-11-20T19:55:00Z',
  },

  {
    // ── Core identity ──────────────────────────────────────
    customerId:  'CUST-004',
    firstName:   'Sofia',
    lastName:    'Bianchi',
    email:       'sofia.bianchi@email.com',
    phone:       '+39 333 1234567',
    password:    'sofia123',

    // ── Address ────────────────────────────────────────────
    address:     'Via Roma 22',
    city:        'Milan',
    zip:         '20121',
    country:     'Italy',

    // ── Personal ───────────────────────────────────────────
    dob:         '1985-02-28',
    gender:      'F',
    language:    'it',
    time_zone:   'Europe/Rome',

    // ── Location ───────────────────────────────────────────
    current_location: { longitude: 9.185924, latitude: 45.465422 },

    // ── Preferences ────────────────────────────────────────
    email_subscribe: 'unsubscribed',
    interests:       ['fashion', 'fine-dining', 'art', 'travel', 'wellness'],

    // ── Loyalty ────────────────────────────────────────────
    loyaltyTier:        'Gold',
    loyaltyPoints:      8900,
    loyaltyLastUpdated: '2025-05-08T08:20:00',

    // ── Session ────────────────────────────────────────────
    date_of_first_session: '2022-09-03T10:30:00Z',
  },
  {
    customerId:  'CUST-IBM-001',
    firstName:   'Riya',
    lastName:    'Roy',
    email:       'riya.roy1@ibm.com',
    phone:       '+919123691991',
    password:    'riya123',
    address:     'GB 64 Sakuntala Park',
    city:        'Kolkata',
    zip:         '700101',
    country:     'India',
    dob:         '1999-06-23',
    gender:      'F',
    language:    'en',
    time_zone:   'Asia/Kolkata',
    current_location: { longitude: 88.363892, latitude: 22.572645 },
    email_subscribe: 'opted_in',
    interests:       ['yoga', 'dance', 'home-decor', 'travel'],
    loyaltyTier:        'Silver',
    loyaltyPoints:      1820,
    loyaltyLastUpdated: '2025-03-28T16:45:00',
    date_of_first_session: '2024-01-15T08:10:00Z',
  },
  {
    customerId:  'CUST-IBM-003',
    firstName:   'Krishanu',
    lastName:    'Banerjee',
    email:       'krishanu.banerjee2@ibm.com',
    phone:       '+919836144463',
    password:    'krish123',
    address:     'Stapathya Tower',
    city:        'Asansol',
    zip:         '713325',
    country:     'India',
    dob:         '1983-08-07',
    gender:      'M',
    language:    'fr',
    time_zone:   'Asia/Kolkata',
    current_location: { longitude: 86.952393, latitude: 23.673944 },
    email_subscribe: 'opted_in',
    interests:       ['coding', 'cooking', 'mythology', 'reading'],
    loyaltyTier:        'Platinum',
    loyaltyPoints:      5820,
    loyaltyLastUpdated: '2026-03-28T16:45:00',
    date_of_first_session: '2026-04-15T08:10:00Z',
  }
];

// ─── PRODUCTS ─────────────────────────────────────────────
const PRODUCTS = [
  {
    id: 'p001', sku: 'CLO-001', name: 'Organic Linen Blazer',
    category: 'clothing', brand: 'LUMA', emoji: '🧥',
    price: 189, originalPrice: 269, rating: 4.8, reviews: 234,
    badge: 'sale', colors: ['#2d3436', '#b2bec3', '#e17055'],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    description: 'Crafted from 100% organic linen, this blazer offers effortless elegance for any occasion.',
    isNew: false, isFeatured: true,
  },
  {
    id: 'p002', sku: 'CLO-002', name: 'Merino Wool Turtleneck',
    category: 'clothing', brand: 'LUMA', emoji: '👕',
    price: 129, originalPrice: null, rating: 4.9, reviews: 189,
    badge: 'new', colors: ['#1a1814', '#dfe6e9', '#fdcb6e'],
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    description: 'Ultra-soft merino wool for all-day comfort and warmth without the bulk.',
    isNew: true, isFeatured: true,
  },
  {
    id: 'p003', sku: 'CLO-003', name: 'Wide-Leg Tailored Trousers',
    category: 'clothing', brand: 'LUMA', emoji: '👖',
    price: 149, originalPrice: 199, rating: 4.7, reviews: 312,
    badge: 'sale', colors: ['#2d3436', '#6c5ce7', '#fab1a0'],
    sizes: ['XS', 'S', 'M', 'L'],
    description: 'Modern wide-leg silhouette with precision tailoring and a comfortable high-rise waist.',
    isNew: false, isFeatured: true,
  },
  {
    id: 'p004', sku: 'ACC-001', name: 'Artisan Leather Tote',
    category: 'accessories', brand: 'LUMA', emoji: '👜',
    price: 299, originalPrice: 399, rating: 4.9, reviews: 156,
    badge: 'sale', colors: ['#795548', '#1a1814', '#fffff0'],
    sizes: ['One Size'],
    description: 'Hand-stitched genuine leather tote, spacious and structured for everyday use.',
    isNew: false, isFeatured: true,
  },
  {
    id: 'p005', sku: 'ACC-002', name: 'Silk Scarf — Abstract Print',
    category: 'accessories', brand: 'LUMA', emoji: '🧣',
    price: 89, originalPrice: null, rating: 4.6, reviews: 78,
    badge: 'new', colors: ['#e17055', '#6c5ce7', '#00cec9'],
    sizes: ['One Size'],
    description: 'Hand-rolled silk scarf with exclusive abstract print by LUMA design studio.',
    isNew: true, isFeatured: false,
  },
  {
    id: 'p006', sku: 'ACC-003', name: 'Minimal Leather Wallet',
    category: 'accessories', brand: 'LUMA', emoji: '👛',
    price: 79, originalPrice: null, rating: 4.8, reviews: 445,
    badge: null, colors: ['#2d3436', '#795548'],
    sizes: ['One Size'],
    description: 'Slim bifold wallet in full-grain leather. Card slots, cash compartment, coin pocket.',
    isNew: false, isFeatured: false,
  },
  {
    id: 'p007', sku: 'HOM-001', name: 'Hand-Thrown Ceramic Mug',
    category: 'home', brand: 'LUMA', emoji: '☕',
    price: 49, originalPrice: null, rating: 4.9, reviews: 678,
    badge: 'hot', colors: ['#fdfd96', '#a8d8ea', '#f8b500'],
    sizes: ['320ml', '450ml'],
    description: 'Artisan-crafted stoneware mug, each one unique with natural glaze variations.',
    isNew: false, isFeatured: true,
  },
  {
    id: 'p008', sku: 'HOM-002', name: 'Linen Throw Pillow Set',
    category: 'home', brand: 'LUMA', emoji: '🛋️',
    price: 119, originalPrice: 159, rating: 4.7, reviews: 234,
    badge: 'sale', colors: ['#f5f5f5', '#dfe6e9', '#b2bec3'],
    sizes: ['45×45cm', '60×60cm'],
    description: 'Set of two handwoven linen cushion covers in neutral tones. Zipper closure.',
    isNew: false, isFeatured: false,
  },
  {
    id: 'p009', sku: 'CLO-004', name: 'Cashmere Knit Cardigan',
    category: 'clothing', brand: 'LUMA', emoji: '🧶',
    price: 249, originalPrice: 329, rating: 4.9, reviews: 189,
    badge: 'sale', colors: ['#f0e6d3', '#2d3436', '#e17055'],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    description: 'Pure cashmere cardigan, lightweight and warm, with pearlescent button closure.',
    isNew: false, isFeatured: false,
  },
  {
    id: 'p010', sku: 'ACC-004', name: 'Architect Sunglasses',
    category: 'accessories', brand: 'LUMA', emoji: '🕶️',
    price: 189, originalPrice: null, rating: 4.7, reviews: 123,
    badge: 'new', colors: ['#1a1814', '#795548', '#b2bec3'],
    sizes: ['One Size'],
    description: 'Geometric acetate frames with polarized UV400 lenses. Includes premium case.',
    isNew: true, isFeatured: false,
  },
  {
    id: 'p011', sku: 'HOM-003', name: 'Scented Soy Candle',
    category: 'home', brand: 'LUMA', emoji: '🕯️',
    price: 45, originalPrice: null, rating: 4.8, reviews: 567,
    badge: null, colors: ['#fffff0', '#f5f5f5', '#fab1a0'],
    sizes: ['150g', '250g', '400g'],
    description: 'Hand-poured soy wax candle with natural essential oils. 50-hour burn time.',
    isNew: false, isFeatured: false,
  },
  {
    id: 'p012', sku: 'CLO-005', name: 'Structured Denim Jacket',
    category: 'clothing', brand: 'LUMA', emoji: '🫙',
    price: 169, originalPrice: 219, rating: 4.6, reviews: 298,
    badge: 'sale', colors: ['#74b9ff', '#2d3436'],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    description: 'Premium selvedge denim jacket with structured shoulders and clean detailing.',
    isNew: false, isFeatured: false,
  },
];

// ─── CATEGORIES ───────────────────────────────────────────
const CATEGORIES = [
  { id: 'clothing',    name: 'Clothing',      emoji: '👗', count: PRODUCTS.filter(p => p.category === 'clothing').length },
  { id: 'accessories', name: 'Accessories',   emoji: '👜', count: PRODUCTS.filter(p => p.category === 'accessories').length },
  { id: 'home',        name: 'Home & Living', emoji: '🏠', count: PRODUCTS.filter(p => p.category === 'home').length },
  { id: 'new',         name: 'New Arrivals',  emoji: '✨', count: PRODUCTS.filter(p => p.isNew).length },
];
