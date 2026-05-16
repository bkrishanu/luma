# LUMA — Modern Retail Store

A production-ready, static front-end e-commerce website built with vanilla HTML, CSS, and JavaScript. No build tools, no frameworks, no backend required.

---

## 📁 File Structure

```
luma-store/
├── index.html   — HTML shell: all page markup, header, footer, modals
├── style.css    — Complete stylesheet (variables, themes, components, responsive)
├── data.js      — All mock data: USERS, PRODUCTS, CATEGORIES
├── main.js      — All JavaScript: auth, cart, routing, rendering, analytics
└── README.md    — This file
```

**Load order is important.** `data.js` must be loaded before `main.js` (already correct in `index.html`).

---

## 🚀 Running the Store

Open `index.html` in any modern browser — no server required.

> **Tip:** For the best experience (especially if you extend it with API calls), serve from a local server:
> ```bash
> npx serve .          # Node.js
> python -m http.server 8080   # Python 3
> ```

---

## 👤 User Login

User data is hardcoded in `data.js` inside the `USERS` array. Each user has:

| Field        | Description                    |
|-------------|--------------------------------|
| `customerId` | Unique ID, e.g. `CUST-001`    |
| `firstName`  | First name                    |
| `lastName`   | Last name                     |
| `email`      | Login email                   |
| `phone`      | Phone number                  |
| `password`   | Plain-text demo password      |
| `address`    | Street address (auto-fills checkout) |
| `city`       | City                          |
| `zip`        | Postal / ZIP code             |
| `country`    | Country                       |

### Demo Accounts

| Email                      | Password  |
|---------------------------|-----------|
| alex.jordan@email.com     | alex123   |
| priya.sharma@email.com    | priya123  |
| james.kimani@email.com    | james123  |
| sofia.bianchi@email.com   | sofia123  |

### Login Behaviour
- Click the **account icon** (top-right header) to open the login modal.
- On success: user's first name appears in the header; avatar shows initials.
- A dropdown with account info and **Sign Out** is accessible via the avatar.
- Checkout fields are **pre-filled** with the logged-in user's saved address.
- **All analytics events** automatically include `customer_id` and `email` when logged in.
- On logout, the header resets to the guest account icon.

### Adding More Users
Edit `data.js` and add an entry to the `USERS` array:
```js
{
  customerId: 'CUST-005',
  firstName: 'Maria',
  lastName: 'Santos',
  email: 'maria.santos@email.com',
  phone: '+55 11 91234-5678',
  password: 'maria123',
  address: 'Rua das Flores 10',
  city: 'São Paulo',
  zip: '01310-100',
  country: 'Brazil',
},
```

---

## 🛒 Pages & Features

| Page             | Route trigger                        |
|-----------------|--------------------------------------|
| Home            | `navigate('home')`                  |
| Product Listing | `navigate('listing', categoryId)`   |
| Product Detail  | `navigate('product', productId)`    |
| Cart            | `navigate('cart')`                  |
| Checkout        | `navigate('checkout')`              |
| Confirmation    | `navigate('confirmation', payload)` |

**Features:**
- Hero banner, category grid, featured products, promotional banner
- Filters (category, price range, rating), sort, pagination
- Product gallery, variant selectors (color/size), quantity control, reviews, related products
- Mini-cart drawer with quantity update and remove
- Full cart page with order summary
- 3-step checkout: Shipping → Payment → Review
- Order confirmation with itemised summary
- Dark / light mode toggle
- Mobile-responsive with sticky add-to-cart bar
- Search with live dropdown

---

## 📊 Analytics

### DataLayer

Every event is pushed to `window.dataLayer`:

```js
window.dataLayer = [
  {
    event: "product_added",
    event_time: "2025-05-12T10:23:45.000Z",
    anonymous_id: "anon_abc123_1715511825000",
    customer_id: "CUST-001",       // present when logged in
    email: "alex.jordan@email.com", // present when logged in
    ecommerce: {
      currency: "USD",
      value: 189,
      items: [{ product_id: "p001", sku: "CLO-001", ... }]
    }
  }
]
```

### Segment Integration

The Segment snippet is in the `<head>` of `index.html`.

**To activate Segment:**
1. Open `index.html`.
2. Find the comment block labelled `TWILIO SEGMENT — Configuration`.
3. Replace `YOUR_SEGMENT_WRITE_KEY` with your actual source write key.
4. Uncomment the line: `/* analytics.load("YOUR_SEGMENT_WRITE_KEY"); */`

The store works fully without Segment configured — all calls are wrapped safely.

### Events Fired

| Event Name              | Trigger                                 | Segment Method       |
|------------------------|-----------------------------------------|----------------------|
| `page_viewed`          | Every page/route load                   | `analytics.page()`   |
| `product_list_viewed`  | Listing page render                     | `analytics.track()`  |
| `product_viewed`       | Product detail page load                | `analytics.track()`  |
| `product_added`        | Add to cart                             | `analytics.track()`  |
| `product_removed`      | Remove from cart                        | `analytics.track()`  |
| `cart_viewed`          | Mini-cart or cart page opened           | `analytics.track()`  |
| `checkout_started`     | Checkout initiated                      | `analytics.track()`  |
| `checkout_step_viewed` | Each checkout step render               | `analytics.track()`  |
| `shipping_info_submitted` | Shipping form submitted              | `analytics.track()`  |
| `payment_info_entered` | Payment step completed                  | `analytics.track()`  |
| `order_completed`      | Order placed successfully               | `analytics.track()`  |
| `search_performed`     | Search query typed                      | `analytics.track()`  |
| `promotion_viewed`     | Promo strip/banner enters viewport      | `analytics.track()`  |
| `promotion_clicked`    | Promo banner clicked                    | `analytics.track()`  |
| `user_identified`      | Login or checkout email entry           | `analytics.identify()`|
| `user_logged_in`       | Successful login                        | `analytics.track()`  |
| `user_logged_out`      | User signs out                          | `analytics.track()`  |

### Identity

- An anonymous ID (`ANON_ID`) is generated in memory on page load.
- When a user **logs in**, `analytics.identify()` is called with their `customerId` and traits.
- When a **guest** enters their email at checkout, `analytics.identify()` is called with the email.
- All subsequent events in the session carry `customer_id` and `email` in the payload.

### Dev Events Panel

Click the **DEV EVENTS** button (bottom-right corner) to open a real-time monitor showing every analytics event fired — including the full payload. Useful for QA and integration testing without needing a Segment destination.

---

## 🎨 Theming

CSS custom properties in `style.css` control the entire visual system:

```css
:root {
  --accent: #c8522a;   /* Primary brand colour */
  --bg: #faf8f5;       /* Page background */
  --surface: #ffffff;  /* Card/panel background */
  /* … */
}
[data-theme="dark"] {
  --accent: #e06b3c;
  --bg: #13110e;
  /* … */
}
```

Toggle is handled by `toggleTheme()` in `main.js`, which switches the `data-theme` attribute on `<html>`.

---

## 🔧 Extending

| Task                          | Where to edit                  |
|------------------------------|-------------------------------|
| Add/edit products             | `data.js` → `PRODUCTS` array  |
| Add/edit categories           | `data.js` → `CATEGORIES` array|
| Add/edit users                | `data.js` → `USERS` array     |
| Add a new page                | `index.html` (HTML) + `main.js` (render + navigate) |
| Change colours/fonts          | `style.css` CSS variables      |
| Connect a real analytics tool | `main.js` → analytics module  |
| Add GA4 / GTM                 | Subscribe to `window.dataLayer` — already populated |

---

## 📝 Notes

- All state is **in-memory only** — refreshing the page resets cart, login, and session.
- No `localStorage` or cookies are used by design.
- The site is fully functional without any network requests (fonts load from Google Fonts CDN).
