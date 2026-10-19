/* Ala-Too: menu, cart and navigation behavior. No dependencies. */
(function () {
  'use strict';

  /* ------------------------------------------------------------------
     Configuration
     ------------------------------------------------------------------ */
  const TAX_RATE = 0.08; // Estimated sales tax. Adjust to your local rate.
  const MAX_QTY = 20;
  const STORAGE_KEY = 'alatoo-cart-v1';

  const CATEGORIES = [
    { id: 'all', label: 'All dishes' },
    { id: 'mains', label: 'Mains' },
    { id: 'noodles', label: 'Noodles & soups' },
    { id: 'dumplings', label: 'Dumplings & breads' },
    { id: 'drinks', label: 'Tea & drinks' },
  ];

  /* Prices are stored in cents to avoid floating point errors. */
  const MENU = [
    {
      id: 'beshbarmak',
      category: 'mains',
      name: 'Beshbarmak',
      local: 'Бешбармак',
      cents: 2400,
      tag: 'Signature',
      description:
        'The national dish. Tender boiled lamb and beef over hand-cut noodles, crowned with soft onions and a cup of rich broth on the side. Its name means "five fingers".',
    },
    {
      id: 'plov',
      category: 'mains',
      name: 'Plov',
      local: 'Палоо',
      cents: 1800,
      tag: 'Slow-cooked',
      description:
        'Rice cooked in a heavy kazan with lamb, golden carrots, garlic and cumin until every grain is glossy and fragrant.',
    },
    {
      id: 'kuurdak',
      category: 'mains',
      name: 'Kuurdak',
      local: 'Куурдак',
      cents: 2000,
      tag: 'Hearty',
      description:
        'Lamb pan-fried with onions and golden potatoes until the edges crisp, then finished with fresh herbs and black pepper.',
    },
    {
      id: 'lagman',
      category: 'noodles',
      name: 'Lagman',
      local: 'Лагман',
      cents: 1500,
      tag: 'Hand-pulled',
      description:
        'Noodles pulled by hand and served in a savory stew of beef, peppers, tomato and garlic, scattered with cilantro.',
    },
    {
      id: 'shorpo',
      category: 'noodles',
      name: 'Shorpo',
      local: 'Шорпо',
      cents: 1300,
      tag: 'Comforting',
      description:
        'A clear lamb broth with a generous cut of meat, potatoes, carrots and dill. Simple, warming and deeply savory.',
    },
    {
      id: 'manty',
      category: 'dumplings',
      name: 'Manty',
      local: 'Манты',
      cents: 1600,
      tag: 'Steamed',
      description:
        'Large steamed dumplings filled with hand-chopped lamb and onion, juicy inside and served with cool sour cream.',
    },
    {
      id: 'samsa',
      category: 'dumplings',
      name: 'Samsa',
      local: 'Самса',
      cents: 700,
      tag: 'Baked',
      description:
        'Two flaky, oven-baked pastries with spiced lamb and onion, topped with sesame seeds.',
    },
    {
      id: 'boorsok',
      category: 'dumplings',
      name: 'Boorsok',
      local: 'Боорсок',
      cents: 800,
      tag: 'Vegetarian',
      description:
        'Golden fried dough pillows, a fixture of every Kyrgyz celebration. Served warm with honey.',
    },
    {
      id: 'chai',
      category: 'drinks',
      name: 'Kyrgyz tea',
      local: 'Чай',
      cents: 500,
      tag: 'Pot for two',
      description:
        'Fragrant black tea served by the pot with jam and sweets, so the conversation can go on as long as you like.',
    },
    {
      id: 'kompot',
      category: 'drinks',
      name: 'Kompot',
      local: 'Компот',
      cents: 450,
      tag: 'Chilled',
      description:
        'A lightly sweet chilled drink of dried apricots, apples and raisins, as made in homes across the country.',
    },
  ];

  /* ------------------------------------------------------------------
     Dish illustrations (original vector artwork, no external images)
     ------------------------------------------------------------------ */
  const plate =
    '<ellipse cx="200" cy="180" rx="156" ry="98" fill="#8a7a58" opacity="0.28"/>' +
    '<ellipse cx="200" cy="168" rx="156" ry="98" fill="#fbf6ec" stroke="#d9ccb0" stroke-width="3"/>' +
    '<ellipse cx="200" cy="168" rx="128" ry="76" fill="#f3e8d2"/>';

  function diamond(cx, cy, w, h, fill) {
    return (
      '<polygon points="' +
      [cx - w, cy, cx, cy - h, cx + w, cy, cx, cy + h].join(' ') +
      '" fill="' + fill + '" stroke="#cdb36a" stroke-width="2" stroke-linejoin="round"/>'
    );
  }

  function ring(cx, cy, rx, ry) {
    return '<ellipse cx="' + cx + '" cy="' + cy + '" rx="' + rx + '" ry="' + ry +
      '" fill="none" stroke="#fffaf0" stroke-width="4"/>';
  }

  function steam(x, y) {
    return '<path d="M' + x + ' ' + y + ' q-10 -14 0 -28 t0 -28" fill="none" stroke="#ffffff" stroke-width="4" stroke-linecap="round" opacity="0.7"/>';
  }

  function dill(x, y) {
    return '<path d="M' + x + ' ' + y + ' l-10 -14 M' + x + ' ' + y + ' l0 -18 M' + x + ' ' + y +
      ' l10 -14" stroke="#3f8f4a" stroke-width="3" stroke-linecap="round" fill="none"/>';
  }

  const ART = {
    beshbarmak: {
      bg: '#efdcc0',
      body:
        plate +
        diamond(150, 178, 38, 22, '#f4e5b6') +
        diamond(205, 192, 38, 22, '#f2e0a8') +
        diamond(255, 176, 38, 22, '#f4e5b6') +
        diamond(172, 154, 36, 20, '#f2e0a8') +
        diamond(232, 152, 36, 20, '#f4e5b6') +
        '<ellipse cx="185" cy="128" rx="34" ry="19" fill="#9b5a3a"/>' +
        '<ellipse cx="226" cy="122" rx="30" ry="18" fill="#8a4c2f"/>' +
        '<ellipse cx="204" cy="104" rx="28" ry="16" fill="#a8663f"/>' +
        '<path d="M170 126 q14 -8 28 0 M212 120 q12 -8 26 0 M192 102 q12 -7 24 0" stroke="#c98d62" stroke-width="3" fill="none" stroke-linecap="round"/>' +
        ring(160, 112, 16, 8) + ring(248, 138, 18, 9) + ring(202, 140, 16, 8) + ring(130, 150, 14, 7) +
        dill(268, 120) + dill(140, 134) +
        '<path d="M282 232 H378 Q374 276 330 276 Q286 276 282 232Z" fill="#1d6b73"/>' +
        '<ellipse cx="330" cy="232" rx="48" ry="14" fill="#2a828b"/>' +
        '<ellipse cx="330" cy="233" rx="40" ry="10" fill="#e8b64a"/>',
    },
    plov: {
      bg: '#f0d4c8',
      body:
        plate +
        '<path d="M96 178 Q200 52 304 178 Q200 222 96 178Z" fill="#e6b947"/>' +
        '<path d="M120 170 Q200 84 280 170" fill="none" stroke="#f3d37a" stroke-width="10" stroke-linecap="round" opacity="0.7"/>' +
        '<g stroke="#e8742a" stroke-width="5" stroke-linecap="round">' +
        '<path d="M150 150 l16 -8"/><path d="M178 120 l14 10"/><path d="M214 112 l16 -6"/>' +
        '<path d="M240 140 l14 8"/><path d="M196 150 l16 6"/><path d="M130 172 l14 -4"/><path d="M262 168 l14 -2"/>' +
        '</g>' +
        '<ellipse cx="170" cy="136" rx="17" ry="11" fill="#8a4c2f"/>' +
        '<ellipse cx="226" cy="132" rx="18" ry="11" fill="#9b5a3a"/>' +
        '<ellipse cx="200" cy="108" rx="16" ry="10" fill="#8a4c2f"/>' +
        '<g fill="#5b2a5e"><circle cx="152" cy="162" r="5"/><circle cx="246" cy="158" r="5"/><circle cx="210" cy="164" r="5"/><circle cx="188" cy="140" r="5"/></g>' +
        '<ellipse cx="206" cy="86" rx="20" ry="16" fill="#fffaf0" stroke="#e3d8c0" stroke-width="2"/>' +
        '<path d="M206 70 q2 -8 6 -10" stroke="#c9bd9e" stroke-width="3" fill="none" stroke-linecap="round"/>' +
        '<path d="M196 90 q10 6 20 0 M206 72 v18" stroke="#e3d8c0" stroke-width="2" fill="none"/>',
    },
    kuurdak: {
      bg: '#d9e3ea',
      body:
        '<ellipse cx="200" cy="182" rx="158" ry="96" fill="#10151d" opacity="0.3"/>' +
        '<rect x="328" y="150" width="68" height="18" rx="9" fill="#2b2b30"/>' +
        '<ellipse cx="200" cy="170" rx="150" ry="92" fill="#2b2b30"/>' +
        '<ellipse cx="200" cy="166" rx="136" ry="80" fill="#4a4a52"/>' +
        '<ellipse cx="200" cy="168" rx="128" ry="72" fill="#6b3d28"/>' +
        '<g fill="#9b5a3a"><ellipse cx="150" cy="150" rx="24" ry="14"/><ellipse cx="214" cy="140" rx="26" ry="14"/><ellipse cx="260" cy="170" rx="24" ry="14"/><ellipse cx="180" cy="196" rx="24" ry="13"/></g>' +
        '<g fill="#e6c36a" stroke="#c8a24a" stroke-width="2"><rect x="120" y="170" width="32" height="20" rx="8" transform="rotate(-18 136 180)"/><rect x="226" y="172" width="34" height="20" rx="8" transform="rotate(14 243 182)"/><rect x="172" y="120" width="32" height="20" rx="8" transform="rotate(10 188 130)"/><rect x="234" y="206" width="32" height="18" rx="8"/><rect x="110" y="140" width="30" height="18" rx="8" transform="rotate(20 125 149)"/></g>' +
        ring(196, 168, 18, 9) + ring(268, 138, 16, 8) + ring(150, 208, 16, 8) +
        '<g fill="#c0392b"><rect x="206" y="196" width="12" height="8" rx="3"/><rect x="146" y="176" width="12" height="8" rx="3"/><rect x="250" y="120" width="12" height="8" rx="3"/></g>' +
        dill(210, 122) + dill(170, 190) + dill(280, 190),
    },
    lagman: {
      bg: '#efdcc0',
      body:
        '<ellipse cx="200" cy="262" rx="130" ry="16" fill="#8a7a58" opacity="0.3"/>' +
        '<path d="M66 150 H334 Q334 254 200 254 Q66 254 66 150Z" fill="#1d6b73"/>' +
        '<path d="M80 200 H320" stroke="#e8a923" stroke-width="5" opacity="0.9"/>' +
        '<ellipse cx="200" cy="150" rx="134" ry="36" fill="#2a828b"/>' +
        '<ellipse cx="200" cy="152" rx="120" ry="28" fill="#c9772e"/>' +
        '<g fill="none" stroke="#f2e2b0" stroke-width="7" stroke-linecap="round">' +
        '<path d="M112 152 Q140 128 168 152 T224 152 T288 152"/>' +
        '<path d="M126 164 Q154 140 182 164 T238 164 T282 160"/>' +
        '<path d="M120 142 Q150 120 178 142 T236 142 T278 140"/>' +
        '<path d="M150 154 Q176 134 204 154 T256 150"/>' +
        '</g>' +
        '<g fill="#8a4c2f"><ellipse cx="170" cy="146" rx="14" ry="8"/><ellipse cx="238" cy="154" rx="14" ry="8"/><ellipse cx="206" cy="136" rx="12" ry="7"/></g>' +
        '<g fill="#d63a2a"><rect x="136" y="158" width="14" height="8" rx="3"/><rect x="258" y="144" width="14" height="8" rx="3"/></g>' +
        '<g fill="#e3a521"><rect x="190" y="160" width="14" height="8" rx="3"/><rect x="224" y="140" width="14" height="8" rx="3"/></g>' +
        dill(160, 138) + dill(262, 164) +
        steam(160, 100) + steam(200, 96) + steam(240, 100),
    },
    shorpo: {
      bg: '#dfe6df',
      body:
        '<ellipse cx="200" cy="262" rx="130" ry="16" fill="#8a7a58" opacity="0.3"/>' +
        '<path d="M66 150 H334 Q334 254 200 254 Q66 254 66 150Z" fill="#8f1d17"/>' +
        '<path d="M80 200 H320" stroke="#e8a923" stroke-width="5"/>' +
        '<ellipse cx="200" cy="150" rx="134" ry="36" fill="#b3261e"/>' +
        '<ellipse cx="200" cy="152" rx="120" ry="28" fill="#e8b64a"/>' +
        '<ellipse cx="200" cy="152" rx="104" ry="22" fill="#f0c968" opacity="0.7"/>' +
        '<ellipse cx="178" cy="146" rx="30" ry="14" fill="#9b5a3a"/>' +
        '<circle cx="152" cy="142" r="7" fill="#fffaf0"/><circle cx="148" cy="150" r="7" fill="#fffaf0"/>' +
        '<g fill="#e6c36a" stroke="#c8a24a" stroke-width="2"><rect x="222" y="140" width="26" height="18" rx="7"/><rect x="254" y="152" width="24" height="16" rx="7"/></g>' +
        '<g fill="#e8742a"><circle cx="214" cy="164" r="8"/><circle cx="244" cy="136" r="8"/><circle cx="130" cy="158" r="7"/></g>' +
        dill(200, 160) + dill(270, 144) + dill(120, 150) +
        steam(170, 100) + steam(230, 98),
    },
    manty: {
      bg: '#f0d4c8',
      body:
        plate +
        [[148, 166], [214, 150], [272, 178], [184, 204], [246, 214]].map(function (p) {
          return (
            '<g transform="translate(' + p[0] + ' ' + p[1] + ')">' +
            '<ellipse cx="0" cy="4" rx="38" ry="28" fill="#d8c694" opacity="0.6"/>' +
            '<ellipse cx="0" cy="0" rx="36" ry="27" fill="#f8eed6" stroke="#dcc99a" stroke-width="2"/>' +
            '<path d="M-16 -14 Q0 -26 16 -14 M-20 -6 Q0 -22 20 -6 M-8 -18 l-3 -8 M0 -20 v-8 M8 -18 l3 -8" fill="none" stroke="#d3bd86" stroke-width="2.5" stroke-linecap="round"/>' +
            '</g>'
          );
        }).join('') +
        '<ellipse cx="338" cy="236" rx="40" ry="16" fill="#1d6b73"/>' +
        '<ellipse cx="338" cy="232" rx="34" ry="11" fill="#fffaf0"/>' +
        dill(338, 232) +
        steam(150, 120) + steam(214, 104) + steam(274, 128),
    },
    samsa: {
      bg: '#d9e3ea',
      body:
        plate +
        '<polygon points="200,86 118,210 282,210" fill="#d99a3c" stroke="#d99a3c" stroke-width="26" stroke-linejoin="round"/>' +
        '<polygon points="200,100 138,198 262,198" fill="#e8b155"/>' +
        '<path d="M150 190 Q200 130 250 190" fill="none" stroke="#c07f24" stroke-width="3" opacity="0.6"/>' +
        '<g fill="#fff6dc"><ellipse cx="192" cy="150" rx="5" ry="2.5" transform="rotate(20 192 150)"/><ellipse cx="214" cy="170" rx="5" ry="2.5" transform="rotate(-30 214 170)"/><ellipse cx="176" cy="178" rx="5" ry="2.5"/><ellipse cx="232" cy="190" rx="5" ry="2.5" transform="rotate(40 232 190)"/><ellipse cx="204" cy="196" rx="5" ry="2.5" transform="rotate(-10 204 196)"/><ellipse cx="200" cy="122" rx="5" ry="2.5" transform="rotate(30 200 122)"/><ellipse cx="160" cy="196" rx="5" ry="2.5" transform="rotate(-20 160 196)"/></g>' +
        '<polygon points="306,190 270,246 342,246" fill="#d99a3c" stroke="#d99a3c" stroke-width="14" stroke-linejoin="round"/>' +
        '<polygon points="306,204 282,238 330,238" fill="#e8b155"/>',
    },
    boorsok: {
      bg: '#efdcc0',
      body:
        plate +
        [[140, 176, -12], [196, 190, 8], [252, 176, 14], [168, 146, 10], [226, 148, -10], [196, 118, 4]].map(function (p) {
          return (
            '<g transform="translate(' + p[0] + ' ' + p[1] + ') rotate(' + p[2] + ')">' +
            '<rect x="-36" y="-22" width="72" height="44" rx="20" fill="#e0a53a" stroke="#b97a1e" stroke-width="2.5"/>' +
            '<path d="M-22 -8 Q0 -16 22 -8" fill="none" stroke="#f0c46a" stroke-width="4" stroke-linecap="round"/>' +
            '<g fill="#b97a1e"><circle cx="-12" cy="6" r="2"/><circle cx="10" cy="10" r="2"/><circle cx="20" cy="2" r="2"/></g>' +
            '</g>'
          );
        }).join('') +
        '<ellipse cx="338" cy="240" rx="44" ry="17" fill="#1d6b73"/>' +
        '<ellipse cx="338" cy="236" rx="37" ry="12" fill="#c98a1b"/>' +
        '<path d="M318 234 q20 -6 40 0" stroke="#f3c761" stroke-width="3" fill="none" stroke-linecap="round"/>',
    },
    chai: {
      bg: '#dfe6df',
      body:
        '<ellipse cx="200" cy="262" rx="160" ry="18" fill="#8a7a58" opacity="0.3"/>' +
        '<path d="M96 150 Q60 130 54 104 Q80 118 102 130Z" fill="#1d6b73"/>' +
        '<path d="M228 150 Q268 150 268 188" fill="none" stroke="#1d6b73" stroke-width="14" stroke-linecap="round"/>' +
        '<ellipse cx="164" cy="184" rx="78" ry="62" fill="#1d6b73"/>' +
        '<path d="M92 182 Q164 214 236 182" fill="none" stroke="#e8a923" stroke-width="7"/>' +
        '<path d="M100 206 Q164 236 228 206" fill="none" stroke="#e8a923" stroke-width="4"/>' +
        '<ellipse cx="164" cy="126" rx="42" ry="12" fill="#2a828b"/>' +
        '<path d="M130 126 Q164 80 198 126Z" fill="#1d6b73"/>' +
        '<circle cx="164" cy="82" r="9" fill="#e8a923"/>' +
        '<ellipse cx="318" cy="238" rx="62" ry="14" fill="#fbf6ec" stroke="#d9ccb0" stroke-width="2"/>' +
        '<path d="M268 188 H368 Q364 238 318 238 Q272 238 268 188Z" fill="#fbf6ec" stroke="#1d6b73" stroke-width="3"/>' +
        '<ellipse cx="318" cy="188" rx="50" ry="10" fill="#b5651d"/>' +
        '<path d="M276 204 H360" stroke="#1d6b73" stroke-width="3"/>' +
        steam(300, 168) + steam(334, 164),
    },
    kompot: {
      bg: '#f0d4c8',
      body:
        '<ellipse cx="200" cy="262" rx="150" ry="16" fill="#8a7a58" opacity="0.3"/>' +
        '<path d="M96 70 H196 L186 252 Q146 262 106 252Z" fill="#f8fbfc" opacity="0.55" stroke="#9fb7c4" stroke-width="3"/>' +
        '<path d="M101 110 H191 L183 250 Q146 258 109 250Z" fill="#d98a2b" opacity="0.88"/>' +
        '<g fill="#e8742a"><circle cx="128" cy="150" r="13"/><circle cx="162" cy="182" r="13"/><circle cx="136" cy="216" r="12"/></g>' +
        '<g fill="#8a2f2f"><circle cx="164" cy="140" r="8"/><circle cx="122" cy="188" r="8"/><circle cx="170" cy="226" r="8"/></g>' +
        '<path d="M104 112 Q146 124 188 112" fill="none" stroke="#f3c761" stroke-width="4"/>' +
        '<path d="M254 130 H334 L326 252 Q294 260 262 252Z" fill="#f8fbfc" opacity="0.55" stroke="#9fb7c4" stroke-width="3"/>' +
        '<path d="M258 160 H330 L324 250 Q294 256 264 250Z" fill="#d98a2b" opacity="0.88"/>' +
        '<g fill="#e8742a"><circle cx="284" cy="196" r="10"/><circle cx="306" cy="226" r="9"/></g>' +
        '<path d="M300 100 L312 170" stroke="#b3261e" stroke-width="5" stroke-linecap="round"/>',
    },
  };

  /* ------------------------------------------------------------------
     Helpers
     ------------------------------------------------------------------ */
  const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

  function formatMoney(cents) {
    return currency.format(cents / 100);
  }

  function byId(id) {
    return document.getElementById(id);
  }

  function findItem(id) {
    return MENU.find(function (item) {
      return item.id === id;
    });
  }

  function makeEl(tag, className, text) {
    const el = document.createElement(tag);
    if (className) {
      el.className = className;
    }
    if (text !== undefined) {
      el.textContent = text;
    }
    return el;
  }

  function buildArt(key) {
    const art = ART[key];
    if (!art) {
      return null;
    }
    const markup =
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300">' +
      '<rect width="400" height="300" fill="' + art.bg + '"/>' + art.body + '</svg>';
    const doc = new DOMParser().parseFromString(markup, 'image/svg+xml');
    const svg = document.importNode(doc.documentElement, true);
    svg.setAttribute('class', 'dish-art');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');
    return svg;
  }

  /* ------------------------------------------------------------------
     Cart state
     ------------------------------------------------------------------ */
  let cart = loadCart();

  function loadCart() {
    const result = {};
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return result;
      }
      const parsed = JSON.parse(raw);
      Object.keys(parsed).forEach(function (id) {
        const qty = Number(parsed[id]);
        if (findItem(id) && Number.isInteger(qty) && qty > 0) {
          result[id] = Math.min(qty, MAX_QTY);
        }
      });
    } catch (error) {
      return {};
    }
    return result;
  }

  function saveCart() {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    } catch (error) {
      /* Storage can be unavailable (private mode). The cart still works in memory. */
    }
  }

  function totals() {
    const subtotal = Object.keys(cart).reduce(function (sum, id) {
      return sum + findItem(id).cents * cart[id];
    }, 0);
    const tax = Math.round(subtotal * TAX_RATE);
    return { subtotal: subtotal, tax: tax, total: subtotal + tax };
  }

  function itemCount() {
    return Object.keys(cart).reduce(function (sum, id) {
      return sum + cart[id];
    }, 0);
  }

  function announce(message) {
    const region = byId('live-region');
    region.textContent = '';
    window.setTimeout(function () {
      region.textContent = message;
    }, 50);
  }

  function setMessage(message) {
    byId('cart-message').textContent = message;
  }

  function changeQty(id, delta) {
    const item = findItem(id);
    if (!item) {
      return;
    }
    const next = Math.max(0, Math.min(MAX_QTY, (cart[id] || 0) + delta));
    if (next === 0) {
      delete cart[id];
      announce(item.name + ' removed from your order.');
    } else {
      cart[id] = next;
      announce(item.name + ' quantity ' + next + '.');
    }
    setMessage('');
    saveCart();
    renderCart();
  }

  function removeItem(id) {
    const item = findItem(id);
    delete cart[id];
    announce(item.name + ' removed from your order.');
    setMessage('');
    saveCart();
    renderCart();
  }

  /* ------------------------------------------------------------------
     Rendering
     ------------------------------------------------------------------ */
  function renderFilters(active) {
    const wrap = byId('menu-filters');
    wrap.textContent = '';
    CATEGORIES.forEach(function (cat) {
      const btn = makeEl('button', 'filter-btn', cat.label);
      btn.type = 'button';
      btn.dataset.category = cat.id;
      btn.setAttribute('aria-pressed', String(cat.id === active));
      wrap.appendChild(btn);
    });
  }

  function renderMenu(active) {
    const grid = byId('menu-grid');
    grid.textContent = '';
    MENU.filter(function (item) {
      return active === 'all' || item.category === active;
    }).forEach(function (item) {
      const li = makeEl('li');
      const card = makeEl('article', 'dish');
      const art = buildArt(item.id);
      if (art) {
        card.appendChild(art);
      }

      const body = makeEl('div', 'dish-body');
      const titleRow = makeEl('div', 'dish-title-row');
      titleRow.appendChild(makeEl('h3', '', item.name));
      titleRow.appendChild(makeEl('span', 'dish-price', formatMoney(item.cents)));
      body.appendChild(titleRow);

      const local = makeEl('p', 'dish-local', item.local);
      local.lang = 'ky';
      body.appendChild(local);
      body.appendChild(makeEl('p', 'dish-desc', item.description));

      const foot = makeEl('div', 'dish-foot');
      foot.appendChild(makeEl('span', 'tag', item.tag));
      const add = makeEl('button', 'add-btn', 'Add to order');
      add.type = 'button';
      add.dataset.id = item.id;
      add.setAttribute('aria-label', 'Add ' + item.name + ' to order, ' + formatMoney(item.cents));
      foot.appendChild(add);
      body.appendChild(foot);

      card.appendChild(body);
      li.appendChild(card);
      grid.appendChild(li);
    });
  }

  function renderCart() {
    const list = byId('cart-items');
    list.textContent = '';
    const ids = Object.keys(cart);

    ids.forEach(function (id) {
      const item = findItem(id);
      const qty = cart[id];
      const li = makeEl('li', 'cart-item');

      const info = makeEl('div');
      info.appendChild(makeEl('div', 'cart-item-name', item.name));
      info.appendChild(makeEl('div', 'cart-item-unit', formatMoney(item.cents) + ' each'));
      li.appendChild(info);
      li.appendChild(makeEl('div', 'cart-item-line', formatMoney(item.cents * qty)));

      const remove = makeEl('button', 'remove-btn', 'Remove');
      remove.type = 'button';
      remove.dataset.action = 'remove';
      remove.dataset.id = id;
      remove.setAttribute('aria-label', 'Remove ' + item.name + ' from order');
      li.appendChild(remove);

      const qtyWrap = makeEl('div', 'qty');
      const minus = makeEl('button', '', '−');
      minus.type = 'button';
      minus.dataset.action = 'decrease';
      minus.dataset.id = id;
      minus.setAttribute('aria-label', 'Decrease quantity of ' + item.name);
      const value = makeEl('span', 'qty-value', String(qty));
      const plus = makeEl('button', '', '+');
      plus.type = 'button';
      plus.dataset.action = 'increase';
      plus.dataset.id = id;
      plus.disabled = qty >= MAX_QTY;
      plus.setAttribute('aria-label', 'Increase quantity of ' + item.name);
      qtyWrap.append(minus, value, plus);
      li.appendChild(qtyWrap);

      list.appendChild(li);
    });

    const t = totals();
    const count = itemCount();
    byId('cart-empty').hidden = ids.length > 0;
    byId('cart-totals').hidden = ids.length === 0;
    byId('cart-checkout').disabled = ids.length === 0;
    byId('cart-clear').disabled = ids.length === 0;
    byId('total-subtotal').textContent = formatMoney(t.subtotal);
    byId('total-tax').textContent = formatMoney(t.tax);
    byId('total-grand').textContent = formatMoney(t.total);
    byId('tax-label').textContent =
      'Estimated tax (' + String(Number((TAX_RATE * 100).toFixed(2))) + '%)';
    byId('cart-count').textContent = String(count);
    byId('cart-count-sr').textContent = count + (count === 1 ? ' item' : ' items') + ' in your order';
  }

  /* ------------------------------------------------------------------
     Events
     ------------------------------------------------------------------ */
  function setupMenu() {
    let active = 'all';
    renderFilters(active);
    renderMenu(active);

    byId('menu-filters').addEventListener('click', function (event) {
      const btn = event.target.closest('button[data-category]');
      if (!btn) {
        return;
      }
      active = btn.dataset.category;
      renderFilters(active);
      renderMenu(active);
      const next = byId('menu-filters').querySelector('[aria-pressed="true"]');
      if (next) {
        next.focus();
      }
    });

    byId('menu-grid').addEventListener('click', function (event) {
      const btn = event.target.closest('button.add-btn');
      if (!btn) {
        return;
      }
      const item = findItem(btn.dataset.id);
      if ((cart[item.id] || 0) >= MAX_QTY) {
        announce('Maximum of ' + MAX_QTY + ' ' + item.name + ' per order.');
        return;
      }
      cart[item.id] = (cart[item.id] || 0) + 1;
      saveCart();
      renderCart();
      announce(item.name + ' added. ' + itemCount() + ' items in your order.');
    });
  }

  function setupCart() {
    const dialog = byId('cart-dialog');
    const toggle = byId('cart-toggle');

    function openCart() {
      setMessage('');
      if (typeof dialog.showModal === 'function') {
        dialog.showModal();
      } else {
        dialog.setAttribute('open', '');
      }
      document.body.classList.add('no-scroll');
    }

    function closeCart() {
      if (typeof dialog.close === 'function') {
        dialog.close();
      } else {
        dialog.removeAttribute('open');
      }
      document.body.classList.remove('no-scroll');
    }

    toggle.addEventListener('click', openCart);
    byId('cart-close').addEventListener('click', closeCart);
    dialog.addEventListener('close', function () {
      document.body.classList.remove('no-scroll');
    });
    dialog.addEventListener('click', function (event) {
      if (event.target === dialog) {
        closeCart();
      }
    });

    byId('cart-items').addEventListener('click', function (event) {
      const btn = event.target.closest('button[data-action]');
      if (!btn) {
        return;
      }
      const id = btn.dataset.id;
      if (btn.dataset.action === 'increase') {
        changeQty(id, 1);
      } else if (btn.dataset.action === 'decrease') {
        changeQty(id, -1);
      } else if (btn.dataset.action === 'remove') {
        removeItem(id);
      }
    });

    byId('cart-clear').addEventListener('click', function () {
      cart = {};
      saveCart();
      renderCart();
      setMessage('Your order has been cleared.');
    });

    byId('cart-checkout').addEventListener('click', function () {
      if (itemCount() === 0) {
        setMessage('Add a dish to your order first.');
        return;
      }
      setMessage(
        'Thank you! This is a demo website, so no order has been sent and nothing was charged.'
      );
    });
  }

  function setupNav() {
    const nav = byId('site-nav');
    const toggle = byId('nav-toggle');

    function setOpen(open) {
      nav.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', String(open));
    }

    toggle.addEventListener('click', function () {
      setOpen(!nav.classList.contains('is-open'));
    });
    nav.addEventListener('click', function (event) {
      if (event.target.closest('a')) {
        setOpen(false);
      }
    });
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && nav.classList.contains('is-open')) {
        setOpen(false);
        toggle.focus();
      }
    });
  }

  function init() {
    setupMenu();
    setupCart();
    setupNav();
    renderCart();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
