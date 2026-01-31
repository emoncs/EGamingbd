/* =========================
   E-GAMING STORE - main.js (FULL FIXED + LIVE DOT BLINK)
   Fixes:
   ✅ Side-widgets footer overlap works (no ReferenceError)
   ✅ initSideWidgets() runs correctly (defined before init)
   ✅ Coupon percent bug fixed (EG10 = 10%)
   ✅ Coupon message fixed (EG100)
   ✅ No “auto hide” cart on remove (never auto-closes)
   ✅ Works even if floating FAB buttons are removed (optional)
   ✅ Right-sidebar cart triggers supported
   ✅ Login/Register route এ left/right widgets (sidebars) HIDE হবে
   ✅ Live Visitors pill dot blinks (JS-injected style)
========================= */

(() => {
  const $ = (s, p = document) => p.querySelector(s);
  const $$ = (s, p = document) => [...p.querySelectorAll(s)];

  /* ===== STORAGE KEYS ===== */
  const CART_KEY = "eg_cart";
  const USERS_KEY = "eg_users";
  const LOGIN_KEY = "eg_logged_in";
  const USER_KEY = "eg_user";
  const COUPON_KEY = "eg_coupon";
  const GAME_GENRE_KEY = "eg_game_genre";
  const LAST_ORDER_KEY = "eg_last_order";

  /* SIDE WIDGETS KEYS (must be before init) */
  const SW_POLL_KEY = "eg_sw_poll";        // {choice:"PC", ts:...}
  const SW_NEWS_KEY = "eg_sw_news_email";  // remember email (optional)

  /* ===== DATA ===== */
  const PRODUCTS = [
    {name:"Desktop", price:125000, cat:"PC", img:"desktop.jpg", rating:4.7, reviews:128, stock:12, delivery:"1-2 Days"},
    {name:"Gaming Laptop", price:110000, cat:"Laptop", img:"laptop.jpg", rating:4.6, reviews:96, stock:7, delivery:"2-3 Days"},
    {name:"Monitor 144Hz", price:25000, cat:"Monitor", img:"monitor.jpg", rating:4.5, reviews:210, stock:18, delivery:"1-2 Days"},
    {name:"Gaming PC", price:95000, cat:"PC", img:"pc.jpg", rating:4.6, reviews:74, stock:6, delivery:"2-3 Days"},
    {name:"Gaming Mouse", price:4500, cat:"Accessories", img:"mouse.jpg", rating:4.4, reviews:302, stock:25, delivery:"Same Day"},
    {name:"Nintendo", price:35000, cat:"Accessories", img:"nintendo.jpg", rating:4.8, reviews:58, stock:4, delivery:"2-3 Days"},
    {name:"GPU", price:65000, cat:"Accessories", img:"gpu.jpg", rating:4.7, reviews:41, stock:3, delivery:"2-4 Days"},
    {name:"Sound Box", price:12000, cat:"Accessories", img:"speaker.jpg", rating:4.3, reviews:88, stock:14, delivery:"1-2 Days"},
    {name:"Keyboard", price:7500, cat:"Accessories", img:"keyboard.jpg", rating:4.5, reviews:150, stock:20, delivery:"Same Day"},
    {name:"Gaming Console", price:55000, cat:"Accessories", img:"console.jpg", rating:4.6, reviews:64, stock:5, delivery:"2-3 Days"},
    {name:"Gaming Chair", price:22000, cat:"Accessories", img:"chair.jpg", rating:4.4, reviews:112, stock:9, delivery:"2-3 Days"},
    {name:"Gaming Headphone", price:8500, cat:"Accessories", img:"headphone.jpg", rating:4.5, reviews:190, stock:16, delivery:"1-2 Days"},
  ];

  const GAMES = [
    {name:"Call of Duty: Modern Ops", price:2999, genre:"Action", img:"cod.jpg", rating:4.6, reviews:1200, platform:"PC/Console", delivery:"Instant"},
    {name:"Apex Strike", price:0, genre:"Battle Royale", img:"apexlegends.jpeg", rating:4.5, reviews:9800, platform:"PC", delivery:"Instant"},
    {name:"Need for Speed: Nitro", price:2499, genre:"Racing", img:"needforspeed.jpg", rating:4.4, reviews:2100, platform:"PC", delivery:"Instant"},
    {name:"eFootball 2026", price:499, genre:"Sports", img:"efootball.jpg", rating:4.7, reviews:3400, platform:"Mobile/PC", delivery:"Instant"},
    {name:"FC 26 Ultimate Edition", price:6999, genre:"Sports", img:"fc26.jpg", rating:4.6, reviews:860, platform:"PC/Console", delivery:"Instant"},
    {name:"Elden Realm", price:3999, genre:"RPG", img:"eldenring.png", rating:4.8, reviews:5400, platform:"PC/Console", delivery:"Instant"},
  ];

  let compare = []; // runtime compare list

  /* ===== DOM ===== */
  const productsGrid = $("#products");
  const gamesGrid = $("#gamesGrid");

  const cartPanel = $("#cartPanel");
  const cartItems = $("#cartItems");
  const cartTotal = $("#cartTotal");
  const cartCount = $("#cartCount");

  const comparePanel = $("#comparePanel");
  const compareItems = $("#compareItems");

  const searchEl = $("#search");
  const categoryEl = $("#category");
  const sortEl = $("#sort");

  const gSearch = $("#gSearch");
  const gGenre = $("#gGenre");
  const gSort = $("#gSort");

  const navToggle = $("#navToggle");
  const navMenu = $("#navMenu");

  /* optional cat dropdown */
  const catDropdown = $("#catDropdown");
  const catDropBtn = $("#catDropBtn");
  const catDropMenu = $("#catDropMenu");

  /* games dropdown exists */
  const gamesDropdown = $("#gamesDropdown");
  const gamesDropBtn = $("#gamesDropBtn");
  const gamesDropMenu = $("#gamesDropMenu");

  /* modal */
  const modal = $("#productModal");
  const modalBody = $("#modalBody");
  const modalCheckout = $("#modalCheckout");

  /* auth */
  const authBtn = $("#authBtn");

  /* checkout */
  const summaryList = $("#summaryList");
  const sumSubtotal = $("#sumSubtotal");
  const sumDelivery = $("#sumDelivery");
  const sumFee = $("#sumFee");
  const sumTotal = $("#sumTotal");
  const clearCartBtn = $("#clearCartBtn");
  const placeOrderBtn = $("#placeOrderBtn");
  const orderMsg = $("#orderMsg");
  const successBox = $("#successBox");
  const successText = $("#successText");

  /* coupon */
  const couponCode = $("#couponCode");
  const applyCouponBtn = $("#applyCouponBtn");
  const couponMsg = $("#couponMsg");

  /* invoice + tracking */
  const invoiceCard = $("#invoiceCard");
  const printInvoiceBtn = $("#printInvoiceBtn");
  const printArea = $("#printArea");
  const trackCard = $("#trackCard");
  const refreshTrackBtn = $("#refreshTrackBtn");

  /* ===== HELPERS ===== */
  const money = (n) => `৳ ${(Number(n) || 0).toLocaleString("en-US")}`;

  const getCart = () => JSON.parse(localStorage.getItem(CART_KEY) || "[]");
  const setCart = (cart) => localStorage.setItem(CART_KEY, JSON.stringify(cart));

  const getUsers = () => JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
  const setUsers = (users) => localStorage.setItem(USERS_KEY, JSON.stringify(users));

  const isLoggedIn = () => localStorage.getItem(LOGIN_KEY) === "true";
  const getUser = () => JSON.parse(localStorage.getItem(USER_KEY) || "null");

  const setLoggedIn = (user) => {
    localStorage.setItem(LOGIN_KEY, "true");
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  };
  const logout = () => {
    localStorage.removeItem(LOGIN_KEY);
    localStorage.removeItem(USER_KEY);
  };

  function requireLogin() {
    if (!isLoggedIn()) {
      alert("⚠️ Please login to continue purchase.");
      location.hash = "#login";
      return false;
    }
    return true;
  }

  /* ===== COUPON ===== */
  const getCoupon = () => JSON.parse(localStorage.getItem(COUPON_KEY) || "null");
  const setCoupon = (c) => localStorage.setItem(COUPON_KEY, JSON.stringify(c));
  const clearCoupon = () => localStorage.removeItem(COUPON_KEY);

  function validateCoupon(code, subtotal) {
    const c = (code || "").trim().toUpperCase();
    if (!c) return null;

    // ✅ fixed: EG10 = 10%
    if (c === "EG10" && subtotal >= 5000) return { code: c, type: "percent", value: 10 };
    if (c === "EG100" && subtotal >= 3000) return { code: c, type: "flat", value: 100 };
    if (c === "FREESHIP" && subtotal >= 2000) return { code: c, type: "ship", value: 1 };

    return null;
  }

  function calcDiscount(coupon, subtotal, delivery) {
    if (!coupon) return 0;
    if (coupon.type === "percent") return Math.round(subtotal * (coupon.value / 100));
    if (coupon.type === "flat") return Math.min(subtotal, coupon.value);
    if (coupon.type === "ship") return delivery;
    return 0;
  }

  /* ===== INVOICE/TRACKING STORAGE ===== */
  const getLastOrder = () => JSON.parse(localStorage.getItem(LAST_ORDER_KEY) || "null");
  const setLastOrder = (o) => localStorage.setItem(LAST_ORDER_KEY, JSON.stringify(o));

  function genOrderId() {
    const t = Date.now().toString(36).toUpperCase();
    const r = Math.random().toString(36).slice(2, 6).toUpperCase();
    return `EG-${t}-${r}`;
  }

  function formatBDDate(ts) {
    try {
      return new Date(ts).toLocaleString("en-GB", {
        timeZone: "Asia/Dhaka",
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return new Date(ts).toLocaleString();
    }
  }

  function updateAuthButton() {
    if (!authBtn) return;
    if (isLoggedIn()) {
      const u = getUser();
      authBtn.textContent = u?.name ? `Hi, ${u.name.split(" ")[0]}` : "Account";
      authBtn.href = "#home";
      authBtn.dataset.mode = "logged";
    } else {
      authBtn.textContent = "Login";
      authBtn.href = "#login";
      authBtn.dataset.mode = "login";
    }
  }

  function starsHTML(rating) {
    const full = Math.floor(rating);
    const half = rating - full >= 0.5 ? 1 : 0;
    const empty = 5 - full - half;
    return `
      ${'<i class="fa-solid fa-star"></i>'.repeat(full)}
      ${half ? '<i class="fa-solid fa-star-half-stroke"></i>' : ""}
      ${'<i class="fa-regular fa-star"></i>'.repeat(empty)}
    `;
  }

  function stockClass(n) {
    if (n <= 5) return "low";
    return "ok";
  }

  /* =========================
     LIVE VISITORS (Vercel + Upstash)
     Tracks active visitors in last ~45s
     + JS injected blink for .nav-live .dot
  ========================= */
  function initLiveVisitors() {
    const el = document.getElementById("liveVisitors");
    if (!el) return;

    // ✅ inject blink animation style once (because user wants only JS)
    if (!document.getElementById("eg-live-blink-style")) {
      const st = document.createElement("style");
      st.id = "eg-live-blink-style";
      st.textContent = `
        @keyframes egLivePulse{
          0%,100%{ transform: scale(1); opacity: 1; }
          50%{ transform: scale(.82); opacity: .65; }
        }
        .nav-live .dot{
          animation: egLivePulse 1.1s ease-in-out infinite;
          transform-origin: center;
        }
      `;
      document.head.appendChild(st);
    }

    // stable session id per tab
    const SID_KEY = "eg_live_sid";
    let sid = sessionStorage.getItem(SID_KEY);
    if (!sid) {
      sid = (crypto?.randomUUID?.() || (`sid_${Date.now()}_${Math.random().toString(16).slice(2)}`));
      sessionStorage.setItem(SID_KEY, sid);
    }

    let timer = 0;

    const ping = async () => {
      try {
        const r = await fetch(`/presence`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sid })
        });
        if (!r.ok) throw new Error("bad response");
        const data = await r.json();
        if (typeof data.active === "number") el.textContent = String(data.active);
      } catch (e) {
        el.textContent = "—";
      }
    };

    const start = () => {
      stop();
      ping();
      timer = setInterval(ping, 10000); // every 10s
    };

    const stop = () => {
      if (timer) clearInterval(timer);
      timer = 0;
    };

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) stop();
      else start();
    });

    start();
  }

  /* ===== COMPARE ===== */
  function addToCompare(item) {
    if (!item) return;
    const key = `${item.type || ""}__${item.name}`;
    const exists = compare.some((x) => `${x.type}__${x.name}` === key);
    if (exists) return;
    compare.push(item);
    updateCompare();
  }

  function updateCompare() {
    if (!compareItems) return;
    if (!compare.length) {
      compareItems.innerHTML = "<p>No products to compare</p>";
      return;
    }
    compareItems.innerHTML = compare
      .map(
        (c, i) => `
        <div class="compare-row">
          <div class="compare-name" title="${c.name}">${c.name}</div>
          <div class="compare-price">${
            Number(c.price) === 0 ? "Free" : `৳${(Number(c.price) || 0).toLocaleString("en-US")}`
          }</div>
          <button class="compare-remove" type="button" data-rm-compare="${i}" aria-label="Remove">
            <i class="fa-solid fa-trash"></i>
          </button>
        </div>
      `
      )
      .join("");
  }

  function toggleCompare(open) {
    comparePanel?.classList.toggle("show", !!open);
    if (open) cartPanel?.classList.remove("show");
  }

  /* ===== CART ===== */
  function refreshCartUI() {
    const cart = getCart();
    let total = 0;

    if (cartItems) {
      if (!cart.length) {
        cartItems.innerHTML = "<p>Cart is empty</p>";
      } else {
        cartItems.innerHTML = cart
          .map((c, i) => {
            total += Number(c.price) || 0;
            const priceText =
              Number(c.price) === 0 ? "Free" : `৳${(Number(c.price) || 0).toLocaleString("en-US")}`;
            return `
              <div class="cart-row">
                <div class="cart-name" title="${c.name}">${c.name}</div>
                <div class="cart-price">${priceText}</div>
                <button class="cart-remove" type="button" data-rm-cart="${i}" aria-label="Remove">
                  <i class="fa-solid fa-trash"></i>
                </button>
              </div>
            `;
          })
          .join("");
      }
    }

    if (cartTotal) cartTotal.textContent = total.toLocaleString("en-US");
    if (cartCount) cartCount.textContent = cart.length;

    // ✅ IMPORTANT: do NOT auto-close cart when empty
  }

  function toggleCart(open) {
    cartPanel?.classList.toggle("show", !!open);
    if (open) comparePanel?.classList.remove("show");
  }

  /* ===== CARDS ===== */
  function cardHTML(item, idx, kind) {
    const isGame = kind === "game";
    const tag = isGame ? item.genre : item.cat;
    const priceText = Number(item.price) === 0 ? "Free" : money(item.price);

    return `
      <article class="pcard" data-kind="${kind}" data-id="${idx}">
        <div class="pimg"><img src="${item.img}" alt="${item.name}"></div>
        <div class="ptitle" title="${item.name}">${item.name}</div>

        <div class="pmeta">
          <span><i class="fa-solid fa-tag"></i> ${tag}</span>
          <span class="pprice">${priceText}</span>
        </div>

        <div class="pmeta2">
          <div class="stars" title="${item.rating} / 5 (${item.reviews} reviews)">
            <span>${starsHTML(item.rating)}</span>
            <b>${item.rating.toFixed(1)}</b>
            <span>(${item.reviews})</span>
          </div>
          <div class="stock ${isGame ? "ok" : stockClass(item.stock || 10)}">
            ${isGame ? item.platform || "Digital" : `Stock: ${item.stock}`}
          </div>
        </div>

        <div class="pmeta2" style="margin-top:8px;">
          <span><i class="fa-solid fa-truck-fast"></i> ${item.delivery}</span>
          <span><i class="fa-solid fa-shield"></i> Genuine</span>
        </div>

        <div class="pactions">
          <button class="btn btn-ghost" type="button" data-add="${idx}" data-kindadd="${kind}">
            <i class="fa-solid fa-cart-plus"></i> Add
          </button>
          <button class="btn btn-ghost" type="button" data-compare="${idx}" data-kindcmp="${kind}">
            <i class="fa-solid fa-code-compare"></i> Compare
          </button>
          <button class="btn btn-dark" type="button" data-details="${idx}" data-kinddet="${kind}">
            <i class="fa-solid fa-circle-info"></i> Details
          </button>
        </div>
      </article>
    `;
  }

  function renderProductsTo(list) {
    if (!productsGrid) return;
    productsGrid.innerHTML = "";
    list.forEach((p) => {
      const idx = PRODUCTS.indexOf(p);
      productsGrid.insertAdjacentHTML("beforeend", cardHTML(p, idx, "product"));
    });
  }

  function renderGamesTo(list) {
    if (!gamesGrid) return;
    gamesGrid.innerHTML = "";
    list.forEach((g) => {
      const idx = GAMES.indexOf(g);
      gamesGrid.insertAdjacentHTML("beforeend", cardHTML(g, idx, "game"));
    });
  }

  /* ===== FILTERS ===== */
  function applyProducts() {
    let list = [...PRODUCTS];

    const q = (searchEl?.value || "").trim().toLowerCase();
    if (q) list = list.filter((p) => p.name.toLowerCase().includes(q));

    const c = categoryEl?.value || "all";
    if (c !== "all") list = list.filter((p) => p.cat === c);

    const s = sortEl?.value || "default";
    if (s === "low") list.sort((a, b) => a.price - b.price);
    if (s === "high") list.sort((a, b) => b.price - a.price);

    renderProductsTo(list);
  }

  function applyGames() {
    let list = [...GAMES];

    const q = (gSearch?.value || "").trim().toLowerCase();
    if (q) list = list.filter((g) => g.name.toLowerCase().includes(q));

    const genre = gGenre?.value || "all";
    if (genre !== "all") list = list.filter((g) => g.genre === genre);

    const s = gSort?.value || "default";
    if (s === "low") list.sort((a, b) => (a.price || 0) - (b.price || 0));
    if (s === "high") list.sort((a, b) => (b.price || 0) - (a.price || 0));

    renderGamesTo(list);

    const sub = $("#gamesSub");
    if (sub) {
      sub.textContent =
        genre === "all" ? "Choose your favorite games. Instant digital delivery." : `Showing genre: ${genre}`;
    }
  }

  /* ===== MODAL ===== */
  function getSpecs(item, kind) {
    if (kind === "game") {
      return [
        ["Type", "Digital"],
        ["Platform", item.platform || "PC"],
        ["Delivery", item.delivery || "Instant"],
        ["Region", "Global/SEA"],
        ["Support", "9AM – 8PM"],
      ];
    }

    const name = (item.name || "").toLowerCase();
    let specs = [
      ["Warranty", "1 Year"],
      ["Condition", "New"],
      ["Delivery", item.delivery || "1-3 Days"],
    ];

    if (item.cat === "PC") {
      specs = [
        ["CPU", "Intel Core i5 / Ryzen 5"],
        ["RAM", "16GB DDR4"],
        ["Storage", "512GB SSD"],
        ["GPU", "RTX Series (Entry/Mid)"],
        ["Warranty", "1 Year Service"],
      ];
    } else if (item.cat === "Monitor") {
      specs = [
        ["Size", '24" / 27"'],
        ["Resolution", "Full HD / QHD"],
        ["Refresh Rate", "144Hz"],
        ["Panel", "IPS / VA"],
        ["Warranty", "3 Years"],
      ];
    } else if (name.includes("mouse")) {
      specs = [
        ["DPI", "Up to 12000"],
        ["Sensor", "Gaming Optical"],
        ["RGB", "Yes"],
        ["Connection", "USB / Wireless"],
        ["Warranty", "1 Year"],
      ];
    } else if (name.includes("headphone")) {
      specs = [
        ["Type", "Over-Ear Gaming"],
        ["Mic", "Noise Cancellation"],
        ["Surround", "Virtual 7.1"],
        ["Connection", "3.5mm / USB"],
        ["Warranty", "1 Year"],
      ];
    } else if (name.includes("console") || name.includes("nintendo")) {
      specs = [
        ["Type", "Gaming Console"],
        ["Storage", "512GB / 1TB"],
        ["Controller", "Included"],
        ["Online", "Supported"],
        ["Warranty", "1 Year"],
      ];
    } else if (name.includes("sound") || name.includes("speaker")) {
      specs = [
        ["Output", "20W - 60W"],
        ["Bass", "Deep Bass"],
        ["Connectivity", "BT / AUX / USB"],
        ["Remote", "Supported"],
        ["Warranty", "1 Year"],
      ];
    }

    return specs;
  }

  function openModal() {
    modal?.classList.add("show");
    modal?.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }
  function closeModal() {
    modal?.classList.remove("show");
    modal?.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  function openDetails(idx, kind) {
    const item = kind === "game" ? GAMES[idx] : PRODUCTS[idx];
    if (!item || !modalBody) return;

    const specs = getSpecs(item, kind);
    const tag = kind === "game" ? item.genre : item.cat;
    const priceText = Number(item.price) === 0 ? "Free" : money(item.price);

    modalBody.innerHTML = `
      <div class="pd-grid">
        <div class="pd-imgbox">
          <img src="${item.img}" alt="${item.name}">
        </div>

        <div class="pd-info">
          <h1>${item.name}</h1>

          <div class="pd-meta">
            <div class="pd-badge"><i class="fa-solid fa-tag"></i> ${tag}</div>
            <div class="pd-badge"><i class="fa-solid fa-star"></i> ${item.rating.toFixed(1)} (${item.reviews})</div>
            <div class="pd-badge"><i class="fa-solid fa-truck-fast"></i> ${item.delivery}</div>
            <div class="pd-badge"><i class="fa-solid fa-shield"></i> Genuine</div>
          </div>

          <div class="pd-price">${priceText}</div>

          <div class="pd-desc">
            Premium quality <strong>${item.name}</strong> for a smooth gaming experience.
            ${kind === "game" ? "Digital delivery with quick support." : "Reliable performance and clean shopping experience."}
          </div>

          <div class="pd-specs">
            <h3>Specifications</h3>
            ${specs
              .map(
                (s) => `
              <div class="spec">
                <span>${s[0]}</span>
                <strong>${s[1]}</strong>
              </div>
            `
              )
              .join("")}
          </div>

          <div class="pactions" style="margin-top:14px;">
            <button class="btn btn-ghost" type="button" id="pdAdd">
              <i class="fa-solid fa-cart-plus"></i> Add Cart
            </button>
            <button class="btn btn-ghost" type="button" id="pdCompare">
              <i class="fa-solid fa-code-compare"></i> Compare
            </button>
            <button class="btn btn-dark" type="button" id="pdCheckoutNow">
              <i class="fa-solid fa-bag-shopping"></i> Checkout
            </button>
          </div>
        </div>
      </div>
    `;

    $("#pdAdd")?.addEventListener("click", () => {
      if (!requireLogin()) return;
      const cart = getCart();
      cart.push({ ...item, type: kind });
      setCart(cart);
      refreshCartUI();
      toggleCart(true);
    });

    $("#pdCompare")?.addEventListener("click", () => {
      addToCompare({ ...item, type: kind });
      toggleCompare(true);
    });

    $("#pdCheckoutNow")?.addEventListener("click", () => {
      if (!requireLogin()) return;
      const cart = getCart();
      cart.push({ ...item, type: kind });
      setCart(cart);
      refreshCartUI();
      closeModal();
      location.hash = "#checkout";
    });

    if (modalCheckout) {
      modalCheckout.dataset.id = String(idx);
      modalCheckout.dataset.kind = kind;
    }
    openModal();
  }

  /* ===== CHECKOUT TOTALS ===== */
  function calcCheckoutTotals(cart) {
    let subtotal = 0;
    cart.forEach((c) => (subtotal += Number(c.price) || 0));

    const hasProduct = cart.some((x) => x.type === "product");
    const delivery = hasProduct ? 150 : 0;
    const fee = Math.max(0, Math.round(subtotal * 0.01));

    const coupon = getCoupon();
    const discountRaw = calcDiscount(coupon, subtotal, delivery);

    const deliveryAfter = Math.max(0, delivery - (coupon?.type === "ship" ? discountRaw : 0));
    const discountAfter = coupon?.type === "ship" ? 0 : discountRaw;

    const total = Math.max(0, subtotal + deliveryAfter + fee - discountAfter);

    return { subtotal, delivery: deliveryAfter, fee, discount: discountAfter, total, coupon };
  }

  function renderCheckout() {
    if (!summaryList) return;
    const cart = getCart();

    if (!cart.length) {
      summaryList.innerHTML = `<div style="padding:12px;color:#64748b;font-weight:900;">No items in cart.</div>`;
      if (sumSubtotal) sumSubtotal.textContent = money(0);
      if (sumDelivery) sumDelivery.textContent = money(0);
      if (sumFee) sumFee.textContent = money(0);
      if (sumTotal) sumTotal.textContent = money(0);
      successBox?.classList.remove("show");
      if (couponMsg) couponMsg.textContent = "";
      return;
    }

    summaryList.innerHTML = cart
      .map((c, i) => {
        const p = Number(c.price) || 0;
        const priceText = Number(c.price) === 0 ? "Free" : money(p);
        return `
          <div class="sum-row">
            <div class="sum-name" title="${c.name}">${c.name}</div>
            <div class="sum-price">${priceText}</div>
            <button class="sum-remove" type="button" data-sumrm="${i}" aria-label="Remove">
              <i class="fa-solid fa-trash"></i>
            </button>
          </div>
        `;
      })
      .join("");

    const { subtotal, delivery, fee, discount, total, coupon } = calcCheckoutTotals(cart);

    if (sumSubtotal) sumSubtotal.textContent = money(subtotal);
    if (sumDelivery) sumDelivery.textContent = money(delivery);
    if (sumFee) sumFee.textContent = money(fee);
    if (sumTotal) sumTotal.textContent = money(total);

    if (couponMsg) {
      if (coupon) {
        couponMsg.style.color = "#16a34a";
        couponMsg.textContent = `✅ Applied: ${coupon.code} | Discount: ${money(discount)}`;
      } else {
        couponMsg.style.color = "#64748b";
        couponMsg.textContent = " ";
      }
    }

    successBox?.classList.remove("show");
  }

  /* ===== INVOICE + TRACKING ===== */
  function buildInvoiceHTML(order) {
    const itemsHTML = order.items
      .map(
        (it) => `
      <div class="inv-row">
        <div class="inv-name">${it.name}</div>
        <div class="inv-price">${Number(it.price) === 0 ? "Free" : money(it.price)}</div>
      </div>
    `
      )
      .join("");

    return `
      <div class="inv-top">
        <div>
          <div class="inv-brand">E-Gaming</div>
          <div class="muted" style="margin-top:6px;font-weight:900;">Dhaka, Bangladesh • 16793</div>
        </div>
        <div class="inv-meta">
          <div>Order ID: <b>${order.orderId}</b></div>
          <div>Date: <b>${formatBDDate(order.createdAt)}</b></div>
          <div>Payment: <b>${order.paymentMethod}</b></div>
          ${order.deliveryEmail ? `<div>Email: <b>${order.deliveryEmail}</b></div>` : ""}
        </div>
      </div>

      <div class="inv-items">${itemsHTML}</div>

      <div class="inv-total">
        <div class="inv-line"><span>Subtotal</span><b>${money(order.totals.subtotal)}</b></div>
        <div class="inv-line"><span>Delivery</span><b>${money(order.totals.delivery)}</b></div>
        <div class="inv-line"><span>Service Fee</span><b>${money(order.totals.fee)}</b></div>
        ${order.totals.discount ? `<div class="inv-line"><span>Discount</span><b>- ${money(order.totals.discount)}</b></div>` : ""}
        <div class="inv-grand"><span>Total</span><b>${money(order.totals.total)}</b></div>
      </div>
    `;
  }

  function getTrackingStage(order) {
    const mins = Math.floor((Date.now() - order.createdAt) / 60000);
    if (mins < 2) return 1;
    if (mins < 10) return 2;
    if (mins < 30) return 3;
    return 4;
  }

  function buildTrackingHTML(order) {
    const stage = getTrackingStage(order);
    const hasGames = order.items.some((x) => x.type === "game");
    const steps = hasGames
      ? ["Payment Confirmed", "Digital Processing", "Delivery Sent", "Completed"]
      : ["Order Confirmed", "Processing", "Out for Delivery", "Delivered"];

    const li = steps
      .map((t, i) => {
        const n = i + 1;
        const cls = n < stage ? "done" : n === stage ? "active" : "";
        const desc =
          n === 1
            ? "We received your order."
            : n === 2
            ? "Preparing items / verifying payment."
            : n === 3
            ? hasGames
              ? "Sending codes to email."
              : "Rider is on the way."
            : "Order completed.";
        return `
          <li class="${cls}">
            <span class="tdot"></span>
            <div>
              <div>${t}</div>
              <div class="tdesc">${desc}</div>
            </div>
          </li>
        `;
      })
      .join("");

    return `
      <div class="track-grid">
        <div class="track-box">
          <h4>Status</h4>
          <ul class="track-steps">${li}</ul>
        </div>

        <div class="track-box">
          <h4>Route</h4>
          <div class="route-map">
            <div class="route-line">
              <span class="route-pin"><i class="fa-solid fa-location-dot"></i> Dhaka Hub</span>
              <i class="fa-solid fa-arrow-right"></i>
              <span class="route-pin"><i class="fa-solid fa-truck-fast"></i> Transit</span>
              <i class="fa-solid fa-arrow-right"></i>
              <span class="route-pin"><i class="fa-solid fa-house"></i> Customer</span>
            </div>
            <div class="muted" style="margin-top:10px;font-weight:900;">
              Order: <b style="color:#0b1220;">${order.orderId}</b> • Updated: <b style="color:#0b1220;">${formatBDDate(Date.now())}</b>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function renderInvoiceAndTracking() {
    const order = getLastOrder();
    if (!order) return;
    if (invoiceCard) invoiceCard.innerHTML = buildInvoiceHTML(order);
    if (trackCard) trackCard.innerHTML = buildTrackingHTML(order);
  }

  function printInvoice() {
    const order = getLastOrder();
    if (!order || !printArea) return;

    printArea.innerHTML = `
      <div style="font-family:Segoe UI,system-ui; padding:8px;">
        <h2 style="margin:0 0 10px;">E-Gaming Invoice</h2>
        <div style="margin-bottom:10px;">
          <div><b>Order ID:</b> ${order.orderId}</div>
          <div><b>Date:</b> ${formatBDDate(order.createdAt)}</div>
          <div><b>Payment:</b> ${order.paymentMethod}</div>
          ${order.deliveryEmail ? `<div><b>Email:</b> ${order.deliveryEmail}</div>` : ""}
        </div>
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:12px 0;" />
        <div>
          ${order.items
            .map(
              (it) => `
            <div style="display:flex;justify-content:space-between;gap:12px;padding:6px 0;border-bottom:1px dashed #e5e7eb;">
              <div style="font-weight:700;">${it.name}</div>
              <div style="font-weight:700;">${Number(it.price) === 0 ? "Free" : money(it.price)}</div>
            </div>
          `
            )
            .join("")}
        </div>
        <div style="margin-top:12px;">
          <div style="display:flex;justify-content:space-between;"><span>Subtotal</span><b>${money(order.totals.subtotal)}</b></div>
          <div style="display:flex;justify-content:space-between;"><span>Delivery</span><b>${money(order.totals.delivery)}</b></div>
          <div style="display:flex;justify-content:space-between;"><span>Service Fee</span><b>${money(order.totals.fee)}</b></div>
          ${order.totals.discount ? `<div style="display:flex;justify-content:space-between;"><span>Discount</span><b>- ${money(order.totals.discount)}</b></div>` : ""}
          <div style="display:flex;justify-content:space-between;margin-top:8px;font-size:18px;"><span>Total</span><b>${money(order.totals.total)}</b></div>
        </div>
        <p style="margin-top:14px;color:#64748b;font-weight:700;">Thank you for shopping with E-Gaming.</p>
      </div>
    `;
    window.print();
  }

  /* =========================
     SIDE WIDGETS LOGIC
  ========================= */
  function pickTopRated() {
    const all = [
      ...PRODUCTS.map((x) => ({ ...x, _kind: "product" })),
      ...GAMES.map((x) => ({ ...x, _kind: "game" })),
    ];
    all.sort((a, b) => {
      if ((b.rating || 0) !== (a.rating || 0)) return (b.rating || 0) - (a.rating || 0);
      return (b.reviews || 0) - (a.reviews || 0);
    });
    return all.slice(0, 4);
  }

  function pickNewArrivals() {
    const p = PRODUCTS.slice(-3).map((x) => ({ ...x, _kind: "product" }));
    const g = GAMES.slice(-2).map((x) => ({ ...x, _kind: "game" }));
    return [...g, ...p].slice(0, 4);
  }

  function renderMiniList(boxEl, items) {
    if (!boxEl) return;
    if (!items?.length) {
      boxEl.innerHTML = `<div class="sw-muted">No data</div>`;
      return;
    }
    boxEl.innerHTML = items
      .map((it) => {
        const price = Number(it.price) === 0 ? "Free" : money(it.price);
        const label = it._kind === "game" ? it.genre || "Game" : it.cat || "Product";
        return `
          <div class="sw-row" title="${it.name}">
            <div class="sw-name">${it.name}</div>
            <div class="sw-meta">${label} • ${price}</div>
          </div>
        `;
      })
      .join("");
  }

  function updateFooterStop() {
    const L = $("#leftWidgets");
    const R = $("#rightWidgets");

    if ((L && L.style.display === "none") || (R && R.style.display === "none")) {
      if (L) L.style.transform = "translateY(0)";
      if (R) R.style.transform = "translateY(0)";
      return;
    }

    const footer = $(".footer");
    if (!footer || (!L && !R)) return;

    const wide = window.matchMedia("(min-width: 1320px)").matches;
    if (!wide) {
      if (L) L.style.transform = "translateY(0)";
      if (R) R.style.transform = "translateY(0)";
      return;
    }

    const rootStyle = getComputedStyle(document.documentElement);
    const gap = parseInt(rootStyle.getPropertyValue("--swGap")) || 48;
    const top = parseInt(rootStyle.getPropertyValue("--swTop")) || 112;

    const footerTop = footer.getBoundingClientRect().top + window.scrollY;

    const handleOne = (el) => {
      if (!el) return;
      const h = el.getBoundingClientRect().height;
      const safety = 16;
      const naturalBottom = window.scrollY + top + h + safety;
      const limitBottom = footerTop - gap;
      const ty = Math.min(0, limitBottom - naturalBottom);
      el.style.transform = `translateY(${ty}px)`;
    };

    handleOne(L);
    handleOne(R);
  }

  function initSideWidgets() {
    renderMiniList($("#topRatedBox"), pickTopRated());
    renderMiniList($("#newArrivalsBox"), pickNewArrivals());

    const pollBox = $("#pollBox");
    const pollMsg = $("#pollMsg");
    const saved = JSON.parse(localStorage.getItem(SW_POLL_KEY) || "null");

    const showPollMsg = (text, ok = true) => {
      if (!pollMsg) return;
      pollMsg.style.color = ok ? "#16a34a" : "#ef4444";
      pollMsg.textContent = text;
    };

    if (saved?.choice) showPollMsg(`✅ You voted: ${saved.choice}`);

    pollBox?.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-poll]");
      if (!btn) return;
      const choice = btn.dataset.poll || "";
      localStorage.setItem(SW_POLL_KEY, JSON.stringify({ choice, ts: Date.now() }));
      showPollMsg(`✅ You voted: ${choice}`);
    });

    const form = $("#swNewsForm");
    const emailEl = $("#swNewsEmail");
    const msgEl = $("#swNewsMsg");

    const toastNews = (text, ok = true) => {
      if (!msgEl) return;
      msgEl.style.color = ok ? "#16a34a" : "#ef4444";
      msgEl.textContent = text;
    };

    const oldEmail = localStorage.getItem(SW_NEWS_KEY);
    if (emailEl && oldEmail) emailEl.value = oldEmail;

    form?.addEventListener("submit", (e) => {
      e.preventDefault();
      const em = (emailEl?.value || "").trim();
      if (!em || em.length < 6 || !em.includes("@")) {
        toastNews("❌ Please enter a valid email.", false);
        return;
      }
      localStorage.setItem(SW_NEWS_KEY, em);
      toastNews("✅ Subscribed! You’ll get deal alerts.");
      form.reset();
    });

    let raf = 0;
    const onMove = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(updateFooterStop);
    };
    window.addEventListener("scroll", onMove, { passive: true });
    window.addEventListener("resize", onMove);

    updateFooterStop();
  }

  function setSideWidgetsVisible(route) {
    const L = $("#leftWidgets");
    const R = $("#rightWidgets");
    const hide = route === "login" || route === "register";

    if (L) L.style.display = hide ? "none" : "";
    if (R) R.style.display = hide ? "none" : "";

    if (hide) {
      if (L) L.style.transform = "translateY(0)";
      if (R) R.style.transform = "translateY(0)";
    } else {
      updateFooterStop();
    }
  }

  /* ===== ROUTING ===== */
  function showRoute(route) {
    if (route === "checkout" && !requireLogin()) return;

    setSideWidgetsVisible(route);

    $$(".route").forEach((sec) => sec.classList.remove("show"));
    $(`#route-${route}`)?.classList.add("show");

    $$(".menu .nav-link").forEach((a) => a.classList.remove("active"));
    $(`.menu .nav-link[data-route="${route}"]`)?.classList.add("active");

    navMenu?.classList.remove("show");
    navToggle?.setAttribute("aria-expanded", "false");

    if (route === "games") {
      const saved = localStorage.getItem(GAME_GENRE_KEY) || "all";
      if (gGenre) gGenre.value = saved;
      applyGames();
    }
    if (route === "checkout") {
      renderCheckout();
      renderInvoiceAndTracking();
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleHashRoute() {
    const raw = (location.hash || "#home").replace("#", "");
    const route = ["home", "games", "checkout", "about", "contact", "login", "register"].includes(raw)
      ? raw
      : "home";
    showRoute(route);
  }

  /* ===== EVENTS ===== */
  function attachEvents() {
    searchEl?.addEventListener("input", applyProducts);
    categoryEl?.addEventListener("change", applyProducts);
    sortEl?.addEventListener("change", applyProducts);

    gSearch?.addEventListener("input", applyGames);
    gGenre?.addEventListener("change", () => {
      localStorage.setItem(GAME_GENRE_KEY, gGenre.value);
      applyGames();
    });
    gSort?.addEventListener("change", applyGames);

    $("#cartFab")?.addEventListener("click", () => {
      if (!requireLogin()) return;
      toggleCart(true);
    });
    $("#compareFab")?.addEventListener("click", () => toggleCompare(true));

    const openCartBySidebar = (e) => {
      const t = e.target.closest("#sideCartBtn, #rightCartBtn, [data-open-cart]");
      if (!t) return;
      if (!requireLogin()) return;
      toggleCart(true);
    };
    document.addEventListener("click", openCartBySidebar);

    $("#cartClose")?.addEventListener("click", () => toggleCart(false));
    $("#compareClose")?.addEventListener("click", () => toggleCompare(false));

    $("#checkoutBtn")?.addEventListener("click", () => {
      if (!requireLogin()) return;
      toggleCart(false);
      location.hash = "#checkout";
    });

    applyCouponBtn?.addEventListener("click", () => {
      if (!requireLogin()) return;

      const cart = getCart();
      if (!cart.length) {
        if (couponMsg) {
          couponMsg.style.color = "#ef4444";
          couponMsg.textContent = "❌ Cart is empty.";
        }
        return;
      }

      const code = (couponCode?.value || "").trim().toUpperCase();
      let subtotal = 0;
      cart.forEach((c) => (subtotal += Number(c.price) || 0));

      const valid = validateCoupon(code, subtotal);
      if (!valid) {
        clearCoupon();
        if (couponMsg) {
          couponMsg.style.color = "#ef4444";
          couponMsg.textContent = "❌ Invalid coupon (Try: EG10 / EG100 / FREESHIP)";
        }
        renderCheckout();
        return;
      }

      setCoupon(valid);
      if (couponMsg) {
        couponMsg.style.color = "#16a34a";
        couponMsg.textContent = `✅ Coupon applied: ${valid.code}`;
      }
      renderCheckout();
    });

    productsGrid?.addEventListener("click", (e) => {
      const addBtn = e.target.closest("[data-kindadd='product']");
      const cmpBtn = e.target.closest("[data-kindcmp='product']");
      const detBtn = e.target.closest("[data-kinddet='product']");
      const card = e.target.closest(".pcard");
      if (!card || card.dataset.kind !== "product") return;
      const idx = Number(card.dataset.id);

      if (addBtn) {
        if (!requireLogin()) return;
        const cart = getCart();
        cart.push({ ...PRODUCTS[idx], type: "product" });
        setCart(cart);
        refreshCartUI();
        toggleCart(true);
        return;
      }
      if (cmpBtn) {
        addToCompare({ ...PRODUCTS[idx], type: "product" });
        toggleCompare(true);
        return;
      }
      if (detBtn) {
        openDetails(idx, "product");
        return;
      }
      openDetails(idx, "product");
    });

    gamesGrid?.addEventListener("click", (e) => {
      const addBtn = e.target.closest("[data-kindadd='game']");
      const cmpBtn = e.target.closest("[data-kindcmp='game']");
      const detBtn = e.target.closest("[data-kinddet='game']");
      const card = e.target.closest(".pcard");
      if (!card || card.dataset.kind !== "game") return;
      const idx = Number(card.dataset.id);

      if (addBtn) {
        if (!requireLogin()) return;
        const cart = getCart();
        cart.push({ ...GAMES[idx], type: "game" });
        setCart(cart);
        refreshCartUI();
        toggleCart(true);
        return;
      }
      if (cmpBtn) {
        addToCompare({ ...GAMES[idx], type: "game" });
        toggleCompare(true);
        return;
      }
      if (detBtn) {
        openDetails(idx, "game");
        return;
      }
      openDetails(idx, "game");
    });

    cartItems?.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-rm-cart]");
      if (!btn) return;
      const i = Number(btn.dataset.rmCart);
      const cart = getCart();
      cart.splice(i, 1);
      setCart(cart);
      refreshCartUI();
      renderCheckout();
      // ✅ do NOT auto-close cart
    });

    compareItems?.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-rm-compare]");
      if (!btn) return;
      const i = Number(btn.dataset.rmCompare);
      compare.splice(i, 1);
      updateCompare();
    });

    navToggle?.addEventListener("click", () => {
      const isOpen = navMenu?.classList.toggle("show");
      navToggle.setAttribute("aria-expanded", String(!!isOpen));
    });

    if (catDropBtn && catDropdown) {
      catDropBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        catDropdown.classList.toggle("open");
        catDropBtn.setAttribute("aria-expanded", String(catDropdown.classList.contains("open")));
      });
    }
    if (catDropMenu) {
      catDropMenu.addEventListener("click", (e) => {
        const link = e.target.closest("a[data-cat]");
        if (!link) return;
        e.preventDefault();
        if (categoryEl) categoryEl.value = link.dataset.cat;
        applyProducts();
        catDropdown?.classList.remove("open");
        location.hash = "#home";
      });
    }

    gamesDropBtn?.addEventListener("click", (e) => {
      e.stopPropagation();
      gamesDropdown?.classList.toggle("open");
      gamesDropBtn.setAttribute("aria-expanded", String(gamesDropdown?.classList.contains("open")));
    });
    gamesDropMenu?.addEventListener("click", (e) => {
      const link = e.target.closest("a[data-genre]");
      if (!link) return;
      e.preventDefault();
      const genre = link.dataset.genre || "all";
      localStorage.setItem(GAME_GENRE_KEY, genre);
      if (gGenre) gGenre.value = genre;
      location.hash = "#games";
    });

    document.addEventListener("click", (e) => {
      if (catDropdown && !e.target.closest("#catDropdown")) catDropdown.classList.remove("open");
      if (!e.target.closest("#gamesDropdown")) gamesDropdown?.classList.remove("open");
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        toggleCart(false);
        toggleCompare(false);
        closeModal();
        catDropdown?.classList.remove("open");
        gamesDropdown?.classList.remove("open");
        navMenu?.classList.remove("show");
      }
    });

    modal?.addEventListener("click", (e) => {
      if (e.target.closest("[data-close]")) closeModal();
    });

    modalCheckout?.addEventListener("click", () => {
      if (!requireLogin()) return;

      const idx = Number(modalCheckout.dataset.id || "0");
      const kind = modalCheckout.dataset.kind || "product";
      const item = kind === "game" ? GAMES[idx] : PRODUCTS[idx];

      if (item) {
        const cart = getCart();
        cart.push({ ...item, type: kind });
        setCart(cart);
        refreshCartUI();
      }
      closeModal();
      location.hash = "#checkout";
    });

    $("#contactForm")?.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = ($("#cName")?.value || "").trim();
      const email = ($("#cEmail")?.value || "").trim();
      const msg = ($("#cMsg")?.value || "").trim();
      const out = $("#contactMsg");

      if (!name || !email || !msg) {
        if (out) {
          out.style.color = "#ef4444";
          out.textContent = "❌ Please fill all fields.";
        }
        return;
      }
      if (out) {
        out.style.color = "#16a34a";
        out.textContent = "✅ Message sent! We will contact you soon.";
      }
      e.target.reset();
    });

    $("#registerForm")?.addEventListener("submit", (e) => {
      e.preventDefault();

      const name = ($("#regName")?.value || "").trim();
      const email = ($("#regEmail")?.value || "").trim().toLowerCase();
      const pass = $("#regPass")?.value || "";

      const msg = $("#regMsg");
      const users = getUsers();

      if (!name || !email || !pass) {
        if (msg) {
          msg.style.color = "#ef4444";
          msg.textContent = "❌ Please fill all fields.";
        }
        return;
      }
      if (users.some((u) => u.email === email)) {
        if (msg) {
          msg.style.color = "#ef4444";
          msg.textContent = "❌ This email is already registered.";
        }
        return;
      }

      users.push({ name, email, pass });
      setUsers(users);

      if (msg) {
        msg.style.color = "#16a34a";
        msg.textContent = "✅ Registration successful! Redirecting to login...";
      }
      setTimeout(() => (location.hash = "#login"), 700);
    });

    $("#loginForm")?.addEventListener("submit", (e) => {
      e.preventDefault();

      const email = ($("#loginEmail")?.value || "").trim().toLowerCase();
      const pass = $("#loginPass")?.value || "";

      const msg = $("#loginMsg");
      const users = getUsers();

      const user = users.find((u) => u.email === email && u.pass === pass);
      if (!user) {
        if (msg) {
          msg.style.color = "#ef4444";
          msg.textContent = "❌ Invalid email or password.";
        }
        return;
      }

      setLoggedIn({ name: user.name, email: user.email });
      updateAuthButton();

      if (msg) {
        msg.style.color = "#16a34a";
        msg.textContent = "✅ Login successful! Redirecting...";
      }
      setTimeout(() => (location.hash = "#home"), 650);
    });

    authBtn?.addEventListener("click", (e) => {
      if (authBtn.dataset.mode === "logged") {
        e.preventDefault();
        const ok = confirm("Logout from your account?");
        if (ok) {
          logout();
          updateAuthButton();
          location.hash = "#home";
        }
      }
    });

    summaryList?.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-sumrm]");
      if (!btn) return;
      const i = Number(btn.dataset.sumrm);
      const cart = getCart();
      cart.splice(i, 1);
      setCart(cart);
      refreshCartUI();
      renderCheckout();
    });

    clearCartBtn?.addEventListener("click", () => {
      const ok = confirm("Clear all items from cart?");
      if (!ok) return;
      setCart([]);
      clearCoupon();
      refreshCartUI();
      renderCheckout();
    });

    placeOrderBtn?.addEventListener("click", () => {
      if (!requireLogin()) return;

      const cart = getCart();
      if (!cart.length) {
        if (orderMsg) {
          orderMsg.style.color = "#ef4444";
          orderMsg.textContent = "❌ Cart is empty.";
        }
        return;
      }

      const pay = $("input[name='pay']:checked")?.value || "bkash";
      const ref = ($("#payRef")?.value || "").trim();
      const email = ($("#deliveryEmail")?.value || "").trim();

      if (ref.length < 3) {
        if (orderMsg) {
          orderMsg.style.color = "#ef4444";
          orderMsg.textContent = "❌ Please enter Transaction/Reference info.";
        }
        return;
      }

      const hasGames = cart.some((x) => x.type === "game");
      if (hasGames && !email) {
        if (orderMsg) {
          orderMsg.style.color = "#ef4444";
          orderMsg.textContent = "❌ Please provide email for digital delivery.";
        }
        return;
      }

      const payName = pay === "bkash" ? "bKash" : pay === "nagad" ? "Nagad" : pay === "rocket" ? "Rocket" : "Card";

      const totals = calcCheckoutTotals(cart);
      const order = {
        orderId: genOrderId(),
        createdAt: Date.now(),
        paymentMethod: payName,
        paymentRef: ref,
        deliveryEmail: hasGames ? email : "",
        items: cart.map((x) => ({ name: x.name, price: x.price, type: x.type })),
        totals,
      };
      setLastOrder(order);

      setCart([]);
      clearCoupon();
      refreshCartUI();
      renderCheckout();

      if (orderMsg) {
        orderMsg.style.color = "#16a34a";
        orderMsg.textContent = "✅ Order placed successfully!";
      }

      if (successText) {
        successText.textContent = hasGames
          ? `Payment via ${payName}. Your digital items will be delivered to: ${email}`
          : `Payment via ${payName}. We will contact you for delivery confirmation.`;
      }
      successBox?.classList.add("show");

      renderInvoiceAndTracking();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });

    printInvoiceBtn?.addEventListener("click", printInvoice);
    refreshTrackBtn?.addEventListener("click", renderInvoiceAndTracking);

    window.addEventListener("hashchange", handleHashRoute);
  }

  /* ===== INIT ===== */
  function init() {
    applyProducts();
    applyGames();
    refreshCartUI();
    updateCompare();
    updateAuthButton();
    attachEvents();

    // ✅ live visitors
    initLiveVisitors();

    handleHashRoute();
    renderInvoiceAndTracking();
    initSideWidgets();

    const raw = (location.hash || "#home").replace("#", "");
    const route = ["home", "games", "checkout", "about", "contact", "login", "register"].includes(raw) ? raw : "home";
    setSideWidgetsVisible(route);
  }

  init();
})();
