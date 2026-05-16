# LUMA — Modern Retail Store

A production-ready, static front-end e-commerce website built with vanilla HTML, CSS, and JavaScript. No build tools, no frameworks, no backend required.

---

## 📁 File Structure

```
luma-store/
├── index.html         — HTML shell: all page markup, header, footer, modals
├── style.css          — Complete stylesheet (variables, themes, components, responsive)
├── data.js            — All mock data: USERS, PRODUCTS, CATEGORIES, PROMO_CODES
├── main.js            — All JavaScript: auth, cart, routing, rendering, analytics
├── README.md          — This file
└── DATALAYER_SPEC.md  — Full dataLayer & Segment event specification
```

**Load order is important.** `data.js` must be loaded before `main.js` (already correct in `index.html`).

---

## 🚀 Running the Store

Open `index.html` in any modern browser — no server required.

> **Tip:** For the best experience (especially if you extend it with API calls), serve from a local server:
> ```bash
> npx serve .               # Node.js
> python -m http.server 8080  # Python 3
> ```

---

## 👤 User Login

User data is hardcoded in `data.js` inside the `USERS` array. Each user carries a full profile:

| Field | Format / Allowed Values | Description |
|---|---|---|
| `customerId` | `"CUST-001"` | Unique customer identifier |
| `firstName` | string | First name |
| `lastName` | string | Last name |
| `email` | string | Login email address |
| `phone` | string | Phone number including country code |
| `password` | string | Plain-text demo password (**never sent to analytics**) |
| `address` | string | Street address — auto-fills checkout |
| `city` | string | City |
| `zip` | string | ZIP or postal code |
| `country` | string | Country name |
| `dob` | `"YYYY-MM-DD"` | Date of birth, e.g. `"1988-03-15"` |
| `current_location` | `{"longitude": float, "latitude": float}` | Geo coordinates |
| `email_subscribe` | `"opted_in"` / `"subscribed"` / `"unsubscribed"` | Email marketing consent |
| `gender` | `"M"` / `"F"` / `"O"` / `"N"` / `"P"` / `null` | M=Male F=Female O=Other N=Not applicable P=Prefer not to say |
| `language` | ISO 639-1, e.g. `"en"`, `"it"` | Preferred language |
| `time_zone` | IANA tz, e.g. `"America/New_York"` | Local time zone |
| `loyaltyTier` | `"Gold"` / `"Silver"` | Loyalty programme tier |
| `loyaltyPoints` | integer | Current loyalty point balance |
| `loyaltyLastUpdated` | `"yyyy-MM-ddTHH:mm:ss"` | Last loyalty balance change |
| `interests` | `string[]` | Interest tags, e.g. `["fashion","travel","art"]` |
| `date_of_first_session` | ISO 8601 | Timestamp of user's first ever session |

### Demo Accounts

| Email | Password | Loyalty Tier | Email Consent |
|---|---|---|---|
| alex.jordan@email.com | alex123 | Gold | opted_in |
| priya.sharma@email.com | priya123 | Silver | subscribed |
| james.kimani@email.com | james123 | Silver | opted_in |
| sofia.bianchi@email.com | sofia123 | Gold | unsubscribed |

### Login Behaviour
- Click the **account icon** (top-right header) to open the login modal.
- On success: user's first name appears in the header; avatar shows initials.
- A dropdown shows full name, email, Customer ID, and **Sign Out**.
- Checkout fields are **pre-filled** with the logged-in user's saved address.
- **All analytics events** automatically include `customer_id` and `email` when logged in.
- On login, `analytics.identify()` is called with the full user profile (password excluded).
- On logout, the header resets to the guest account icon.

### Adding More Users
Edit `data.js` and add an entry to the `USERS` array:
```js
{
  customerId:  'CUST-005',
  firstName:   'Maria',
  lastName:    'Santos',
  email:       'maria.santos@email.com',
  phone:       '+55 11 91234-5678',
  password:    'maria123',
  address:     'Rua das Flores 10',
  city:        'Sao Paulo',
  zip:         '01310-100',
  country:     'Brazil',
  dob:         '1991-05-17',
  gender:      'F',
  language:    'pt',
  time_zone:   'America/Sao_Paulo',
  current_location:      { longitude: -46.633309, latitude: -23.548943 },
  email_subscribe:       'opted_in',
  interests:             ['fashion', 'music', 'travel'],
  loyaltyTier:           'Silver',
  loyaltyPoints:         950,
  loyaltyLastUpdated:    '2025-04-20T10:00:00',
  date_of_first_session: '2024-03-01T12:00:00Z',
},
```

---

## 🏷️ Promo Codes

Promo codes are hardcoded in `data.js` inside the `PROMO_CODES` object. The coupon field appears in the mini-cart drawer and the cart page order summary.

### Available Codes

| Code | Type | Discount | Min. Order | Cap | Expiry | Description |
|---|---|---|---|---|---|---|
| `LUMA10` | % off | 10% | None | None | Never | 10% off any order |
| `WELCOME15` | % off | 15% | $50 | None | Never | New customer welcome discount |
| `SAVE20` | % off | 20% | $100 | $50 max | Never | 20% off orders over $100 |
| `SUMMER40` | % off | 40% | $200 | $80 max | 2025-08-31 | Summer sale |
| `FLAT25` | Fixed $ | $25 off | $75 | — | Never | Flat $25 off orders over $75 |
| `FREESHIP` | Free shipping | — | None | — | Never | Free shipping on any order |
| `GOLD20` | % off | 20% | None | None | Never | 20% off for Gold loyalty members |

### How It Works

1. Enter a code in the **Promo code** field in the cart drawer or cart page and click **Apply**.
2. Valid codes show a green chip with the code name and savings. Click **✕** to remove.
3. Discounts are reflected live — subtotal, tax, shipping, and total all update instantly.
4. `FREESHIP` zeroes out shipping regardless of order value or method selected.
5. For `%` codes with a `maxDiscount`, the saving is capped at that dollar amount.
6. Tax (8%) is calculated on the **post-discount** subtotal.
7. Only **one coupon** can be applied at a time.

### Validation Rules

| Scenario | Behaviour |
|---|---|
| Code not found | Toast: "Invalid promo code" · fires `coupon_denied` (`reason: invalid_code`) |
| Code past expiry date | Toast: "Code has expired" · fires `coupon_denied` (`reason: expired`) |
| Cart below `minOrder` | Toast: "Minimum order of $X required" · fires `coupon_denied` (`reason: minimum_not_met`) |
| Coupon already applied | Toast: "Remove current code first" |
| Valid code | Applied immediately · fires `coupon_applied` |
| Code removed | Fires `coupon_removed` |

### Adding More Promo Codes
Edit `data.js` and add an entry to the `PROMO_CODES` object:
```js
'VIP30': {
  code:        'VIP30',
  type:        'percent',       // "percent" | "fixed" | "freeship"
  value:       30,              // % for percent; dollar amount for fixed; 0 for freeship
  minOrder:    150,             // minimum cart subtotal (0 = no minimum)
  maxDiscount: 60,              // cap in dollars for percent type; null = no cap
  expiresAt:   '2025-12-31',   // "YYYY-MM-DD" or null (never expires)
  description: '30% off for VIP members (max $60)',
},
```

---

## 🛒 Pages & Features

| Page | Route trigger |
|---|---|
| Home | `navigate('home')` |
| Product Listing | `navigate('listing', categoryId)` |
| Product Detail | `navigate('product', productId)` |
| Cart | `navigate('cart')` |
| Checkout | `navigate('checkout')` |
| Confirmation | `navigate('confirmation', payload)` |

**Features:**
- Hero banner, category grid, featured products, promotional banner
- Filters (category, price range, rating), sort, pagination
- Product gallery, variant selectors (color/size), quantity control, reviews, related products
- Mini-cart drawer with live quantity update, remove, and promo code entry
- Full cart page with order summary and promo code entry
- 3-step checkout: Shipping → Payment → Review (coupon savings carried through all steps)
- Order confirmation with itemised summary, coupon savings line, and total paid
- Dark / light mode toggle
- Mobile-responsive with sticky add-to-cart bar
- Search with live dropdown

---

## 📊 Analytics

### DataLayer

Every event is pushed to `window.dataLayer`:

```js
window.dataLayer              // full array of all pushed events
window.dataLayer.slice(-1)[0] // most recent event
```

Example — `product_added` (logged-in user):
```js
{
  event:        "product_added",
  event_time:   "2025-05-12T10:23:45.000Z",
  segment_ready: false,
  anonymous_id: "anon_abc123_1715511825000",
  customer_id:  "CUST-001",
  email:        "alex.jordan@email.com",
  user_name:    "Alex Jordan",
  ecommerce: {
    currency: "USD",
    value:    189,
    items: [{ product_id: "p001", sku: "CLO-001", name: "Organic Linen Blazer", price: 189, quantity: 1 }]
  }
}
```

### Segment Integration

The Segment snippet is in the `<head>` of `index.html`.

**To activate Segment:**
1. Open `index.html`.
2. Find the comment block labelled `TWILIO SEGMENT — Configuration`.
3. Replace `YOUR_SEGMENT_WRITE_KEY` with your actual source write key.
4. Uncomment: `/* analytics.load("YOUR_SEGMENT_WRITE_KEY"); */`

The store works fully without Segment configured — all calls are wrapped safely.

### Events Fired

| Event Name | Trigger | Segment Method |
|---|---|---|
| `page_viewed` | Every page/route load | `analytics.page()` |
| `product_list_viewed` | Listing page render | `analytics.track()` |
| `product_viewed` | Product detail page load | `analytics.track()` |
| `product_added` | Add to cart | `analytics.track()` |
| `product_removed` | Remove from cart | `analytics.track()` |
| `cart_viewed` | Mini-cart or cart page opened | `analytics.track()` |
| `checkout_started` | Checkout initiated | `analytics.track()` |
| `checkout_step_viewed` | Each checkout step render | `analytics.track()` |
| `shipping_info_submitted` | Shipping form submitted | `analytics.track()` |
| `payment_info_entered` | Payment step completed | `analytics.track()` |
| `order_completed` | Order placed successfully | `analytics.track()` |
| `search_performed` | Search query typed | `analytics.track()` |
| `promotion_viewed` | Promo strip/banner enters viewport | `analytics.track()` |
| `promotion_clicked` | Promo banner clicked | `analytics.track()` |
| `coupon_applied` | Valid promo code successfully applied | `analytics.track()` |
| `coupon_denied` | Invalid / expired / unqualified code | `analytics.track()` |
| `coupon_removed` | Applied coupon removed by user | `analytics.track()` |
| `user_identified` | Login or guest checkout email entry | `analytics.identify()` |
| `user_logged_in` | Successful login | `analytics.track()` |
| `user_logged_out` | User signs out | `analytics.track()` |

For full payload specifications, field definitions, and GTM/GA4 integration guidance, see **[DATALAYER_SPEC.md](./DATALAYER_SPEC.md)**.

### Identity

- An anonymous ID (`ANON_ID`) is generated in memory on page load.
- When a user **logs in**, `analytics.identify()` is called with their full profile (all fields except `password`).
- When a **guest** enters their email at checkout, `analytics.identify()` is called with name and email.
- All subsequent events carry `customer_id` and `email` in every payload.

### Dev Events Panel

Click the **DEV EVENTS** button (bottom-right corner) to see every analytics event and its full payload in real time. No Segment configuration needed.

---

## 🎨 Theming

CSS custom properties in `style.css` control the entire visual system:

```css
:root {
  --accent:  #c8522a;  /* Primary brand colour */
  --bg:      #faf8f5;  /* Page background */
  --surface: #ffffff;  /* Card/panel background */
}
[data-theme="dark"] {
  --accent: #e06b3c;
  --bg:     #13110e;
}
```

Toggle is handled by `toggleTheme()` in `main.js`, which flips the `data-theme` attribute on `<html>`.

---

## 🔧 Extending

| Task | Where to edit |
|---|---|
| Add / edit products | `data.js` → `PRODUCTS` array |
| Add / edit categories | `data.js` → `CATEGORIES` array |
| Add / edit users | `data.js` → `USERS` array |
| Add / edit promo codes | `data.js` → `PROMO_CODES` object |
| Add a new page | `index.html` (markup) + `main.js` (render fn + `navigate()`) |
| Change colours / fonts | `style.css` CSS variables |
| Connect a real analytics tool | `main.js` → analytics module at the top of the file |
| Add GA4 / GTM | Subscribe to `window.dataLayer` — already populated |

---

## 📝 Notes

- All state is **in-memory only** — refreshing the page resets cart, login, coupon, and session.
- No `localStorage` or cookies are used by design.
- The site is fully functional without any network requests (fonts load from Google Fonts CDN).
- `password` is **never** pushed to `window.dataLayer` or Segment under any circumstance.
