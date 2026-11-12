// ==========================================================================
// Pick and Mix Studios — shared site script
// ==========================================================================

document.addEventListener('DOMContentLoaded', function () {

  // --- Video lightbox: an accessible dialog (Showcase + Tutorials pages) ---
  var overlay = document.getElementById('tcVideoOverlay');
  if (overlay) {
    var frame = document.getElementById('tcVideoFrame');
    var closeBtn = document.getElementById('tcVideoClose');
    var dialog = overlay.querySelector('.tc-modal');
    var lastTrigger = null;
    dialog.setAttribute('role', 'dialog');
    dialog.setAttribute('aria-modal', 'true');
    dialog.setAttribute('aria-label', 'Video');
    // focus guard: tabbing out of the video (which runs in its own frame) loops back to the close button
    var guard = document.createElement('span');
    guard.tabIndex = 0;
    guard.className = 'tc-sr';
    guard.addEventListener('focus', function () { closeBtn.focus(); });
    dialog.appendChild(guard);

    function openModal(url, title, trigger) {
      lastTrigger = trigger || null;
      frame.src = url;
      frame.title = title ? title + ' video' : 'Video player';
      dialog.setAttribute('aria-label', title ? title + ' video' : 'Video');
      overlay.classList.add('is-open');
      document.body.classList.add('tc-no-scroll');
      closeBtn.focus();
    }

    function closeModal() {
      if (!overlay.classList.contains('is-open')) return;
      overlay.classList.remove('is-open');
      document.body.classList.remove('tc-no-scroll');
      frame.src = '';
      if (lastTrigger) lastTrigger.focus();
    }

    document.querySelectorAll('.tc-video-btn').forEach(function (btn) {
      btn.setAttribute('aria-haspopup', 'dialog');
      btn.addEventListener('click', function () {
        var url = btn.getAttribute('data-video');
        if (!url || url === '#') return;
        var card = btn.closest('.tc-card, .tc-bss-card');
        var h = card ? card.querySelector('h2') : null;
        openModal(url, h ? h.textContent.trim() : '', btn);
      });
    });

    closeBtn.addEventListener('click', closeModal);
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) closeModal();
    });
    document.addEventListener('keydown', function (e) {
      if (!overlay.classList.contains('is-open')) return;
      if (e.key === 'Escape') { closeModal(); return; }
      if (e.key === 'Tab') {
        // keep keyboard focus inside the dialog: close button <-> video
        var items = [closeBtn, frame];
        var i = items.indexOf(document.activeElement);
        if (e.shiftKey && i <= 0) { e.preventDefault(); frame.focus(); }
        else if (!e.shiftKey && i === items.length - 1) { e.preventDefault(); closeBtn.focus(); }
      }
    });
  }

  // --- Contact form (Web3Forms) ---
  var form = document.getElementById('tcContactForm');
  if (form) {
    var statusEl = document.getElementById('tcFormStatus');
    var btn = document.getElementById('tcSubmitBtn');
    var btnLabel = document.getElementById('tcSubmitLabel');
    var topic = document.getElementById('tcTopic');
    var subject = form.querySelector('input[name="subject"]');
    var accessNote = document.getElementById('tcAccessNote');
    var orgField = document.getElementById('tcOrgField');
    var defaultStatus = statusEl.textContent;
    var subjects = {
      general: 'Website enquiry from Pick and Mix Studios contact page',
      project: 'New project enquiry (Pick and Mix Studios website)',
      'client-work': 'Client work access request (Pick and Mix Studios website)',
      shop: 'Shop / templates question (Pick and Mix Studios website)',
      other: 'Website enquiry from Pick and Mix Studios contact page'
    };

    function syncTopic() {
      if (!topic) return;
      var v = topic.value;
      subject.value = subjects[v] || subjects.general;
      var isAccess = v === 'client-work';
      if (accessNote) accessNote.hidden = !isAccess;
      if (orgField) orgField.hidden = !(isAccess || v === 'project');
    }
    if (topic) {
      var wanted = new URLSearchParams(location.search).get('topic');
      if (wanted && topic.querySelector('option[value="' + wanted + '"]')) topic.value = wanted;
      topic.addEventListener('change', syncTopic);
      syncTopic();
    }

    function setStatus(text, kind) {
      statusEl.textContent = text;
      statusEl.classList.remove('is-success', 'is-error');
      if (kind) statusEl.classList.add('is-' + kind);
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      btn.setAttribute('disabled', 'true');
      btnLabel.textContent = 'Sending...';
      setStatus('Sending your message...');

      var formData = new FormData(form);
      var payload = Object.fromEntries(formData.entries());

      fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(payload)
      })
        .then(function (res) { return res.json(); })
        .then(function (data) {
          if (data.success) {
            form.reset();
            syncTopic();
            setStatus(payload.topic === 'client-work'
              ? 'Thanks! Your request has been sent. We’ll email you a link to our client work.'
              : 'Thanks! Your message has been sent. We’ll get back to you soon.', 'success');
          } else {
            setStatus('Sorry, that didn’t send: ' + (data.message || 'please try again.') + ' You can also email hello@pickandmixstudios.com.', 'error');
          }
        })
        .catch(function () {
          setStatus('Sorry, something went wrong sending your message. Please try again, or email hello@pickandmixstudios.com.', 'error');
        })
        .finally(function () {
          btnLabel.textContent = 'Send message';
          btn.removeAttribute('disabled');
        });
    });
  }

  // --- Read more / read less toggles (Pop up Shop) ---
  document.querySelectorAll('.tc-readmore-btn').forEach(function (btn) {
    var targetId = btn.getAttribute('data-target');
    var target = document.getElementById(targetId);
    if (!target) return;

    btn.addEventListener('click', function () {
      var isOpen = target.classList.toggle('is-open');
      btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      var label = btn.querySelector('.tc-readmore-label');
      if (label) label.textContent = isOpen ? 'Read Less' : 'Read More';
    });
  });

});

// ==========================================================================
// Header tools: translate (globe) and reading settings (Aa), as on Tiny Bytes.
// Settings use the same saved keys as Tiny Bytes, so a choice made on one
// carries over to the other. The <head> of each page applies them before load.
// ==========================================================================
(function () {
  var holder = document.getElementById('tcTools');
  if (!holder) return;
  var root = document.documentElement;
  var store = {
    get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  };

  var langs = [
    ['en', 'English (original)'], ['pt-PT', 'Português (Portugal)'], ['pt', 'Português (Brasil)'],
    ['es', 'Spanish · Español'], ['fr', 'French · Français'], ['de', 'German · Deutsch'],
    ['it', 'Italian · Italiano'], ['nl', 'Dutch · Nederlands'], ['pl', 'Polish · Polski'],
    ['uk', 'Ukrainian · Українська'], ['tr', 'Turkish · Türkçe'], ['ar', 'Arabic · العربية'],
    ['hi', 'Hindi · हिन्दी'], ['zh-CN', 'Chinese · 中文'], ['ja', 'Japanese · 日本語'], ['ko', 'Korean · 한국어']
  ];
  var opts = langs.map(function (l) { return '<option value="' + l[0] + '"' + (l[0] === 'en' ? ' lang="en"' : '') + '>' + l[1] + '</option>'; }).join('');

  holder.innerHTML =
    '<button type="button" class="tc-tool-btn" id="tcLangBtn" aria-expanded="false" aria-controls="tcLangPanel" aria-label="Translate this page">' +
      '<svg viewBox="0 0 24 24" aria-hidden="true" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9.5"/><path d="M2.5 12h19"/><path d="M12 2.5c2.6 2.6 3.9 5.8 3.9 9.5s-1.3 6.9-3.9 9.5c-2.6-2.6-3.9-5.8-3.9-9.5S9.4 5.1 12 2.5z"/></svg>' +
    '</button>' +
    '<div class="tc-panel notranslate" translate="no" id="tcLangPanel" role="region" aria-label="Translate this page" hidden>' +
      '<div class="tc-ctl"><span class="tc-ctl-label" id="tcLblLang">Read this page in</span>' +
        '<div class="tc-lang-row"><select id="tcLang" aria-labelledby="tcLblLang">' + opts + '</select>' +
        '<button type="button" class="tc-lang-go" id="tcLangGo">Translate</button></div>' +
        '<p class="tc-lang-note">Opens a translated copy of this page using Google Translate.</p></div>' +
    '</div>' +
    '<button type="button" class="tc-tool-btn" id="tcSetBtn" aria-expanded="false" aria-controls="tcSetPanel" aria-label="Reading settings: theme and text size">Aa</button>' +
    '<div class="tc-panel" id="tcSetPanel" role="region" aria-label="Reading settings" hidden>' +
      '<div class="tc-ctl"><span class="tc-ctl-label" id="tcLblTheme">Theme</span>' +
        '<div class="tc-seg" role="group" aria-labelledby="tcLblTheme">' +
          '<button type="button" data-theme-set="auto" aria-pressed="true">Auto</button>' +
          '<button type="button" data-theme-set="light" aria-pressed="false">Light</button>' +
          '<button type="button" data-theme-set="dark" aria-pressed="false">Dark</button>' +
        '</div></div>' +
      '<div class="tc-ctl"><span class="tc-ctl-label" id="tcLblSize">Text</span>' +
        '<div class="tc-seg" role="group" aria-labelledby="tcLblSize">' +
          '<button type="button" data-size="0" aria-pressed="true" aria-label="Normal text">A</button>' +
          '<button type="button" data-size="1" aria-pressed="false" aria-label="Larger text" style="font-size:1.05rem">A+</button>' +
          '<button type="button" data-size="2" aria-pressed="false" aria-label="Largest text" style="font-size:1.2rem">A++</button>' +
        '</div></div>' +
    '</div>';

  var announcer = document.createElement('p');
  announcer.className = 'tc-sr'; announcer.setAttribute('aria-live', 'polite');
  document.body.appendChild(announcer);
  function announce(t) { announcer.textContent = ''; setTimeout(function () { announcer.textContent = t; }, 30); }

  var lBtn = document.getElementById('tcLangBtn'), lPanel = document.getElementById('tcLangPanel');
  var sBtn = document.getElementById('tcSetBtn'), sPanel = document.getElementById('tcSetPanel');

  function setOpen(btn, panel, open, focusEl) {
    panel.hidden = !open; btn.setAttribute('aria-expanded', String(open));
    if (open && focusEl) focusEl.focus();
  }
  sBtn.addEventListener('click', function () {
    var open = sPanel.hidden; setOpen(lBtn, lPanel, false);
    setOpen(sBtn, sPanel, open, sPanel.querySelector('[aria-pressed="true"]'));
  });
  lBtn.addEventListener('click', function () {
    var open = lPanel.hidden; setOpen(sBtn, sPanel, false);
    setOpen(lBtn, lPanel, open, document.getElementById('tcLang'));
  });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (!sPanel.hidden) { setOpen(sBtn, sPanel, false); sBtn.focus(); }
    if (!lPanel.hidden) { setOpen(lBtn, lPanel, false); lBtn.focus(); }
  });
  document.addEventListener('click', function (e) {
    if (!sPanel.hidden && !sPanel.contains(e.target) && !sBtn.contains(e.target)) setOpen(sBtn, sPanel, false);
    if (!lPanel.hidden && !lPanel.contains(e.target) && !lBtn.contains(e.target)) setOpen(lBtn, lPanel, false);
  });

  // Theme
  function setTheme(t, save) {
    if (t === 'auto') delete root.dataset.theme; else root.dataset.theme = t;
    document.querySelectorAll('[data-theme-set]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.themeSet === t)); });
    if (save) { store.set('bs-theme', t); announce((t === 'auto' ? 'Automatic' : t) + ' theme on'); }
  }
  document.querySelectorAll('[data-theme-set]').forEach(function (b) { b.addEventListener('click', function () { setTheme(b.dataset.themeSet, true); }); });
  var savedTheme = store.get('bs-theme'); setTheme(savedTheme || 'light', false); // light on a first visit

  // Text size
  function setSize(n, save) {
    root.classList.remove('size-1', 'size-2'); if (n !== '0') root.classList.add('size-' + n);
    document.querySelectorAll('[data-size]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.size === n)); });
    if (save) { store.set('bs-size', n); announce(['Normal', 'Larger', 'Largest'][+n] + ' text'); }
  }
  document.querySelectorAll('[data-size]').forEach(function (b) { b.addEventListener('click', function () { setSize(b.dataset.size, true); }); });
  var savedSize = store.get('bs-size'); if (savedSize) setSize(savedSize, false);

  // Language: opens the page through Google Translate (live site only, where Google can reach it)
  if (!/pickandmixstudios\.com$|translate\.goog$/.test(location.hostname)) lBtn.hidden = true;
  var langSel = document.getElementById('tcLang');
  var onGoog = /translate\.goog$/.test(location.hostname);
  var params = new URLSearchParams(location.search);
  var browserLang = (navigator.language || '').toLowerCase();
  var values = langs.map(function (l) { return l[0]; });
  if (onGoog && params.get('_x_tr_tl')) langSel.value = params.get('_x_tr_tl');
  else if (browserLang.indexOf('en') !== 0) {
    var base = browserLang.split('-')[0];
    var exact = values.filter(function (v) { return v.toLowerCase() === browserLang; })[0];
    var byBase = values.filter(function (v) { return v.toLowerCase().split('-')[0] === base; })[0];
    langSel.value = exact || (base === 'pt' ? (browserLang === 'pt-br' ? 'pt' : 'pt-PT') : byBase || 'en');
  }
  document.getElementById('tcLangGo').addEventListener('click', function () {
    var path = location.pathname, hash = location.hash;
    if (langSel.value === 'en') { location.href = 'https://pickandmixstudios.com' + path + hash; return; }
    location.href = 'https://pickandmixstudios-com.translate.goog' + path + '?_x_tr_sl=en&_x_tr_tl=' + encodeURIComponent(langSel.value) + '&_x_tr_hl=en' + hash;
  });
})();

// ==========================================================================
// Mobile menu: on narrow screens the nav folds behind a Menu button.
// Without the script the full nav simply stays visible.
// ==========================================================================
(function () {
  var btn = document.getElementById('tcMenuBtn');
  var nav = document.getElementById('tcNav');
  if (!btn || !nav) return;
  document.documentElement.classList.add('js-menu');
  function set(open) {
    nav.classList.toggle('is-open', open);
    btn.setAttribute('aria-expanded', String(open));
  }
  btn.addEventListener('click', function () { set(btn.getAttribute('aria-expanded') !== 'true'); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && btn.getAttribute('aria-expanded') === 'true') { set(false); btn.focus(); }
  });
})();

// ==========================================================================
// Team page: "Choose your player" tabs (arrow keys move between players).
// Without the script both profiles simply show one after the other.
// ==========================================================================
(function () {
  var list = document.querySelector('.tc-select[role="tablist"]');
  if (!list) return;
  var tabs = Array.prototype.slice.call(list.querySelectorAll('[role="tab"]'));
  function select(tab, focus) {
    tabs.forEach(function (t) {
      var on = t === tab;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      var panel = document.getElementById(t.getAttribute('aria-controls'));
      if (panel) panel.hidden = !on;
    });
    if (focus) tab.focus();
  }
  tabs.forEach(function (tab, i) {
    tab.addEventListener('click', function () { select(tab, false); });
    tab.addEventListener('keydown', function (e) {
      var n = null;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') n = tabs[(i + 1) % tabs.length];
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') n = tabs[(i - 1 + tabs.length) % tabs.length];
      if (e.key === 'Home') n = tabs[0];
      if (e.key === 'End') n = tabs[tabs.length - 1];
      if (n) { e.preventDefault(); select(n, true); }
    });
  });
  select(tabs.filter(function (t) { return t.getAttribute('aria-selected') === 'true'; })[0] || tabs[0], false);
})();



// ==========================================================================
// Showcase: "Select a level" world map. Builds round level stops from the
// demo cards, draws a winding dotted path through them, and shows the chosen
// demo's card underneath. Without the script the map stays hidden and every
// demo card shows as a normal list.
// ==========================================================================
(function () {
  var map = document.getElementById('tcMap');
  if (!map) return;
  var wrap = map.querySelector('.tc-map-nodes');
  var path = map.querySelector('.tc-map-path path');
  var svg = map.querySelector('.tc-map-path');
  var grid = document.querySelector('.tc-showcase-grid');
  var cards = Array.prototype.slice.call(document.querySelectorAll('.tc-card[data-playable]'));
  if (!cards.length) return;
  var logo = document.querySelector('.tc-logo img');
  var token = document.createElement('img');
  token.className = 'tc-map-token'; token.alt = ''; token.setAttribute('aria-hidden', 'true');
  if (logo) token.src = logo.src;
  map.appendChild(token);

  var nodes = cards.map(function (card, i) {
    var name = (card.querySelector('h2') || {}).textContent || ('Level ' + (i + 1));
    var thumb = card.querySelector('.tc-card-image > img:not(.tc-award-img)');
    var award = card.dataset.award === 'true';
    card.id = card.id || ('tcLevelCard' + (i + 1));
    card.setAttribute('role', 'tabpanel');
    var b = document.createElement('button');
    b.type = 'button'; b.className = 'tc-node' + (award ? ' is-award' : ''); b.id = 'tcLevel' + (i + 1);
    b.setAttribute('role', 'tab');
    b.setAttribute('aria-controls', card.id);
    b.setAttribute('aria-label', 'Level ' + (i + 1) + ': ' + name.trim() + (award ? ', Platinum award winner' : ''));
    card.setAttribute('aria-labelledby', b.id);
    b.innerHTML = (thumb ? '<img class="tc-node-thumb" alt="" src="' + thumb.getAttribute('src') + '">' : '') +
      '<span class="tc-node-num" aria-hidden="true">' + (i + 1) + '</span>' +
      (award ? '<span class="tc-node-aura" aria-hidden="true"></span>' +
        '<img class="tc-node-medal" aria-hidden="true" alt="" src="assets/img/platinum-medal.svg">' +
        [1, 2, 3].map(function (k) { return '<span class="tc-spark s' + k + '" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 0c.8 6.4 4.8 10.6 12 12-7.2 1.4-11.2 5.6-12 12-.8-6.4-4.8-10.6-12-12 7.2-1.4 11.2-5.6 12-12z"/></svg></span>'; }).join('') : '') +
      '<span class="tc-node-name" aria-hidden="true">' + name.trim() + '</span>';
    wrap.appendChild(b);
    return b;
  });

  var current = 0;
  function cols() { return parseInt(getComputedStyle(wrap).getPropertyValue('--cols'), 10) || 5; }

  // Snake the stops: left to right, then right to left on the next row
  function place() {
    var c = cols();
    nodes.forEach(function (n, i) {
      var row = Math.floor(i / c), col = i % c;
      if (row % 2) col = c - 1 - col;
      n.style.gridRow = String(row + 1);
      n.style.gridColumn = String(col + 1);
      n.style.marginTop = (col % 2 ? 30 : 0) + 'px';
    });
  }

  function centre(el) {
    var m = map.getBoundingClientRect(), r = el.getBoundingClientRect();
    return { x: r.left - m.left + r.width / 2, y: r.top - m.top + r.height / 2, w: r.width };
  }

  // Smooth curve through the stop centres (Catmull-Rom to Bezier)
  function draw() {
    var pts = nodes.map(centre);
    svg.setAttribute('viewBox', '0 0 ' + map.clientWidth + ' ' + map.clientHeight);
    var d = 'M' + pts[0].x + ' ' + pts[0].y;
    for (var i = 0; i < pts.length - 1; i++) {
      var p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
      var t = 0.22;
      d += ' C' + (p1.x + (p2.x - p0.x) * t) + ' ' + (p1.y + (p2.y - p0.y) * t) + ' ' +
        (p2.x - (p3.x - p1.x) * t) + ' ' + (p2.y - (p3.y - p1.y) * t) + ' ' + p2.x + ' ' + p2.y;
    }
    path.setAttribute('d', d);
    moveToken();
  }

  function moveToken() {
    var p = centre(nodes[current]);
    token.style.left = (p.x - token.offsetWidth / 2) + 'px';
    token.style.top = (p.y - p.w / 2 - token.offsetHeight + 4) + 'px';
  }

  function select(i, focus) {
    current = i;
    nodes.forEach(function (n, j) {
      var on = j === i;
      n.setAttribute('aria-selected', String(on));
      n.tabIndex = on ? 0 : -1;
      cards[j].hidden = !on;
    });
    if (focus) nodes[i].focus();
    moveToken();
  }

  nodes.forEach(function (n, i) {
    n.addEventListener('click', function () { select(i, false); });
    n.addEventListener('keydown', function (e) {
      var k = e.key, t = null;
      if (k === 'ArrowRight' || k === 'ArrowDown') t = (i + 1) % nodes.length;
      if (k === 'ArrowLeft' || k === 'ArrowUp') t = (i - 1 + nodes.length) % nodes.length;
      if (k === 'Home') t = 0;
      if (k === 'End') t = nodes.length - 1;
      if (t !== null) { e.preventDefault(); select(t, true); }
    });
  });

  map.hidden = false;
  if (grid) grid.classList.add('is-map');
  place();
  select(0, false);
  draw();
  var raf;
  function redraw() { cancelAnimationFrame(raf); raf = requestAnimationFrame(function () { place(); draw(); }); }
  window.addEventListener('resize', redraw);
  if (window.ResizeObserver) new ResizeObserver(redraw).observe(map);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(redraw);
  window.addEventListener('load', redraw);
})();

// ==========================================================================
// Tutorials: "Training mode" cartridge shelf. Each tutorial is a game
// cartridge; picking one pops it up and shows that tutorial's card below.
// Without the script the shelf stays hidden and every tutorial card shows.
// ==========================================================================
(function () {
  var shelf = document.getElementById('tcShelf');
  if (!shelf) return;
  var row = shelf.querySelector('.tc-shelf-carts');
  var grid = document.querySelector('.tc-bss-grid');
  var cards = Array.prototype.slice.call(document.querySelectorAll('.tc-bss-card'));
  if (!cards.length) return;
  var colours = ['c-blue', 'c-pink', 'c-orange', 'c-navy', 'c-teal'];
  var carts = cards.map(function (card, i) {
    var name = ((card.querySelector('h2') || {}).textContent || ('Tutorial ' + (i + 1))).trim();
    var img = card.querySelector('.tc-bss-image img');
    card.id = card.id || ('tcTutorial' + (i + 1));
    card.setAttribute('role', 'tabpanel');
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'tc-cart ' + colours[i % colours.length];
    b.id = 'tcCart' + (i + 1);
    b.setAttribute('role', 'tab');
    b.setAttribute('aria-controls', card.id);
    b.setAttribute('aria-label', 'Tutorial ' + (i + 1) + ': ' + name);
    card.setAttribute('aria-labelledby', b.id);
    b.innerHTML = '<span class="tc-cart-ridge" aria-hidden="true"></span>' +
      '<span class="tc-cart-label" aria-hidden="true">' + (img ? '<img alt="" src="' + img.getAttribute('src') + '">' : '') + '</span>' +
      '<span class="tc-cart-num" aria-hidden="true">' + (i + 1) + '</span>' +
      '<span class="tc-cart-grip" aria-hidden="true"></span>';
    b.dataset.name = name;
    row.appendChild(b);
    return b;
  });
  function select(i, focus) {
    carts.forEach(function (c, j) {
      var on = j === i;
      c.setAttribute('aria-selected', String(on));
      c.tabIndex = on ? 0 : -1;
      cards[j].hidden = !on;
    });
    var now = document.getElementById('tcShelfNow');
    if (now) now.textContent = carts[i].dataset.name;
    if (focus) carts[i].focus();
  }
  carts.forEach(function (c, i) {
    c.addEventListener('click', function () { select(i, false); });
    c.addEventListener('keydown', function (e) {
      var k = e.key, t = null;
      if (k === 'ArrowRight' || k === 'ArrowDown') t = (i + 1) % carts.length;
      if (k === 'ArrowLeft' || k === 'ArrowUp') t = (i - 1 + carts.length) % carts.length;
      if (k === 'Home') t = 0;
      if (k === 'End') t = carts.length - 1;
      if (t !== null) { e.preventDefault(); select(t, true); }
    });
  });
  shelf.hidden = false;
  if (grid) grid.classList.add('is-shelf');
  select(0, false);
})();

// ==========================================================================
// Pop-up Shop: "Item shop" loot chests. Each product is a treasure chest;
// opening one pops the product out with a glow and shows its card below.
// Without the script the chests stay hidden and every product card shows.
// ==========================================================================
(function () {
  var loot = document.getElementById('tcLoot');
  if (!loot) return;
  var row = loot.querySelector('.tc-loot-row');
  var grid = document.querySelector('.tc-shop-grid');
  var cards = Array.prototype.slice.call(document.querySelectorAll('.tc-product-card'));
  if (!cards.length) return;
  var CHEST_BACK = '<svg class="tc-chest-back" viewBox="0 0 220 200" aria-hidden="true" focusable="false"><defs><linearGradient id="tcWoodF" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#D9813E"/><stop offset=".55" stop-color="#B65A1E"/><stop offset="1" stop-color="#8A4214"/></linearGradient><linearGradient id="tcWoodS" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#8F4516"/><stop offset="1" stop-color="#6A300E"/></linearGradient><linearGradient id="tcWoodL" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#EA9550"/><stop offset="1" stop-color="#BC6022"/></linearGradient><linearGradient id="tcGold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFF3B0"/><stop offset=".45" stop-color="#F4C24C"/><stop offset="1" stop-color="#C2871C"/></linearGradient><radialGradient id="tcInside" cx=".5" cy=".2" r=".9"><stop offset="0" stop-color="#FFE7A0"/><stop offset=".3" stop-color="#9B3B73"/><stop offset="1" stop-color="#2A0F22"/></radialGradient><linearGradient id="tcVelvet" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5B1F48"/><stop offset="1" stop-color="#8E2F66"/></linearGradient></defs><ellipse cx="108" cy="188" rx="92" ry="9" fill="rgba(0,0,0,.28)"/><g class="tc-cs-open"><path d="M46 88 V58 Q46 30 122 30 Q198 30 198 58 V88 Z" fill="url(#tcWoodS)" stroke="#3A1A06" stroke-width="3" stroke-linejoin="round"/><path d="M56 86 V60 Q56 40 122 40 Q188 40 188 60 V86 Z" fill="url(#tcVelvet)" stroke="#3A1A06" stroke-width="2"/><path d="M70 50 Q96 44 122 44" fill="none" stroke="#C25A92" stroke-width="3" stroke-linecap="round" opacity=".6"/><rect x="43" y="82" width="158" height="9" rx="4" fill="url(#tcGold)" stroke="#5A3A06" stroke-width="2.5"/></g><path class="tc-cs-mouth" d="M22 98 L46 86 H198 L174 98 Z" fill="url(#tcInside)" stroke="#3A1A06" stroke-width="3" stroke-linejoin="round"/></svg>';
  var CHEST_FRONT = '<svg class="tc-chest-front" viewBox="0 0 220 200" aria-hidden="true" focusable="false"><path d="M174 98 L198 86 V168 L174 182 Z" fill="url(#tcWoodS)" stroke="#3A1A06" stroke-width="3" stroke-linejoin="round"/><path d="M178 122 L194 114 M178 150 L194 142" stroke="#4E2208" stroke-width="2" opacity=".55"/><path d="M184 96 L188 94 V174 L184 176 Z" fill="url(#tcGold)" stroke="#5A3A06" stroke-width="1.5"/><rect x="22" y="96" width="152" height="86" rx="9" fill="url(#tcWoodF)" stroke="#3A1A06" stroke-width="3"/><path d="M26 124 H170 M26 153 H170" stroke="#6E3210" stroke-width="2.5" opacity=".55"/><path d="M30 110 h30 M120 138 h36 M40 166 h22" stroke="#F1A867" stroke-width="2" stroke-linecap="round" opacity=".45"/><rect x="42" y="96" width="17" height="86" fill="url(#tcGold)" stroke="#5A3A06" stroke-width="2.5"/><rect x="137" y="96" width="17" height="86" fill="url(#tcGold)" stroke="#5A3A06" stroke-width="2.5"/><g fill="#FFF7D1" stroke="#8A5A10" stroke-width="1.2"><circle cx="50.5" cy="106" r="2.4"/><circle cx="50.5" cy="139" r="2.4"/><circle cx="50.5" cy="172" r="2.4"/><circle cx="145.5" cy="106" r="2.4"/><circle cx="145.5" cy="139" r="2.4"/><circle cx="145.5" cy="172" r="2.4"/></g><path d="M22 162 V173 Q22 182 31 182 H44 V176 H32 Q28 176 28 172 V162 Z" fill="url(#tcGold)" stroke="#5A3A06" stroke-width="2" stroke-linejoin="round"/><path d="M174 162 V173 Q174 182 165 182 H152 V176 H164 Q168 176 168 172 V162 Z" fill="url(#tcGold)" stroke="#5A3A06" stroke-width="2" stroke-linejoin="round"/><rect x="20" y="94" width="156" height="8" rx="3" fill="url(#tcGold)" stroke="#5A3A06" stroke-width="2" class="tc-cs-rim"/><g class="tc-cs-lockg"><path d="M84 100 H112 V124 Q112 138 98 144 Q84 138 84 124 Z" fill="url(#tcGold)" stroke="#5A3A06" stroke-width="2.5" stroke-linejoin="round"/><circle cx="98" cy="118" r="5" fill="#3A1A06"/><path d="M95.5 120 L94 132 H102 L100.5 120 Z" fill="#3A1A06"/></g><g class="tc-cs-lid"><path d="M46 88 V64 Q46 26 122 26 Q198 26 198 64 V88 L174 100 H22 V76 Q22 38 98 38 Q140 38 160 46 Z" fill="url(#tcWoodS)" stroke="#3A1A06" stroke-width="3" stroke-linejoin="round"/><path d="M22 100 V76 Q22 38 98 38 Q174 38 174 76 V100 Z" fill="url(#tcWoodL)" stroke="#3A1A06" stroke-width="3" stroke-linejoin="round"/><path d="M26 74 Q98 56 170 74" fill="none" stroke="#7A3810" stroke-width="2.5" opacity=".5"/><path d="M40 54 Q70 44 98 44" fill="none" stroke="#FFD1A0" stroke-width="3" stroke-linecap="round" opacity=".55"/><path d="M42 100 V52 Q50 45 59 43 V100 Z" fill="url(#tcGold)" stroke="#5A3A06" stroke-width="2.5" stroke-linejoin="round"/><path d="M137 100 V43 Q146 45 154 52 V100 Z" fill="url(#tcGold)" stroke="#5A3A06" stroke-width="2.5" stroke-linejoin="round"/><g fill="#FFF7D1" stroke="#8A5A10" stroke-width="1.2"><circle cx="50.5" cy="62" r="2.4"/><circle cx="50.5" cy="86" r="2.4"/><circle cx="145.5" cy="62" r="2.4"/><circle cx="145.5" cy="86" r="2.4"/></g><rect x="19" y="92" width="158" height="10" rx="4" fill="url(#tcGold)" stroke="#5A3A06" stroke-width="2.5"/></g></svg>';
  var spark = '<span class="tc-spark s1" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 0c.8 6.4 4.8 10.6 12 12-7.2 1.4-11.2 5.6-12 12-.8-6.4-4.8-10.6-12-12 7.2-1.4 11.2-5.6 12-12z"/></svg></span><span class="tc-spark s2" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 0c.8 6.4 4.8 10.6 12 12-7.2 1.4-11.2 5.6-12 12-.8-6.4-4.8-10.6-12-12 7.2-1.4 11.2-5.6 12-12z"/></svg></span><span class="tc-spark s3" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 0c.8 6.4 4.8 10.6 12 12-7.2 1.4-11.2 5.6-12 12-.8-6.4-4.8-10.6-12-12 7.2-1.4 11.2-5.6 12-12z"/></svg></span>';
  var chests = cards.map(function (card, i) {
    var name = ((card.querySelector('h2') || {}).textContent || ('Product ' + (i + 1))).trim();
    var img = card.querySelector('.tc-product-main-image img');
    card.id = card.id || ('tcProduct' + (i + 1));
    card.setAttribute('role', 'tabpanel');
    var b = document.createElement('button');
    b.type = 'button'; b.className = 'tc-chest'; b.id = 'tcChest' + (i + 1);
    b.setAttribute('role', 'tab');
    b.setAttribute('aria-controls', card.id);
    b.setAttribute('aria-label', 'Open chest: ' + name);
    card.setAttribute('aria-labelledby', b.id);
    b.innerHTML =
      '<span class="tc-chest-stage" aria-hidden="true">' +
        '<span class="tc-chest-rays"></span>' + CHEST_BACK +
        '<span class="tc-chest-loot">' + (img ? '<img alt="" src="' + img.getAttribute('src') + '">' : '') + '</span>' +
        '<span class="tc-sweet w1"></span><span class="tc-sweet w2"></span><span class="tc-sweet w3"></span><span class="tc-sweet w4"></span><span class="tc-sweet w5"></span><span class="tc-sweet w6"></span>' + spark +
        CHEST_FRONT +
      '</span>' +
      '<span class="tc-chest-name" aria-hidden="true">' + name + '</span>';
    row.appendChild(b);
    return b;
  });
  function select(i, focus) {
    chests.forEach(function (c, j) {
      var on = j === i;
      c.setAttribute('aria-selected', String(on));
      c.tabIndex = on ? 0 : -1;
      cards[j].hidden = !on;
    });
    if (focus) chests[i].focus();
  }
  chests.forEach(function (c, i) {
    c.addEventListener('click', function () { select(i, false); });
    c.addEventListener('keydown', function (e) {
      var k = e.key, t = null;
      if (k === 'ArrowRight' || k === 'ArrowDown') t = (i + 1) % chests.length;
      if (k === 'ArrowLeft' || k === 'ArrowUp') t = (i - 1 + chests.length) % chests.length;
      if (k === 'Home') t = 0;
      if (k === 'End') t = chests.length - 1;
      if (t !== null) { e.preventDefault(); select(t, true); }
    });
  });
  loot.hidden = false;
  if (grid) grid.classList.add('is-loot');
  select(0, false);
})();

// ==========================================================================
// Home: title screen (Press start + main menu), flip-over achievement
// stickers, and the client work padlock. Without the script the menu and
// the Request access button simply show, and the stickers stay front-side up.
// ==========================================================================
(function () {
  // Press start
  var start = document.getElementById('tcStart');
  var menu = document.getElementById('tcMainMenu');
  if (start && menu) {
    var links = Array.prototype.slice.call(menu.querySelectorAll('a'));
    start.hidden = false;
    menu.hidden = true;
    start.setAttribute('aria-expanded', 'false');
    start.addEventListener('click', function () {
      menu.hidden = false;
      menu.classList.add('is-in');
      start.setAttribute('aria-expanded', 'true');
      start.hidden = true;
      var ts = document.getElementById('tcTS'); if (ts) ts.classList.add('is-on');
      if (links[0]) links[0].focus();
    });
    links.forEach(function (a, i) {
      a.addEventListener('keydown', function (e) {
        var t = null;
        if (e.key === 'ArrowDown' || e.key === 'ArrowRight') t = links[(i + 1) % links.length];
        if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') t = links[(i - 1 + links.length) % links.length];
        if (t) { e.preventDefault(); t.focus(); }
      });
    });
  }

  // Achievement stickers flip over
  document.querySelectorAll('.tc-flip').forEach(function (b) {
    b.addEventListener('click', function () {
      b.setAttribute('aria-pressed', String(b.getAttribute('aria-pressed') !== 'true'));
    });
  });

  // Client work padlock: it stays locked. Tapping it just rattles the chain
  // (handled by the chain script); the Request access button is always shown.
  var pad = document.getElementById('tcPadlock');
  if (pad) {
    pad.hidden = false;
    pad.removeAttribute('aria-expanded');
    pad.removeAttribute('aria-controls');
    pad.setAttribute('aria-hidden', 'true');
    pad.setAttribute('tabindex', '-1');
  }
})();

// ==========================================================================
// Contact: Pick & Mix Bot asks one question at a time, RPG dialogue style.
// The real form is unchanged underneath; without JavaScript it shows as a
// normal form.
// ==========================================================================
(function () {
  function $(id) { return document.getElementById(id); }
  var npc = $('tcNPC'), form = $('tcContactForm'), topic = $('tcTopic');
  if (!npc || !form || !topic) return;
  var name = $('tcName'), email = $('tcEmail'), org = $('tcOrg'), msg = $('tcMessage');
  var fTopic = topic.closest('.tc-field'), fName = name.closest('.tc-field'), fEmail = email.closest('.tc-field');
  var fOrg = $('tcOrgField'), fMsg = msg.closest('.tc-field'), note = $('tcAccessNote');
  var status = $('tcFormStatus'), submit = $('tcSubmitBtn');
  var nav = $('tcNPCNav'), back = $('tcNPCBack'), next = $('tcNPCNext'), again = $('tcNPCAgain');
  var typeEl = $('tcNPCtype'), sr = $('tcNPCsr'), pips = npc.querySelector('.tc-npc-pips');
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var LINES = { general: 'A question', project: 'Start a project with you', 'client-work': 'Unlock your client work', shop: 'Your templates and shop', other: 'Something else' };

  // Topic choices, RPG style
  var choices = document.createElement('div');
  choices.className = 'tc-npc-choices';
  choices.setAttribute('role', 'group');
  choices.setAttribute('aria-label', 'What brings you here?');
  Array.prototype.forEach.call(topic.options, function (o) {
    var b = document.createElement('button');
    b.type = 'button'; b.className = 'tc-npc-opt'; b.setAttribute('data-v', o.value);
    b.textContent = LINES[o.value] || o.textContent;
    choices.appendChild(b);
  });
  fTopic.parentNode.insertBefore(choices, fTopic);
  function markChoice() {
    Array.prototype.forEach.call(choices.children, function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-v') === topic.value)); });
  }
  choices.addEventListener('click', function (e) {
    var b = e.target.closest('.tc-npc-opt'); if (!b) return;
    topic.value = b.getAttribute('data-v');
    topic.dispatchEvent(new Event('change'));
    markChoice();
    go(1);
  });

  function first() { return (name.value.trim().split(/\s+/)[0]) || 'there'; }
  var steps = [
    { say: function () { return 'Hi! I’m the Pick & Mix Bot. What’s your name?'; }, show: [fName], field: name },
    { say: function () { return 'Nice to meet you, ' + first() + '! What brings you here today?'; }, show: [choices], choice: true },
    { say: function () { return topic.value === 'client-work' ? 'Ooh, a secret level! Which organisation are you with? You can skip this one.' : 'Exciting! Who are you working with? You can skip this one.'; },
      show: function () { return topic.value === 'client-work' ? [note, fOrg] : [fOrg]; }, field: org,
      when: function () { return topic.value === 'client-work' || topic.value === 'project'; } },
    { say: function () { return 'What’s your email, so we can reply?'; }, show: [fEmail], field: email },
    { say: function () { return 'Last one! Tell us all about it.'; }, show: [fMsg], field: msg, last: true }
  ];
  var managed = [fTopic, fName, fEmail, fOrg, fMsg, choices, note];
  var cur = 0, timer = null, full = '';

  function talk(text, silent) {
    clearInterval(timer);
    full = text;
    if (!silent) sr.textContent = text;
    npc.classList.add('is-talking');
    if (reduce) { typeEl.textContent = text; npc.classList.remove('is-talking'); return; }
    var n = 0; typeEl.textContent = '';
    timer = setInterval(function () {
      n += 2; typeEl.textContent = text.slice(0, n);
      if (n >= text.length) { clearInterval(timer); npc.classList.remove('is-talking'); }
    }, 22);
  }
  npc.addEventListener('click', function () { clearInterval(timer); typeEl.textContent = full; npc.classList.remove('is-talking'); });

  function ok(i) { return !steps[i].when || steps[i].when(); }
  function render(i, noFocus) {
    cur = i;
    var s = steps[i];
    managed.forEach(function (el) { if (el) el.hidden = true; });
    var show = typeof s.show === 'function' ? s.show() : s.show;
    show.forEach(function (el) { if (el) el.hidden = false; });
    nav.hidden = false; again.hidden = true;
    var firstOk = 0; while (!ok(firstOk)) firstOk++;
    back.hidden = i === firstOk;
    next.hidden = !!s.last;
    submit.hidden = !s.last;
    var shown = steps.filter(function (x, k) { return ok(k); }), pos = shown.indexOf(s);
    pips.innerHTML = shown.map(function (x, k) { return '<span class="' + (k < pos ? 'done' : k === pos ? 'on' : '') + '"></span>'; }).join('');
    talk(s.say());
    if (s.choice) markChoice();
    if (!noFocus) {
      var f = s.choice ? (choices.querySelector('[aria-pressed="true"]') || choices.firstChild) : s.field;
      if (f) f.focus({ preventScroll: true });
    }
  }
  function go(dir) {
    var s = steps[cur];
    if (dir > 0 && s.field && !s.field.reportValidity()) return;
    var i = cur + dir;
    while (i >= 0 && i < steps.length && !ok(i)) i += dir;
    if (i >= 0 && i < steps.length) render(i);
  }
  next.addEventListener('click', function () { go(1); });
  back.addEventListener('click', function () { go(-1); });
  document.addEventListener('submit', function (e) {
    if (e.target !== form || steps[cur].last) return;
    e.preventDefault(); e.stopImmediatePropagation(); go(1);
  }, true);
  form.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && e.target.tagName === 'INPUT' && !steps[cur].last) { e.preventDefault(); go(1); }
  });

  // React to sending
  var sentTopic = topic.value;
  form.addEventListener('submit', function () { if (steps[cur].last) { sentTopic = topic.value; talk('Beep boop… sending your message!', true); } });
  new MutationObserver(function () {
    if (status.classList.contains('is-success')) {
      talk(sentTopic === 'client-work'
        ? 'Access request received! Achievement unlocked. We’ll email you a link to our client work soon.'
        : 'Message received! Achievement unlocked. We’ll get back to you soon.', true);
      npc.classList.add('is-win');
      managed.forEach(function (el) { if (el) el.hidden = true; });
      back.hidden = true; next.hidden = true; submit.hidden = true; again.hidden = false;
      pips.innerHTML = '';
    } else if (status.classList.contains('is-error')) {
      talk('Uh-oh, that didn’t send. Have another go?', true);
    }
  }).observe(status, { attributes: true, attributeFilter: ['class'] });
  again.addEventListener('click', function () { npc.classList.remove('is-win'); status.classList.remove('is-success'); render(0); });

  nav.appendChild(submit);
  var intro = npc.previousElementSibling;
  if (intro && intro.tagName === 'P') intro.textContent = 'Our bot will ask you a few quick questions, and your answers come straight to our inbox.';
  npc.hidden = false;
  form.classList.add('is-npc');
  render(0, true);
  // the topic script can show the client-work note on load; tidy up after it
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { render(cur, true); });
  else setTimeout(function () { render(cur, true); }, 0);
})();

// Home main menu: highlight + info panel. Hover or focus picks an item;
// until then it gently cycles through them like a game's attract mode.
(function () {
  var menu = document.getElementById('tcMainMenu');
  var info = document.getElementById('tcMMInfo');
  if (!menu || !info) return;
  var links = Array.prototype.slice.call(menu.querySelectorAll('a'));
  var ic = document.getElementById('tcMMIc'), tag = document.getElementById('tcMMTag'), desc = document.getElementById('tcMMDesc');
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var cur = 0, auto = null;
  info.hidden = false;
  menu.classList.add('has-info');
  function sel(i) {
    cur = i;
    links.forEach(function (a, k) { a.classList.toggle('is-sel', k === i); });
    var a = links[i];
    ic.className = 'tc-mm-ic ' + a.getAttribute('data-ic');
    ic.innerHTML = a.querySelector('.tc-mm-svg').outerHTML;
    tag.textContent = a.getAttribute('data-tag');
    desc.textContent = a.querySelector('.tc-mm-desc').textContent;
    info.classList.remove('is-pop'); void info.offsetWidth; info.classList.add('is-pop');
  }
  function stop() { clearInterval(auto); auto = null; }
  links.forEach(function (a, i) {
    a.addEventListener('mouseenter', function () { stop(); sel(i); });
    a.addEventListener('focus', function () { stop(); sel(i); });
  });
  sel(0);
  if (!reduce) auto = setInterval(function () { if (!menu.hidden) sel((cur + 1) % links.length); }, 2600);
})();

// Home: chain across the client work card. It jangles on hover or tap and
// falls away when the padlock is opened. Decorative only.
(function () {
  var card = document.getElementById('tcUnlock');
  var bar = document.getElementById('tcChainBar');
  var pad = document.getElementById('tcPadlock');
  if (!card || !bar || !pad) return;
  var NS = 'http://www.w3.org/2000/svg';
  bar.appendChild(pad);
  card.classList.add('has-chain');
  function build() {
    Array.prototype.forEach.call(bar.querySelectorAll('svg.tc-chain'), function (s) { s.remove(); });
    var W = card.offsetWidth, H = 130, Y0 = 40, PITCH = 21;
    var off = bar.getBoundingClientRect().left - card.getBoundingClientRect().left;
    var DEFS = '<defs>' +
      '<linearGradient id="tcStR" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset=".35" stop-color="#C9D4DE"/><stop offset=".75" stop-color="#7F90A0"/><stop offset="1" stop-color="#4A5A6A"/></linearGradient>' +
      '<linearGradient id="tcStB" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E9EFF4"/><stop offset=".45" stop-color="#AEBDCB"/><stop offset="1" stop-color="#55667A"/></linearGradient>' +
      '</defs>';
    var RING = '<ellipse rx="15" ry="9.5" fill="none" stroke="#1F2B36" stroke-width="10"/>' +
      '<ellipse rx="15" ry="9.5" fill="none" stroke="url(#tcStR)" stroke-width="6.2"/>' +
      '<ellipse rx="11.2" ry="5.9" fill="none" stroke="rgba(16,30,45,.35)" stroke-width="1.2"/>' +
      '<path d="M-11 -6.5 Q-2 -11 9 -8" fill="none" stroke="#FFFFFF" stroke-width="1.8" stroke-linecap="round" opacity=".9"/>';
    var BAR = '<rect x="-16" y="-4.2" width="32" height="8.4" rx="4.2" fill="url(#tcStB)" stroke="#1F2B36" stroke-width="1.8"/>' +
      '<line x1="-9" y1="0.4" x2="9" y2="0.4" stroke="rgba(16,30,45,.55)" stroke-width="1.4" stroke-linecap="round"/>' +
      '<line x1="-12" y1="-2.1" x2="12" y2="-2.1" stroke="#FFFFFF" stroke-width="1.3" stroke-linecap="round" opacity=".85"/>';
    function mk(front) {
      var svg = document.createElementNS(NS, 'svg');
      svg.setAttribute('class', 'tc-chain' + (front ? ' tc-chain-front' : '')); svg.setAttribute('aria-hidden', 'true');
      svg.setAttribute('width', W); svg.setAttribute('height', H); svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
      svg.style.left = -off + 'px';
      svg.innerHTML = DEFS;
      return svg;
    }
    function G(cls) { var g = document.createElementNS(NS, 'g'); if (cls) g.setAttribute('class', cls); return g; }
    function place(parent, x, y, ang, html) {
      var g = G(); g.setAttribute('transform', 'translate(' + x.toFixed(1) + ' ' + y.toFixed(1) + ') rotate(' + ang.toFixed(1) + ')');
      g.innerHTML = html; parent.appendChild(g);
    }
    var svg = mk(false), front = mk(true), C = G('tc-chain-c');
    var cx = W / 2, cy = Y0 + 34;
    // two chains in an X, pulled down a little at the middle by the padlock
    // one chain, edge to edge, pulled down in the middle by the padlock; the ends are clipped at the card's edges
    [[[-12, Y0], [W + 12, Y0], 'tc-chain-l', 'tc-chain-r']].forEach(function (ch, idx) {
      var A = ch[0], B = ch[1];
      var ctl = [2 * cx - (A[0] + B[0]) / 2, 2 * cy - (A[1] + B[1]) / 2];
      function pt(t) { var u = 1 - t; return [u * u * A[0] + 2 * u * t * ctl[0] + t * t * B[0], u * u * A[1] + 2 * u * t * ctl[1] + t * t * B[1]]; }
      var tab = [[0, pt(0)]], S = 0, prev = pt(0);
      for (var k = 1; k <= 900; k++) { var p = pt(k / 900); S += Math.hypot(p[0] - prev[0], p[1] - prev[1]); tab.push([S, p]); prev = p; }
      function at(s) {
        for (var j = 1; j < tab.length; j++) if (tab[j][0] >= s) { var a = tab[j - 1][1], b = tab[j][1]; return [b, Math.atan2(b[1] - a[1], b[0] - a[0]) * 180 / Math.PI]; }
        return [tab[tab.length - 1][1], 0];
      }
      var n = Math.max(2, Math.round((S / 2) / PITCH)), step = (S / 2) / n;
      var L = G(ch[2]), R = G(ch[3]);
      L.style.transformOrigin = A[0] + 'px ' + A[1] + 'px'; R.style.transformOrigin = B[0] + 'px ' + B[1] + 'px';
      var bars = [], rings = [];
      for (var i = -n; i <= n; i++) {
        var q = at(S / 2 + i * step);
        if (i === 0) { place(C, q[0][0], q[0][1], q[1], BAR); continue; }
        (i % 2 ? rings : bars).push([i < 0 ? L : R, q]);
      }
      // edge-on links first, rings over their ends so they read as threaded
      bars.forEach(function (b) { place(b[0], b[1][0][0], b[1][0][1], b[1][1], BAR); });
      rings.forEach(function (r) { place(r[0], r[1][0][0], r[1][0][1], r[1][1], RING); });
      svg.appendChild(L); svg.appendChild(R);
    });
    front.appendChild(C);
    bar.insertBefore(svg, bar.firstChild);
    bar.appendChild(front);
    var scale = (pad.offsetWidth - 8) / 64;
    pad.style.top = (cy - 3 - 9 * scale) + 'px';
  }
  build();
  var rt; window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(build, 150); });
  function jangle() {
    if (card.classList.contains('is-open')) return;
    card.classList.remove('is-jangle'); void card.offsetWidth; card.classList.add('is-jangle');
  }
  card.addEventListener('mouseenter', jangle);
  card.addEventListener('click', function (e) { if (!e.target.closest('a')) jangle(); });
  card.addEventListener('animationend', function (e) { if (e.animationName === 'tcJangleL') card.classList.remove('is-jangle'); });
})();
