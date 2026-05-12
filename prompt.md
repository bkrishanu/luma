Build a production-ready static retail e-commerce website as a modern web app using HTML, CSS, and vanilla JavaScript only.

Project goal:
Create a clean, responsive retail shopping website prototype with the key customer journey flows:
- Home page / landing page
- Category / product listing page
- Product detail page
- Mini cart + cart page
- Checkout flow
- Order confirmation page

Core business features:
1. Home page
- Hero banner
- Featured categories
- Featured products
- Search bar
- Promotional strip
- Header with logo, navigation, account icon, cart icon, and theme toggle

2. Product listing page
- Product grid with cards
- Category filters
- Price filter
- Sort by price/popularity/newest
- Product list view tracking
- Pagination or “load more”

3. Product detail page
- Product image gallery
- Product title
- SKU / product ID
- Price and discount display
- Variant selector (size/color)
- Quantity selector
- Add to cart button
- Wishlist button UI
- Ratings/reviews section
- Delivery/return info
- Related products carousel

4. Cart
- Mini-cart drawer
- Full cart page
- Update quantity
- Remove product
- Coupon field UI
- Price summary (subtotal, discount, shipping, total)

5. Checkout
- Guest checkout
- Checkout steps:
  - Cart
  - Shipping
  - Payment
  - Review
- Shipping address form
- Shipping method selection
- Payment method selection
- Place order CTA

6. Confirmation page
- Order summary
- Order ID
- Purchased items
- Total amount
- Continue shopping CTA

Implementation constraints:
- Single static front-end project
- No backend required
- Use in-memory mock product data and cart state
- Responsive design for mobile and desktop
- Accessible semantic HTML
- Clean modern retail UI
- Light and dark mode
- Fast loading and modular JavaScript
- Use realistic sample product/catalog data

Analytics requirements:
Implement BOTH:
1. A global JavaScript dataLayer array
2. Twilio Segment integration

Data layer rules:
- Create a global array:
  window.dataLayer = window.dataLayer || [];
- Create a reusable helper:
  function pushToDataLayer(eventName, payload) { ... }
- Every important ecommerce action must push a structured event object into dataLayer
- Also mirror the same event to Segment using analytics.page(), analytics.track(), and analytics.identify() where appropriate

Twilio Segment requirements:
- Add Segment JavaScript source snippet placeholder in the head
- Use a placeholder write key like: YOUR_SEGMENT_WRITE_KEY
- Wrap Segment calls safely so the app works even if Segment is not configured
- Create helpers:
  - trackPageView(...)
  - trackProductView(...)
  - trackAddToCart(...)
  - trackRemoveFromCart(...)
  - trackCartViewed(...)
  - trackCheckoutStarted(...)
  - trackCheckoutStepViewed(...)
  - trackPaymentInfoEntered(...)
  - trackOrderCompleted(...)
  - identifyUser(...)
- Use Segment page calls for page/screen views and track calls for user actions
- Align event naming to common Segment ecommerce semantics where possible

Mandatory tracked events:
1. Page Viewed
- Trigger on each route/page load
- Include:
  - page_name
  - page_type
  - url
  - referrer

2. Product List Viewed
- Trigger on category/listing page render
- Include:
  - category_id
  - category_name
  - product_count
  - products (array of visible product ids/names/prices)

3. Product Viewed
- Trigger on product detail page load
- Include:
  - product_id
  - sku
  - name
  - category
  - brand
  - variant
  - price
  - currency

4. Product Added
- Trigger on add to cart
- Include:
  - cart_id
  - product_id
  - sku
  - name
  - category
  - brand
  - variant
  - price
  - quantity
  - currency

5. Product Removed
- Trigger when item removed from cart
- Include the same product fields

6. Cart Viewed
- Trigger when mini cart or cart page is opened
- Include:
  - cart_id
  - currency
  - total
  - products array

7. Checkout Started
- Trigger when user begins checkout
- Include:
  - cart_id
  - total
  - currency
  - products array

8. Checkout Step Viewed
- Trigger on each checkout step
- Include:
  - step_name
  - step_number
  - cart_id
  - total
  - currency

9. Shipping Info Submitted
- Trigger when shipping step is completed
- Include:
  - shipping_method
  - cart_id
  - total

10. Payment Info Submitted
- Trigger when payment step is completed
- Include:
  - payment_method
  - cart_id
  - total

11. Order Completed
- Trigger on successful mock order placement
- Include:
  - order_id
  - cart_id
  - total
  - revenue
  - shipping
  - tax
  - discount
  - currency
  - products array
  - payment_method
  - shipping_method

12. Search Performed
- Trigger when user searches
- Include:
  - query
  - results_count

13. Promotion Viewed
- Trigger when promo banner enters viewport
- Include:
  - promotion_id
  - promotion_name
  - creative
  - location

14. Promotion Clicked
- Trigger when promo is clicked
- Include same promo metadata

Data layer event format:
Use a consistent structure like:
{
  event: "product_added",
  event_time: new Date().toISOString(),
  page_type: "product",
  ecommerce: {
    currency: "USD",
    value: 129.99,
    items: [...]
  },
  segment_ready: true/false,
  ...custom fields
}

Segment mapping guidance:
- page load => analytics.page(...)
- product detail => analytics.track("Product Viewed", {...})
- add to cart => analytics.track("Product Added", {...})
- cart viewed => analytics.track("Cart Viewed", {...})
- checkout started => analytics.track("Checkout Started", {...})
- checkout steps => analytics.track("Checkout Step Viewed", {...})
- payment entered => analytics.track("Payment Info Entered", {...})
- order placed => analytics.track("Order Completed", {...})

Identity guidance:
- Support anonymous browsing using a generated anonymous ID in memory
- When checkout email is entered, call identifyUser(email or customerId, traits)
- Store and reuse session state only in memory, not localStorage

Engineering requirements:
- Organize code cleanly:
  - app state
  - product catalog
  - rendering functions
  - router/navigation
  - cart logic
  - analytics/dataLayer logic
- Include a dedicated analytics module/file or clearly separated analytics section
- Add comments only where necessary
- Make the event payloads easy to extend for Adobe/GA4/GTM later
- Include a console debug mode to log all pushed dataLayer and Segment events

UI/UX requirements:
- Modern retail design, not a generic admin dashboard
- Sticky header
- Sticky add-to-cart on mobile
- Elegant product cards
- Clear CTAs
- Trust badges near checkout
- Form validation
- Loading, empty, and success states
- Smooth microinteractions

Deliverables:
1. Complete front-end code
2. Mock product dataset
3. A visible walkthrough of all flows
4. dataLayer implementation
5. Twilio Segment integration wrapper
6. Sample event payloads in code comments or a documentation block
7. README section explaining:
   - where to insert Segment write key/snippet
   - which events are fired
   - how dataLayer and Segment are connected

Important:
- Use standard Segment ecommerce event names where possible, especially Product Viewed, Product Added, Cart Viewed, Checkout Started, Checkout Step Viewed, and Order Completed
- Ensure the website functions even if analytics is unavailable
- Make all tracked events fire from real user interactions, not just placeholders
- Add a test mode button or developer panel that displays the latest fired analytics events on screen for validation