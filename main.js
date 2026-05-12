/* ============================================================
   MAIN.JS — LUMA Retail Store
   Depends on: data.js (loaded first)
   ============================================================ */

/* ============================================================
   ANALYTICS MODULE
   
   README:
   -------
   1. To configure Segment: Replace YOUR_SEGMENT_WRITE_KEY in index.html
      <head> snippet and uncomment `analytics.load("YOUR_SEGMENT_WRITE_KEY")`.
   
   2. All events are pushed to:
      - window.dataLayer (GTM / GA4 compatible)
      - Segment analytics object (if loaded)
      - Dev panel (debug UI)
   
   3. Events fired:
      Page Viewed, Product List Viewed, Product Viewed,
      Product Added, Product Removed, Cart Viewed,
      Checkout Started, Checkout Step Viewed,
      Shipping Info Submitted, Payment Info Entered,
      Order Completed, Search Performed,
      Promotion Viewed, Promotion Clicked,
      User Logged In, User Logged Out
   
   4. Identity: anonymous ID generated in memory at session start.
      On login, identifyUser() is called with customerId + traits.
      All subsequent events carry customerId and email if logged in.
   
   ============================================================ */

// ─── Global DataLayer ─────────────────────────────────────
window.dataLayer = window.dataLayer || [];
const DEBUG_MODE = true;

/** Returns identity context to attach to every event */
function getIdentityContext() {
  const u = state.currentUser;
  if (!u) return { anonymous_id: ANON_ID };
  return {
    anonymous_id: ANON_ID,
    customer_id: u.customerId,
    email: u.email,
    user_name: `${u.firstName} ${u.lastName}`,
  };
}

/** Push to dataLayer + Segment */
function pushToDataLayer(eventName, payload) {
  const event = {
    event: eventName,
    event_time: new Date().toISOString(),
    segment_ready: typeof analytics !== 'undefined' && !!analytics.initialized,
    ...getIdentityContext(),
    ...payload,
  };
  window.dataLayer.push(event);
  if (DEBUG_MODE) logDevEvent(eventName, event);
  return event;
}

/** Safe Segment wrapper */
function seg(method, ...args) {
  try {
    if (window.analytics && typeof window.analytics[method] === 'function') {
      window.analytics[method](...args);
    }
  } catch (e) {}
}

// ─── Anonymous Identity ───────────────────────────────────
const ANON_ID = 'anon_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();

// ─── Analytics Helpers ────────────────────────────────────

function trackPageView({ page_name, page_type, url = location.href, referrer = document.referrer }) {
  pushToDataLayer('page_viewed', { page_name, page_type, url, referrer });
  seg('page', page_name, { page_type, url, referrer, ...getIdentityContext() });
}

function trackProductListViewed({ category_id, category_name, product_count, products }) {
  pushToDataLayer('product_list_viewed', {
    page_type: 'listing',
    ecommerce: { category_id, category_name, product_count, products },
  });
  seg('track', 'Product List Viewed', { category_id, category_name, product_count, products, ...getIdentityContext() });
}

function trackProductView({ product_id, sku, name, category, brand, variant, price, currency = 'USD' }) {
  pushToDataLayer('product_viewed', {
    page_type: 'product',
    ecommerce: { currency, value: price, items: [{ product_id, sku, name, category, brand, variant, price }] },
  });
  seg('track', 'Product Viewed', { product_id, sku, name, category, brand, variant, price, currency, ...getIdentityContext() });
}

function trackAddToCart({ cart_id, product_id, sku, name, category, brand, variant, price, quantity, currency = 'USD' }) {
  pushToDataLayer('product_added', {
    page_type: 'product',
    ecommerce: { currency, value: price * quantity, items: [{ product_id, sku, name, category, brand, variant, price, quantity }] },
  });
  seg('track', 'Product Added', { cart_id, product_id, sku, name, category, brand, variant, price, quantity, currency, ...getIdentityContext() });
}

function trackRemoveFromCart({ cart_id, product_id, sku, name, price, quantity, currency = 'USD' }) {
  pushToDataLayer('product_removed', {
    ecommerce: { currency, value: price * quantity, items: [{ product_id, sku, name, price, quantity }] },
  });
  seg('track', 'Product Removed', { cart_id, product_id, sku, name, price, quantity, currency, ...getIdentityContext() });
}

function trackCartViewed({ cart_id, currency = 'USD', total, products }) {
  pushToDataLayer('cart_viewed', { ecommerce: { currency, value: total, cart_id, products } });
  seg('track', 'Cart Viewed', { cart_id, currency, total, products, ...getIdentityContext() });
}

function trackCheckoutStarted({ cart_id, total, currency = 'USD', products }) {
  pushToDataLayer('checkout_started', { ecommerce: { currency, value: total, cart_id, products } });
  seg('track', 'Checkout Started', { cart_id, total, currency, products, ...getIdentityContext() });
}

function trackCheckoutStepViewed({ step_name, step_number, cart_id, total, currency = 'USD' }) {
  pushToDataLayer('checkout_step_viewed', { ecommerce: { step_name, step_number, cart_id, total, currency } });
  seg('track', 'Checkout Step Viewed', { step_name, step_number, cart_id, total, currency, ...getIdentityContext() });
}

function trackShippingInfoSubmitted({ shipping_method, cart_id, total }) {
  pushToDataLayer('shipping_info_submitted', { shipping_method, cart_id, total });
  seg('track', 'Shipping Info Submitted', { shipping_method, cart_id, total, ...getIdentityContext() });
}

function trackPaymentInfoEntered({ payment_method, cart_id, total }) {
  pushToDataLayer('payment_info_entered', { payment_method, cart_id, total });
  seg('track', 'Payment Info Entered', { payment_method, cart_id, total, ...getIdentityContext() });
}

function trackOrderCompleted({ order_id, cart_id, total, revenue, shipping, tax, discount, currency = 'USD', products, payment_method, shipping_method }) {
  pushToDataLayer('order_completed', {
    page_type: 'confirmation',
    ecommerce: { currency, value: total, order_id, cart_id, revenue, shipping, tax, discount, products, payment_method, shipping_method },
  });
  seg('track', 'Order Completed', { order_id, cart_id, total, revenue, shipping, tax, discount, currency, products, payment_method, shipping_method, ...getIdentityContext() });
}

function trackSearchPerformed({ query, results_count }) {
  pushToDataLayer('search_performed', { query, results_count });
  seg('track', 'Search Performed', { query, results_count, ...getIdentityContext() });
}

function trackPromotionViewed({ promotion_id, promotion_name, creative, location }) {
  pushToDataLayer('promotion_viewed', { promotion_id, promotion_name, creative, location });
  seg('track', 'Promotion Viewed', { promotion_id, promotion_name, creative, location, ...getIdentityContext() });
}

function trackPromotionClicked({ promotion_id, promotion_name, creative, location }) {
  pushToDataLayer('promotion_clicked', { promotion_id, promotion_name, creative, location });
  seg('track', 'Promotion Clicked', { promotion_id, promotion_name, creative, location, ...getIdentityContext() });
}

function identifyUser(userId, traits = {}) {
  pushToDataLayer('user_identified', { user_id: userId, traits });
  seg('identify', userId, { ...traits, anonymous_id: ANON_ID });
}

function trackUserLoggedIn(user) {
  pushToDataLayer('user_logged_in', {
    customer_id: user.customerId,
    email: user.email,
    user_name: `${user.firstName} ${user.lastName}`,
  });
  seg('track', 'User Logged In', { customer_id: user.customerId, email: user.email });
}

function trackUserLoggedOut(user) {
  pushToDataLayer('user_logged_out', {
    customer_id: user.customerId,
    email: user.email,
  });
  seg('track', 'User Logged Out', { customer_id: user.customerId, email: user.email });
}

// ─── Dev Panel ────────────────────────────────────────────
let devFirstEvent = true;
function logDevEvent(name, data) {
  const container = document.getElementById('dev-events');
  if (!container) return;
  if (devFirstEvent) { container.innerHTML = ''; devFirstEvent = false; }
  const el = document.createElement('div');
  el.className = 'dev-event';
  el.innerHTML = `<div class="dev-event-name">${name}</div><div class="dev-event-data">${JSON.stringify(data, null, 1).slice(0, 400)}…</div>`;
  container.insertBefore(el, container.firstChild);
}
function toggleDevPanel() {
  document.getElementById('dev-panel').classList.toggle('open');
}

// ─── Intersection Observer for Promos ─────────────────────
const promoObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      const el = e.target;
      trackPromotionViewed({
        promotion_id: el.dataset.promoId,
        promotion_name: el.dataset.promoName,
        creative: 'banner',
        location: el.id,
      });
      promoObserver.unobserve(el);
    }
  });
}, { threshold: 0.5 });

/* ============================================================
   APP STATE
   ============================================================ */
const state = {
  currentUser: null,            // logged-in user object from USERS array
  cart: [],                     // { product, variant, quantity, cartItemId }
  cartId: 'cart_' + Math.random().toString(36).substr(2, 8),
  currentPage: 'home',
  currentProduct: null,
  currentCategory: 'all',
  selectedVariant: {},
  quantities: {},
  listingFilters: { categories: [], priceMin: null, priceMax: null, rating: null },
  checkoutStep: 0,
  checkoutData: { shipping: {}, shippingMethod: 'standard', paymentMethod: 'card', email: '' },
  orderId: null,
};

/* ============================================================
   AUTH — LOGIN / LOGOUT
   ============================================================ */

/** Open the login modal */
function openLoginModal() {
  document.getElementById('login-modal-overlay').classList.add('open');
  document.getElementById('login-email').value = '';
  document.getElementById('login-password').value = '';
  document.getElementById('login-error').textContent = '';
}

/** Close the login modal */
function closeLoginModal() {
  document.getElementById('login-modal-overlay').classList.remove('open');
}

/** Attempt login with hardcoded USERS data */
function attemptLogin() {
  const email = document.getElementById('login-email').value.trim().toLowerCase();
  const password = document.getElementById('login-password').value;
  const errorEl = document.getElementById('login-error');
  errorEl.textContent = '';

  if (!email || !password) {
    errorEl.textContent = 'Please enter your email and password.';
    return;
  }

  const user = USERS.find(u => u.email.toLowerCase() === email && u.password === password);
  if (!user) {
    errorEl.textContent = 'Invalid email or password. Please try again.';
    document.getElementById('login-email').classList.add('error');
    document.getElementById('login-password').classList.add('error');
    return;
  }

  // Successful login
  state.currentUser = user;
  // Pre-fill checkout data with user info
  state.checkoutData.email = user.email;
  state.checkoutData.shipping = {
    fname: user.firstName,
    lname: user.lastName,
    address: user.address || '',
    city: user.city || '',
    zip: user.zip || '',
  };

  closeLoginModal();
  renderHeaderAuth();
  showToast(`Welcome back, ${user.firstName}! 👋`);

  // Analytics
  identifyUser(user.customerId, {
    first_name: user.firstName,
    last_name: user.lastName,
    email: user.email,
    phone: user.phone,
    customer_id: user.customerId,
  });
  trackUserLoggedIn(user);
}

/** Log the current user out */
function logout() {
  const user = state.currentUser;
  if (user) trackUserLoggedOut(user);
  state.currentUser = null;
  state.checkoutData.email = '';
  state.checkoutData.shipping = {};
  closeUserDropdown();
  renderHeaderAuth();
  showToast('You have been signed out.');
}

/** Toggle the user dropdown */
function toggleUserDropdown() {
  document.getElementById('user-dropdown').classList.toggle('open');
}
function closeUserDropdown() {
  document.getElementById('user-dropdown')?.classList.remove('open');
}

/** Render the header account area depending on login state */
function renderHeaderAuth() {
  const area = document.getElementById('user-area');
  if (!area) return;

  if (state.currentUser) {
    const u = state.currentUser;
    const initials = `${u.firstName[0]}${u.lastName[0]}`.toUpperCase();
    area.innerHTML = `
      <span class="user-greeting">Hi, ${u.firstName}</span>
      <div class="user-avatar" onclick="toggleUserDropdown()" title="Account menu">${initials}</div>
      <div class="user-dropdown" id="user-dropdown">
        <div class="user-dropdown-header">
          <div class="user-dropdown-name">${u.firstName} ${u.lastName}</div>
          <div class="user-dropdown-email">${u.email}</div>
          <div class="user-dropdown-id">ID: ${u.customerId}</div>
        </div>
        <div class="user-dropdown-item" onclick="closeUserDropdown();navigate('home')">
          <span>🏠</span> Home
        </div>
        <div class="user-dropdown-item" onclick="closeUserDropdown();navigate('listing','all')">
          <span>🛍️</span> Shop
        </div>
        <div class="user-dropdown-item" onclick="closeUserDropdown();navigate('cart')">
          <span>🛒</span> My Cart
        </div>
        <div class="user-dropdown-item logout" onclick="logout()">
          <span>🚪</span> Sign Out
        </div>
      </div>
    `;
  } else {
    area.innerHTML = `
      <button class="icon-btn" onclick="openLoginModal()" title="Sign In">
        <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
          <circle cx="12" cy="8" r="4"/>
          <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
        </svg>
      </button>
    `;
  }
}

// Close dropdown when clicking outside
document.addEventListener('click', (e) => {
  const area = document.getElementById('user-area');
  if (area && !area.contains(e.target)) closeUserDropdown();
});

/* ============================================================
   CART LOGIC
   ============================================================ */
function cartTotal() {
  return state.cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
}
function cartCount() {
  return state.cart.reduce((sum, item) => sum + item.quantity, 0);
}
function cartProducts() {
  return state.cart.map(item => ({
    product_id: item.product.id, sku: item.product.sku,
    name: item.product.name, price: item.product.price,
    quantity: item.quantity, variant: item.variant,
  }));
}

function addToCart(productId, variant = {}, quantity = 1) {
  const product = PRODUCTS.find(p => p.id === productId);
  if (!product) return;
  const variantKey = JSON.stringify(variant);
  const existing = state.cart.find(i => i.product.id === productId && JSON.stringify(i.variant) === variantKey);
  if (existing) {
    existing.quantity += quantity;
  } else {
    state.cart.push({ product, variant, quantity, cartItemId: 'ci_' + Date.now() });
  }
  updateCartUI();
  showToast(`${product.name} added to bag 🛍️`);
  trackAddToCart({
    cart_id: state.cartId, product_id: product.id, sku: product.sku,
    name: product.name, category: product.category, brand: product.brand,
    variant: JSON.stringify(variant), price: product.price, quantity, currency: 'USD',
  });
}

function removeFromCart(cartItemId) {
  const item = state.cart.find(i => i.cartItemId === cartItemId);
  if (!item) return;
  trackRemoveFromCart({
    cart_id: state.cartId, product_id: item.product.id, sku: item.product.sku,
    name: item.product.name, price: item.product.price, quantity: item.quantity,
  });
  state.cart = state.cart.filter(i => i.cartItemId !== cartItemId);
  updateCartUI();
  renderDrawer();
  if (state.currentPage === 'cart') renderCartPage();
}

function updateCartQty(cartItemId, delta) {
  const item = state.cart.find(i => i.cartItemId === cartItemId);
  if (!item) return;
  item.quantity = Math.max(1, item.quantity + delta);
  updateCartUI();
  renderDrawer();
  if (state.currentPage === 'cart') renderCartPage();
}

function updateCartUI() {
  const count = cartCount();
  const badge = document.getElementById('cart-badge');
  const drawerCount = document.getElementById('drawer-count');
  if (count > 0) {
    badge.style.display = 'flex';
    badge.textContent = count;
  } else {
    badge.style.display = 'none';
  }
  if (drawerCount) drawerCount.textContent = count;
}

function openCart() {
  document.getElementById('cart-overlay').classList.add('open');
  document.getElementById('cart-drawer').classList.add('open');
  renderDrawer();
  trackCartViewed({ cart_id: state.cartId, currency: 'USD', total: cartTotal(), products: cartProducts() });
}

function closeCart() {
  document.getElementById('cart-overlay').classList.remove('open');
  document.getElementById('cart-drawer').classList.remove('open');
}

/* ============================================================
   RENDER: MINI CART DRAWER
   ============================================================ */
function renderDrawer() {
  const itemsEl = document.getElementById('drawer-items');
  const footerEl = document.getElementById('drawer-footer');
  const total = cartTotal();
  const shipping = total >= 75 ? 0 : 9.99;

  if (state.cart.length === 0) {
    itemsEl.innerHTML = `
      <div class="cart-empty">
        <div class="cart-empty-icon">🛍️</div>
        <p>Your bag is empty</p>
        <button class="btn-primary" onclick="closeCart();navigate('listing','all')">Start Shopping</button>
      </div>`;
    footerEl.innerHTML = '';
    return;
  }

  itemsEl.innerHTML = state.cart.map(item => `
    <div class="cart-item">
      <div class="cart-item-thumb">${item.product.emoji}</div>
      <div class="cart-item-info">
        <div class="cart-item-name">${item.product.name}</div>
        <div class="cart-item-variant">${Object.values(item.variant).filter(Boolean).join(' · ') || 'Standard'}</div>
        <div class="cart-item-controls">
          <div class="cart-item-qty">
            <button class="qty-mini-btn" onclick="updateCartQty('${item.cartItemId}',-1)">−</button>
            <span>${item.quantity}</span>
            <button class="qty-mini-btn" onclick="updateCartQty('${item.cartItemId}',1)">+</button>
          </div>
          <span class="cart-item-price">$${(item.product.price * item.quantity).toFixed(2)}</span>
          <span class="cart-item-remove" onclick="removeFromCart('${item.cartItemId}')">Remove</span>
        </div>
      </div>
    </div>
  `).join('');

  footerEl.innerHTML = `
    <div class="coupon-row">
      <input class="coupon-input" placeholder="Promo code" id="coupon-input"/>
      <button class="btn-coupon" onclick="applyCoupon()">Apply</button>
    </div>
    <div class="price-summary">
      <div class="summary-row"><span>Subtotal</span><span>$${total.toFixed(2)}</span></div>
      <div class="summary-row"><span>Discount</span><span>—$0.00</span></div>
      <div class="summary-row"><span>Shipping</span><span class="${shipping === 0 ? 'free' : ''}">${shipping === 0 ? 'Free' : '$' + shipping.toFixed(2)}</span></div>
      <div class="summary-row total"><span>Total</span><span>$${(total + shipping).toFixed(2)}</span></div>
    </div>
    <button class="btn-checkout" onclick="closeCart();startCheckout()">Checkout →</button>
    <button class="btn-secondary" style="width:100%;margin-top:8px;text-align:center;justify-content:center" onclick="closeCart();navigate('cart')">View full cart</button>
  `;
}

/* ============================================================
   RENDER: CART PAGE
   ============================================================ */
function renderCartPage() {
  const el = document.getElementById('cart-page-content');
  const total = cartTotal();
  const shipping = total >= 75 ? 0 : 9.99;
  const tax = total * 0.08;
  const grandTotal = total + shipping + tax;

  if (state.cart.length === 0) {
    el.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:80px 0;color:var(--text2)">
      <div style="font-size:4rem;margin-bottom:16px">🛒</div>
      <h2>Your cart is empty</h2>
      <p style="margin-top:8px;margin-bottom:24px">Add some items to get started</p>
      <button class="btn-primary" onclick="navigate('listing','all')">Continue Shopping</button>
    </div>`;
    return;
  }

  el.innerHTML = `
    <div>
      <div class="cart-table-header">
        <span>Product</span>
        <span class="cart-qty-col">Quantity</span>
        <span class="cart-total-col">Price</span>
        <span></span>
      </div>
      ${state.cart.map(item => `
        <div class="cart-table-row">
          <div class="cart-product-info">
            <div class="cart-product-thumb">${item.product.emoji}</div>
            <div>
              <div class="cart-product-name" onclick="navigate('product','${item.product.id}')" style="cursor:pointer">${item.product.name}</div>
              <div class="cart-product-variant">${Object.values(item.variant).filter(Boolean).join(' · ') || 'Standard'}</div>
              <div style="font-size:13px;color:var(--accent);font-weight:700">$${item.product.price}</div>
            </div>
          </div>
          <div class="cart-qty-col">
            <div class="qty-control" style="transform:scale(0.9);transform-origin:left">
              <button class="qty-btn" onclick="updateCartQty('${item.cartItemId}',-1)">−</button>
              <div class="qty-display">${item.quantity}</div>
              <button class="qty-btn" onclick="updateCartQty('${item.cartItemId}',1)">+</button>
            </div>
          </div>
          <div class="cart-total-col" style="font-weight:700">$${(item.product.price * item.quantity).toFixed(2)}</div>
          <div>
            <button onclick="removeFromCart('${item.cartItemId}')" style="color:var(--text3);font-size:18px;width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;transition:background 0.2s" onmouseover="this.style.background='var(--surface2)'" onmouseout="this.style.background='none'">×</button>
          </div>
        </div>
      `).join('')}
    </div>
    <div>
      <div class="order-summary-card">
        <div class="order-summary-title">Order Summary</div>
        <div class="coupon-row">
          <input class="coupon-input" placeholder="Promo code"/>
          <button class="btn-coupon" onclick="applyCoupon()">Apply</button>
        </div>
        <div class="price-summary" style="margin-top:16px">
          <div class="summary-row"><span>Subtotal</span><span>$${total.toFixed(2)}</span></div>
          <div class="summary-row"><span>Shipping</span><span class="${shipping === 0 ? 'free' : ''}">${shipping === 0 ? 'Free' : '$' + shipping.toFixed(2)}</span></div>
          <div class="summary-row"><span>Tax (8%)</span><span>$${tax.toFixed(2)}</span></div>
          <div class="summary-row total"><span>Total</span><span>$${grandTotal.toFixed(2)}</span></div>
        </div>
        <button class="btn-checkout" onclick="startCheckout()">Proceed to Checkout →</button>
        <button class="btn-ghost" style="width:100%;justify-content:center;margin-top:12px" onclick="navigate('listing','all')">← Continue Shopping</button>
      </div>
    </div>
  `;
}

/* ============================================================
   CHECKOUT
   ============================================================ */
function startCheckout() {
  state.checkoutStep = 0;
  navigate('checkout');
  trackCheckoutStarted({ cart_id: state.cartId, total: cartTotal(), currency: 'USD', products: cartProducts() });
}

function renderCheckout() {
  const el = document.getElementById('checkout-content');
  const total = cartTotal();
  const shipping = state.checkoutData.shippingMethod === 'express' ? 19.99 : (total >= 75 ? 0 : 9.99);
  const tax = total * 0.08;
  const grand = total + shipping + tax;
  const steps = ['Shipping', 'Payment', 'Review'];

  const stepsHTML = steps.map((s, i) => `
    <div class="checkout-step-tab ${i === state.checkoutStep ? 'active' : i < state.checkoutStep ? 'done' : ''}">
      <div class="step-num">${i < state.checkoutStep ? '✓' : i + 1}</div>${s}
    </div>
  `).join('');

  // Pre-fill with logged-in user data
  const cd = state.checkoutData;
  const sh = cd.shipping;

  let formHTML = '';
  if (state.checkoutStep === 0) {
    formHTML = `
      <h3 style="margin-bottom:24px;font-family:var(--font-display);font-weight:400">Contact & Shipping</h3>
      <div class="checkout-form-group">
        <label class="checkout-label">Email address</label>
        <input class="checkout-input" type="email" id="co-email" placeholder="you@example.com" value="${cd.email}"/>
      </div>
      <div class="input-grid-2">
        <div class="checkout-form-group">
          <label class="checkout-label">First name</label>
          <input class="checkout-input" id="co-fname" placeholder="Alex" value="${sh.fname || ''}"/>
        </div>
        <div class="checkout-form-group">
          <label class="checkout-label">Last name</label>
          <input class="checkout-input" id="co-lname" placeholder="Jordan" value="${sh.lname || ''}"/>
        </div>
      </div>
      <div class="checkout-form-group">
        <label class="checkout-label">Address</label>
        <input class="checkout-input" id="co-addr" placeholder="123 Main Street" value="${sh.address || ''}"/>
      </div>
      <div class="input-grid-2">
        <div class="checkout-form-group">
          <label class="checkout-label">City</label>
          <input class="checkout-input" id="co-city" placeholder="New York" value="${sh.city || ''}"/>
        </div>
        <div class="checkout-form-group">
          <label class="checkout-label">ZIP / Postal code</label>
          <input class="checkout-input" id="co-zip" placeholder="10001" value="${sh.zip || ''}"/>
        </div>
      </div>
      <div class="checkout-form-group">
        <label class="checkout-label">Country</label>
        <select class="checkout-input" id="co-country">
          <option>United States</option><option>United Kingdom</option><option>Canada</option><option>Australia</option><option>India</option>
        </select>
      </div>
      <div class="checkout-form-group">
        <label class="checkout-label">Shipping method</label>
        <div class="shipping-methods">
          <div class="shipping-method ${cd.shippingMethod === 'standard' ? 'selected' : ''}" onclick="selectShipping('standard')">
            <input type="radio" ${cd.shippingMethod === 'standard' ? 'checked' : ''} style="accent-color:var(--accent)"/>
            <div class="shipping-method-info"><div class="shipping-method-name">Standard Shipping</div><div class="shipping-method-time">5–7 business days</div></div>
            <div class="shipping-method-price">${total >= 75 ? 'Free' : '$9.99'}</div>
          </div>
          <div class="shipping-method ${cd.shippingMethod === 'express' ? 'selected' : ''}" onclick="selectShipping('express')">
            <input type="radio" ${cd.shippingMethod === 'express' ? 'checked' : ''} style="accent-color:var(--accent)"/>
            <div class="shipping-method-info"><div class="shipping-method-name">Express Shipping</div><div class="shipping-method-time">1–2 business days</div></div>
            <div class="shipping-method-price">$19.99</div>
          </div>
        </div>
      </div>
      <button class="btn-primary" style="margin-top:8px" onclick="submitShipping()">Continue to Payment →</button>
    `;
  } else if (state.checkoutStep === 1) {
    formHTML = `
      <h3 style="margin-bottom:24px;font-family:var(--font-display);font-weight:400">Payment Method</h3>
      <div class="trust-badges" style="margin-bottom:24px">
        <div class="trust-badge"><span>🔒</span>SSL Secured</div>
        <div class="trust-badge"><span>✅</span>PCI Compliant</div>
        <div class="trust-badge"><span>🛡️</span>Buyer Protected</div>
      </div>
      <div class="payment-methods">
        <div class="payment-method ${cd.paymentMethod === 'card' ? 'selected' : ''}" onclick="selectPayment('card')">
          <div class="payment-method-icon">💳</div>
          <div class="payment-method-name">Credit / Debit Card</div>
        </div>
        <div class="payment-method ${cd.paymentMethod === 'paypal' ? 'selected' : ''}" onclick="selectPayment('paypal')">
          <div class="payment-method-icon">🅿️</div>
          <div class="payment-method-name">PayPal</div>
        </div>
        <div class="payment-method ${cd.paymentMethod === 'apple' ? 'selected' : ''}" onclick="selectPayment('apple')">
          <div class="payment-method-icon">🍎</div>
          <div class="payment-method-name">Apple Pay</div>
        </div>
      </div>
      ${cd.paymentMethod === 'card' ? `
        <div style="margin-top:24px">
          <div class="checkout-form-group">
            <label class="checkout-label">Card number</label>
            <input class="checkout-input" placeholder="1234 5678 9012 3456" maxlength="19" oninput="this.value=this.value.replace(/[^\\d]/g,'').replace(/(\\d{4})/g,'$1 ').trim()"/>
          </div>
          <div class="input-grid-2">
            <div class="checkout-form-group">
              <label class="checkout-label">Expiry</label>
              <input class="checkout-input" placeholder="MM / YY" maxlength="7"/>
            </div>
            <div class="checkout-form-group">
              <label class="checkout-label">CVV</label>
              <input class="checkout-input" placeholder="123" maxlength="4" type="password"/>
            </div>
          </div>
          <div class="checkout-form-group">
            <label class="checkout-label">Name on card</label>
            <input class="checkout-input" placeholder="Alex Jordan"/>
          </div>
        </div>` : ''}
      <div style="display:flex;gap:12px;margin-top:8px">
        <button class="btn-secondary" onclick="state.checkoutStep=0;renderCheckout()">← Back</button>
        <button class="btn-primary" onclick="submitPayment()">Review Order →</button>
      </div>
    `;
  } else if (state.checkoutStep === 2) {
    formHTML = `
      <h3 style="margin-bottom:24px;font-family:var(--font-display);font-weight:400">Review Your Order</h3>
      <div style="background:var(--surface2);border-radius:var(--radius);padding:20px;margin-bottom:20px">
        <div style="font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;color:var(--text3);margin-bottom:12px">Shipping to</div>
        <div style="font-size:14px">${sh.fname} ${sh.lname}</div>
        <div style="font-size:14px;color:var(--text2)">${sh.address}, ${sh.city} ${sh.zip}</div>
        <div style="font-size:14px;color:var(--text2)">${cd.shippingMethod === 'express' ? 'Express (1–2 days)' : 'Standard (5–7 days)'}</div>
      </div>
      <div style="background:var(--surface2);border-radius:var(--radius);padding:20px;margin-bottom:20px">
        <div style="font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;color:var(--text3);margin-bottom:12px">Payment</div>
        <div style="font-size:14px">${{ card: 'Credit Card', paypal: 'PayPal', apple: 'Apple Pay' }[cd.paymentMethod]}</div>
      </div>
      <div style="background:var(--surface2);border-radius:var(--radius);padding:20px;margin-bottom:24px">
        <div style="font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;color:var(--text3);margin-bottom:12px">Items</div>
        ${state.cart.map(item => `
          <div style="display:flex;gap:12px;align-items:center;padding:8px 0;border-bottom:1px solid var(--border);font-size:13px">
            <span style="font-size:1.6rem">${item.product.emoji}</span>
            <span style="flex:1">${item.product.name} <span style="color:var(--text3)">×${item.quantity}</span></span>
            <span style="font-weight:700">$${(item.product.price * item.quantity).toFixed(2)}</span>
          </div>
        `).join('')}
      </div>
      <div style="display:flex;gap:12px">
        <button class="btn-secondary" onclick="state.checkoutStep=1;renderCheckout()">← Back</button>
        <button class="btn-primary" onclick="placeOrder()" style="flex:1">Place Order →</button>
      </div>
    `;
  }

  el.innerHTML = `
    <div>
      <div class="checkout-steps">${stepsHTML}</div>
      ${formHTML}
    </div>
    <div>
      <div class="checkout-order-summary">
        <div class="order-summary-title">Order Summary</div>
        ${state.cart.map(item => `
          <div style="display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid var(--border)">
            <div style="font-size:1.6rem;width:44px;height:44px;background:var(--bg2);border-radius:8px;display:flex;align-items:center;justify-content:center;flex-shrink:0">${item.product.emoji}</div>
            <div style="flex:1;font-size:13px;font-weight:500">${item.product.name}<span style="color:var(--text3)"> ×${item.quantity}</span></div>
            <div style="font-weight:700;font-size:13px">$${(item.product.price * item.quantity).toFixed(2)}</div>
          </div>
        `).join('')}
        <div class="price-summary" style="margin-top:16px">
          <div class="summary-row"><span>Subtotal</span><span>$${total.toFixed(2)}</span></div>
          <div class="summary-row"><span>Shipping</span><span class="${shipping === 0 ? 'free' : ''}">${shipping === 0 ? 'Free' : '$' + shipping.toFixed(2)}</span></div>
          <div class="summary-row"><span>Tax</span><span>$${tax.toFixed(2)}</span></div>
          <div class="summary-row total"><span>Total</span><span>$${grand.toFixed(2)}</span></div>
        </div>
        <div class="trust-badges" style="margin-top:16px">
          <div class="trust-badge"><span>🔒</span>Secure</div>
          <div class="trust-badge"><span>↩️</span>Free Returns</div>
          <div class="trust-badge"><span>✅</span>Guaranteed</div>
        </div>
      </div>
    </div>
  `;

  trackCheckoutStepViewed({
    step_name: steps[state.checkoutStep],
    step_number: state.checkoutStep + 1,
    cart_id: state.cartId,
    total: cartTotal(),
    currency: 'USD',
  });
}

function selectShipping(method) {
  state.checkoutData.shippingMethod = method;
  renderCheckout();
}

function selectPayment(method) {
  state.checkoutData.paymentMethod = method;
  renderCheckout();
}

function submitShipping() {
  const email = document.getElementById('co-email')?.value;
  const fname = document.getElementById('co-fname')?.value;
  const lname = document.getElementById('co-lname')?.value;
  const addr  = document.getElementById('co-addr')?.value;
  const city  = document.getElementById('co-city')?.value;
  const zip   = document.getElementById('co-zip')?.value;

  if (!email || !fname || !addr || !city || !zip) {
    showToast('Please fill in all required fields');
    return;
  }
  state.checkoutData.email = email;
  state.checkoutData.shipping = { fname, lname, address: addr, city, zip };

  // Identify user if not already logged in
  if (!state.currentUser) {
    identifyUser(email, { first_name: fname, last_name: lname, email });
  }

  trackShippingInfoSubmitted({ shipping_method: state.checkoutData.shippingMethod, cart_id: state.cartId, total: cartTotal() });
  state.checkoutStep = 1;
  renderCheckout();
}

function submitPayment() {
  trackPaymentInfoEntered({ payment_method: state.checkoutData.paymentMethod, cart_id: state.cartId, total: cartTotal() });
  state.checkoutStep = 2;
  renderCheckout();
}

function placeOrder() {
  const total = cartTotal();
  const shipping = state.checkoutData.shippingMethod === 'express' ? 19.99 : (total >= 75 ? 0 : 9.99);
  const tax = total * 0.08;
  const grand = total + shipping + tax;
  state.orderId = 'ORD-' + Math.random().toString(36).substr(2, 8).toUpperCase();

  trackOrderCompleted({
    order_id: state.orderId, cart_id: state.cartId,
    total: grand, revenue: total, shipping, tax, discount: 0,
    currency: 'USD', products: cartProducts(),
    payment_method: state.checkoutData.paymentMethod,
    shipping_method: state.checkoutData.shippingMethod,
  });

  const purchasedCart = [...state.cart];
  state.cart = [];
  updateCartUI();
  navigate('confirmation', { orderId: state.orderId, items: purchasedCart, total: grand, tax, shipping });
}

/* ============================================================
   RENDER: CONFIRMATION
   ============================================================ */
function renderConfirmation({ orderId, items, total }) {
  const el = document.getElementById('page-confirmation');
  el.innerHTML = `
    <div class="confirmation-icon">🎉</div>
    <h1 class="confirmation-title">Order Confirmed!</h1>
    <p class="confirmation-subtitle">Thank you for shopping with LUMA${state.currentUser ? ', ' + state.currentUser.firstName : ''}</p>
    <div class="order-id-display">Order ID: <strong>${orderId}</strong></div>
    <div class="confirmation-items">
      ${items.map(item => `
        <div class="confirmation-item">
          <div class="conf-item-thumb">${item.product.emoji}</div>
          <div>
            <div class="conf-item-name">${item.product.name}</div>
            <div class="conf-item-detail">${Object.values(item.variant).filter(Boolean).join(' · ') || 'Standard'} · Qty ${item.quantity}</div>
          </div>
          <div class="conf-item-price">$${(item.product.price * item.quantity).toFixed(2)}</div>
        </div>
      `).join('')}
      <div class="confirmation-total"><span>Total paid</span><span>$${total.toFixed(2)}</span></div>
    </div>
    <button class="btn-primary" onclick="navigate('home')">← Continue Shopping</button>
  `;
}

/* ============================================================
   RENDER: HOME
   ============================================================ */
function renderHome() {
  const catGrid = document.getElementById('categories-grid');
  if (catGrid) {
    catGrid.innerHTML = CATEGORIES.map(c => `
      <div class="category-card" onclick="navigate('listing','${c.id}')">
        <div class="cat-emoji">${c.emoji}</div>
        <div class="cat-name">${c.name}</div>
        <div class="cat-count">${c.count} items</div>
      </div>
    `).join('');
  }

  const featGrid = document.getElementById('featured-products');
  if (featGrid) {
    const featured = PRODUCTS.filter(p => p.isFeatured);
    featGrid.innerHTML = featured.map(p => productCardHTML(p)).join('');
  }
}

/* ============================================================
   RENDER: LISTING
   ============================================================ */
function renderListing(category = 'all') {
  state.currentCategory = category;
  let products = category === 'all' ? PRODUCTS
    : category === 'new' ? PRODUCTS.filter(p => p.isNew)
    : PRODUCTS.filter(p => p.category === category);

  const priceMin = parseFloat(document.getElementById('price-min')?.value) || 0;
  const priceMax = parseFloat(document.getElementById('price-max')?.value) || Infinity;
  products = products.filter(p => p.price >= priceMin && p.price <= priceMax);

  const sort = document.getElementById('sort-select')?.value || 'featured';
  if (sort === 'price-asc')  products.sort((a, b) => a.price - b.price);
  if (sort === 'price-desc') products.sort((a, b) => b.price - a.price);
  if (sort === 'rating')     products.sort((a, b) => b.rating - a.rating);
  if (sort === 'newest')     products.sort((a, b) => b.isNew - a.isNew);

  const catFiltersEl = document.getElementById('category-filters');
  if (catFiltersEl) {
    catFiltersEl.innerHTML = [{ id: 'all', name: 'All' }, ...CATEGORIES].map(c => `
      <label class="filter-option">
        <input type="checkbox" value="${c.id}" ${state.currentCategory === c.id ? 'checked' : ''} onchange="navigate('listing','${c.id}')"/>
        ${c.name}
      </label>
    `).join('');
  }

  const listingEl = document.getElementById('listing-products');
  const countEl   = document.getElementById('listing-count');
  if (countEl) countEl.textContent = `Showing ${products.length} product${products.length !== 1 ? 's' : ''}`;
  if (listingEl) listingEl.innerHTML = products.map(p => productCardHTML(p)).join('');

  const paginationEl = document.getElementById('pagination');
  if (paginationEl && products.length > 8) {
    paginationEl.innerHTML = [1, 2, 3].map(i => `<button class="page-btn ${i === 1 ? 'active' : ''}">${i}</button>`).join('');
  }

  trackProductListViewed({
    category_id: category, category_name: category,
    product_count: products.length,
    products: products.map(p => ({ product_id: p.id, name: p.name, price: p.price })),
  });
}

function applyFilters() { renderListing(state.currentCategory); }

/* ============================================================
   PRODUCT CARD HTML
   ============================================================ */
function productCardHTML(p) {
  const discount = p.originalPrice ? Math.round((1 - p.price / p.originalPrice) * 100) : 0;
  const stars = '★'.repeat(Math.floor(p.rating)) + '☆'.repeat(5 - Math.floor(p.rating));
  return `
    <div class="product-card" onclick="navigate('product','${p.id}')">
      <div class="card-image">
        <span style="font-size:4.5rem">${p.emoji}</span>
        ${p.badge ? `<div class="card-badge badge-${p.badge}">${p.badge === 'sale' ? `-${discount}%` : p.badge}</div>` : ''}
        <div class="card-actions" onclick="event.stopPropagation()">
          <div class="card-add-btn" onclick="addToCart('${p.id}', {}, 1)">Add to Bag</div>
          <div class="card-wishlist-btn">♡</div>
        </div>
      </div>
      <div class="card-body">
        <div class="card-category">${p.category}</div>
        <div class="card-title">${p.name}</div>
        <div class="card-rating">
          <span class="stars">${stars}</span>
          <span class="rating-count">(${p.reviews})</span>
        </div>
        <div class="card-price">
          <span class="price-current">$${p.price}</span>
          ${p.originalPrice ? `<span class="price-original">$${p.originalPrice}</span><span class="price-discount">-${discount}%</span>` : ''}
        </div>
      </div>
    </div>
  `;
}

/* ============================================================
   RENDER: PRODUCT DETAIL
   ============================================================ */
function renderProduct(productId) {
  const p = PRODUCTS.find(x => x.id === productId);
  if (!p) return;
  state.currentProduct = p;
  state.selectedVariant = { color: p.colors?.[0] || null, size: p.sizes?.[0] || null };
  state.quantities[productId] = 1;

  const discount = p.originalPrice ? Math.round((1 - p.price / p.originalPrice) * 100) : 0;
  const stars = '★'.repeat(Math.floor(p.rating)) + '☆'.repeat(5 - Math.floor(p.rating));

  document.getElementById('product-detail-content').innerHTML = `
    <div class="product-gallery">
      <div class="gallery-main" id="gallery-main"><span style="font-size:9rem">${p.emoji}</span></div>
      <div class="gallery-thumbs">
        ${[p.emoji, p.emoji, p.emoji].map((e, i) => `
          <div class="gallery-thumb ${i === 0 ? 'active' : ''}" onclick="selectThumb(this, '${e}')"><span>${e}</span></div>
        `).join('')}
      </div>
    </div>
    <div class="product-info">
      <div class="product-breadcrumb">
        <span onclick="navigate('home')">Home</span> /
        <span onclick="navigate('listing','${p.category}')">${p.category.charAt(0).toUpperCase() + p.category.slice(1)}</span> /
        <span>${p.name}</span>
      </div>
      <h1 class="product-title-main">${p.name}</h1>
      <div class="product-sku">SKU: ${p.sku} · ID: ${p.id}</div>
      <div class="product-rating-row">
        <span class="stars" style="font-size:16px;color:var(--gold)">${stars}</span>
        <span style="font-weight:700;font-size:14px">${p.rating}</span>
        <span class="review-count-link">(${p.reviews} reviews)</span>
      </div>
      <div class="product-price-block">
        <span class="price-main">$${p.price}</span>
        ${p.originalPrice ? `<span class="price-was">$${p.originalPrice}</span><span class="price-save">Save ${discount}%</span>` : ''}
      </div>
      <p style="color:var(--text2);font-size:15px;line-height:1.7;margin-bottom:24px">${p.description}</p>

      ${p.colors?.length ? `
        <div class="option-group">
          <div class="option-label">Color <span id="selected-color-label">${p.colors[0]}</span></div>
          <div class="option-swatches">
            ${p.colors.map((c, i) => `<div class="color-swatch ${i === 0 ? 'active' : ''}" style="background:${c}" onclick="selectColor(this,'${c}')" title="${c}"></div>`).join('')}
          </div>
        </div>
      ` : ''}

      ${p.sizes?.length > 1 ? `
        <div class="option-group">
          <div class="option-label">Size <span id="selected-size-label">${p.sizes[0]}</span></div>
          <div class="option-swatches">
            ${p.sizes.map((s, i) => `<button class="size-btn ${i === 0 ? 'active' : ''}" onclick="selectSize(this,'${s}')">${s}</button>`).join('')}
          </div>
        </div>
      ` : ''}

      <div class="option-group">
        <div class="option-label">Quantity</div>
        <div class="qty-control">
          <button class="qty-btn" onclick="changeQty('${p.id}',-1)">−</button>
          <div class="qty-display" id="qty-${p.id}">1</div>
          <button class="qty-btn" onclick="changeQty('${p.id}',1)">+</button>
        </div>
      </div>

      <div class="product-cta-row">
        <button class="btn-add-cart" onclick="addCurrentToCart('${p.id}')">Add to Bag</button>
        <button class="btn-wishlist">♡</button>
      </div>

      <div class="trust-badges">
        <div class="trust-badge"><span>🚚</span>Free shipping over $75</div>
        <div class="trust-badge"><span>↩️</span>30-day returns</div>
        <div class="trust-badge"><span>✅</span>Authenticity guaranteed</div>
        <div class="trust-badge"><span>🔒</span>Secure checkout</div>
      </div>

      <div class="product-meta">
        <div class="meta-row"><span class="meta-icon">📦</span>In stock — ships within 24 hours</div>
        <div class="meta-row"><span class="meta-icon">🌿</span>Sustainably sourced materials</div>
        <div class="meta-row"><span class="meta-icon">🏭</span>Ethically manufactured</div>
      </div>
    </div>
  `;

  // Sticky ATC (mobile)
  document.getElementById('sticky-atc').innerHTML = `
    <div style="display:flex;gap:4px;font-size:13px;align-items:center;flex:1">
      <span style="font-size:1.4rem">${p.emoji}</span>
      <div><div style="font-weight:600;font-size:13px">${p.name}</div><div style="color:var(--accent);font-weight:700">$${p.price}</div></div>
    </div>
    <button class="btn-primary" style="white-space:nowrap;padding:12px 20px" onclick="addCurrentToCart('${p.id}')">Add to Bag</button>
  `;

  // Reviews
  const reviewsSection = document.getElementById('reviews-section');
  const reviewsContent  = document.getElementById('reviews-content');
  reviewsSection.style.display = 'block';
  reviewsContent.innerHTML = `
    <div class="reviews-summary">
      <div class="rating-big">
        <div class="rating-number">${p.rating}</div>
        <div class="rating-stars-big">${stars}</div>
        <div class="rating-total">${p.reviews} reviews</div>
      </div>
    </div>
    ${[
      { name: 'Sarah M.', rating: 5, text: 'Absolutely love this product! The quality is exceptional and it arrived earlier than expected.', date: 'May 2025' },
      { name: 'James K.', rating: 5, text: 'Exceeded my expectations in every way. The materials feel premium and the fit is perfect.', date: 'Apr 2025' },
      { name: 'Priya R.', rating: 4, text: 'Great product overall. Slight discrepancy in color from the photo but very happy with the purchase.', date: 'Mar 2025' },
    ].map(r => `
      <div class="review-card">
        <div class="review-header">
          <div><div class="reviewer-name">${r.name}</div><div style="color:var(--gold);font-size:13px">${'★'.repeat(r.rating)}</div></div>
          <div class="review-date">${r.date}</div>
        </div>
        <div class="review-text">${r.text}</div>
      </div>
    `).join('')}
  `;

  // Related products
  const related = PRODUCTS.filter(x => x.category === p.category && x.id !== p.id).slice(0, 6);
  document.getElementById('related-products').innerHTML = related.map(r => productCardHTML(r)).join('');

  trackProductView({
    product_id: p.id, sku: p.sku, name: p.name, category: p.category,
    brand: p.brand, variant: JSON.stringify(state.selectedVariant),
    price: p.price, currency: 'USD',
  });
}

function selectThumb(el, emoji) {
  document.querySelectorAll('.gallery-thumb').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
  document.getElementById('gallery-main').innerHTML = `<span style="font-size:9rem">${emoji}</span>`;
}
function selectColor(el, color) {
  document.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('active'));
  el.classList.add('active');
  state.selectedVariant.color = color;
  const lbl = document.getElementById('selected-color-label');
  if (lbl) lbl.textContent = color;
}
function selectSize(el, size) {
  document.querySelectorAll('.size-btn').forEach(s => s.classList.remove('active'));
  el.classList.add('active');
  state.selectedVariant.size = size;
  const lbl = document.getElementById('selected-size-label');
  if (lbl) lbl.textContent = size;
}
function changeQty(productId, delta) {
  state.quantities[productId] = Math.max(1, (state.quantities[productId] || 1) + delta);
  const el = document.getElementById('qty-' + productId);
  if (el) el.textContent = state.quantities[productId];
}
function addCurrentToCart(productId) {
  addToCart(productId, { ...state.selectedVariant }, state.quantities[productId] || 1);
}

/* ============================================================
   ROUTER / NAVIGATION
   ============================================================ */
function navigate(page, param) {
  document.querySelectorAll('.page').forEach(el => el.classList.remove('active'));
  const pageEl = document.getElementById('page-' + page);
  if (pageEl) pageEl.classList.add('active');
  state.currentPage = page;
  window.scrollTo({ top: 0, behavior: 'smooth' });
  document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));

  if (page === 'home') {
    renderHome();
    trackPageView({ page_name: 'Home', page_type: 'home' });
  } else if (page === 'listing') {
    renderListing(param || 'all');
    trackPageView({ page_name: 'Product Listing', page_type: 'listing' });
  } else if (page === 'product') {
    renderProduct(param);
    trackPageView({ page_name: 'Product Detail', page_type: 'product' });
  } else if (page === 'cart') {
    renderCartPage();
    trackPageView({ page_name: 'Cart', page_type: 'cart' });
    trackCartViewed({ cart_id: state.cartId, currency: 'USD', total: cartTotal(), products: cartProducts() });
  } else if (page === 'checkout') {
    renderCheckout();
    trackPageView({ page_name: 'Checkout', page_type: 'checkout' });
  } else if (page === 'confirmation') {
    renderConfirmation(param);
    trackPageView({ page_name: 'Order Confirmation', page_type: 'confirmation' });
  }
}

/* ============================================================
   SEARCH
   ============================================================ */
let searchTimeout;
function handleSearch(query) {
  clearTimeout(searchTimeout);
  const dropdown = document.getElementById('search-dropdown');
  if (!query || query.length < 2) { dropdown.classList.add('hidden'); return; }
  searchTimeout = setTimeout(() => {
    const results = PRODUCTS.filter(p =>
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.category.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 5);
    trackSearchPerformed({ query, results_count: results.length });
    if (results.length === 0) { dropdown.classList.add('hidden'); return; }
    dropdown.innerHTML = results.map(p => `
      <div class="search-result-item" onclick="navigate('product','${p.id}');document.getElementById('search-input').value='';hideSearchDropdown()">
        <div class="search-result-thumb">${p.emoji}</div>
        <div class="search-result-info">
          <div class="search-result-name">${p.name}</div>
          <div class="search-result-price">$${p.price}</div>
        </div>
      </div>
    `).join('');
    dropdown.classList.remove('hidden');
  }, 300);
}
function hideSearchDropdown() {
  document.getElementById('search-dropdown')?.classList.add('hidden');
}

/* ============================================================
   PROMO BANNER
   ============================================================ */
function handlePromoBannerClick() {
  const banner = document.getElementById('promo-banner-main');
  trackPromotionClicked({
    promotion_id: banner?.dataset.promoId || 'banner-001',
    promotion_name: banner?.dataset.promoName || 'Summer Sale',
    creative: 'banner',
    location: 'home_page',
  });
  navigate('listing', 'all');
}

/* ============================================================
   COUPON
   ============================================================ */
function applyCoupon() {
  showToast('Promo code applied! 🎉');
}

/* ============================================================
   THEME TOGGLE
   ============================================================ */
function toggleTheme() {
  const html = document.documentElement;
  const isDark = html.getAttribute('data-theme') === 'dark';
  html.setAttribute('data-theme', isDark ? 'light' : 'dark');
  document.getElementById('theme-icon-light').style.display = isDark ? '' : 'none';
  document.getElementById('theme-icon-dark').style.display  = isDark ? 'none' : '';
}

/* ============================================================
   MOBILE MENU
   ============================================================ */
function toggleMobileMenu() {
  const nav = document.querySelector('.main-nav');
  const isVisible = nav.style.display === 'flex';
  nav.style.display    = isVisible ? 'none' : 'flex';
  nav.style.position   = 'fixed';
  nav.style.top        = 'var(--header-h)';
  nav.style.left       = '0';
  nav.style.right      = '0';
  nav.style.background = 'var(--surface)';
  nav.style.flexDirection = 'column';
  nav.style.padding    = '16px';
  nav.style.borderBottom = '1.5px solid var(--border)';
  nav.style.zIndex     = '150';
}

/* ============================================================
   TOAST
   ============================================================ */
function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2500);
}

/* ============================================================
   SCROLL HEADER EFFECT
   ============================================================ */
window.addEventListener('scroll', () => {
  const header = document.getElementById('site-header');
  if (window.scrollY > 10) header.classList.add('scrolled');
  else header.classList.remove('scrolled');
});

/* ============================================================
   INIT
   ============================================================ */
renderHeaderAuth();
navigate('home');

// Observe promos after render
setTimeout(() => {
  const promoStrip = document.getElementById('promo-strip');
  if (promoStrip) promoObserver.observe(promoStrip);
  const promoBanner = document.getElementById('promo-banner-main');
  if (promoBanner) promoObserver.observe(promoBanner);
}, 500);
