// Email address, put together in the page so spam bots reading the raw HTML don't see it.
var MAIL = ['hello', 'pickandmixstudios.com'].join(String.fromCharCode(64));
(function () {
  function fill() {
    document.querySelectorAll('.tc-mail').forEach(function (s) { s.textContent = MAIL; });
    document.querySelectorAll('a[data-mailto]').forEach(function (a) {
      var subj = a.getAttribute('data-subject');
      a.href = 'mailto:' + MAIL + (subj ? '?subject=' + encodeURIComponent(subj) : '');
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fill); else fill();
})();
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
            setStatus('Sorry, that didn’t send: ' + (data.message || 'please try again.') + ' You can also email ' + MAIL + '.', 'error');
          }
        })
        .catch(function () {
          setStatus('Sorry, something went wrong sending your message. Please try again, or email ' + MAIL + '.', 'error');
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
    '<button type="button" class="tc-tool-btn" id="tcSetBtn" aria-expanded="false" aria-controls="tcSetPanel" aria-label="Reading settings">Aa</button>' +
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
      '<div class="tc-ctl"><span class="tc-ctl-label" id="tcLblfont">Font</span>' +
        '<div class="tc-seg" role="group" aria-labelledby="tcLblfont">' +
          '<button type="button" data-pref="font" data-val="std" aria-pressed="true">Standard</button>' +
          '<button type="button" data-pref="font" data-val="easy" aria-pressed="false">Easy-read</button>' +
        '</div></div>' +
      '<div class="tc-ctl"><span class="tc-ctl-label" id="tcLblspace">Spacing</span>' +
        '<div class="tc-seg" role="group" aria-labelledby="tcLblspace">' +
          '<button type="button" data-pref="space" data-val="normal" aria-pressed="true">Normal</button>' +
          '<button type="button" data-pref="space" data-val="wide" aria-pressed="false">Wide</button>' +
        '</div></div>' +
      '<div class="tc-ctl"><span class="tc-ctl-label" id="tcLblmotion">Animation</span>' +
        '<div class="tc-seg" role="group" aria-labelledby="tcLblmotion">' +
          '<button type="button" data-pref="motion" data-val="on" aria-pressed="true">On</button>' +
          '<button type="button" data-pref="motion" data-val="off" aria-pressed="false">Off</button>' +
        '</div></div>' +
      '<div class="tc-ctl"><span class="tc-ctl-label" id="tcLblsimple">Simple page</span>' +
        '<div class="tc-seg" role="group" aria-labelledby="tcLblsimple">' +
          '<button type="button" data-pref="simple" data-val="off" aria-pressed="true">Off</button>' +
          '<button type="button" data-pref="simple" data-val="on" aria-pressed="false">On</button>' +
        '</div></div>' +
      '<div class="tc-ctl" id="tcCtlListen" hidden><span class="tc-ctl-label">Read aloud</span>' +
        '<button type="button" class="tc-listen-btn" id="tcListenBtn" aria-pressed="false"><span aria-hidden="true">&#9654;</span> Listen to this page</button></div>' +
      '<button type="button" class="tc-reset-btn" id="tcPrefsReset">Reset all</button>' +
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
  var savedTheme = store.get('bs-theme'); setTheme(savedTheme || 'auto', false); // follow the device on a first visit

  // Text size
  function setSize(n, save) {
    root.classList.remove('size-1', 'size-2'); if (n !== '0') root.classList.add('size-' + n);
    document.querySelectorAll('[data-size]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.size === n)); });
    if (save) { store.set('bs-size', n); announce(['Normal', 'Larger', 'Largest'][+n] + ' text'); }
  }
  document.querySelectorAll('[data-size]').forEach(function (b) { b.addEventListener('click', function () { setSize(b.dataset.size, true); }); });
  var savedSize = store.get('bs-size'); if (savedSize) setSize(savedSize, false);

  // Reading options (same saved settings as Tiny Bytes)
  var PREFS = { font: ['std', 'font-easy'], space: ['normal', 'space-wide'], motion: ['on', 'motion-off'], simple: ['off', 'simple'] };
  var PREF_NAMES = { font: { std: 'Standard font', easy: 'Easy-read font' }, space: { normal: 'Normal spacing', wide: 'Wide spacing' },
    motion: { on: 'Animation on', off: 'Animation off' }, simple: { off: 'Simple page off', on: 'Simple page on' } };
  function loadEasyFont() {
    if (document.getElementById('tcEasyFont')) return;
    var l = document.createElement('link'); l.id = 'tcEasyFont'; l.rel = 'stylesheet';
    var css = document.querySelector('link[href*="site.css"]'); l.href = css ? css.href.replace(/site\.css.*$/, 'fonts/atkinson.css') : '/assets/fonts/atkinson.css';
    document.head.appendChild(l);
  }
  function setPref(k, v, save) {
    root.classList.toggle(PREFS[k][1], v !== PREFS[k][0]);
    if (k === 'font' && v === 'easy') loadEasyFont();
    document.querySelectorAll('[data-pref="' + k + '"]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.val === v)); });
    if (save) { store.set('bs-' + k, v); announce(PREF_NAMES[k][v]); window.dispatchEvent(new Event('resize')); }
  }
  document.querySelectorAll('[data-pref]').forEach(function (b) { b.addEventListener('click', function () { setPref(b.dataset.pref, b.dataset.val, true); }); });
  Object.keys(PREFS).forEach(function (k) { var v = store.get('bs-' + k); if (v) setPref(k, v, false); });

  // Read aloud with the device's own voice
  var listenCtl = document.getElementById('tcCtlListen'), listenBtn = document.getElementById('tcListenBtn');
  if (listenCtl && 'speechSynthesis' in window) {
    listenCtl.hidden = false;
    var listenLabel = listenBtn.innerHTML;
    var stopReading = function () { speechSynthesis.cancel(); listenBtn.setAttribute('aria-pressed', 'false'); listenBtn.innerHTML = listenLabel; };
    listenBtn.addEventListener('click', function () {
      if (listenBtn.getAttribute('aria-pressed') === 'true') { stopReading(); return; }
      var main = document.getElementById('main-content') || document.querySelector('main'); if (!main) return;
      var parts = main.innerText.split(/\n+/).map(function (t) { return t.trim(); }).filter(Boolean);
      speechSynthesis.cancel();
      parts.forEach(function (t, i) {
        var u = new SpeechSynthesisUtterance(t); u.lang = document.documentElement.lang || 'en-GB'; u.rate = 0.95;
        if (i === parts.length - 1) u.onend = stopReading;
        speechSynthesis.speak(u);
      });
      listenBtn.setAttribute('aria-pressed', 'true'); listenBtn.innerHTML = '<span aria-hidden="true">&#9632;</span> Stop reading';
    });
    window.addEventListener('pagehide', stopReading);
  }
  var resetBtn = document.getElementById('tcPrefsReset');
  if (resetBtn) resetBtn.addEventListener('click', function () {
    setTheme('auto', false); setSize('0', false);
    Object.keys(PREFS).forEach(function (k) { setPref(k, PREFS[k][0], false); });
    ['bs-theme', 'bs-size', 'bs-font', 'bs-space', 'bs-motion', 'bs-simple'].forEach(function (k) { try { localStorage.removeItem(k); } catch (e) {} });
    announce('Reading settings reset'); window.dispatchEvent(new Event('resize'));
  });

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
    n.addEventListener('click', function () {
      select(i, false);
      // bring the level's details into view so it's clear something changed
      var card = cards[i], r = card.getBoundingClientRect();
      if (r.top > window.innerHeight * .6 || r.bottom < 80) {
        var still = document.documentElement.classList.contains('motion-off') || matchMedia('(prefers-reduced-motion: reduce)').matches;
        setTimeout(function () { card.scrollIntoView({ behavior: still ? 'auto' : 'smooth', block: 'start' }); }, still ? 0 : 250);
      }
      card.classList.remove('is-new'); void card.offsetWidth; card.classList.add('is-new');
    });
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

// ==========================================================================
// Easter eggs: sweet hunt (8 hidden sweets, one per page), cheat code
// (Konami code, or tap the big home logo 7 times), a grumpy padlock and the
// Sweet catch mini-game. All optional; progress is kept on this device only.
// ==========================================================================
(function () {
  var LS = {
    get: function (k, d) { try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  };
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  function calm() { return reduce || document.documentElement.classList.contains('motion-off') || document.documentElement.classList.contains('simple'); }

  // ---- toast
  var toast = document.createElement('div');
  toast.className = 'pm-toast'; toast.setAttribute('role', 'status'); toast.setAttribute('aria-live', 'polite');
  document.body.appendChild(toast);
  var toastTimer;
  function say(html, ms, action) {
    toast.innerHTML = html;
    if (action) {
      var b = document.createElement('button'); b.type = 'button'; b.className = 'pm-toast-btn'; b.textContent = action.label;
      b.addEventListener('click', function () { hideToast(); action.fn(); });
      toast.appendChild(b);
    }
    toast.classList.add('is-on');
    clearTimeout(toastTimer); toastTimer = setTimeout(hideToast, ms || 3500);
  }
  function hideToast() { toast.classList.remove('is-on'); }

  // ---- sweet shapes (SVG)
  // each sweet is drawn three times: a thick white sticker edge, a dark outline, then the colour
  function stk(shape, c, extra) {
    return '<svg viewBox="0 0 40 40" aria-hidden="true" focusable="false"><g fill="#fff" stroke="#fff" stroke-width="6" stroke-linejoin="round">' + shape + '</g>' +
      '<g fill="' + c + '" stroke="#10324F" stroke-width="1.8" stroke-linejoin="round">' + shape + '</g>' + (extra || '') + '</svg>';
  }
  var SWEET_SVG = {
    bear: function (c) { return stk('<circle cx="13" cy="9" r="3.6"/><circle cx="27" cy="9" r="3.6"/><circle cx="20" cy="13.5" r="7.2"/><ellipse cx="20" cy="26" rx="8.6" ry="9"/><circle cx="11" cy="22" r="3.2"/><circle cx="29" cy="22" r="3.2"/><circle cx="14" cy="33.5" r="3.4"/><circle cx="26" cy="33.5" r="3.4"/>', c,
      '<circle cx="17.3" cy="12.5" r="1.2" fill="#10324F"/><circle cx="22.7" cy="12.5" r="1.2" fill="#10324F"/><path d="M18 16q2 1.6 4 0" stroke="#10324F" stroke-width="1.3" fill="none" stroke-linecap="round"/><ellipse cx="16" cy="23" rx="2.6" ry="1.4" fill="#fff" opacity=".6" transform="rotate(-30 16 23)"/>'); },
    lolly: function (c) { return stk('<rect x="18.6" y="22" width="2.8" height="15" rx="1.4"/><circle cx="20" cy="15" r="11.5"/>', c,
      '<rect x="18.6" y="27" width="2.8" height="10" rx="1.4" fill="#fff" stroke="#10324F" stroke-width="1.4"/><path d="M20 15 a2 2 0 0 1 2 2 a4 4 0 0 1 -4 4 a6 6 0 0 1 -6 -6 a8 8 0 0 1 8 -8 a9 9 0 0 1 8.6 6.3" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/>'); },
    wrap: function (c) { return stk('<path d="M3 11l8.5 5.5v7L3 29zM37 11l-8.5 5.5v7L37 29z"/><ellipse cx="20" cy="20" rx="10" ry="8.5"/>', c,
      '<path d="M13.5 17.5q6.5-6 13 0M13.5 22.5q6.5 6 13 0" stroke="#fff" stroke-width="1.8" fill="none" opacity=".75" stroke-linecap="round"/><path d="M6 15l3 1.8M6 25l3-1.8M34 15l-3 1.8M34 25l-3-1.8" stroke="#10324F" stroke-width="1.2" stroke-linecap="round"/>'); },
    // cola bottle, the pick & mix classic (kept under the old "bean" name so saved spots still work)
    bean: function (c) { return stk('<path d="M16 3h8v4.5c0 2.5 4.5 4.5 4.5 11v4.5c0 1.5-1.2 2.3-1.2 3.7s1.2 2.1 1.2 3.6V35c0 1.8-3 2.6-8.5 2.6S11.5 36.8 11.5 35v-4.7c0-1.5 1.2-2.2 1.2-3.6s-1.2-2.2-1.2-3.7V18.5c0-6.5 4.5-8.5 4.5-11z"/>', c,
      '<path d="M12.6 25.4h14.8" stroke="#10324F" stroke-width="1.4"/><rect x="15.5" y="3" width="9" height="3.4" rx="1" fill="#fff" stroke="#10324F" stroke-width="1.4"/><path d="M15 15c-1 2-1.3 4-1.2 7" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round" opacity=".7"/>'); }
  };

  // ---- sweet hunt: one hidden sweet per page
  var TOTAL = 8;
  var SPOTS = {
    index:          { sel: '.tc-sq-art', kind: 'bear', col: '#FF8DBC', pos: 'left:6px;bottom:2px' },
    'team-chorley': { sel: '.tc-page-heading', kind: 'lolly', col: '#C01F62', pos: 'right:6%;bottom:0' },
    showcase:       { sel: '#tcMap', kind: 'wrap', col: '#F4C24C', pos: 'right:4px;bottom:2px' },
    tutorials:      { sel: '#tcShelf', kind: 'bean', col: '#7BE0A5', pos: 'right:6px;top:4px' },
    'popup-shop':   { sel: '.tc-loot-row', kind: 'bear', col: '#FFAA66', pos: 'left:0;bottom:0' },
    contact:        { sel: '.tc-cyp-pill', kind: 'wrap', col: '#F4C24C', pos: 'right:-38px;top:-18px;transform:rotate(18deg)' },
    privacy:        { sel: '.tc-legal', kind: 'lolly', col: '#1A64A8', pos: 'right:6px;bottom:4px' },
    accessibility:  { sel: '.tc-sticker-h1', kind: 'bean', col: '#C01F62', pos: 'right:4%;top:6%' }
  };

  var page = (location.pathname.split('/').pop() || 'index.html').replace(/\.html$/, '') || 'index';
  if (location.pathname.indexOf('/examples/') !== -1) page = 'examples';
  // ?sweets=reset puts every sweet back (handy for testing)
  if (/[?&]sweets=reset\b/.test(location.search)) { try { localStorage.removeItem('pm-sweets'); } catch (e) {} }
  var found = LS.get('pm-sweets', []);
  var spot = SPOTS[page], host = spot && document.querySelector(spot.sel);
  // never put the sweet inside a tab list or menu: use its container instead
  while (host && /^(tablist|menu|listbox|radiogroup)$/.test(host.getAttribute('role') || '')) host = host.parentElement;
  while (host && host.closest('[aria-hidden="true"]')) host = host.closest('[aria-hidden="true"]').parentElement;
  if (host && found.indexOf(page) === -1) {
    if (getComputedStyle(host).position === 'static') host.style.position = 'relative';
    var b = document.createElement('button');
    b.type = 'button'; b.className = 'pm-sweet'; b.style.cssText = spot.pos;
    b.setAttribute('aria-label', 'A hidden sweet! Collect it');
    b.innerHTML = SWEET_SVG[spot.kind](spot.col);
    host.appendChild(b);
    b.addEventListener('click', function (e) {
      e.stopPropagation(); e.preventDefault();
      if (found.indexOf(page) === -1) found.push(page);
      LS.set('pm-sweets', found);
      b.classList.add('is-got'); b.disabled = true;
      setTimeout(function () { b.remove(); }, calm() ? 0 : 600);
      if (window.pmUpdateArcadeTab) window.pmUpdateArcadeTab();
      if (found.length >= TOTAL) {
        say('<strong>Achievement unlocked: Sweet tooth!</strong> You found all ' + TOTAL + ' sweets.', 9000, { label: 'Open the arcade', fn: function () { openGame(); } });
      } else {
        say('<strong>Sweet found!</strong> ' + found.length + ' of ' + TOTAL + '. Find them all to unlock the arcade!', 4000);
      }
    });
  }

  // ---- cheat code
  var KONAMI = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'], ki = 0;
  document.addEventListener('keydown', function (e) {
    var k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    ki = (k === KONAMI[ki]) ? ki + 1 : (k === KONAMI[0] ? 1 : 0);
    if (ki === KONAMI.length) { ki = 0; cheat(); }
  });
  var logo = document.querySelector('img.tc-hero-welcome-img'), taps = 0, tapT;
  if (logo) logo.addEventListener('click', function (e) {
    // a happy boing and a little burst of sweets on every tap
    if (!calm()) {
      var bot = logo.parentElement;
      bot.classList.remove('is-boing'); void bot.offsetWidth; bot.classList.add('is-boing');
      juggle(bot);
    }
    taps++; clearTimeout(tapT); tapT = setTimeout(function () { taps = 0; }, 1500);
    if (taps >= 7) { taps = 0; cheat(); }
  });
  // the robot throws his lollipop and gummy bear from hand to hand, twice
  var juggling = false;
  function juggle(bot) {
    var lol = bot.querySelector('.tc-juggle-lolly'), bear = bot.querySelector('.tc-juggle-bear');
    if (juggling || !lol || !bear || !lol.animate) return;
    juggling = true;
    var w = bot.offsetWidth, h = bot.offsetHeight;
    var dx = w * (764 - 100) / 858, dy = h * (404 - 354) / 802;
    function arc(fromX, fromY, toX, toY, lift, spin, n) {
      var f = [];
      for (var i = 0; i <= n; i++) {
        var t = i / n, x = fromX + (toX - fromX) * t, y = fromY + (toY - fromY) * t - 4 * lift * t * (1 - t);
        f.push({ transform: 'translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px) rotate(' + (spin * t).toFixed(0) + 'deg)' });
      }
      return f;
    }
    // lollipop: left hand to right hand and back; bear: right to left and back, on a higher arc so they pass
    var lk = arc(0, 0, dx, dy, h * .34, 360, 12).concat(arc(dx, dy, 0, 0, h * .34, -360, 12).slice(1));
    var bk = arc(0, 0, -dx, -dy, h * .52, -300, 12).concat(arc(-dx, -dy, 0, 0, h * .52, 300, 12).slice(1));
    lol.animate(lk, { duration: 1500, easing: 'linear' });
    var a = bear.animate(bk, { duration: 1500, easing: 'linear', delay: 120 });
    a.onfinish = function () { juggling = false; };
  }
  function cheat() {
    say('<strong>Cheat mode activated!</strong> Sweets for everyone.', 8000, { label: 'Open the arcade', fn: function () { openGame(); } });
    if (calm()) return;
    var layer = document.createElement('div'); layer.className = 'pm-rain'; layer.setAttribute('aria-hidden', 'true');
    var kinds = Object.keys(SWEET_SVG), cols = ['#FF8DBC', '#F4C24C', '#7DC2F4', '#7BE0A5', '#FFAA66', '#C01F62'];
    for (var i = 0; i < 40; i++) {
      var s = document.createElement('span');
      s.innerHTML = SWEET_SVG[kinds[i % kinds.length]](cols[i % cols.length]);
      s.style.left = (Math.random() * 100) + 'vw';
      s.style.animationDelay = (Math.random() * 1.6) + 's';
      s.style.animationDuration = (2.2 + Math.random() * 1.6) + 's';
      s.style.setProperty('--spin', (Math.random() * 720 - 360) + 'deg');
      layer.appendChild(s);
    }
    document.body.appendChild(layer);
    setTimeout(function () { layer.remove(); }, 5200);
  }

  // ---- grumpy padlock: wakes up (eyes) on the first tap, talks from the second
  var card = document.getElementById('tcUnlock'), padTries = 0, padIdx = 0;
  var LINES = [
    'Oi! That tickles! &#x1F606;',
    'Nice try. I went to padlock school. &#x1F393;',
    'No key, no entry. Them&rsquo;s the rules. &#x1F511;',
    'Error 403: padlock says no. &#x1F645;',
    'Have you tried turning me off and on again?',
    'Keep poking and I&rsquo;ll tell the robot. &#x1F916;',
    'I&rsquo;m not even locked to anything. I just like the chain. &#x26D3;&#xFE0F;',
    'Psst&hellip; the Request access button is RIGHT there &#x1F447;'
  ];
  var padSvg = document.querySelector('.tc-padlock-svg');
  if (card && padSvg) {
    var NS = 'http://www.w3.org/2000/svg';
    var eyes = document.createElementNS(NS, 'g'); eyes.setAttribute('class', 'tc-pad-eyes');
    eyes.innerHTML = '<g class="tc-pad-lids"><ellipse cx="23.5" cy="40.5" rx="5" ry="5.2" fill="#fff" stroke="#3A1A06" stroke-width="1.6"/><ellipse cx="40.5" cy="40.5" rx="5" ry="5.2" fill="#fff" stroke="#3A1A06" stroke-width="1.6"/>' +
      '<g class="tc-pad-pupils"><circle cx="24" cy="41" r="2.3" fill="#10324F"/><circle cx="41" cy="41" r="2.3" fill="#10324F"/><circle cx="24.8" cy="40.1" r=".8" fill="#fff"/><circle cx="41.8" cy="40.1" r=".8" fill="#fff"/></g></g>' +
      '<path class="tc-pad-brows" d="M18.5 33.6 L28 35.6 M45.5 33.6 L36 35.6" stroke="#3A1A06" stroke-width="2" stroke-linecap="round"/>';
    padSvg.appendChild(eyes);
    var bubble = document.createElement('div'); bubble.className = 'pm-pad-bubble'; bubble.setAttribute('role', 'status');
    (document.getElementById('tcChainBar') || card).appendChild(bubble);
    var bT;
    card.addEventListener('click', function (e) {
      if (e.target.closest('a, .pm-sweet')) return;
      padTries++;
      card.classList.add('is-awake');
      if (padTries >= 3) card.classList.add('is-cross');
      if (padTries < 2) return;
      var padEl = document.getElementById('tcPadlock');
      if (padEl && bubble.parentNode === padEl.parentNode) bubble.style.top = (padEl.offsetTop + 4) + 'px';
      bubble.innerHTML = LINES[padIdx % LINES.length]; padIdx++;
      bubble.classList.add('is-on'); clearTimeout(bT);
      bT = setTimeout(function () { bubble.classList.remove('is-on'); }, 3800);
    });
  }

  // ---- the arcade (assets/arcade.js, loaded only when it's opened)
  var arcadeLoading = null;
  function openGame(id) {
    if (window.pmArcade) { window.pmArcade.open(id); return; }
    if (!arcadeLoading) {
      arcadeLoading = new Promise(function (res, rej) {
        var me = document.querySelector('script[src*="site.js"]');
        var s = document.createElement('script');
        s.src = me ? me.src.replace(/site\.js/, 'arcade.js') : '/assets/arcade.js';
        s.onload = res; s.onerror = rej; document.head.appendChild(s);
      });
    }
    arcadeLoading.then(function () { window.pmArcade.open(id); });
  }
  window.pmOpenArcade = openGame;

  // ---- floating Arcade tab: locked until all the sweets are found
  var PAGES = [['index', 'Home', ''], ['team-chorley', 'Team', 'team-chorley.html'], ['showcase', 'Showcase', 'showcase.html'], ['tutorials', 'Tutorials', 'tutorials.html'],
    ['popup-shop', 'Pop-up Shop', 'popup-shop.html'], ['contact', 'Get in touch', 'contact.html'], ['privacy', 'Privacy', 'privacy.html'], ['accessibility', 'Accessibility', 'accessibility.html']];
  if (page !== 'examples') {
    var pre = location.pathname.indexOf('/examples/') !== -1 ? '../' : '';
    var tabBtn = document.createElement('button');
    tabBtn.type = 'button'; tabBtn.className = 'pm-arcade-tab'; tabBtn.setAttribute('aria-expanded', 'false'); tabBtn.setAttribute('aria-controls', 'pmArcadePanel');
    var panel = document.createElement('div');
    panel.className = 'pm-arcade-panel'; panel.id = 'pmArcadePanel'; panel.hidden = true; panel.setAttribute('role', 'dialog'); panel.setAttribute('aria-labelledby', 'pmArcadePanelTitle');
    document.body.appendChild(tabBtn); document.body.appendChild(panel);
    var LOCK = '<svg viewBox="0 0 64 76" aria-hidden="true" focusable="false"><path d="M17 36 V22 Q17 8 32 8 Q47 8 47 22 V36" fill="none" stroke="#3A2A0A" stroke-width="10" stroke-linecap="round"/><path d="M17 36 V22 Q17 8 32 8 Q47 8 47 22 V36" fill="none" stroke="#DCE4EC" stroke-width="6.5" stroke-linecap="round"/><rect x="7" y="32" width="50" height="40" rx="9" fill="#F4C24C" stroke="#5A3A06" stroke-width="2.5"/><circle cx="32" cy="49" r="5.5" fill="#3A1A06"/><path d="M29.5 51 L28 62 H36 L34.5 51 Z" fill="#3A1A06"/></svg>';
    var SLOT_COLS = ['#FF8DBC', '#C01F62', '#F4C24C', '#7BE0A5', '#FFAA66', '#7DC2F4', '#1A64A8', '#C01F62'];
    var SLOT_KINDS = ['bear', 'lolly', 'wrap', 'bean', 'bear', 'wrap', 'lolly', 'bean'];
    function renderTab() {
      var f = LS.get('pm-sweets', []), n = f.length, open = n >= TOTAL;
      tabBtn.classList.toggle('is-open', open);
      tabBtn.innerHTML = '<svg class="pm-at-cab" viewBox="0 0 64 84" aria-hidden="true" focusable="false">' +
        '<path d="M10 14 L14 4 H50 L54 14 V80 H10 Z" fill="#16314D" stroke="#FFFFFF" stroke-width="2.5" stroke-linejoin="round"/>' +
        '<rect x="13" y="7" width="38" height="10" rx="2" fill="' + (open ? '#F4C24C' : '#E2367D') + '"/>' +
        '<text x="32" y="15" text-anchor="middle" font-family="Maven Pro, Arial, sans-serif" font-weight="800" font-size="7.5" letter-spacing=".6" fill="' + (open ? '#3A2A0A' : '#FFFFFF') + '">ARCADE</text>' +
        '<rect x="15" y="21" width="34" height="27" rx="4" fill="' + (open ? '#1A64A8' : '#0E1A26') + '" stroke="#7DC2F4" stroke-width="1.5"/>' +
        (open ? '<path d="M24 39 L28 29 L32 36 L36 31 L40 39 Z" fill="#7BE0A5"/><circle cx="25" cy="28" r="2" fill="#F4C24C"/><circle cx="40" cy="27" r="1.4" fill="#FFFFFF"/>' :
          '<path d="M27 34 V30 Q27 25 32 25 Q37 25 37 30 V34" fill="none" stroke="#DCE4EC" stroke-width="2.6"/><rect x="24.5" y="33" width="15" height="11" rx="2.5" fill="#F4C24C"/><circle cx="32" cy="38" r="1.6" fill="#3A1A06"/>') +
        '<path d="M8 52 H56 L54 62 H10 Z" fill="#1F4B75" stroke="#FFFFFF" stroke-width="2" stroke-linejoin="round"/>' +
        '<line x1="22" y1="57" x2="20" y2="51" stroke="#DCE4EC" stroke-width="2" stroke-linecap="round"/><circle cx="20" cy="50" r="2.6" fill="#E2367D"/>' +
        '<circle cx="36" cy="57" r="2.2" fill="#F4C24C"/><circle cx="43" cy="57" r="2.2" fill="#7BE0A5"/>' +
        '<rect x="22" y="67" width="20" height="5" rx="1.5" fill="#0E1A26"/></svg>' +
        '<span class="pm-at-n' + (open ? ' is-open' : '') + '" aria-hidden="true">' + (open ? 'Play!' : n + '/' + TOTAL) + '</span>';
      tabBtn.setAttribute('aria-label', open ? 'Arcade: unlocked, play the games' : 'Arcade: locked, ' + n + ' of ' + TOTAL + ' sweets found');
      var slots = '', list = '';
      PAGES.forEach(function (p, i) {
        var got = f.indexOf(p[0]) !== -1;
        slots += '<span class="pm-ap-slot' + (got ? ' is-got' : '') + '">' + SWEET_SVG[SLOT_KINDS[i]](got ? SLOT_COLS[i] : '#C9D4DE') + '</span>';
        list += '<li class="' + (got ? 'is-got' : '') + '">' + (got ? '<span aria-hidden="true">&#10003;</span> ' : '') +
          (got ? p[1] + '<span class="pm-sr">: found</span>' : '<a href="' + pre + (p[2] || 'index.html') + '">' + p[1] + '</a><span class="pm-sr">: not found yet</span>') + '</li>';
      });
      panel.innerHTML =
        '<button type="button" class="pm-ap-x" aria-label="Close">&times;</button>' +
        '<div class="pm-ap-lock' + (open ? ' is-open' : '') + '">' + LOCK + '</div>' +
        '<h2 class="pm-ap-title" id="pmArcadePanelTitle">' + (open ? 'Arcade unlocked!' : 'The arcade is locked') + '</h2>' +
        '<p class="pm-ap-txt">' + (open ? 'You found every sweet. Six games are waiting for you.' :
          'There&rsquo;s a sweet hidden on every page of this site. Find all ' + TOTAL + ' to unlock six mini-games.') + '</p>' +
        '<div class="pm-ap-slots" aria-hidden="true">' + slots + '</div>' +
        '<p class="pm-ap-count">' + n + ' of ' + TOTAL + ' sweets found</p>' +
        (open ? '<button type="button" class="pm-ap-play">&#9654; Play now</button>' :
          '<p class="pm-ap-hint">Tip: look closely at the pictures, boards and headings. Your progress:</p><ul class="pm-ap-list">' + list + '</ul>');
      panel.querySelector('.pm-ap-x').addEventListener('click', function () { togglePanel(false); });
      var pb = panel.querySelector('.pm-ap-play'); if (pb) pb.addEventListener('click', function () { togglePanel(false); openGame(); });
    }
    function togglePanel(show) {
      if (show) renderTab();
      panel.hidden = !show; tabBtn.setAttribute('aria-expanded', String(show));
      if (show) { var f = panel.querySelector('.pm-ap-play, .pm-ap-list a, .pm-ap-x'); if (f) f.focus(); } else tabBtn.focus();
    }
    tabBtn.addEventListener('click', function () { togglePanel(panel.hidden); });
    panel.addEventListener('keydown', function (e) { if (e.key === 'Escape') togglePanel(false); });
    document.addEventListener('click', function (e) { if (!panel.hidden && e.target.isConnected && !panel.contains(e.target) && !tabBtn.contains(e.target)) { panel.hidden = true; tabBtn.setAttribute('aria-expanded', 'false'); } });
    window.pmUpdateArcadeTab = function () { renderTab(); tabBtn.classList.remove('is-bump'); void tabBtn.offsetWidth; tabBtn.classList.add('is-bump'); };
    renderTab();
  }
  // ?game=play opens the arcade; ?game=catch, match, memory, hop, whack or claw opens that game
  var gm = /[?&]game=([a-z]+)/.exec(location.search);
  if (gm) openGame(gm[1] === 'play' ? null : gm[1]);
})();
