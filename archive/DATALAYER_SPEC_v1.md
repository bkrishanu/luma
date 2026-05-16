# LUMA Retail — DataLayer Event Specification

**Version:** 1.0  
**Last Updated:** May 2025  
**Applies to:** `main.js` analytics module  
**Compatible with:** Google Tag Manager (GTM), GA4, Segment, Adobe Launch, any tag management system that reads `window.dataLayer`

---

## Table of Contents

1. [Overview](#1-overview)
2. [Global Event Structure](#2-global-event-structure)
3. [Identity Fields](#3-identity-fields)
4. [Event Reference](#4-event-reference)
   - [4.01 page_viewed](#401-page_viewed)
   - [4.02 product_list_viewed](#402-product_list_viewed)
   - [4.03 product_viewed](#403-product_viewed)
   - [4.04 product_added](#404-product_added)
   - [4.05 product_removed](#405-product_removed)
   - [4.06 cart_viewed](#406-cart_viewed)
   - [4.07 checkout_started](#407-checkout_started)
   - [4.08 checkout_step_viewed](#408-checkout_step_viewed)
   - [4.09 shipping_info_submitted](#409-shipping_info_submitted)
   - [4.10 payment_info_entered](#410-payment_info_entered)
   - [4.11 order_completed](#411-order_completed)
   - [4.12 search_performed](#412-search_performed)
   - [4.13 promotion_viewed](#413-promotion_viewed)
   - [4.14 promotion_clicked](#414-promotion_clicked)
   - [4.15 user_identified](#415-user_identified)
   - [4.16 user_logged_in](#416-user_logged_in)
   - [4.17 user_logged_out](#417-user_logged_out)
5. [Segment Mapping](#5-segment-mapping)
6. [Field Type Reference](#6-field-type-reference)
7. [GTM / GA4 Integration Notes](#7-gtm--ga4-integration-notes)
8. [Trigger Map](#8-trigger-map)

---

## 1. Overview

The LUMA store pushes structured event objects to `window.dataLayer` for every meaningful user interaction. Events follow a consistent schema so that any downstream tag management or analytics tool can consume them without custom transformation.

```js
// Accessing the dataLayer in the browser console
window.dataLayer              // full array of all pushed events
window.dataLayer.slice(-1)[0] // most recent event
```

Every event is also mirrored to Twilio Segment via the `analytics` object (when configured). See [Section 5](#5-segment-mapping) for the Segment method mapping.

---

## 2. Global Event Structure

Every event in `window.dataLayer` shares these top-level fields:

```jsonc
{
  "event":          "string",   // snake_case event name — used as GTM trigger
  "event_time":     "string",   // ISO 8601 timestamp, e.g. "2025-05-12T10:23:45.000Z"
  "segment_ready":  "boolean",  // true if Segment analytics.js is loaded & initialised
  "anonymous_id":   "string",   // session-scoped anonymous identifier

  // Present only when a user is logged in:
  "customer_id":    "string",   // e.g. "CUST-001"
  "email":          "string",   // e.g. "alex.jordan@email.com"
  "user_name":      "string",   // e.g. "Alex Jordan"

  // Event-specific fields follow (see each event below)
}
```

### Field Descriptions

| Field | Type | Always Present | Description |
|---|---|---|---|
| `event` | string | ✅ | Snake_case identifier. Use as the GTM custom event trigger name. |
| `event_time` | string (ISO 8601) | ✅ | UTC timestamp of when the event was fired. |
| `segment_ready` | boolean | ✅ | Whether Segment is configured and ready to receive calls. |
| `anonymous_id` | string | ✅ | Randomly generated at session start. Persists for the browser session. |
| `customer_id` | string | ⬜ Logged-in only | Unique customer identifier from the USERS data store. |
| `email` | string | ⬜ Logged-in only | Customer email address. Also populated at checkout for guest users. |
| `user_name` | string | ⬜ Logged-in only | Full name: `firstName + " " + lastName`. |

---

## 3. Identity Fields

Identity is appended automatically to every event by `getIdentityContext()`.

### Guest (not logged in)
```jsonc
{
  "anonymous_id": "anon_k7x2m9abc_1715511825000"
}
```

### Authenticated User
```jsonc
{
  "anonymous_id": "anon_k7x2m9abc_1715511825000",
  "customer_id":  "CUST-001",
  "email":        "alex.jordan@email.com",
  "user_name":    "Alex Jordan"
}
```

> **Note:** Guest checkout users also get `email` populated after they enter it on the shipping step, via `analytics.identify()`.

---

## 4. Event Reference

---

### 4.01 `page_viewed`

Fired on every route change / page load.

**Trigger:** `navigate()` function — fires for all pages.

**GTM Trigger:** Custom Event → Event name equals `page_viewed`

#### DataLayer Push
```jsonc
{
  "event":        "page_viewed",
  "event_time":   "2025-05-12T10:00:00.000Z",
  "segment_ready": false,
  "anonymous_id": "anon_k7x2m9abc_1715511825000",

  // Identity fields (if logged in)
  "customer_id":  "CUST-001",
  "email":        "alex.jordan@email.com",
  "user_name":    "Alex Jordan",

  // Event-specific fields
  "page_name":    "Home",
  "page_type":    "home",
  "url":          "https://example.com/",
  "referrer":     ""
}
```

#### Field Reference

| Field | Type | Example Values | Description |
|---|---|---|---|
| `page_name` | string | `"Home"`, `"Product Listing"`, `"Product Detail"`, `"Cart"`, `"Checkout"`, `"Order Confirmation"` | Human-readable page name |
| `page_type` | string | `"home"`, `"listing"`, `"product"`, `"cart"`, `"checkout"`, `"confirmation"` | Machine-readable page category |
| `url` | string | `"https://example.com/"` | Full page URL |
| `referrer` | string | `""`, `"https://google.com"` | Previous page URL; empty on direct load |

#### Page Name → Page Type Mapping

| Page | `page_name` | `page_type` |
|---|---|---|
| Home / Landing | `"Home"` | `"home"` |
| Product Listing | `"Product Listing"` | `"listing"` |
| Product Detail | `"Product Detail"` | `"product"` |
| Cart | `"Cart"` | `"cart"` |
| Checkout | `"Checkout"` | `"checkout"` |
| Order Confirmation | `"Order Confirmation"` | `"confirmation"` |

---

### 4.02 `product_list_viewed`

Fired when the product listing page renders with visible products.

**Trigger:** `renderListing()` — fires on category/listing page load and filter changes.

**GTM Trigger:** Custom Event → `product_list_viewed`

#### DataLayer Push
```jsonc
{
  "event":        "product_list_viewed",
  "event_time":   "2025-05-12T10:01:00.000Z",
  "segment_ready": false,
  "anonymous_id": "anon_k7x2m9abc_1715511825000",
  "customer_id":  "CUST-001",
  "email":        "alex.jordan@email.com",
  "user_name":    "Alex Jordan",

  "page_type": "listing",

  "ecommerce": {
    "category_id":    "clothing",
    "category_name":  "clothing",
    "product_count":  6,
    "products": [
      { "product_id": "p001", "name": "Organic Linen Blazer",     "price": 189 },
      { "product_id": "p002", "name": "Merino Wool Turtleneck",   "price": 129 },
      { "product_id": "p003", "name": "Wide-Leg Tailored Trousers","price": 149 },
      { "product_id": "p009", "name": "Cashmere Knit Cardigan",   "price": 249 },
      { "product_id": "p012", "name": "Structured Denim Jacket",  "price": 169 }
    ]
  }
}
```

#### Field Reference

| Field | Type | Description |
|---|---|---|
| `page_type` | string | Always `"listing"` |
| `ecommerce.category_id` | string | Category slug: `"all"`, `"clothing"`, `"accessories"`, `"home"`, `"new"` |
| `ecommerce.category_name` | string | Same as `category_id` (can be extended to display name) |
| `ecommerce.product_count` | number | Total number of products shown after filters applied |
| `ecommerce.products` | array | Array of visible product summaries (see below) |
| `ecommerce.products[].product_id` | string | Product ID, e.g. `"p001"` |
| `ecommerce.products[].name` | string | Product name |
| `ecommerce.products[].price` | number | Current selling price in USD |

---

### 4.03 `product_viewed`

Fired when the product detail page fully renders.

**Trigger:** `renderProduct()` — fires on product detail page load.

**GTM Trigger:** Custom Event → `product_viewed`

#### DataLayer Push
```jsonc
{
  "event":        "product_viewed",
  "event_time":   "2025-05-12T10:02:00.000Z",
  "segment_ready": false,
  "anonymous_id": "anon_k7x2m9abc_1715511825000",
  "customer_id":  "CUST-001",
  "email":        "alex.jordan@email.com",
  "user_name":    "Alex Jordan",

  "page_type": "product",

  "ecommerce": {
    "currency": "USD",
    "value":    189,
    "items": [
      {
        "product_id": "p001",
        "sku":        "CLO-001",
        "name":       "Organic Linen Blazer",
        "category":   "clothing",
        "brand":      "LUMA",
        "variant":    "{\"color\":\"#2d3436\",\"size\":\"XS\"}",
        "price":      189
      }
    ]
  }
}
```

#### Field Reference

| Field | Type | Description |
|---|---|---|
| `page_type` | string | Always `"product"` |
| `ecommerce.currency` | string | ISO 4217 currency code. Always `"USD"`. |
| `ecommerce.value` | number | Product price |
| `ecommerce.items[0].product_id` | string | Unique product identifier |
| `ecommerce.items[0].sku` | string | Stock keeping unit, e.g. `"CLO-001"` |
| `ecommerce.items[0].name` | string | Full product name |
| `ecommerce.items[0].category` | string | Product category slug |
| `ecommerce.items[0].brand` | string | Always `"LUMA"` |
| `ecommerce.items[0].variant` | string | JSON-stringified `{color, size}` of the default selected variant |
| `ecommerce.items[0].price` | number | Current selling price |

---

### 4.04 `product_added`

Fired when a product is added to the cart from any location (product card, product detail page, mobile sticky bar).

**Trigger:** `addToCart()` — fires on every successful add-to-cart action.

**GTM Trigger:** Custom Event → `product_added`

#### DataLayer Push
```jsonc
{
  "event":        "product_added",
  "event_time":   "2025-05-12T10:03:00.000Z",
  "segment_ready": false,
  "anonymous_id": "anon_k7x2m9abc_1715511825000",
  "customer_id":  "CUST-001",
  "email":        "alex.jordan@email.com",
  "user_name":    "Alex Jordan",

  "page_type": "product",

  "ecommerce": {
    "currency": "USD",
    "value":    378,
    "items": [
      {
        "product_id": "p001",
        "sku":        "CLO-001",
        "name":       "Organic Linen Blazer",
        "category":   "clothing",
        "brand":      "LUMA",
        "variant":    "{\"color\":\"#2d3436\",\"size\":\"M\"}",
        "price":      189,
        "quantity":   2
      }
    ]
  }
}
```

#### Field Reference

| Field | Type | Description |
|---|---|---|
| `ecommerce.value` | number | `price × quantity` — total line value |
| `ecommerce.items[0].quantity` | number | Quantity being added in this action |
| *(all other fields)* | — | Same as `product_viewed` |

> **Note:** `ecommerce.value` reflects the value of items added in this single action, not the total cart value.

---

### 4.05 `product_removed`

Fired when a product is removed from the cart (via mini-cart drawer, cart page, or quantity reduced to zero).

**Trigger:** `removeFromCart()` — fires on item removal.

**GTM Trigger:** Custom Event → `product_removed`

#### DataLayer Push
```jsonc
{
  "event":        "product_removed",
  "event_time":   "2025-05-12T10:04:00.000Z",
  "segment_ready": false,
  "anonymous_id": "anon_k7x2m9abc_1715511825000",
  "customer_id":  "CUST-001",
  "email":        "alex.jordan@email.com",
  "user_name":    "Alex Jordan",

  "ecommerce": {
    "currency": "USD",
    "value":    189,
    "items": [
      {
        "product_id": "p001",
        "sku":        "CLO-001",
        "name":       "Organic Linen Blazer",
        "price":      189,
        "quantity":   1
      }
    ]
  }
}
```

#### Field Reference

| Field | Type | Description |
|---|---|---|
| `ecommerce.value` | number | `price × quantity` of the removed line |
| `ecommerce.items[0].product_id` | string | Removed product ID |
| `ecommerce.items[0].sku` | string | SKU of removed product |
| `ecommerce.items[0].name` | string | Name of removed product |
| `ecommerce.items[0].price` | number | Unit price |
| `ecommerce.items[0].quantity` | number | Quantity that was in cart before removal |

---

### 4.06 `cart_viewed`

Fired when the user opens the mini-cart drawer or navigates to the full cart page.

**Trigger:** `openCart()` and `navigate('cart')`.

**GTM Trigger:** Custom Event → `cart_viewed`

#### DataLayer Push
```jsonc
{
  "event":        "cart_viewed",
  "event_time":   "2025-05-12T10:05:00.000Z",
  "segment_ready": false,
  "anonymous_id": "anon_k7x2m9abc_1715511825000",
  "customer_id":  "CUST-001",
  "email":        "alex.jordan@email.com",
  "user_name":    "Alex Jordan",

  "ecommerce": {
    "currency": "USD",
    "value":    318,
    "cart_id":  "cart_ab12cd34",
    "products": [
      {
        "product_id": "p001",
        "sku":        "CLO-001",
        "name":       "Organic Linen Blazer",
        "price":      189,
        "quantity":   1,
        "variant":    { "color": "#2d3436", "size": "M" }
      },
      {
        "product_id": "p007",
        "sku":        "HOM-001",
        "name":       "Hand-Thrown Ceramic Mug",
        "price":      49,
        "quantity":   1,
        "variant":    { "color": "#fdfd96", "size": "320ml" }
      }
    ]
  }
}
```

#### Field Reference

| Field | Type | Description |
|---|---|---|
| `ecommerce.cart_id` | string | Session-scoped cart identifier |
| `ecommerce.currency` | string | Always `"USD"` |
| `ecommerce.value` | number | Cart subtotal (sum of all line totals) |
| `ecommerce.products` | array | All line items currently in the cart |
| `ecommerce.products[].product_id` | string | Product ID |
| `ecommerce.products[].sku` | string | SKU |
| `ecommerce.products[].name` | string | Product name |
| `ecommerce.products[].price` | number | Unit price |
| `ecommerce.products[].quantity` | number | Quantity in cart |
| `ecommerce.products[].variant` | object | `{color, size}` variant object |

---

### 4.07 `checkout_started`

Fired when the user initiates the checkout flow (clicks "Checkout" from the cart drawer or cart page).

**Trigger:** `startCheckout()`.

**GTM Trigger:** Custom Event → `checkout_started`

#### DataLayer Push
```jsonc
{
  "event":        "checkout_started",
  "event_time":   "2025-05-12T10:06:00.000Z",
  "segment_ready": false,
  "anonymous_id": "anon_k7x2m9abc_1715511825000",
  "customer_id":  "CUST-001",
  "email":        "alex.jordan@email.com",
  "user_name":    "Alex Jordan",

  "ecommerce": {
    "currency": "USD",
    "value":    318,
    "cart_id":  "cart_ab12cd34",
    "products": [
      {
        "product_id": "p001",
        "sku":        "CLO-001",
        "name":       "Organic Linen Blazer",
        "price":      189,
        "quantity":   1,
        "variant":    { "color": "#2d3436", "size": "M" }
      }
    ]
  }
}
```

#### Field Reference

Same structure as `cart_viewed`. The key distinction is the event name — this marks the user's intent to purchase.

| Field | Type | Description |
|---|---|---|
| `ecommerce.cart_id` | string | Cart identifier |
| `ecommerce.value` | number | Cart subtotal at time of checkout start |
| `ecommerce.currency` | string | Always `"USD"` |
| `ecommerce.products` | array | Full cart contents (same schema as `cart_viewed`) |

---

### 4.08 `checkout_step_viewed`

Fired each time a checkout step renders. Steps are: Shipping (1), Payment (2), Review (3).

**Trigger:** `renderCheckout()` — fires once per step render.

**GTM Trigger:** Custom Event → `checkout_step_viewed`

#### DataLayer Push — Step 1: Shipping
```jsonc
{
  "event":        "checkout_step_viewed",
  "event_time":   "2025-05-12T10:06:30.000Z",
  "segment_ready": false,
  "anonymous_id": "anon_k7x2m9abc_1715511825000",
  "customer_id":  "CUST-001",
  "email":        "alex.jordan@email.com",
  "user_name":    "Alex Jordan",

  "ecommerce": {
    "step_name":   "Shipping",
    "step_number": 1,
    "cart_id":     "cart_ab12cd34",
    "total":       318,
    "currency":    "USD"
  }
}
```

#### DataLayer Push — Step 2: Payment
```jsonc
{
  "event":        "checkout_step_viewed",
  "event_time":   "2025-05-12T10:07:00.000Z",
  "ecommerce": {
    "step_name":   "Payment",
    "step_number": 2,
    "cart_id":     "cart_ab12cd34",
    "total":       318,
    "currency":    "USD"
  }
}
```

#### DataLayer Push — Step 3: Review
```jsonc
{
  "event":        "checkout_step_viewed",
  "ecommerce": {
    "step_name":   "Review",
    "step_number": 3,
    "cart_id":     "cart_ab12cd34",
    "total":       318,
    "currency":    "USD"
  }
}
```

#### Field Reference

| Field | Type | Values | Description |
|---|---|---|---|
| `ecommerce.step_name` | string | `"Shipping"`, `"Payment"`, `"Review"` | Human-readable step label |
| `ecommerce.step_number` | number | `1`, `2`, `3` | Numeric step index (1-based) |
| `ecommerce.cart_id` | string | — | Cart identifier |
| `ecommerce.total` | number | — | Cart subtotal (excl. tax and shipping) |
| `ecommerce.currency` | string | `"USD"` | Currency code |

---

### 4.09 `shipping_info_submitted`

Fired when the user completes the Shipping step and clicks "Continue to Payment".

**Trigger:** `submitShipping()` — fires after form validation passes.

**GTM Trigger:** Custom Event → `shipping_info_submitted`

#### DataLayer Push
```jsonc
{
  "event":        "shipping_info_submitted",
  "event_time":   "2025-05-12T10:07:30.000Z",
  "segment_ready": false,
  "anonymous_id": "anon_k7x2m9abc_1715511825000",
  "customer_id":  "CUST-001",
  "email":        "alex.jordan@email.com",
  "user_name":    "Alex Jordan",

  "shipping_method": "standard",
  "cart_id":         "cart_ab12cd34",
  "total":           318
}
```

#### Field Reference

| Field | Type | Values | Description |
|---|---|---|---|
| `shipping_method` | string | `"standard"`, `"express"` | Selected shipping option |
| `cart_id` | string | — | Cart identifier |
| `total` | number | — | Cart subtotal at time of submission |

---

### 4.10 `payment_info_entered`

Fired when the user completes the Payment step and clicks "Review Order".

**Trigger:** `submitPayment()`.

**GTM Trigger:** Custom Event → `payment_info_entered`

#### DataLayer Push
```jsonc
{
  "event":        "payment_info_entered",
  "event_time":   "2025-05-12T10:08:00.000Z",
  "segment_ready": false,
  "anonymous_id": "anon_k7x2m9abc_1715511825000",
  "customer_id":  "CUST-001",
  "email":        "alex.jordan@email.com",
  "user_name":    "Alex Jordan",

  "payment_method": "card",
  "cart_id":        "cart_ab12cd34",
  "total":          318
}
```

#### Field Reference

| Field | Type | Values | Description |
|---|---|---|---|
| `payment_method` | string | `"card"`, `"paypal"`, `"apple"` | Selected payment method |
| `cart_id` | string | — | Cart identifier |
| `total` | number | — | Cart subtotal |

---

### 4.11 `order_completed`

Fired when the user successfully places an order (clicks "Place Order" on the Review step). This is the most important conversion event.

**Trigger:** `placeOrder()` — fires before cart is cleared.

**GTM Trigger:** Custom Event → `order_completed`

#### DataLayer Push
```jsonc
{
  "event":        "order_completed",
  "event_time":   "2025-05-12T10:09:00.000Z",
  "segment_ready": false,
  "anonymous_id": "anon_k7x2m9abc_1715511825000",
  "customer_id":  "CUST-001",
  "email":        "alex.jordan@email.com",
  "user_name":    "Alex Jordan",

  "page_type": "confirmation",

  "ecommerce": {
    "currency":        "USD",
    "value":           369.44,
    "order_id":        "ORD-AB12CD34",
    "cart_id":         "cart_ab12cd34",
    "revenue":         318.00,
    "shipping":        9.99,
    "tax":             25.44,
    "discount":        0,
    "payment_method":  "card",
    "shipping_method": "standard",
    "products": [
      {
        "product_id": "p001",
        "sku":        "CLO-001",
        "name":       "Organic Linen Blazer",
        "price":      189,
        "quantity":   1,
        "variant":    { "color": "#2d3436", "size": "M" }
      },
      {
        "product_id": "p007",
        "sku":        "HOM-001",
        "name":       "Hand-Thrown Ceramic Mug",
        "price":      49,
        "quantity":   1,
        "variant":    { "color": "#fdfd96", "size": "320ml" }
      }
    ]
  }
}
```

#### Field Reference

| Field | Type | Description |
|---|---|---|
| `page_type` | string | Always `"confirmation"` |
| `ecommerce.order_id` | string | Unique order identifier, e.g. `"ORD-AB12CD34"` |
| `ecommerce.cart_id` | string | Cart identifier (links order back to cart events) |
| `ecommerce.currency` | string | Always `"USD"` |
| `ecommerce.value` | number | Grand total paid (revenue + shipping + tax − discount) |
| `ecommerce.revenue` | number | Product subtotal (before tax and shipping) |
| `ecommerce.shipping` | number | Shipping cost. `0` if free, `9.99` (standard) or `19.99` (express) |
| `ecommerce.tax` | number | Tax amount (8% of revenue) |
| `ecommerce.discount` | number | Discount amount applied. `0` if no coupon. |
| `ecommerce.payment_method` | string | `"card"`, `"paypal"`, `"apple"` |
| `ecommerce.shipping_method` | string | `"standard"` or `"express"` |
| `ecommerce.products` | array | All purchased items (same schema as `cart_viewed.products`) |

#### Value Calculation

```
revenue  = sum of (product.price × quantity) for all items
shipping = 0 if revenue ≥ 75 and standard, else 9.99 (standard) or 19.99 (express)
tax      = revenue × 0.08
value    = revenue + shipping + tax − discount
```

---

### 4.12 `search_performed`

Fired when a user types a search query into the site search bar (debounced, triggers after 300ms of inactivity, minimum 2 characters).

**Trigger:** `handleSearch()` — fires on debounced input.

**GTM Trigger:** Custom Event → `search_performed`

#### DataLayer Push
```jsonc
{
  "event":        "search_performed",
  "event_time":   "2025-05-12T10:10:00.000Z",
  "segment_ready": false,
  "anonymous_id": "anon_k7x2m9abc_1715511825000",
  "customer_id":  "CUST-001",
  "email":        "alex.jordan@email.com",
  "user_name":    "Alex Jordan",

  "query":         "linen",
  "results_count": 2
}
```

#### Field Reference

| Field | Type | Description |
|---|---|---|
| `query` | string | The search string entered by the user |
| `results_count` | number | Number of matching products returned (0–5, capped at 5 in dropdown) |

---

### 4.13 `promotion_viewed`

Fired when a promotional element (promo strip or promo banner) enters the viewport. Uses the Intersection Observer API — fires once per element per session.

**Trigger:** `IntersectionObserver` callback — fires when ≥50% of the element is visible.

**GTM Trigger:** Custom Event → `promotion_viewed`

#### DataLayer Push — Promo Strip
```jsonc
{
  "event":        "promotion_viewed",
  "event_time":   "2025-05-12T10:00:05.000Z",
  "segment_ready": false,
  "anonymous_id": "anon_k7x2m9abc_1715511825000",

  "promotion_id":   "strip-001",
  "promotion_name": "Free Shipping Offer",
  "creative":       "banner",
  "location":       "promo-strip"
}
```

#### DataLayer Push — Hero Banner
```jsonc
{
  "event":        "promotion_viewed",
  "event_time":   "2025-05-12T10:00:10.000Z",

  "promotion_id":   "banner-001",
  "promotion_name": "Summer Sale",
  "creative":       "banner",
  "location":       "promo-banner-main"
}
```

#### Field Reference

| Field | Type | Description |
|---|---|---|
| `promotion_id` | string | Unique identifier from the element's `data-promo-id` attribute |
| `promotion_name` | string | Human-readable name from `data-promo-name` attribute |
| `creative` | string | Always `"banner"` — extend for carousel, popup, etc. |
| `location` | string | DOM `id` of the promotional element |

---

### 4.14 `promotion_clicked`

Fired when a user clicks on the promotional banner (the "Shop the Sale →" button).

**Trigger:** `handlePromoBannerClick()` — fires on promo banner CTA click.

**GTM Trigger:** Custom Event → `promotion_clicked`

#### DataLayer Push
```jsonc
{
  "event":        "promotion_clicked",
  "event_time":   "2025-05-12T10:11:00.000Z",
  "segment_ready": false,
  "anonymous_id": "anon_k7x2m9abc_1715511825000",
  "customer_id":  "CUST-001",
  "email":        "alex.jordan@email.com",
  "user_name":    "Alex Jordan",

  "promotion_id":   "banner-001",
  "promotion_name": "Summer Sale",
  "creative":       "banner",
  "location":       "home_page"
}
```

#### Field Reference

Same fields as `promotion_viewed`. The `location` value here is `"home_page"` (contextual) rather than the DOM element ID.

---

### 4.15 `user_identified`

Fired when a user is identified — either on login or when a guest enters their email at checkout.

**Trigger:** `identifyUser()` — called from `attemptLogin()` and `submitShipping()`.

**GTM Trigger:** Custom Event → `user_identified`

#### DataLayer Push — On Login
```jsonc
{
  "event":        "user_identified",
  "event_time":   "2025-05-12T10:12:00.000Z",
  "segment_ready": false,
  "anonymous_id": "anon_k7x2m9abc_1715511825000",
  "customer_id":  "CUST-001",
  "email":        "alex.jordan@email.com",
  "user_name":    "Alex Jordan",

  "user_id": "CUST-001",
  "traits": {
    "customer_id":   "CUST-001",
    "first_name":    "Alex",
    "last_name":     "Jordan",
    "email":         "alex.jordan@email.com",
    "phone":         "+1 (555) 123-4567",
    "address":       "123 Main Street",
    "city":          "New York",
    "zip":           "10001",
    "country":       "United States",
    "dob":           "1988-03-15",
    "gender":        "M",
    "language":      "en",
    "time_zone":     "America/New_York",
    "current_location":      { "longitude": -73.991443, "latitude": 40.753824 },
    "email_subscribe":       "opted_in",
    "interests":             ["fashion", "travel", "art"],
    "loyalty_tier":          "Gold",
    "loyalty_points":        4750,
    "loyalty_last_updated":  "2025-04-10T09:30:00",
    "date_of_first_session": "2023-06-01T14:22:00Z"
  }
}
```

#### DataLayer Push — Guest Checkout Email Entry
```jsonc
{
  "event":        "user_identified",
  "event_time":   "2025-05-12T10:13:00.000Z",
  "anonymous_id": "anon_k7x2m9abc_1715511825000",

  "user_id": "guest@email.com",
  "traits": {
    "first_name": "Guest",
    "last_name":  "User",
    "email":      "guest@email.com"
  }
}
```

#### Field Reference

| Field | Type | Format / Allowed Values | Description |
|---|---|---|---|
| `user_id` | string | — | Customer ID (logged-in) or email address (guest) |
| `traits.customer_id` | string | `"CUST-001"` | Unique customer identifier |
| `traits.first_name` | string | — | First name |
| `traits.last_name` | string | — | Last name |
| `traits.email` | string | — | Email address |
| `traits.phone` | string | — | Phone number including country code |
| `traits.address` | string | — | Street address |
| `traits.city` | string | — | City |
| `traits.zip` | string | — | ZIP or postal code |
| `traits.country` | string | — | Country name |
| `traits.dob` | string | `"YYYY-MM-DD"` | Date of birth, e.g. `"1988-03-15"` |
| `traits.gender` | string | `"M"` `"F"` `"O"` `"N"` `"P"` `null` | M=Male, F=Female, O=Other, N=Not applicable, P=Prefer not to say, null=Unknown |
| `traits.language` | string | ISO 639-1, e.g. `"en"` `"it"` | User's preferred language |
| `traits.time_zone` | string | IANA tz, e.g. `"America/New_York"` | User's local time zone |
| `traits.current_location` | object | `{"longitude": float, "latitude": float}` | User's approximate geo coordinates |
| `traits.email_subscribe` | string | `"opted_in"` `"subscribed"` `"unsubscribed"` | Email marketing consent status |
| `traits.interests` | array | e.g. `["fashion","travel"]` | User interest tags |
| `traits.loyalty_tier` | string | `"Gold"` `"Silver"` | Loyalty programme tier |
| `traits.loyalty_points` | number | integer | Current loyalty point balance |
| `traits.loyalty_last_updated` | string | `"yyyy-MM-ddTHH:mm:ss"` | Timestamp of last loyalty balance change |
| `traits.date_of_first_session` | string | ISO 8601 | Timestamp of the user's very first session |

---

### 4.16 `user_logged_in`

Fired immediately after a successful login. Includes the complete user profile (all fields except `password`) as a nested `user` object, making it a self-contained event for downstream identity resolution without requiring a separate `user_identified` lookup.

**Trigger:** `trackUserLoggedIn()` — called from `attemptLogin()`.

**GTM Trigger:** Custom Event → `user_logged_in`

#### DataLayer Push
```jsonc
{
  "event":        "user_logged_in",
  "event_time":   "2025-05-12T10:12:05.000Z",
  "segment_ready": false,
  "anonymous_id": "anon_k7x2m9abc_1715511825000",

  // ── Top-level identity envelope ────────────────────────
  "customer_id":  "CUST-001",
  "email":        "alex.jordan@email.com",
  "user_name":    "Alex Jordan",

  // ── Full user profile (password excluded) ──────────────
  "user": {
    "customer_id":   "CUST-001",
    "first_name":    "Alex",
    "last_name":     "Jordan",
    "email":         "alex.jordan@email.com",
    "phone":         "+1 (555) 123-4567",
    "address":       "123 Main Street",
    "city":          "New York",
    "zip":           "10001",
    "country":       "United States",
    "dob":           "1988-03-15",
    "gender":        "M",
    "language":      "en",
    "time_zone":     "America/New_York",
    "current_location":      { "longitude": -73.991443, "latitude": 40.753824 },
    "email_subscribe":       "opted_in",
    "interests":             ["fashion", "travel", "art"],
    "loyalty_tier":          "Gold",
    "loyalty_points":        4750,
    "loyalty_last_updated":  "2025-04-10T09:30:00",
    "date_of_first_session": "2023-06-01T14:22:00Z"
  }
}
```

> **Note:** This event fires *after* `user_identified`. The top-level `customer_id`, `email`, and `user_name` fields are present in the envelope for quick access. The full profile is inside `user{}` for downstream tools that need complete attribute resolution.

#### Field Reference

| Field | Type | Format / Allowed Values | Description |
|---|---|---|---|
| `customer_id` | string | `"CUST-001"` | Unique customer identifier (top-level for quick GTM access) |
| `email` | string | — | Email address (top-level) |
| `user_name` | string | `"First Last"` | Full display name (top-level) |
| `user.customer_id` | string | `"CUST-001"` | Unique customer identifier |
| `user.first_name` | string | — | First name |
| `user.last_name` | string | — | Last name |
| `user.email` | string | — | Email address |
| `user.phone` | string | — | Phone number including country code |
| `user.address` | string | — | Street address |
| `user.city` | string | — | City |
| `user.zip` | string | — | ZIP or postal code |
| `user.country` | string | — | Country name |
| `user.dob` | string | `"YYYY-MM-DD"` | Date of birth |
| `user.gender` | string | `"M"` `"F"` `"O"` `"N"` `"P"` `null` | Gender identifier |
| `user.language` | string | ISO 639-1 | Preferred language code |
| `user.time_zone` | string | IANA tz | Local time zone |
| `user.current_location` | object | `{"longitude": float, "latitude": float}` | Geo coordinates |
| `user.email_subscribe` | string | `"opted_in"` `"subscribed"` `"unsubscribed"` | Email consent status |
| `user.interests` | array | strings | Interest tags |
| `user.loyalty_tier` | string | `"Gold"` `"Silver"` | Loyalty tier |
| `user.loyalty_points` | number | integer | Loyalty point balance |
| `user.loyalty_last_updated` | string | `"yyyy-MM-ddTHH:mm:ss"` | Last loyalty update timestamp |
| `user.date_of_first_session` | string | ISO 8601 | First-ever session timestamp |

> ⚠️ **`password` is never included in any dataLayer event.** It exists only in the in-memory `USERS` data store for demo authentication.

---

### 4.17 `user_logged_out`

Fired when the user clicks "Sign Out" from the account dropdown.

**Trigger:** `trackUserLoggedOut()` — called from `logout()`.

**GTM Trigger:** Custom Event → `user_logged_out`

#### DataLayer Push
```jsonc
{
  "event":        "user_logged_out",
  "event_time":   "2025-05-12T10:50:00.000Z",
  "segment_ready": false,
  "anonymous_id": "anon_k7x2m9abc_1715511825000",
  "customer_id":  "CUST-001",
  "email":        "alex.jordan@email.com",
  "user_name":    "Alex Jordan"
}
```

> **Note:** This event fires while `state.currentUser` is still set — so the identity fields are present. After the event fires, the user object is cleared from state.

---

## 5. Segment Mapping

All events are mirrored to Twilio Segment. The table below shows the exact Segment method and event name used.

| DataLayer Event | Segment Method | Segment Event Name |
|---|---|---|
| `page_viewed` | `analytics.page()` | *(page name as first arg)* |
| `product_list_viewed` | `analytics.track()` | `"Product List Viewed"` |
| `product_viewed` | `analytics.track()` | `"Product Viewed"` |
| `product_added` | `analytics.track()` | `"Product Added"` |
| `product_removed` | `analytics.track()` | `"Product Removed"` |
| `cart_viewed` | `analytics.track()` | `"Cart Viewed"` |
| `checkout_started` | `analytics.track()` | `"Checkout Started"` |
| `checkout_step_viewed` | `analytics.track()` | `"Checkout Step Viewed"` |
| `shipping_info_submitted` | `analytics.track()` | `"Shipping Info Submitted"` |
| `payment_info_entered` | `analytics.track()` | `"Payment Info Entered"` |
| `order_completed` | `analytics.track()` | `"Order Completed"` |
| `search_performed` | `analytics.track()` | `"Search Performed"` |
| `promotion_viewed` | `analytics.track()` | `"Promotion Viewed"` |
| `promotion_clicked` | `analytics.track()` | `"Promotion Clicked"` |
| `user_identified` | `analytics.identify()` | *(no event name — identify call)* |
| `user_logged_in` | `analytics.track()` | `"User Logged In"` |
| `user_logged_out` | `analytics.track()` | `"User Logged Out"` |

---

## 6. Field Type Reference

| Type | Format | Example |
|---|---|---|
| `string` | Plain text | `"Organic Linen Blazer"` |
| `number` | Float or integer | `189`, `25.44` |
| `boolean` | `true` / `false` | `false` |
| `array` | JSON array | `[{...}, {...}]` |
| `object` | JSON object | `{"color": "#2d3436", "size": "M"}` |
| ISO 8601 | `YYYY-MM-DDTHH:mm:ss.sssZ` | `"2025-05-12T10:00:00.000Z"` |

---

## 7. GTM / GA4 Integration Notes

### Reading Events in GTM

1. Create a **Custom Event** trigger for each `event` name (e.g. `product_added`).
2. Create **DataLayer Variables** for each field you want to pass to GA4 (e.g. `ecommerce.value`, `customer_id`).
3. Map variables to a **GA4 Event tag**.

### GA4 Ecommerce

The `ecommerce` object is structured to be GA4-compatible. For GA4 Enhanced Ecommerce:

- Use `ecommerce.items` (for product-level events) or `ecommerce.products` (for cart/checkout events).
- `ecommerce.value` maps to GA4's `value` parameter.
- `ecommerce.currency` maps to GA4's `currency` parameter.

### Resetting the DataLayer

GA4 / GTM recommends clearing the `ecommerce` object before each push to prevent data bleeding. The current implementation does not do this. To add it, in `main.js` before each `pushToDataLayer` call with an `ecommerce` field, push:

```js
window.dataLayer.push({ ecommerce: null });
```

---

## 8. Trigger Map

Quick reference: which user action fires which events.

| User Action | Events Fired (in order) |
|---|---|
| App loads / page opens | `page_viewed` |
| Navigates to any page | `page_viewed` |
| Views product listing | `page_viewed` → `product_list_viewed` |
| Changes filter / sort | `product_list_viewed` |
| Views product detail | `page_viewed` → `product_viewed` |
| Clicks "Add to Bag" (card or detail) | `product_added` |
| Opens mini-cart drawer | `cart_viewed` |
| Navigates to cart page | `page_viewed` → `cart_viewed` |
| Removes item from cart | `product_removed` |
| Clicks "Checkout" | `checkout_started` → `page_viewed` → `checkout_step_viewed` (step 1) |
| Submits shipping form | `shipping_info_submitted` → `checkout_step_viewed` (step 2) |
| Selects payment & continues | `payment_info_entered` → `checkout_step_viewed` (step 3) |
| Clicks "Place Order" | `order_completed` → `page_viewed` (confirmation) |
| Types in search box (≥2 chars) | `search_performed` |
| Promo element enters viewport | `promotion_viewed` |
| Clicks promo banner | `promotion_clicked` |
| Logs in successfully | `user_identified` → `user_logged_in` |
| Logs out | `user_logged_out` |
| Guest enters email at checkout | `user_identified` |
