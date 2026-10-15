/* AURA PENS — multi-page storefront (demo, no real payments)
   Pages: index.html (home) → shop.html (listing) → product.html (detail + cart)
   Cart persists via localStorage. To add a gateway later, replace placeOrder(). */
const PRODUCTS = [
  {
    id: 'inxo-ultra',
    name: 'INXO ULTRA',
    price: 20,
    category: 'Premium everyday pen',
    img: 'assets/inxo-ultra.jpg',
    fallbackImg: 'assets/inxo-ultra.svg',
    url: 'product.html',
    desc: 'Meet INXO ULTRA by AURA PENS — everyday ideas, bold thoughts, creative possibilities.',
    keywords: 'inxo inxo ultra pen aura pens writing ball pen blue premium everyday',
  },
];

const $ = (s) => document.querySelector(s);
const on = (sel, evt, fn) => { const el = $(sel); if (el) el.addEventListener(evt, fn); return el; };
const fmt = (n) => '₹' + Number(n).toLocaleString('en-IN');
const imgFallback = `onerror="this.onerror=null;this.src='assets/inxo-ultra.svg'"`;

const state = { qty: 1, cart: loadCart() };
function loadCart() { try { return JSON.parse(localStorage.getItem('aura_cart_v1')) || {}; } catch { return {}; } }
function saveCart() { try { localStorage.setItem('aura_cart_v1', JSON.stringify(state.cart)); } catch {} }
function cartCount() { return Object.values(state.cart).reduce((a, b) => a + b, 0); }
function cartSubtotal() {
  return Object.entries(state.cart).reduce((sum, [id, q]) => {
    const p = PRODUCTS.find((x) => x.id === id);
    return sum + (p ? p.price * q : 0);
  }, 0);
}

/* ---------- toast ---------- */
function toast(msg, isErr = false) {
  const wrap = $('#toastWrap'); if (!wrap) return;
  const el = document.createElement('div');
  el.className = 'toast' + (isErr ? ' error' : '');
  el.textContent = msg;
  wrap.appendChild(el);
  setTimeout(() => { el.style.opacity = '0'; setTimeout(() => el.remove(), 300); }, 2600);
}

/* ---------- header scroll ---------- */
const header = $('#siteHeader');
if (header) {
  addEventListener('scroll', () => header.classList.toggle('scrolled', scrollY > 30), { passive: true });
  header.classList.toggle('scrolled', scrollY > 30);
}

/* ---------- product image: PNG/JPG with SVG fallback ---------- */
const pImg = $('#productImg');
if (pImg) {
  pImg.addEventListener('error', () => {
    if (!pImg.src.endsWith('inxo-ultra.svg')) pImg.src = 'assets/inxo-ultra.svg';
  });
}
on('#logoImg', 'error', function () { this.alt = 'AURA PENS'; });

/* ---------- quantity (product page only) ---------- */
function renderQty() {
  const qv = $('#qtyVal'), qt = $('#qtyTotal');
  if (!qv || !qt) return;
  qv.textContent = state.qty;
  qt.textContent = fmt(PRODUCTS[0].price * state.qty);
}
on('#qtyMinus', 'click', () => { state.qty = Math.max(1, state.qty - 1); renderQty(); });
on('#qtyPlus', 'click', () => { state.qty = Math.min(99, state.qty + 1); renderQty(); });
renderQty();

/* ---------- cart drawer (all pages) ---------- */
const drawer = $('#cartDrawer'), overlay = $('#overlay'), modal = $('#checkoutModal');
function openCart() { if (!drawer) return; renderCart(); drawer.classList.add('open'); drawer.setAttribute('aria-hidden', 'false'); if (overlay) overlay.hidden = false; }
function closeCart() { if (!drawer) return; drawer.classList.remove('open'); drawer.setAttribute('aria-hidden', 'true'); if (overlay && !(modal && modal.classList.contains('open'))) overlay.hidden = true; }
on('#cartToggle', 'click', openCart);
on('#cartClose', 'click', closeCart);
on('#continueBtn', 'click', closeCart);
if (overlay) overlay.addEventListener('click', () => { closeCart(); closeCheckout(); });

function renderCart() {
  const box = $('#cartItems'); if (!box) return;
  const entries = Object.entries(state.cart);
  const cc = $('#cartCount'), dc = $('#drawerCount'), st = $('#cartSubtotal');
  if (cc) cc.textContent = cartCount();
  if (dc) dc.textContent = `(${cartCount()})`;
  if (st) st.textContent = fmt(cartSubtotal());
  if (!entries.length) {
    box.innerHTML = `<div class="sr-empty" style="color:var(--muted);border-color:var(--line-cool)">Your cart is empty.<br/>Add the INXO ULTRA pen to get started.</div>`;
    return;
  }
  box.innerHTML = '';
  entries.forEach(([id, q]) => {
    const p = PRODUCTS.find((x) => x.id === id);
    if (!p) return;
    const div = document.createElement('div');
    div.className = 'cart-item';
    div.innerHTML = `
      <img src="${p.img}" ${imgFallback} alt="${p.name}"/>
      <div><strong>${p.name}</strong><br/><small>${fmt(p.price)} × ${q} = <strong>${fmt(p.price * q)}</strong></small>
        <div class="ci-qty">
          <button aria-label="Decrease">−</button><span>${q}</span><button aria-label="Increase">+</button>
        </div>
        <button class="ci-remove">Remove</button>
      </div>
      <strong>${fmt(p.price * q)}</strong>`;
    const [dec, inc] = div.querySelectorAll('.ci-qty button');
    dec.onclick = () => { state.cart[id] = Math.max(0, q - 1); if (!state.cart[id]) delete state.cart[id]; saveCart(); renderCart(); };
    inc.onclick = () => { state.cart[id] = Math.min(99, q + 1); saveCart(); renderCart(); };
    div.querySelector('.ci-remove').onclick = () => { delete state.cart[id]; saveCart(); renderCart(); toast('Removed from cart'); };
    box.appendChild(div);
  });
}
renderCart();

on('#addToCartBtn', 'click', () => {
  const id = 'inxo-ultra';
  state.cart[id] = (state.cart[id] || 0) + state.qty;
  saveCart(); renderCart();
  toast(`${state.qty} × INXO ULTRA added — ${fmt(PRODUCTS[0].price * state.qty)}`);
  openCart();
});
on('#buyNowBtn', 'click', () => {
  const id = 'inxo-ultra';
  state.cart[id] = (state.cart[id] || 0) + state.qty;
  saveCart(); renderCart();
  openCheckout();
});

/* ---------- search (all pages → goes to product page) ---------- */
const panel = $('#searchPanel'), sInput = $('#searchInput'), sClear = $('#searchClear'), sRes = $('#searchResults');
const sToggle = $('#searchToggle');
function setSearch(open) {
  if (!panel) return;
  panel.classList.toggle('open', open);
  panel.setAttribute('aria-hidden', String(!open));
  if (sToggle) sToggle.setAttribute('aria-expanded', String(open));
  if (open) { renderSearch(''); setTimeout(() => sInput && sInput.focus(), 120); }
}
if (sToggle) sToggle.addEventListener('click', () => setSearch(!panel.classList.contains('open')));
if (sInput) sInput.addEventListener('input', () => { if (sClear) sClear.hidden = !sInput.value; renderSearch(sInput.value); });
if (sClear) sClear.addEventListener('click', () => { sInput.value = ''; sClear.hidden = true; renderSearch(''); sInput.focus(); });
function renderSearch(q) {
  if (!sRes) return;
  q = (q || '').trim().toLowerCase();
  const hits = PRODUCTS.filter((p) => !q || (p.name + ' ' + p.category + ' ' + p.keywords).toLowerCase().includes(q));
  sRes.innerHTML = '';
  if (!hits.length) {
    sRes.innerHTML = `<div class="sr-empty">No pens found for “${escapeHtml(sInput.value)}”. Try “INXO”, “INXO ULTRA” or “pen”.</div>`;
    return;
  }
  hits.forEach((p) => {
    const b = document.createElement('button');
    b.className = 'sr-item'; b.setAttribute('role', 'option');
    b.innerHTML = `<img src="${p.img}" ${imgFallback} alt=""/><span><strong>${p.name}</strong><br/><small>${p.category} · ${fmt(p.price)}</small></span><span style="margin-left:auto;color:var(--ocean);font-weight:800">→</span>`;
    b.onclick = () => { window.location.href = p.url; };
    sRes.appendChild(b);
  });
}
function escapeHtml(s) { return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }

/* ---------- checkout ---------- */
function openCheckout() {
  if (!modal) return;
  if (!cartCount()) { toast('Your cart is empty — add a pen first', true); return; }
  closeCart(); renderSummary();
  modal.classList.add('open'); modal.setAttribute('aria-hidden', 'false'); if (overlay) overlay.hidden = false;
}
function closeCheckout() { if (!modal) return; modal.classList.remove('open'); modal.setAttribute('aria-hidden', 'true'); if (overlay && !(drawer && drawer.classList.contains('open'))) overlay.hidden = true; }
on('#checkoutBtn', 'click', openCheckout);
on('#checkoutClose', 'click', closeCheckout);

function renderSummary() {
  const box = $('#orderSummary'); if (!box) return;
  const rows = Object.entries(state.cart).map(([id, q]) => {
    const p = PRODUCTS.find((x) => x.id === id);
    return `<div style="display:flex;justify-content:space-between"><span>${p.name} × ${q}</span><strong>${fmt(p.price * q)}</strong></div>`;
  }).join('');
  box.innerHTML = rows + `<div style="display:flex;justify-content:space-between;border-top:1px solid #dbe6f1;padding-top:8px"><span>Total</span><strong>${fmt(cartSubtotal())}</strong></div>`;
  const ot = $('#orderTotal'); if (ot) ot.textContent = fmt(cartSubtotal());
}
function fieldError(input, errEl, msg) { if (errEl) errEl.textContent = msg || ''; if (input) input.style.borderColor = msg ? '#dc2626' : ''; return !msg; }

const checkoutForm = $('#checkoutForm');
if (checkoutForm) checkoutForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const name = $('#oName'), phone = $('#oPhone'), addr = $('#oAddress');
  const digits = phone.value.replace(/\D/g, '').replace(/^91(?=\d{10}$)/, '');
  let ok = true;
  ok = fieldError(name, $('#oNameErr'), name.value.trim().length < 3 ? 'Please enter your full name' : '') && ok;
  ok = fieldError(phone, $('#oPhoneErr'), !/^[6-9]\d{9}$/.test(digits) ? 'Enter a valid 10-digit Indian mobile number' : '') && ok;
  ok = fieldError(addr, $('#oAddressErr'), addr.value.trim().length < 12 ? 'Please enter a full delivery address with PIN' : '') && ok;
  const cm = $('#checkoutMsg');
  if (!ok) { if (cm) { cm.textContent = 'Please fix the highlighted fields.'; cm.className = 'form-msg bad'; } return; }
  placeOrder({ name: name.value.trim(), phone: digits, address: addr.value.trim() });
});

// Swap this with a real gateway later (Razorpay/Stripe + your orders API).
function placeOrder(details) {
  const btn = $('#placeOrderBtn');
  if (btn) { btn.disabled = true; btn.textContent = 'PLACING ORDER…'; }
  setTimeout(() => {
    const orderId = 'AURA-' + Math.random().toString(36).slice(2, 8).toUpperCase();
    const total = cartSubtotal();
    state.cart = {}; saveCart(); renderCart(); renderSummary();
    const cm = $('#checkoutMsg');
    if (cm) { cm.textContent = `✓ Demo order ${orderId} confirmed for ${details.name} — ${fmt(total)}. No payment was charged. We’ll contact ${details.phone} for delivery.`; cm.className = 'form-msg ok'; }
    toast(`Order ${orderId} placed (demo) — ${fmt(total)}`);
    if (btn) { btn.disabled = false; btn.innerHTML = `CONFIRM ORDER · <span id="orderTotal">${fmt(0)}</span>`; }
  }, 900);
}

/* ---------- contact form (home only) ---------- */
const contactForm = $('#contactForm');
if (contactForm) contactForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const n = $('#cName'), em = $('#cEmail'), m = $('#cMsg');
  let ok = true;
  ok = fieldError(n, $('#cNameErr'), n.value.trim().length < 2 ? 'Please enter your name' : '') && ok;
  ok = fieldError(em, $('#cEmailErr'), !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em.value.trim()) ? 'Enter a valid email' : '') && ok;
  ok = fieldError(m, $('#cMsgErr'), m.value.trim().length < 10 ? 'Message should be at least 10 characters' : '') && ok;
  const msg = $('#contactMsg');
  if (!ok) { if (msg) { msg.textContent = 'Please fix the highlighted fields.'; msg.className = 'form-msg bad'; } return; }
  const btn = $('#contactSubmit');
  if (btn) { btn.disabled = true; btn.textContent = 'SENDING…'; }
  setTimeout(() => {
    if (msg) { msg.textContent = `✓ Thanks ${n.value.trim().split(' ')[0]}! Your message was received (demo). We’ll reply to ${em.value.trim()} soon.`; msg.className = 'form-msg ok'; }
    e.target.reset(); if (btn) { btn.disabled = false; btn.textContent = 'SUBMIT'; }
    toast('Message sent (demo)');
  }, 700);
});
document.querySelectorAll('[data-placeholder]').forEach((a) => {
  a.addEventListener('click', (e) => { e.preventDefault(); toast(`${a.textContent} link not set — replace ${a.dataset.placeholder}`, true); });
});

/* ---------- reveal on scroll ---------- */
const io = new IntersectionObserver((es) => es.forEach((en) => en.isIntersecting && en.target.classList.add('visible')), { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach((el) => io.observe(el));

/* ---------- keyboard ---------- */
addEventListener('keydown', (e) => { if (e.key === 'Escape') { setSearch(false); closeCart(); closeCheckout(); } });

const yr = $('#year'); if (yr) yr.textContent = new Date().getFullYear();

/* ---------- ocean canvas (home hero only) ---------- */
(function ocean() {
  const cv = $('#oceanCanvas');
  if (!cv) return;
  const ctx = cv.getContext('2d');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const lowPower = (navigator.hardwareConcurrency || 4) <= 2;
  let W, H, t = 0, mx = 0, targetMx = 0;
  const N = lowPower ? 36 : 70;
  const drops = Array.from({ length: N }, () => ({ x: Math.random(), y: Math.random(), r: Math.random() * 2.2 + 0.6, s: Math.random() * 0.0009 + 0.0003, o: Math.random() * 0.5 + 0.2 }));
  function size() { const d = Math.min(devicePixelRatio || 1, 2); W = cv.clientWidth; H = cv.clientHeight; cv.width = W * d; cv.height = H * d; ctx.setTransform(d, 0, 0, d, 0, 0); }
  size(); addEventListener('resize', size);
  addEventListener('mousemove', (e) => { targetMx = (e.clientX / innerWidth - 0.5) * 40; }, { passive: true });
  const layers = [
    { y: 0.62, amp: 26, len: 0.004, sp: 0.014, col: 'rgba(34,211,238,0.16)' },
    { y: 0.70, amp: 34, len: 0.003, sp: 0.010, col: 'rgba(94,234,212,0.14)' },
    { y: 0.78, amp: 40, len: 0.0025, sp: 0.007, col: 'rgba(10,77,140,0.55)' },
    { y: 0.86, amp: 30, len: 0.0035, sp: 0.011, col: 'rgba(2,20,50,0.75)' },
  ];
  function wave(L, phase) {
    ctx.beginPath(); ctx.moveTo(0, H);
    for (let x = 0; x <= W; x += 6) {
      const y = H * L.y + Math.sin(x * L.len * 6 + t * L.sp * 60 + phase) * L.amp + Math.sin(x * 0.008 - t * 0.6) * 8 + mx * (L.y);
      ctx.lineTo(x, y);
    }
    ctx.lineTo(W, H); ctx.closePath(); ctx.fillStyle = L.col; ctx.fill();
  }
  function frame() {
    t += 0.008; mx += (targetMx - mx) * 0.04;
    const sy = Math.min(scrollY * 0.12, 120);
    ctx.clearRect(0, 0, W, H);
    ctx.save(); ctx.translate(0, sy * 0.3);
    const g = ctx.createLinearGradient(0, 0, W, 0);
    g.addColorStop(0, 'rgba(34,211,238,0)'); g.addColorStop(0.5, 'rgba(94,234,212,0.10)'); g.addColorStop(1, 'rgba(34,211,238,0)');
    ctx.fillStyle = g; ctx.fillRect(0, H * 0.3, W, 3);
    layers.forEach((L, i) => wave(L, i * 1.7));
    drops.forEach((d) => {
      d.y -= d.s; if (d.y < -0.02) { d.y = 1.02; d.x = Math.random(); }
      const x = d.x * W + Math.sin(t * 2 + d.r * 5) * 12 + mx;
      const y = d.y * H * 0.9;
      ctx.beginPath(); ctx.arc(x, y, d.r, 0, 7);
      ctx.fillStyle = `rgba(165,243,252,${d.o})`; ctx.fill();
    });
    ctx.restore();
    if (!reduced) requestAnimationFrame(frame);
  }
  if (reduced) { t = 10; ctx.clearRect(0, 0, W, H); layers.forEach((L, i) => wave(L, i * 1.7)); }
  else frame();
})();
