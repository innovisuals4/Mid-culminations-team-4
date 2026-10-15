/* AURA PENS (new UI) — shared storefront. Home → shop.html → product.html?id=. Demo checkout. */
const PRODUCTS = [
  {
    id: 'inxo-ultra', name: 'INXO ULTRA', price: 20, category: 'Premium everyday pen',
    img: 'assets/inxo-ultra.jpg', tag: 'N°01 — LAUNCH EDITION', rating: '★★★★★', ratingNote: '4.8 · sample',
    url: 'product.html?id=inxo-ultra',
    desc: '“Meet INXO ULTRA by AURA PENS — a writing companion for everyday ideas, bold thoughts and creative possibilities. Simple, stylish, ready to make every word count.”',
    keywords: 'inxo inxo ultra pen aura pens writing ball pen blue premium everyday',
    specs: ['Model: INXO ULTRA by AURA PENS', '₹20 per pen, INR', 'Everyday ball pen — smooth, lightweight', 'Deep-ocean matte, silver accents', 'For notes, study, journaling, office'],
  },
  {
    id: 'inxo-marine', name: 'INXO MARINE', price: 35, category: 'Premium everyday pen',
    img: 'assets/pen-marine.jpg', tag: 'N°02 — SEA-TEAL EDITION', rating: '★★★★★', ratingNote: '4.9 · sample',
    url: 'product.html?id=inxo-marine',
    desc: '“Meet INXO MARINE — the calm of deep water in your hand. A smooth teal barrel, balanced grip and steady ink for long writing days.”',
    keywords: 'inxo marine teal green pen aura pens writing premium everyday sea',
    specs: ['Model: INXO MARINE by AURA PENS', '₹35 per pen, INR', 'Everyday ball pen — smooth, balanced grip', 'Sea-teal gloss, silver accents', 'For study, journaling, gifting'],
  },
  {
    id: 'aura-noir', name: 'AURA NOIR', price: 49, category: 'Signature gift pen',
    img: 'assets/pen-noir.jpg', tag: 'N°03 — BLACK GOLD EDITION', rating: '★★★★★', ratingNote: '5.0 · sample',
    url: 'product.html?id=aura-noir',
    desc: '“Meet AURA NOIR — matte black with gold accents for signings that matter. Weighted, assured, unforgettable.”',
    keywords: 'aura noir black gold pen gift signature premium luxury aura pens',
    specs: ['Model: AURA NOIR by AURA PENS', '₹49 per pen, INR', 'Signature pen — weighted, assured flow', 'Matte black, gold accents', 'For gifting, signings, desk display'],
  },
  {
    id: 'aura-lumen', name: 'AURA LUMEN', price: 29, category: 'Everyday comfort pen',
    img: 'assets/pen-lumen.jpg', tag: 'N°04 — IVORY EDITION', rating: '★★★★☆', ratingNote: '4.7 · sample',
    url: 'product.html?id=aura-lumen',
    desc: '“Meet AURA LUMEN — warm ivory with brass details. Light, gentle and easy on long pages.”',
    keywords: 'aura lumen ivory white brass pen comfort everyday aura pens',
    specs: ['Model: AURA LUMEN by AURA PENS', '₹29 per pen, INR', 'Comfort pen — light, gentle flow', 'Ivory satin, brass details', 'For notes, study, everyday carry'],
  },
];
// To use real photos later, save them as assets/<id>.jpg and change that pen's img above.
function currentProduct() {
  const id = new URLSearchParams(location.search).get('id');
  return PRODUCTS.find(p => p.id === id) || PRODUCTS[0];
}
const PD = currentProduct();
const $ = (s) => document.querySelector(s);
const on = (sel, evt, fn) => { const el = $(sel); if (el) el.addEventListener(evt, fn); return el; };
const fmt = (n) => '₹' + Number(n).toLocaleString('en-IN');
const state = { qty: 1, cart: load() };
function load() { try { return JSON.parse(localStorage.getItem('aura_cart_v1')) || {}; } catch { return {}; } }
function save() { try { localStorage.setItem('aura_cart_v1', JSON.stringify(state.cart)); } catch {} }
const count = () => Object.values(state.cart).reduce((a, b) => a + b, 0);
const subtotal = () => Object.entries(state.cart).reduce((s, [id, q]) => { const p = PRODUCTS.find(x => x.id === id); return s + (p ? p.price * q : 0); }, 0);

function toast(msg, err = false) {
  const w = $('#toastWrap'); if (!w) return;
  const el = document.createElement('div');
  el.className = 'toast' + (err ? ' error' : ''); el.textContent = msg; w.appendChild(el);
  setTimeout(() => { el.style.opacity = '0'; setTimeout(() => el.remove(), 300); }, 2600);
}

function renderQty() {
  const qv = $('#qtyVal'), qt = $('#qtyTotal'); if (!qv || !qt) return;
  qv.textContent = state.qty; qt.textContent = fmt(PD.price * state.qty);
}
on('#qtyMinus', 'click', () => { state.qty = Math.max(1, state.qty - 1); renderQty(); });
on('#qtyPlus', 'click', () => { state.qty = Math.min(99, state.qty + 1); renderQty(); });
renderQty();

/* ---------- shop listing (shop.html) ---------- */
(function renderShop() {
  const grid = $('#grid'); if (!grid) return;
  const sc = $('#shopCount');
  if (sc) sc.textContent = `${PRODUCTS.length} pens · tap any pen for details, quantity and checkout. Prices in INR.`;
  grid.innerHTML = '';
  PRODUCTS.forEach((p, i) => {
    const a = document.createElement('a');
    a.className = 'card reveal visible'; a.href = p.url;
    a.setAttribute('aria-label', `View ${p.name} details`);
    a.innerHTML = `<span class="card-img"><img src="${p.img}" alt="${p.name} pen" width="640" height="640" loading="lazy"/><span class="tag">N°0${i + 1}</span></span>
      <span class="card-body"><span class="cat">${p.category}</span>
      <span class="cname">${p.name}</span>
      <span class="cprice">₹${p.price} <small>· per pen</small></span>
      <span class="go">View product →</span></span>`;
    grid.appendChild(a);
  });
})();

/* ---------- product detail (product.html) ---------- */
(function renderProduct() {
  if (!$('#pdName')) return;
  document.title = `${PD.name} ₹${PD.price} — AURA PENS`;
  $('#pdName').textContent = PD.name;
  $('#pdCat').textContent = PD.category;
  $('#pdRate').innerHTML = `${PD.rating} <span>${PD.ratingNote}</span>`;
  $('#pdPrice').textContent = fmt(PD.price);
  $('#pdDesc').textContent = PD.desc;
  $('#pdTag').textContent = PD.tag;
  const cn = $('#crumbName'); if (cn) cn.textContent = PD.name;
  const img = $('#pdImg'); if (img) { img.src = PD.img; img.alt = `${PD.name} pen by AURA PENS`; }
  const sp = $('#pdSpecs'); if (sp) sp.innerHTML = PD.specs.map(s => `<li>${s}</li>`).join('');
  renderQty();
})();

const drawer = $('#cartDrawer'), scrim = $('#overlay'), modal = $('#checkoutModal');
function openCart() { if (!drawer) return; renderCart(); drawer.classList.add('open'); drawer.setAttribute('aria-hidden', 'false'); if (scrim) scrim.hidden = false; }
function closeCart() { if (!drawer) return; drawer.classList.remove('open'); drawer.setAttribute('aria-hidden', 'true'); if (scrim && !(modal && modal.classList.contains('open'))) scrim.hidden = true; }
on('#cartToggle', 'click', openCart);
on('#cartClose', 'click', closeCart);
on('#continueBtn', 'click', closeCart);
if (scrim) scrim.addEventListener('click', () => { closeCart(); closeCheckout(); });

function renderCart() {
  const box = $('#cartItems'); if (!box) return;
  const es = Object.entries(state.cart);
  const cc = $('#cartCount'), dc = $('#drawerCount'), st = $('#cartSubtotal');
  if (cc) cc.textContent = count();
  if (dc) dc.textContent = `(${count()})`;
  if (st) st.textContent = fmt(subtotal());
  if (!es.length) { box.innerHTML = `<div class="demo">Your cart is empty.<br/>Add the INXO ULTRA pen to get started.</div>`; return; }
  box.innerHTML = '';
  es.forEach(([id, q]) => {
    const p = PRODUCTS.find(x => x.id === id); if (!p) return;
    const d = document.createElement('div'); d.className = 'ci';
    d.innerHTML = `<img src="${p.img}" alt="${p.name}"/><div><strong>${p.name}</strong><br/><small>${fmt(p.price)} × ${q} = <strong>${fmt(p.price * q)}</strong></small>
      <div class="ci-qty"><button aria-label="Decrease">−</button><span>${q}</span><button aria-label="Increase">+</button></div>
      <button class="ci-remove">Remove</button></div><strong>${fmt(p.price * q)}</strong>`;
    const [dec, inc] = d.querySelectorAll('.ci-qty button');
    dec.onclick = () => { state.cart[id] = Math.max(0, q - 1); if (!state.cart[id]) delete state.cart[id]; save(); renderCart(); };
    inc.onclick = () => { state.cart[id] = Math.min(99, q + 1); save(); renderCart(); };
    d.querySelector('.ci-remove').onclick = () => { delete state.cart[id]; save(); renderCart(); toast('Removed from cart'); };
    box.appendChild(d);
  });
}
renderCart();
on('#addToCartBtn', 'click', () => {
  state.cart[PD.id] = (state.cart[PD.id] || 0) + state.qty;
  save(); renderCart(); toast(`${state.qty} × ${PD.name} added — ${fmt(PD.price * state.qty)}`); openCart();
});
on('#buyNowBtn', 'click', () => {
  state.cart[PD.id] = (state.cart[PD.id] || 0) + state.qty;
  save(); renderCart(); openCheckout();
});

/* search → product page */
const panel = $('#searchPanel'), inp = $('#searchInput'), clr = $('#searchClear'), res = $('#searchResults'), tog = $('#searchToggle');
function setSearch(o) {
  if (!panel) return;
  panel.classList.toggle('open', o); panel.setAttribute('aria-hidden', String(!o));
  if (tog) tog.setAttribute('aria-expanded', String(o));
  if (o) { runSearch(''); setTimeout(() => inp && inp.focus(), 100); }
}
if (tog) tog.addEventListener('click', () => setSearch(!panel.classList.contains('open')));
if (inp) inp.addEventListener('input', () => { if (clr) clr.hidden = !inp.value; runSearch(inp.value); });
if (clr) clr.addEventListener('click', () => { inp.value = ''; clr.hidden = true; runSearch(''); inp.focus(); });
function runSearch(q) {
  if (!res) return;
  q = (q || '').trim().toLowerCase();
  const hits = PRODUCTS.filter(p => !q || (p.name + ' ' + p.category + ' ' + p.keywords).toLowerCase().includes(q));
  res.innerHTML = '';
  if (!hits.length) { res.innerHTML = `<div class="demo">No pens for “${esc(inp.value)}”. Try “INXO” or “pen”.</div>`; return; }
  hits.forEach(p => {
    const b = document.createElement('button'); b.className = 'sr-item';
    b.innerHTML = `<img src="${p.img}" alt=""/><span><strong>${p.name}</strong><br/><small>${p.category} · ${fmt(p.price)}</small></span><span style="margin-left:auto;font-weight:800">→</span>`;
    b.onclick = () => { location.href = p.url; };
    res.appendChild(b);
  });
}
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/* checkout */
function openCheckout() {
  if (!modal) return;
  if (!count()) { toast('Your cart is empty — add a pen first', true); return; }
  closeCart(); summary();
  modal.classList.add('open'); modal.setAttribute('aria-hidden', 'false'); if (scrim) scrim.hidden = false;
}
function closeCheckout() { if (!modal) return; modal.classList.remove('open'); modal.setAttribute('aria-hidden', 'true'); if (scrim && !(drawer && drawer.classList.contains('open'))) scrim.hidden = true; }
on('#checkoutBtn', 'click', openCheckout);
on('#checkoutClose', 'click', closeCheckout);
function summary() {
  const box = $('#orderSummary'); if (!box) return;
  box.innerHTML = Object.entries(state.cart).map(([id, q]) => {
    const p = PRODUCTS.find(x => x.id === id);
    return `<div style="display:flex;justify-content:space-between"><span>${p.name} × ${q}</span><strong>${fmt(p.price * q)}</strong></div>`;
  }).join('') + `<div style="display:flex;justify-content:space-between;border-top:1px solid #33475c;padding-top:8px"><span>Total</span><strong>${fmt(subtotal())}</strong></div>`;
  const ot = $('#orderTotal'); if (ot) ot.textContent = fmt(subtotal());
}
const ferr = (i, e, m) => { if (e) e.textContent = m || ''; if (i) i.style.borderColor = m ? '#b91c1c' : ''; return !m; };
const coForm = $('#checkoutForm');
if (coForm) coForm.addEventListener('submit', e => {
  e.preventDefault();
  const n = $('#oName'), ph = $('#oPhone'), ad = $('#oAddress');
  const dg = ph.value.replace(/\D/g, '').replace(/^91(?=\d{10}$)/, '');
  let ok = true;
  ok = ferr(n, $('#oNameErr'), n.value.trim().length < 3 ? 'Please enter your full name' : '') && ok;
  ok = ferr(ph, $('#oPhoneErr'), !/^[6-9]\d{9}$/.test(dg) ? 'Enter a valid 10-digit Indian mobile number' : '') && ok;
  ok = ferr(ad, $('#oAddressErr'), ad.value.trim().length < 12 ? 'Please enter a full delivery address with PIN' : '') && ok;
  const cm = $('#checkoutMsg');
  if (!ok) { if (cm) { cm.textContent = 'Please fix the highlighted fields.'; cm.className = 'form-msg bad'; } return; }
  const btn = $('#placeOrderBtn'); if (btn) { btn.disabled = true; btn.textContent = 'PLACING ORDER…'; }
  setTimeout(() => {
    const oid = 'AURA-' + Math.random().toString(36).slice(2, 8).toUpperCase();
    const tot = subtotal(); state.cart = {}; save(); renderCart(); summary();
    if (cm) { cm.textContent = `✓ Demo order ${oid} for ${n.value.trim()} — ${fmt(tot)}. No payment charged. We’ll call ${dg}.`; cm.className = 'form-msg ok'; }
    toast(`Order ${oid} placed (demo) — ${fmt(tot)}`);
    if (btn) { btn.disabled = false; btn.innerHTML = `CONFIRM · <span id="orderTotal">${fmt(0)}</span>`; }
  }, 900);
});

/* contact */
const cForm = $('#contactForm');
if (cForm) cForm.addEventListener('submit', e => {
  e.preventDefault();
  const n = $('#cName'), em = $('#cEmail'), m = $('#cMsg');
  let ok = true;
  ok = ferr(n, $('#cNameErr'), n.value.trim().length < 2 ? 'Please enter your name' : '') && ok;
  ok = ferr(em, $('#cEmailErr'), !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em.value.trim()) ? 'Enter a valid email' : '') && ok;
  ok = ferr(m, $('#cMsgErr'), m.value.trim().length < 10 ? 'Message should be at least 10 characters' : '') && ok;
  const msg = $('#contactMsg');
  if (!ok) { if (msg) { msg.textContent = 'Please fix the highlighted fields.'; msg.className = 'form-msg bad'; } return; }
  const btn = $('#contactSubmit'); if (btn) { btn.disabled = true; btn.textContent = 'SENDING…'; }
  setTimeout(() => {
    if (msg) { msg.textContent = `✓ Thanks ${n.value.trim().split(' ')[0]}! Message received (demo). We’ll reply to ${em.value.trim()} soon.`; msg.className = 'form-msg ok'; }
    e.target.reset(); if (btn) { btn.disabled = false; btn.textContent = 'SUBMIT'; }
    toast('Message sent (demo)');
  }, 700);
});
document.querySelectorAll('[data-placeholder]').forEach(a => a.addEventListener('click', e => { e.preventDefault(); toast(`${a.textContent} link not set`, true); }));

/* reveal */
const io = new IntersectionObserver(es => es.forEach(en => en.isIntersecting && en.target.classList.add('visible')), { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach(el => io.observe(el));
addEventListener('keydown', e => { if (e.key === 'Escape') { setSearch(false); closeCart(); closeCheckout(); } });
const yr = $('#year'); if (yr) yr.textContent = new Date().getFullYear();

/* ocean wash for hero */
(function ocean() {
  const cv = $('#oceanCanvas'); if (!cv) return;
  const ctx = cv.getContext('2d');
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  let W, H, t = 0;
  const N = 60, drops = Array.from({ length: N }, () => ({ x: Math.random(), y: Math.random(), r: Math.random() * 2 + .6, s: Math.random() * .0009 + .0003, o: Math.random() * .45 + .15 }));
  function size() { const d = Math.min(devicePixelRatio || 1, 2); W = cv.clientWidth; H = cv.clientHeight; cv.width = W * d; cv.height = H * d; ctx.setTransform(d, 0, 0, d, 0, 0); }
  size(); addEventListener('resize', size);
  const layers = [
    { y: .66, amp: 24, sp: .013, col: 'rgba(94,200,190,.16)' },
    { y: .76, amp: 32, sp: .009, col: 'rgba(20,90,110,.5)' },
    { y: .86, amp: 26, sp: .011, col: 'rgba(6,20,34,.7)' },
  ];
  (function frame() {
    t += .008; ctx.clearRect(0, 0, W, H);
    layers.forEach((L, i) => {
      ctx.beginPath(); ctx.moveTo(0, H);
      for (let x = 0; x <= W; x += 8) ctx.lineTo(x, H * L.y + Math.sin(x * .012 + t * L.sp * 60 + i * 1.7) * L.amp);
      ctx.lineTo(W, H); ctx.closePath(); ctx.fillStyle = L.col; ctx.fill();
    });
    drops.forEach(d => {
      d.y -= d.s; if (d.y < 0) { d.y = 1; d.x = Math.random(); }
      ctx.beginPath(); ctx.arc(d.x * W, d.y * H * .85, d.r, 0, 7);
      ctx.fillStyle = `rgba(180,240,225,${d.o})`; ctx.fill();
    });
    requestAnimationFrame(frame);
  })();
})();
