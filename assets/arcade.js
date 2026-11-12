/* Pick & Mix Arcade: six little games behind the site's Easter eggs.
   Loaded only when the arcade is opened (cheat code, sweet hunt, ?game=).
   Best scores are kept on the visitor's device only. */
(function () {
  'use strict';
  if (window.pmArcade) return;

  var NAVY = '#10324F', INK = '#0E1A26';
  var SWEETS = [
    { k: 'bear', c: '#FF8DBC', n: 'pink gummy bear' },
    { k: 'wrap', c: '#F4C24C', n: 'yellow wrapped sweet' },
    { k: 'bean', c: '#7BE0A5', n: 'green jelly bean' },
    { k: 'ball', c: '#7DC2F4', n: 'blue gobstopper' },
    { k: 'star', c: '#FFAA66', n: 'orange jelly star' },
    { k: 'heart', c: '#C79BF2', n: 'purple jelly heart' }
  ];
  var store = {
    get: function (k, d) { try { var v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  };
  var robotImg = new Image();
  var cssLink = document.querySelector('link[href*="site.css"]');
  robotImg.src = cssLink ? cssLink.href.replace(/site\.css.*$/, 'img/robot-logo.webp') : '/assets/img/robot-logo.webp';

  // ---------------------------------------------------------------- shapes
  // Glossy outlined sweets as SVG (menu art, DOM games) ...
  function sweetSVG(i, size) {
    var s = SWEETS[i], c = s.c, o = 'stroke="' + NAVY + '" stroke-width="2.2" stroke-linejoin="round"', shape;
    switch (s.k) {
      case 'bear': shape = '<g fill="' + c + '" ' + o + '><circle cx="12" cy="9" r="4"/><circle cx="28" cy="9" r="4"/><circle cx="20" cy="14" r="8"/><ellipse cx="20" cy="27" rx="9.5" ry="9"/><circle cx="10" cy="23" r="3.6"/><circle cx="30" cy="23" r="3.6"/><circle cx="13.5" cy="34" r="3.8"/><circle cx="26.5" cy="34" r="3.8"/></g><ellipse cx="16.5" cy="11.5" rx="2.6" ry="1.6" fill="#fff" opacity=".75"/>'; break;
      case 'wrap': shape = '<path d="M3 12l9 5v7l-9 5zM37 12l-9 5v7l9 5z" fill="' + c + '" ' + o + '/><ellipse cx="20" cy="20.5" rx="10.5" ry="9" fill="' + c + '" ' + o + '/><path d="M14 16c3-3 8-3.4 11-1.6" stroke="#fff" stroke-width="2.2" fill="none" stroke-linecap="round" opacity=".8"/>'; break;
      case 'bean': shape = '<path d="M9 12c6-8 24-6 23 7s-8 9-12 11-14 5-15-5 0-10 4-13z" fill="' + c + '" ' + o + '/><ellipse cx="15.5" cy="13.5" rx="4.4" ry="2" fill="#fff" opacity=".7" transform="rotate(-25 15.5 13.5)"/>'; break;
      case 'ball': shape = '<circle cx="20" cy="20" r="13" fill="' + c + '" ' + o + '/><path d="M9 20h22" stroke="#fff" stroke-width="3" opacity=".55"/><circle cx="15" cy="14" r="3.4" fill="#fff" opacity=".8"/>'; break;
      case 'star': shape = '<path d="M20 5l4.3 9 9.9 1.3-7.2 6.8 1.9 9.8L20 27.2l-8.9 4.7 1.9-9.8-7.2-6.8 9.9-1.3z" fill="' + c + '" ' + o + '/><ellipse cx="17" cy="14" rx="2.6" ry="1.5" fill="#fff" opacity=".75"/>'; break;
      default: shape = '<path d="M20 33C9 25 6 19 6 14.5 6 10 9.4 7 13.3 7c3 0 5.2 1.7 6.7 4 1.5-2.3 3.7-4 6.7-4C30.6 7 34 10 34 14.5 34 19 31 25 20 33z" fill="' + c + '" ' + o + '/><ellipse cx="13.5" cy="13" rx="2.8" ry="1.7" fill="#fff" opacity=".75"/>';
    }
    return '<svg viewBox="0 0 40 40" width="' + (size || 40) + '" height="' + (size || 40) + '" aria-hidden="true" focusable="false">' + shape + '</svg>';
  }
  // ... and the same sweets drawn on a canvas.
  function drawSweet(ctx, i, x, y, scale, rot) {
    var s = SWEETS[i];
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot || 0); ctx.scale(scale || 1, scale || 1); ctx.translate(-20, -20);
    ctx.lineWidth = 2.2; ctx.strokeStyle = NAVY; ctx.lineJoin = 'round'; ctx.fillStyle = s.c;
    function circ(cx, cy, r) { ctx.beginPath(); ctx.arc(cx, cy, r, 0, 7); ctx.fill(); ctx.stroke(); }
    function shine(cx, cy, rx, ry, a) { ctx.save(); ctx.globalAlpha = 0.75; ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, a || 0, 0, 7); ctx.fill(); ctx.restore(); }
    var p;
    switch (s.k) {
      case 'bear': circ(12, 9, 4); circ(28, 9, 4); circ(10, 23, 3.6); circ(30, 23, 3.6); circ(13.5, 34, 3.8); circ(26.5, 34, 3.8);
        ctx.beginPath(); ctx.ellipse(20, 27, 9.5, 9, 0, 0, 7); ctx.fill(); ctx.stroke(); circ(20, 14, 8); shine(16.5, 11.5, 2.6, 1.6); break;
      case 'wrap': p = new Path2D('M3 12l9 5v7l-9 5zM37 12l-9 5v7l9 5z'); ctx.fill(p); ctx.stroke(p);
        ctx.beginPath(); ctx.ellipse(20, 20.5, 10.5, 9, 0, 0, 7); ctx.fill(); ctx.stroke(); shine(18, 15.5, 4.5, 1.6, -0.2); break;
      case 'bean': p = new Path2D('M9 12c6-8 24-6 23 7s-8 9-12 11-14 5-15-5 0-10 4-13z'); ctx.fill(p); ctx.stroke(p); shine(15.5, 13.5, 4.4, 2, -0.44); break;
      case 'ball': circ(20, 20, 13); ctx.save(); ctx.globalAlpha = 0.55; ctx.strokeStyle = '#fff'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(9, 20); ctx.lineTo(31, 20); ctx.stroke(); ctx.restore(); shine(15, 14, 3.4, 3.4); break;
      case 'star': p = new Path2D('M20 5l4.3 9 9.9 1.3-7.2 6.8 1.9 9.8L20 27.2l-8.9 4.7 1.9-9.8-7.2-6.8 9.9-1.3z'); ctx.fill(p); ctx.stroke(p); shine(17, 14, 2.6, 1.5); break;
      default: p = new Path2D('M20 33C9 25 6 19 6 14.5 6 10 9.4 7 13.3 7c3 0 5.2 1.7 6.7 4 1.5-2.3 3.7-4 6.7-4C30.6 7 34 10 34 14.5 34 19 31 25 20 33z'); ctx.fill(p); ctx.stroke(p); shine(13.5, 13, 2.8, 1.7);
    }
    ctx.restore();
  }
  function drawBroccoli(ctx, x, y, scale, rot) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot || 0); ctx.scale(scale || 1, scale || 1);
    ctx.lineWidth = 2.2; ctx.strokeStyle = NAVY;
    ctx.fillStyle = '#8DBF4A'; ctx.beginPath(); ctx.roundRect(-4, 0, 8, 16, 3); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#3BA55C';
    [[-9, -3, 8], [9, -3, 8], [0, -10, 9], [-4, 1, 7], [5, 1, 7]].forEach(function (c) { ctx.beginPath(); ctx.arc(c[0], c[1], c[2], 0, 7); ctx.fill(); ctx.stroke(); });
    ctx.restore();
  }
  function drawBoard(ctx, w, h) {
    var g = ctx.createLinearGradient(0, 0, w * 0.4, h); g.addColorStop(0, '#2C8BCB'); g.addColorStop(1, '#1A64A8');
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = 'rgba(255,255,255,.16)';
    for (var y = 7; y < h; y += 14) for (var x = 7; x < w; x += 14) { ctx.beginPath(); ctx.arc(x, y, 1.2, 0, 7); ctx.fill(); }
  }
  function stickerText(ctx, txt, x, y, rot, bg) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot || 0);
    ctx.font = '900 16px Poppins, "Arial Black", sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    var w = ctx.measureText(txt).width + 14;
    ctx.fillStyle = bg || '#C01F62'; ctx.strokeStyle = '#fff'; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.roundRect(-w / 2, -12, w, 24, 7); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#fff'; ctx.fillText(txt, 0, 1); ctx.restore();
  }
  function makeCanvas(stage, w, h) {
    var dpr = Math.min(2, window.devicePixelRatio || 1);
    var cv = document.createElement('canvas'); cv.width = w * dpr; cv.height = h * dpr; cv.className = 'pa-canvas';
    var ctx = cv.getContext('2d'); ctx.scale(dpr, dpr);
    if (!ctx.roundRect) ctx.roundRect = function (x, y, ww, hh, r) { this.rect(x, y, ww, hh); };
    stage.appendChild(cv);
    return { cv: cv, ctx: ctx, w: w, h: h };
  }
  function confetti(list, x, y, n) {
    var cols = ['#FF8DBC', '#F4C24C', '#7DC2F4', '#7BE0A5', '#fff'];
    for (var i = 0; i < n; i++) list.push({ x: x, y: y, vx: (Math.random() - 0.5) * 220, vy: -80 - Math.random() * 160, t: 0.7, c: cols[i % cols.length], r: Math.random() * 6 });
  }
  function stepConfetti(ctx, list, dt) {
    for (var i = list.length - 1; i >= 0; i--) {
      var p = list[i]; p.t -= dt; p.vy += 500 * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.r += dt * 8;
      if (p.t <= 0) { list.splice(i, 1); continue; }
      ctx.save(); ctx.globalAlpha = Math.min(1, p.t * 2); ctx.translate(p.x, p.y); ctx.rotate(p.r); ctx.fillStyle = p.c; ctx.fillRect(-3, -2, 6, 4); ctx.restore();
    }
  }
  function shuffle(a) { for (var i = a.length - 1; i > 0; i--) { var j = (Math.random() * (i + 1)) | 0, t = a[i]; a[i] = a[j]; a[j] = t; } return a; }

  // ---------------------------------------------------------------- games
  var GAMES = [];

  // 1. Sweet catch -------------------------------------------------------
  GAMES.push({
    id: 'catch', name: 'Sweet catch', blurb: 'Catch the falling sweets, dodge the broccoli.', icon: [0, 3], time: true,
    help: 'Drag on the game, or use the arrow keys, to move the robot. Sweets +1, broccoli −3. 30 seconds.',
    start: function (stage, api) {
      var c = makeCanvas(stage, 360, 440), ctx = c.ctx, raf, st = { x: 180, items: [], score: 0, spawn: 0, pops: [], conf: [], left: false, right: false, t0: performance.now(), last: performance.now(), on: true };
      function key(e, down) {
        if (e.key === 'ArrowLeft' || e.key === 'a') { st.left = down; e.preventDefault(); }
        if (e.key === 'ArrowRight' || e.key === 'd') { st.right = down; e.preventDefault(); }
      }
      var kd = function (e) { key(e, true); }, ku = function (e) { key(e, false); };
      document.addEventListener('keydown', kd); document.addEventListener('keyup', ku);
      function ptr(e) { var r = c.cv.getBoundingClientRect(); st.x = Math.max(30, Math.min(330, (e.clientX - r.left) * 360 / r.width)); }
      c.cv.addEventListener('pointerdown', function (e) { c.cv.setPointerCapture(e.pointerId); ptr(e); });
      c.cv.addEventListener('pointermove', function (e) { if (e.buttons || e.pointerType === 'mouse') ptr(e); });
      function tick(now) {
        if (!st.on) return;
        var dt = Math.min(0.05, (now - st.last) / 1000); st.last = now;
        var left = Math.max(0, 30 - (now - st.t0) / 1000), speed = 1 + (30 - left) / 30;
        api.time(Math.ceil(left));
        if (st.left) st.x -= 340 * dt; if (st.right) st.x += 340 * dt; st.x = Math.max(30, Math.min(330, st.x));
        if ((st.spawn -= dt) <= 0) {
          st.spawn = 0.5 / speed + Math.random() * 0.25;
          st.items.push({ x: 24 + Math.random() * 312, y: -24, v: (120 + Math.random() * 80) * speed, bad: Math.random() < 0.17, i: (Math.random() * SWEETS.length) | 0, r: Math.random() * 6, s: (Math.random() - 0.5) * 3 });
        }
        drawBoard(ctx, 360, 440);
        for (var k = st.items.length - 1; k >= 0; k--) {
          var it = st.items[k]; it.y += it.v * dt; it.r += it.s * dt;
          if (it.y > 370 && it.y < 414 && Math.abs(it.x - st.x) < 36) {
            if (it.bad) { st.score = Math.max(0, st.score - 3); st.pops.push({ x: it.x, y: 360, t: 0.9, txt: '−3', bg: '#3BA55C' }); }
            else { st.score++; st.pops.push({ x: it.x, y: 360, t: 0.7, txt: '+1', bg: '#C01F62' }); confetti(st.conf, it.x, 380, 8); }
            api.score(st.score); st.items.splice(k, 1); continue;
          }
          if (it.y > 470) { st.items.splice(k, 1); continue; }
          if (it.bad) drawBroccoli(ctx, it.x, it.y, 1.3, it.r * 0.3); else drawSweet(ctx, it.i, it.x, it.y, 1.15, it.r * 0.4);
        }
        if (robotImg.complete && robotImg.naturalWidth) ctx.drawImage(robotImg, st.x - 34, 364, 68, 68);
        stepConfetti(ctx, st.conf, dt);
        for (var j = st.pops.length - 1; j >= 0; j--) { var p = st.pops[j]; p.t -= dt; p.y -= 50 * dt; if (p.t <= 0) { st.pops.splice(j, 1); continue; } ctx.globalAlpha = Math.min(1, p.t * 2); stickerText(ctx, p.txt, p.x, p.y, -0.12, p.bg); ctx.globalAlpha = 1; }
        if (left <= 0) { st.on = false; api.finish(st.score); return; }
        raf = requestAnimationFrame(tick);
      }
      raf = requestAnimationFrame(tick);
      return function stop() { st.on = false; cancelAnimationFrame(raf); document.removeEventListener('keydown', kd); document.removeEventListener('keyup', ku); };
    }
  });

  // 2. Pick & Mix Match --------------------------------------------------
  GAMES.push({
    id: 'match', name: 'Pick & Mix Match', blurb: 'Swap sweets to line up three or more.', icon: [1, 0, 1], time: true,
    help: 'Tap a sweet, then a sweet next to it, to swap them. Line up 3 or more of the same to clear them. Arrow keys and Enter work too. 60 seconds.',
    start: function (stage, api) {
      var N = 6, K = 5, grid = [], sel = -1, score = 0, busy = false, on = true, focusI = 0;
      var wrap = document.createElement('div'); wrap.className = 'pa-match'; wrap.setAttribute('role', 'grid'); wrap.setAttribute('aria-label', 'Sweets, 6 by 6');
      stage.appendChild(wrap);
      function rnd() { return (Math.random() * K) | 0; }
      for (var i = 0; i < N * N; i++) { var v; do { v = rnd(); } while ((i % N >= 2 && grid[i - 1] === v && grid[i - 2] === v) || (i >= 2 * N && grid[i - N] === v && grid[i - 2 * N] === v)); grid.push(v); }
      var cells = [];
      for (var r = 0; r < N; r++) {
        var row = document.createElement('div'); row.setAttribute('role', 'row'); row.className = 'pa-match-row';
        for (var cI = 0; cI < N; cI++) {
          var b = document.createElement('button'); b.type = 'button'; b.className = 'pa-cell'; b.setAttribute('role', 'gridcell');
          b.dataset.i = r * N + cI; b.tabIndex = (r * N + cI) === 0 ? 0 : -1; row.appendChild(b); cells.push(b);
        }
        wrap.appendChild(row);
      }
      function paint(pop) {
        cells.forEach(function (b, i) {
          var v = grid[i];
          b.innerHTML = v < 0 ? '' : sweetSVG(v, 34);
          b.setAttribute('aria-label', (v < 0 ? 'empty' : SWEETS[v].n) + ', row ' + (((i / N) | 0) + 1) + ', column ' + (i % N + 1));
          b.classList.toggle('is-sel', i === sel);
          if (pop && pop.indexOf(i) !== -1) { b.classList.remove('is-new'); void b.offsetWidth; b.classList.add('is-new'); }
        });
      }
      function matches() {
        var hit = {};
        for (var r = 0; r < N; r++) for (var c = 0; c < N; c++) {
          var i = r * N + c, v = grid[i]; if (v < 0) continue;
          if (c <= N - 3 && grid[i + 1] === v && grid[i + 2] === v) { hit[i] = hit[i + 1] = hit[i + 2] = 1; }
          if (r <= N - 3 && grid[i + N] === v && grid[i + 2 * N] === v) { hit[i] = hit[i + N] = hit[i + 2 * N] = 1; }
        }
        return Object.keys(hit).map(Number);
      }
      function resolve(combo) {
        var m = matches();
        if (!m.length || !on) { busy = false; return; }
        score += m.length * 10 * combo; api.score(score);
        if (combo > 1) api.status('Combo ×' + combo + '!');
        m.forEach(function (i) { cells[i].classList.add('is-pop'); });
        setTimeout(function () {
          m.forEach(function (i) { grid[i] = -1; cells[i].classList.remove('is-pop'); });
          var fresh = [];
          for (var c = 0; c < N; c++) {
            var col = []; for (var r = N - 1; r >= 0; r--) if (grid[r * N + c] >= 0) col.push(grid[r * N + c]);
            for (r = N - 1; r >= 0; r--) { var idx = N - 1 - r; if (idx < col.length) grid[r * N + c] = col[idx]; else { grid[r * N + c] = rnd(); fresh.push(r * N + c); } }
          }
          paint(fresh);
          setTimeout(function () { resolve(combo + 1); }, 260);
        }, 260);
      }
      function adj(a, b) { var ra = (a / N) | 0, rb = (b / N) | 0; return (ra === rb && Math.abs(a - b) === 1) || (Math.abs(a - b) === N); }
      function choose(i) {
        if (busy || !on) return;
        if (sel === -1) { sel = i; paint(); return; }
        if (sel === i) { sel = -1; paint(); return; }
        if (!adj(sel, i)) { sel = i; paint(); return; }
        var a = sel; sel = -1; busy = true;
        var t = grid[a]; grid[a] = grid[i]; grid[i] = t; paint([a, i]);
        if (matches().length) { setTimeout(function () { resolve(1); }, 180); }
        else {
          setTimeout(function () { t = grid[a]; grid[a] = grid[i]; grid[i] = t; cells[a].classList.add('is-no'); cells[i].classList.add('is-no'); paint();
            setTimeout(function () { cells[a].classList.remove('is-no'); cells[i].classList.remove('is-no'); busy = false; }, 300); }, 220);
        }
      }
      wrap.addEventListener('click', function (e) { var b = e.target.closest('.pa-cell'); if (b) { setFocus(+b.dataset.i); choose(+b.dataset.i); } });
      function setFocus(i) { cells[focusI].tabIndex = -1; focusI = i; cells[i].tabIndex = 0; cells[i].focus(); }
      wrap.addEventListener('keydown', function (e) {
        var i = focusI, r = (i / N) | 0, c = i % N;
        if (e.key === 'ArrowRight' && c < N - 1) i++; else if (e.key === 'ArrowLeft' && c > 0) i--;
        else if (e.key === 'ArrowDown' && r < N - 1) i += N; else if (e.key === 'ArrowUp' && r > 0) i -= N; else return;
        e.preventDefault(); setFocus(i);
      });
      paint();
      var t0 = performance.now(), timer = setInterval(function () {
        var left = Math.max(0, 60 - (performance.now() - t0) / 1000); api.time(Math.ceil(left));
        if (left <= 0) { on = false; clearInterval(timer); setTimeout(function () { api.finish(score); }, 300); }
      }, 200);
      setTimeout(function () { cells[0].focus(); }, 50);
      return function stop() { on = false; clearInterval(timer); };
    }
  });

  // 3. Sweet memory ------------------------------------------------------
  GAMES.push({
    id: 'memory', name: 'Sweet memory', blurb: 'Flip the cards and find the matching pairs.', icon: [5, 5], time: false, lowWins: true, unit: 'moves',
    help: 'Turn over two cards at a time to find matching sweets. Fewer moves is better.',
    start: function (stage, api) {
      var deck = shuffle([0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5]), open = [], done = 0, moves = 0, lock = false;
      var g = document.createElement('div'); g.className = 'pa-memory'; stage.appendChild(g);
      var cards = deck.map(function (v, i) {
        var b = document.createElement('button'); b.type = 'button'; b.className = 'pa-card';
        b.innerHTML = '<span class="pa-card-in"><span class="pa-card-back" aria-hidden="true">?</span><span class="pa-card-face">' + sweetSVG(v, 46) + '</span></span>';
        b.setAttribute('aria-label', 'Card ' + (i + 1) + ', face down');
        b.addEventListener('click', function () { flip(i); });
        g.appendChild(b); return b;
      });
      api.score(0);
      function flip(i) {
        var b = cards[i];
        if (lock || b.classList.contains('is-up')) return;
        b.classList.add('is-up'); b.setAttribute('aria-label', 'Card ' + (i + 1) + ', ' + SWEETS[deck[i]].n); open.push(i);
        if (open.length < 2) { api.status(SWEETS[deck[i]].n); return; }
        moves++; api.score(moves);
        var a = open[0], c = open[1]; open = [];
        if (deck[a] === deck[c]) {
          done++; cards[a].classList.add('is-done'); cards[c].classList.add('is-done');
          cards[a].disabled = cards[c].disabled = true;
          api.status('Match! ' + SWEETS[deck[a]].n + '. ' + done + ' of 6 pairs found.');
          if (done === 6) setTimeout(function () { api.finish(moves); }, 600);
        } else {
          lock = true; api.status(SWEETS[deck[c]].n + '. No match.');
          setTimeout(function () {
            [a, c].forEach(function (k) { cards[k].classList.remove('is-up'); cards[k].setAttribute('aria-label', 'Card ' + (k + 1) + ', face down'); });
            lock = false;
          }, 800);
        }
      }
      setTimeout(function () { cards[0].focus(); }, 50);
      return function stop() {};
    }
  });

  // 4. Robot hop ---------------------------------------------------------
  GAMES.push({
    id: 'hop', name: 'Robot hop', blurb: 'Flap through the gaps between lollipop sticks.', icon: [3], time: false,
    help: 'Tap the game, or press Space, to make the robot hop. Fly through the gaps. Don’t touch the lollipops!',
    start: function (stage, api) {
      var c = makeCanvas(stage, 360, 440), ctx = c.ctx, raf, on = true;
      var st = { y: 200, v: 0, pipes: [], t: 0, score: 0, last: performance.now(), started: false, conf: [] };
      function flap() { if (!on) return; st.started = true; st.v = -300; }
      c.cv.addEventListener('pointerdown', function (e) { e.preventDefault(); flap(); });
      var kd = function (e) { if (e.key === ' ' || e.key === 'ArrowUp' || e.key === 'Enter') { e.preventDefault(); flap(); } };
      document.addEventListener('keydown', kd);
      function lolly(x, top, bottom) {
        // white stick with a swirly lollipop at the end
        ctx.lineWidth = 2.5; ctx.strokeStyle = NAVY; ctx.fillStyle = '#fff';
        ctx.beginPath(); ctx.roundRect(x - 7, top ? -10 : bottom, 14, top ? bottom + 10 : 460, 7); ctx.fill(); ctx.stroke();
        var cy = top ? bottom - 4 : bottom + 4, col = top ? '#FF8DBC' : '#F4C24C';
        ctx.beginPath(); ctx.arc(x, cy, 22, 0, 7); ctx.fillStyle = '#fff'; ctx.fill(); ctx.stroke();
        for (var a = 0; a < 4; a++) { ctx.beginPath(); ctx.moveTo(x, cy); ctx.arc(x, cy, 20.5, a * Math.PI / 2 + st.t, a * Math.PI / 2 + Math.PI / 4 + st.t); ctx.closePath(); ctx.fillStyle = col; ctx.fill(); }
        ctx.beginPath(); ctx.arc(x, cy, 22, 0, 7); ctx.stroke();
      }
      function tick(now) {
        if (!on) return;
        var dt = Math.min(0.04, (now - st.last) / 1000); st.last = now; st.t += dt;
        drawBoard(ctx, 360, 440);
        if (st.started) {
          st.v += 850 * dt; st.y += st.v * dt; if (st.y < 24) { st.y = 24; st.v = Math.max(0, st.v); }
          if (!st.pipes.length || st.pipes[st.pipes.length - 1].x < 160) st.pipes.push({ x: 400, gap: 130 + Math.random() * 180, passed: false });
          for (var i = st.pipes.length - 1; i >= 0; i--) {
            var p = st.pipes[i]; p.x -= 140 * dt;
            if (!p.passed && p.x < 80) { p.passed = true; st.score++; api.score(st.score); confetti(st.conf, 80, st.y, 6); }
            if (p.x < -40) st.pipes.splice(i, 1);
            if (Math.abs(p.x - 80) < 34 && (st.y - 22 < p.gap - 82 || st.y + 22 > p.gap + 82)) return end();
          }
          if (st.y > 440 - 24) return end();
        } else { st.y = 200 + Math.sin(st.t * 3) * 8; }
        st.pipes.forEach(function (p) { lolly(p.x, true, p.gap - 104); lolly(p.x, false, p.gap + 104); });
        ctx.save(); ctx.translate(80, st.y); ctx.rotate(Math.max(-0.5, Math.min(0.7, st.v / 700)));
        if (robotImg.complete && robotImg.naturalWidth) ctx.drawImage(robotImg, -26, -26, 52, 52); ctx.restore();
        stepConfetti(ctx, st.conf, dt);
        if (!st.started) { ctx.font = '800 18px "Maven Pro", Arial, sans-serif'; ctx.textAlign = 'center'; ctx.fillStyle = '#fff'; ctx.strokeStyle = NAVY; ctx.lineWidth = 4; ctx.strokeText('Tap to hop!', 180, 290); ctx.fillText('Tap to hop!', 180, 290); }
        raf = requestAnimationFrame(tick);
      }
      function end() { on = false; document.removeEventListener('keydown', kd); setTimeout(function () { api.finish(st.score); }, 250); }
      raf = requestAnimationFrame(tick);
      setTimeout(function () { c.cv.focus && c.cv.focus(); }, 50);
      return function stop() { on = false; cancelAnimationFrame(raf); document.removeEventListener('keydown', kd); };
    }
  });

  // 5. Whack-a-gummy -----------------------------------------------------
  GAMES.push({
    id: 'whack', name: 'Whack-a-gummy', blurb: 'Bonk the gummy bears before they hide.', icon: [4, 0], time: true,
    help: 'Tap a jar when a gummy bear pops up: +1. Leave the broccoli alone: −2. Number keys 1 to 9 work too. 30 seconds.',
    start: function (stage, api) {
      var g = document.createElement('div'); g.className = 'pa-whack'; stage.appendChild(g);
      var score = 0, on = true, jars = [], timers = [];
      for (var i = 0; i < 9; i++) {
        var b = document.createElement('button'); b.type = 'button'; b.className = 'pa-jar'; b.setAttribute('aria-label', 'Jar ' + (i + 1) + ', empty');
        b.innerHTML = '<span class="pa-pop" aria-hidden="true"></span><span class="pa-jar-glass" aria-hidden="true"></span><span class="pa-jar-n" aria-hidden="true">' + (i + 1) + '</span>';
        (function (k) { b.addEventListener('click', function () { hit(k); }); })(i);
        g.appendChild(b); jars.push({ b: b, who: null, until: 0 });
      }
      var kd = function (e) { var n = +e.key; if (n >= 1 && n <= 9) { e.preventDefault(); hit(n - 1); } };
      document.addEventListener('keydown', kd);
      function hit(k) {
        var j = jars[k]; if (!on || !j.who) return;
        if (j.who === 'bad') { score = Math.max(0, score - 2); j.b.classList.add('is-oops'); api.status('Oops, broccoli! −2'); }
        else { score++; j.b.classList.add('is-bonk'); }
        api.score(score); hide(k, true);
      }
      function hide(k, hitIt) {
        var j = jars[k]; j.who = null; j.b.classList.remove('is-up');
        j.b.setAttribute('aria-label', 'Jar ' + (k + 1) + ', empty');
        setTimeout(function () { j.b.classList.remove('is-bonk', 'is-oops'); }, hitIt ? 300 : 0);
      }
      var t0 = performance.now();
      function spawn() {
        if (!on) return;
        var el = (performance.now() - t0) / 1000, free = jars.map(function (j, i) { return j.who ? -1 : i; }).filter(function (i) { return i >= 0; });
        if (free.length) {
          var k = free[(Math.random() * free.length) | 0], j = jars[k], bad = Math.random() < 0.16;
          j.who = bad ? 'bad' : (Math.random() * 5) | 0;
          j.b.querySelector('.pa-pop').innerHTML = bad ? '<svg viewBox="-20 -22 40 42" width="46" height="46" aria-hidden="true"><rect x="-4" y="0" width="8" height="16" rx="3" fill="#8DBF4A" stroke="#10324F" stroke-width="2.2"/><g fill="#3BA55C" stroke="#10324F" stroke-width="2.2"><circle cx="-9" cy="-3" r="8"/><circle cx="9" cy="-3" r="8"/><circle cx="0" cy="-10" r="9"/><circle cx="-4" cy="1" r="7"/><circle cx="5" cy="1" r="7"/></g></svg>' : sweetSVG(0, 46).replace(SWEETS[0].c, ['#FF8DBC', '#FFAA66', '#7BE0A5', '#F4C24C', '#C79BF2'][j.who]);
          j.b.setAttribute('aria-label', 'Jar ' + (k + 1) + (bad ? ', broccoli! Leave it' : ', gummy bear! Bonk it'));
          j.b.classList.add('is-up');
          var stay = Math.max(560, 1100 - el * 18);
          timers.push(setTimeout(function () { if (j.who !== null) hide(k); }, stay));
        }
        timers.push(setTimeout(spawn, Math.max(380, 820 - el * 15)));
      }
      spawn();
      var tm = setInterval(function () {
        var left = Math.max(0, 30 - (performance.now() - t0) / 1000); api.time(Math.ceil(left));
        if (left <= 0) { on = false; clearInterval(tm); api.finish(score); }
      }, 200);
      setTimeout(function () { jars[4].b.focus(); }, 50);
      return function stop() { on = false; clearInterval(tm); timers.forEach(clearTimeout); document.removeEventListener('keydown', kd); };
    }
  });

  // 6. Claw machine ------------------------------------------------------
  GAMES.push({
    id: 'claw', name: 'Claw machine', blurb: 'Time the claw to grab the best prize.', icon: [1, 4], time: false,
    help: 'The claw swings left and right. Press Drop (or Space) to grab. Gold stars are worth 5, sweets 1 to 3. You get 3 goes.',
    start: function (stage, api) {
      var c = makeCanvas(stage, 360, 400), ctx = c.ctx, raf, on = true;
      var btn = document.createElement('button'); btn.type = 'button'; btn.className = 'pa-drop'; btn.innerHTML = '&#9660; Drop';
      stage.appendChild(btn);
      var prizes = [], score = 0, goes = 3, st = { x: 180, dir: 1, phase: 'move', y: 40, held: null, t: 0, last: performance.now() }, conf = [];
      for (var i = 0; i < 9; i++) prizes.push({ x: 40 + i * 35 + (Math.random() * 14 - 7), y: 330 + Math.random() * 18, i: (Math.random() * SWEETS.length) | 0, gold: i === 2 || i === 6, r: Math.random() - 0.5 });
      prizes.forEach(function (p) { p.val = p.gold ? 5 : 1 + ((Math.random() * 3) | 0); });
      api.time(goes); api.score(0);
      function drop() { if (!on || st.phase !== 'move') return; st.phase = 'down'; }
      btn.addEventListener('click', drop);
      var kd = function (e) { if (e.key === ' ' || e.key === 'ArrowDown') { e.preventDefault(); drop(); } };
      document.addEventListener('keydown', kd);
      c.cv.addEventListener('pointerdown', drop);
      function claw(x, y, open) {
        ctx.strokeStyle = '#C9D4DE'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, y - 10); ctx.stroke();
        ctx.fillStyle = '#F4C24C'; ctx.strokeStyle = NAVY; ctx.lineWidth = 2.2; ctx.beginPath(); ctx.roundRect(x - 14, y - 14, 28, 14, 5); ctx.fill(); ctx.stroke();
        var s = open ? 16 : 8; ctx.lineWidth = 4; ctx.strokeStyle = NAVY; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(x - 8, y); ctx.quadraticCurveTo(x - s - 4, y + 12, x - s + 2, y + 26); ctx.moveTo(x + 8, y); ctx.quadraticCurveTo(x + s + 4, y + 12, x + s - 2, y + 26); ctx.stroke();
        ctx.lineWidth = 2; ctx.strokeStyle = '#C9D4DE';
        ctx.beginPath(); ctx.moveTo(x - 8, y); ctx.quadraticCurveTo(x - s - 4, y + 12, x - s + 2, y + 26); ctx.moveTo(x + 8, y); ctx.quadraticCurveTo(x + s + 4, y + 12, x + s - 2, y + 26); ctx.stroke();
      }
      function prize(p) { if (p.gold) { ctx.save(); ctx.shadowColor = '#FFE48A'; ctx.shadowBlur = 14; drawSweet(ctx, 4, p.x, p.y, 1.1, p.r); ctx.restore(); ctx.save(); ctx.globalCompositeOperation = 'source-atop'; ctx.restore(); }
        else drawSweet(ctx, p.i, p.x, p.y, 1.0, p.r); }
      function tick(now) {
        if (!on) return;
        var dt = Math.min(0.04, (now - st.last) / 1000); st.last = now; st.t += dt;
        drawBoard(ctx, 360, 400);
        ctx.fillStyle = 'rgba(255,255,255,.18)'; ctx.fillRect(0, 300, 360, 100);
        ctx.fillStyle = '#16314D'; ctx.fillRect(0, 386, 360, 14);
        ctx.fillStyle = 'rgba(16,50,79,.55)'; ctx.beginPath(); ctx.roundRect(300, 250, 52, 136, 8); ctx.fill();
        ctx.fillStyle = '#fff'; ctx.font = '800 11px "Maven Pro", Arial, sans-serif'; ctx.textAlign = 'center'; ctx.fillText('PRIZE', 326, 272);
        prizes.forEach(prize);
        if (st.phase === 'move') { st.x += st.dir * 120 * dt; if (st.x > 285) { st.x = 285; st.dir = -1; } if (st.x < 30) { st.x = 30; st.dir = 1; } st.y = 40; }
        else if (st.phase === 'down') { st.y += 220 * dt; if (st.y >= 300) { st.y = 300; grab(); } }
        else if (st.phase === 'up') {
          st.y -= 180 * dt;
          if (st.held && st.y < 200 && !st.checked) { st.checked = true; if (Math.random() < 0.18) { st.held.y = 330 + Math.random() * 18; prizes.push(st.held); st.held = null; api.status('Oh no, it slipped!'); } }
          if (st.y <= 40) { st.y = 40; st.phase = 'carry'; }
        } else if (st.phase === 'carry') {
          st.x += 160 * dt;
          if (st.x >= 326) { st.x = 326; st.phase = 'release'; st.rt = 0.5; if (st.held) { score += st.held.val; api.score(score); confetti(conf, 326, 260, 14); api.status('You won a ' + (st.held.gold ? 'gold star' : SWEETS[st.held.i].n) + '! +' + st.held.val); st.drop = st.held; st.held = null; } }
        } else if (st.phase === 'release') {
          st.rt -= dt; if (st.drop) { st.drop.y += 300 * dt; prize(st.drop); }
          if (st.rt <= 0) { st.drop = null; goes--; api.time(goes); if (goes <= 0 || !prizes.length) { on = false; setTimeout(function () { api.finish(score); }, 400); } else { st.phase = 'move'; st.checked = false; } }
        }
        if (st.held) { st.held.x = st.x; st.held.y = st.y + 30; prize(st.held); }
        claw(st.x, st.y, st.phase === 'move' || st.phase === 'down' || st.phase === 'release');
        stepConfetti(ctx, conf, dt);
        ctx.strokeStyle = '#fff'; ctx.lineWidth = 3; ctx.strokeRect(1.5, 1.5, 357, 397);
        btn.disabled = st.phase !== 'move';
        raf = requestAnimationFrame(tick);
      }
      function grab() {
        var best = null, bd = 99;
        prizes.forEach(function (p) { var d = Math.abs(p.x - st.x); if (d < bd) { bd = d; best = p; } });
        var chance = bd < 10 ? 0.9 : bd < 22 ? 0.55 : 0;
        if (best && Math.random() < chance) { prizes.splice(prizes.indexOf(best), 1); st.held = best; }
        else api.status('Missed!');
        st.phase = 'up';
      }
      raf = requestAnimationFrame(tick);
      setTimeout(function () { btn.focus(); }, 50);
      return function stop() { on = false; cancelAnimationFrame(raf); document.removeEventListener('keydown', kd); };
    }
  });

  // ---------------------------------------------------------------- arcade shell
  var dlg, stage, current = null, stopFn = null, lastFocus = null, el = {};
  function build() {
    dlg = document.createElement('div');
    dlg.className = 'pa'; dlg.hidden = true;
    dlg.setAttribute('role', 'dialog'); dlg.setAttribute('aria-modal', 'true'); dlg.setAttribute('aria-labelledby', 'paTitle');
    dlg.innerHTML =
      '<div class="pa-box">' +
        '<div class="pa-top"><button type="button" class="pa-back" hidden>&#9664; Arcade</button>' +
        '<h2 class="pa-title" id="paTitle">arcade</h2>' +
        '<button type="button" class="pa-x" aria-label="Close the arcade">&times;</button></div>' +
        '<div class="pa-hud" hidden><span class="pa-pill"><span aria-hidden="true">&#127852;</span> <span class="pa-lab" id="paScoreLab">Score</span> <b id="paScore">0</b></span>' +
        '<span class="pa-pill" id="paTimePill"><span aria-hidden="true">&#9201;</span> <span class="pa-lab" id="paTimeLab">Time</span> <b id="paTime">0</b></span>' +
        '<span class="pa-pill"><span aria-hidden="true">&#127942;</span> <span class="pa-lab">Best</span> <b id="paBest">0</b></span></div>' +
        '<div class="pa-menu"></div>' +
        '<div class="pa-play" hidden><div class="pa-stagewrap"><div class="pa-stage"></div>' +
          '<div class="pa-over" hidden><p class="pa-over-msg"></p><div class="pa-over-btns"><button type="button" class="pa-go">&#9654; Press start</button><button type="button" class="pa-menu-btn">More games</button></div></div></div>' +
          '<p class="pa-help"></p></div>' +
        '<p class="pa-sr" id="paStatus" role="status" aria-live="polite"></p>' +
      '</div>';
    document.body.appendChild(dlg);
    ['back', 'x', 'menu', 'play', 'over', 'go', 'help'].forEach(function (k) { el[k] = dlg.querySelector('.pa-' + k); });
    el.menuBtn = dlg.querySelector('.pa-menu-btn'); el.hud = dlg.querySelector('.pa-hud'); el.msg = dlg.querySelector('.pa-over-msg');
    stage = dlg.querySelector('.pa-stage');
    var html = '';
    GAMES.forEach(function (g) {
      var icon = g.icon.map(function (i, n) { return '<span style="--r:' + (n * 14 - 8) + 'deg">' + sweetSVG(i, 40) + '</span>'; }).join('');
      html += '<button type="button" class="pa-game" data-id="' + g.id + '"><span class="pa-game-art" aria-hidden="true">' + icon + '</span>' +
        '<span class="pa-game-name">' + g.name + '</span><span class="pa-game-blurb">' + g.blurb + '</span>' +
        '<span class="pa-game-best" data-best="' + g.id + '"></span></button>';
    });
    el.menu.innerHTML = html;
    el.menu.addEventListener('click', function (e) { var b = e.target.closest('.pa-game'); if (b) openGame(b.dataset.id); });
    el.x.addEventListener('click', close);
    el.back.addEventListener('click', showMenu);
    el.menuBtn.addEventListener('click', showMenu);
    el.go.addEventListener('click', function () { run(current); });
    dlg.addEventListener('click', function (e) { if (e.target === dlg) close(); });
    dlg.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { e.preventDefault(); if (current && !el.play.hidden) showMenu(); else close(); return; }
      if (e.key === 'Tab') {
        var f = [].slice.call(dlg.querySelectorAll('button, [tabindex="0"]')).filter(function (x) { return x.offsetParent && !x.disabled; });
        if (!f.length) return;
        if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
        else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
      }
    });
    document.addEventListener('visibilitychange', function () { if (document.hidden && stopFn) { stopFn(); stopFn = null; if (current) overScreen('Paused. Ready when you are!'); } });
  }
  function best(g) { return store.get('pm-best-' + g.id, null); }
  function bestText(g) { var b = best(g); return b === null ? 'Not played yet' : 'Best: ' + b + (g.unit ? ' ' + g.unit : ''); }
  function status(t) { var s = document.getElementById('paStatus'); s.textContent = ''; setTimeout(function () { s.textContent = t; }, 30); }
  function stopGame() { if (stopFn) { stopFn(); stopFn = null; } stage.innerHTML = ''; }
  function showMenu() {
    stopGame(); current = null;
    el.menu.hidden = false; el.play.hidden = true; el.hud.hidden = true; el.back.hidden = true;
    dlg.querySelector('#paTitle').textContent = 'arcade'; dlg.querySelector('#paTitle').classList.remove('is-game');
    GAMES.forEach(function (g) { dlg.querySelector('[data-best="' + g.id + '"]').textContent = bestText(g); });
    var first = el.menu.querySelector('.pa-game'); if (first) first.focus();
  }
  function find(id) { for (var i = 0; i < GAMES.length; i++) if (GAMES[i].id === id) return GAMES[i]; return null; }
  function openGame(id) {
    var g = find(id); if (!g) return showMenu();
    stopGame(); current = g;
    el.menu.hidden = true; el.play.hidden = false; el.hud.hidden = false; el.back.hidden = false;
    dlg.querySelector('#paTitle').textContent = g.name.toLowerCase(); dlg.querySelector('#paTitle').classList.add('is-game');
    el.help.textContent = g.help;
    document.getElementById('paScoreLab').textContent = g.unit === 'moves' ? 'Moves' : 'Score';
    document.getElementById('paTimeLab').textContent = g.id === 'claw' ? 'Goes' : 'Time';
    document.getElementById('paTimePill').hidden = !g.time && g.id !== 'claw';
    document.getElementById('paScore').textContent = '0';
    document.getElementById('paTime').textContent = g.id === 'claw' ? '3' : g.id === 'match' ? '60' : '30';
    var b = best(g); document.getElementById('paBest').textContent = b === null ? '–' : b;
    overScreen(g.blurb);
    el.go.innerHTML = '&#9654; Press start';
    el.go.focus();
  }
  function overScreen(msg) { el.over.hidden = false; el.msg.innerHTML = msg; }
  function run(g) {
    stopGame(); el.over.hidden = true;
    document.getElementById('paScore').textContent = '0';
    status(g.name + ' started.');
    stopFn = g.start(stage, {
      score: function (n) { document.getElementById('paScore').textContent = n; },
      time: function (n) { document.getElementById('paTime').textContent = n; },
      status: status,
      finish: function (s) {
        stopFn = null;
        var b = best(g), nb = b === null || (g.lowWins ? s < b : s > b);
        if (nb) { store.set('pm-best-' + g.id, s); document.getElementById('paBest').textContent = s; }
        var word = g.lowWins ? 'You did it in ' + s + ' moves.' : 'You scored ' + s + '.';
        overScreen('<strong>' + (g.lowWins ? 'All pairs found!' : 'Game over!') + '</strong>' + word + (nb ? ' <span class="pa-new">New best!</span>' : ' Best: ' + b + '.'));
        el.go.innerHTML = '&#9654; Play again';
        status((g.lowWins ? 'All pairs found in ' + s + ' moves' : 'Game over. You scored ' + s) + (nb ? ', a new best.' : '.'));
        el.go.focus();
      }
    });
  }
  function open(id) {
    if (!dlg) build();
    lastFocus = document.activeElement;
    dlg.hidden = false; document.body.classList.add('pa-open');
    if (id && find(id)) openGame(id); else showMenu();
  }
  function close() {
    stopGame(); current = null;
    dlg.hidden = true; document.body.classList.remove('pa-open');
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  window.pmArcade = { open: open, close: close, games: GAMES.map(function (g) { return g.id; }) };
})();
