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
  var savedTheme = store.get('bs-theme'); if (savedTheme) setTheme(savedTheme, false);

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
    b.type = 'button'; b.className = 'tc-node'; b.id = 'tcLevel' + (i + 1);
    b.setAttribute('role', 'tab');
    b.setAttribute('aria-controls', card.id);
    b.setAttribute('aria-label', 'Level ' + (i + 1) + ': ' + name.trim() + (award ? ', Platinum award winner' : ''));
    card.setAttribute('aria-labelledby', b.id);
    b.innerHTML = (thumb ? '<img class="tc-node-thumb" alt="" src="' + thumb.getAttribute('src') + '">' : '') +
      '<span class="tc-node-num" aria-hidden="true">' + (i + 1) + '</span>' +
      (award ? '<span class="tc-node-star" aria-hidden="true"><img alt="" src="assets/img/award-platinum.webp"></span>' : '') +
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
