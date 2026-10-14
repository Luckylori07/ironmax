/* Ironmax Sport - script condiviso. Nessuna dipendenza. */
(function () {
  'use strict';
  var doc = document, root = doc.documentElement, body = doc.body;
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var $ = function (s, c) { return (c || doc).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || doc).querySelectorAll(s)); };

  /* ---------- demo: un solo punto di controllo = attributo data-demo sul body ---------- */
  var banner = $('.demo-banner');
  function syncBanner() {
    if (body.hasAttribute('data-demo') && banner) {
      body.style.setProperty('--demo-h', banner.offsetHeight + 'px');
    } else {
      body.style.removeProperty('--demo-h');
    }
  }
  if (!body.hasAttribute('data-demo')) {
    $$('[data-demo-only]').forEach(function (n) { n.remove(); });
  }
  syncBanner();
  window.addEventListener('resize', syncBanner);

  /* ---------- header: stile allo scroll + menu mobile ---------- */
  var header = $('.site-header');
  var menuBtn = $('.menu-btn');
  var mobileNav = $('#mobile-nav');
  function onScroll() { if (header) header.classList.toggle('is-solid', window.scrollY > 24); }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  function setMenu(open) {
    root.classList.toggle('nav-open', open);
    body.classList.toggle('nav-open', open);
    if (menuBtn) {
      menuBtn.setAttribute('aria-expanded', String(open));
      menuBtn.setAttribute('aria-label', open ? 'Chiudi il menu' : 'Apri il menu');
    }
    if (mobileNav) { mobileNav.inert = !open; }
    body.style.overflow = open ? 'hidden' : '';
  }
  if (menuBtn && mobileNav) {
    mobileNav.inert = true;
    menuBtn.addEventListener('click', function () { setMenu(menuBtn.getAttribute('aria-expanded') !== 'true'); });
    doc.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menuBtn.getAttribute('aria-expanded') === 'true') { setMenu(false); menuBtn.focus(); }
    });
    $$('a', mobileNav).forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
    window.matchMedia('(min-width: 1100px)').addEventListener('change', function (m) { if (m.matches) setMenu(false); });
  }

  /* ---------- aperto / chiuso (fuso Europe/Rome) ---------- */
  var SCHEDULE = { 2: [[9, 0, 12, 0], [15, 0, 19, 0]], 3: [[9, 0, 12, 0], [15, 0, 19, 0]], 4: [[9, 0, 12, 0], [15, 0, 19, 0]], 5: [[9, 0, 12, 0], [15, 0, 19, 0]], 6: [[9, 0, 12, 0], [15, 0, 19, 0]] };
  var DAYS = ['domenica', 'lunedì', 'martedì', 'mercoledì', 'giovedì', 'venerdì', 'sabato'];
  function romeNow() {
    var parts = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Rome', weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false }).formatToParts(new Date());
    var m = {}; parts.forEach(function (p) { m[p.type] = p.value; });
    var wd = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }[m.weekday];
    return { day: wd, min: (parseInt(m.hour, 10) % 24) * 60 + parseInt(m.minute, 10) };
  }
  function hhmm(h, mi) { return h + ':' + (mi < 10 ? '0' : '') + mi; }
  function computeStatus() {
    var n = romeNow(), today = SCHEDULE[n.day] || [], i, s, a, b;
    for (i = 0; i < today.length; i++) {
      s = today[i]; a = s[0] * 60 + s[1]; b = s[2] * 60 + s[3];
      if (n.min >= a && n.min < b) return { open: true, text: 'Aperto ora, chiude alle ' + hhmm(s[2], s[3]) };
    }
    for (i = 0; i < today.length; i++) {
      s = today[i]; a = s[0] * 60 + s[1];
      if (n.min < a) return { open: false, text: 'Chiuso, riapre oggi alle ' + hhmm(s[0], s[1]) };
    }
    for (var d = 1; d <= 7; d++) {
      var nd = (n.day + d) % 7;
      if (SCHEDULE[nd]) {
        var f = SCHEDULE[nd][0];
        return { open: false, text: 'Chiuso, riapre ' + (d === 1 ? 'domani' : DAYS[nd]) + ' alle ' + hhmm(f[0], f[1]) };
      }
    }
    return { open: false, text: 'Chiuso' };
  }
  function renderStatus() {
    var st = computeStatus(), n = romeNow();
    $$('[data-open-status]').forEach(function (el) {
      el.dataset.state = st.open ? 'open' : 'closed';
      el.innerHTML = '<i aria-hidden="true"></i><span></span>';
      el.lastChild.textContent = st.text;
    });
    $$('[data-day]').forEach(function (tr) { tr.classList.toggle('is-today', parseInt(tr.dataset.day, 10) === n.day); });
  }
  if ($('[data-open-status]') || $('[data-day]')) { renderStatus(); setInterval(renderStatus, 60000); }

  /* ---------- split parole per titoli con mask reveal ---------- */
  function splitWords(el) {
    if (el.dataset.split) return;
    el.dataset.split = '1';
    var i = 0;
    function walk(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (c) {
        if (c.nodeType === 3) {
          var frag = doc.createDocumentFragment();
          c.textContent.split(/(\s+)/).forEach(function (t) {
            if (!t) return;
            if (/^\s+$/.test(t)) { frag.appendChild(doc.createTextNode(' ')); return; }
            var w = doc.createElement('span'); w.className = 'w'; w.setAttribute('aria-hidden', 'true');
            var wi = doc.createElement('span'); wi.className = 'wi'; wi.textContent = t; wi.style.setProperty('--i', i++);
            w.appendChild(wi); frag.appendChild(w);
          });
          c.parentNode.replaceChild(frag, c);
        } else if (c.nodeType === 1 && !c.classList.contains('w')) { walk(c); }
      });
    }
    el.setAttribute('aria-label', el.textContent.replace(/\s+/g, ' ').trim());
    walk(el);
  }

  /* ---------- intro di caricamento + rivelazione hero ---------- */
  var hero = $('.hero');
  var heroTitle = $('[data-hero-title]');
  if (heroTitle && !reduced) splitWords(heroTitle);
  function heroGo() {
    root.classList.add('hero-ready');
    if (heroTitle) heroTitle.classList.add('is-in');
  }
  if (root.classList.contains('has-intro') && !reduced) {
    try { sessionStorage.setItem('ironmax-intro', '1'); } catch (e) { /* ok */ }
    setTimeout(heroGo, 1500);
    setTimeout(function () { var i = $('.intro'); if (i) i.remove(); root.classList.remove('has-intro'); }, 2400);
  } else {
    heroGo();
  }

  /* ---------- reveal allo scroll ---------- */
  var revealEls = $$('[data-reveal-title]').filter(function (e) { return e !== heroTitle; });
  if (!reduced) revealEls.forEach(splitWords);
  var io = ('IntersectionObserver' in window) ? new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
    });
  }, { threshold: 0.18, rootMargin: '0px 0px -6% 0px' }) : null;
  $$('.reveal, [data-reveal-title]').forEach(function (el) {
    if (el === heroTitle) return;
    if (!io || reduced) { el.classList.add('is-in'); return; }
    io.observe(el);
  });
  $$('[data-stagger]').forEach(function (parent) {
    Array.prototype.forEach.call(parent.children, function (c, i) { c.classList.add('reveal'); c.style.setProperty('--i', i); if (io && !reduced) io.observe(c); else c.classList.add('is-in'); });
  });

  /* ---------- contatori Ironman ---------- */
  function fmt(v, dec) { return new Intl.NumberFormat('it-IT', { minimumFractionDigits: dec, maximumFractionDigits: dec }).format(v); }
  function runCounter(el) {
    var target = parseFloat(el.dataset.count), dec = parseInt(el.dataset.dec || '0', 10), dur = 1700, t0 = null;
    if (reduced) { el.textContent = fmt(target, dec); return; }
    function step(t) {
      if (t0 === null) t0 = t;
      var p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 4);
      el.textContent = fmt(target * e, dec);
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  var counters = $$('[data-count]');
  if (counters.length) {
    counters.forEach(function (el) { el.textContent = fmt(0, parseInt(el.dataset.dec || '0', 10)); });
    var cio = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { runCounter(e.target); cio.unobserve(e.target); } });
    }, { threshold: 0.6 });
    counters.forEach(function (c) { if (reduced) runCounter(c); else cio.observe(c); });
  }

  /* ---------- linee SVG disegnate dallo scroll ---------- */
  var draws = $$('.disc__draw');
  var ticking = false;
  function pathsFor(svg) { return $$('.disc__draw', svg); }
  function updateDraw() {
    ticking = false;
    var vh = window.innerHeight;
    $$('.disc__svg').forEach(function (svg) {
      var r = svg.getBoundingClientRect();
      var p = (vh * 0.92 - r.top) / (vh * 0.55);
      p = Math.max(0, Math.min(1, p));
      pathsFor(svg).forEach(function (path) { path.style.strokeDashoffset = (1 - p).toFixed(4); });
    });
  }
  if (draws.length) {
    if (reduced) { draws.forEach(function (p) { p.style.strokeDashoffset = 0; }); }
    else { updateDraw(); }
  }

  /* ---------- parallax leggero ---------- */
  var parallaxEls = reduced ? [] : $$('[data-parallax]').map(function (el) { return { el: el, f: parseFloat(el.dataset.parallax) || 0.1, vis: true }; });
  if (parallaxEls.length && 'IntersectionObserver' in window) {
    var pio = new IntersectionObserver(function (es) {
      es.forEach(function (e) { parallaxEls.forEach(function (p) { if (p.el.parentNode === e.target || p.el === e.target) p.vis = e.isIntersecting; }); });
    }, { rootMargin: '10% 0px' });
    parallaxEls.forEach(function (p) { pio.observe(p.el.parentNode); });
  }
  function updateParallax() {
    var vh = window.innerHeight;
    parallaxEls.forEach(function (p) {
      if (!p.vis) return;
      var box = p.el.parentNode.getBoundingClientRect();
      var off = (box.top + box.height / 2 - vh / 2) * -p.f;
      var max = box.height * 0.1;
      off = Math.max(-max, Math.min(max, off));
      p.el.style.transform = 'translate3d(0,' + off.toFixed(1) + 'px,0)';
    });
  }
  if (parallaxEls.length) updateParallax();

  function onScrollFrame() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () { updateParallax(); if (draws.length && !reduced) updateDraw(); ticking = false; });
  }
  window.addEventListener('scroll', onScrollFrame, { passive: true });
  window.addEventListener('resize', onScrollFrame);

  /* ---------- pulsanti magnetici e tilt ---------- */
  if (finePointer && !reduced) {
    $$('[data-magnetic]').forEach(function (el) {
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        var x = (e.clientX - (r.left + r.width / 2)) / r.width, y = (e.clientY - (r.top + r.height / 2)) / r.height;
        el.style.transform = 'translate(' + (x * 10).toFixed(1) + 'px,' + (y * 8).toFixed(1) + 'px)';
      });
      el.addEventListener('pointerleave', function () { el.style.transform = ''; });
    });
    $$('[data-tilt]').forEach(function (el) {
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform = 'perspective(900px) rotateX(' + (-y * 5).toFixed(2) + 'deg) rotateY(' + (x * 6).toFixed(2) + 'deg) translateZ(0)';
      });
      el.addEventListener('pointerleave', function () { el.style.transform = ''; });
    });
  }

  /* ---------- catalogo: filtro per marchio + "mostra altri" ---------- */
  var grid = $('[data-grid]');
  if (grid) {
    var cards = $$('.card', grid);
    var chips = $$('[data-filter]');
    var countEl = $('[data-count-label]');
    var moreBtn = $('[data-more]');
    var PAGE = 24, shown = PAGE, current = 'all';
    function apply() {
      var matching = cards.filter(function (c) { return current === 'all' || c.dataset.brand === current; });
      cards.forEach(function (c) { c.hidden = true; });
      matching.forEach(function (c, i) { c.hidden = i >= shown; });
      if (countEl) {
        var vis = Math.min(shown, matching.length);
        countEl.textContent = vis === matching.length ? matching.length + (matching.length === 1 ? ' articolo' : ' articoli') : vis + ' di ' + matching.length + ' articoli';
      }
      if (moreBtn) moreBtn.parentNode.hidden = shown >= matching.length;
      chips.forEach(function (ch) { ch.setAttribute('aria-pressed', String(ch.dataset.filter === current)); });
    }
    chips.forEach(function (ch) {
      ch.addEventListener('click', function () {
        current = ch.dataset.filter; shown = PAGE; apply();
        try { var u = new URL(location.href); if (current === 'all') u.searchParams.delete('marchio'); else u.searchParams.set('marchio', current); history.replaceState(null, '', u); } catch (e) { /* ok */ }
      });
    });
    if (moreBtn) moreBtn.addEventListener('click', function () {
      var before = shown; shown += PAGE; apply();
      var first = cards.filter(function (c) { return !c.hidden; })[before];
      if (first) { var a = first.querySelector('h3'); if (a) { a.setAttribute('tabindex', '-1'); a.focus({ preventScroll: true }); } }
    });
    try { var q = new URL(location.href).searchParams.get('marchio'); if (q && chips.some(function (c) { return c.dataset.filter === q; })) current = q; } catch (e) { /* ok */ }
    $$('[data-js-only]').forEach(function (n) { n.hidden = false; });
    apply();
  }

  /* ---------- lightbox accessibile (dialog nativo) ---------- */
  var lb = $('dialog.lightbox');
  if (lb && typeof lb.showModal === 'function') {
    var shots = $$('[data-lightbox]');
    var img = $('.lb__stage img', lb), cap = $('.lb__cap', lb), idx = 0, opener = null;
    function show(i) {
      idx = (i + shots.length) % shots.length;
      var s = shots[idx];
      img.src = s.dataset.full; img.alt = s.dataset.alt; img.width = s.dataset.w; img.height = s.dataset.h;
      cap.textContent = s.dataset.alt + ' (' + (idx + 1) + ' di ' + shots.length + ')';
    }
    shots.forEach(function (s, i) {
      s.addEventListener('click', function () { opener = s; show(i); lb.showModal(); body.style.overflow = 'hidden'; $('.lb__close', lb).focus(); });
    });
    $('.lb__prev', lb).addEventListener('click', function () { show(idx - 1); });
    $('.lb__next', lb).addEventListener('click', function () { show(idx + 1); });
    $('.lb__close', lb).addEventListener('click', function () { lb.close(); });
    lb.addEventListener('click', function (e) { if (e.target === lb) lb.close(); });
    lb.addEventListener('close', function () { body.style.overflow = ''; if (opener) opener.focus(); });
    lb.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') { show(idx - 1); }
      if (e.key === 'ArrowRight') { show(idx + 1); }
    });
  } else if (lb) {
    $$('[data-lightbox]').forEach(function (s) { s.addEventListener('click', function () { window.open(s.dataset.full, '_blank', 'noopener'); }); });
  }
})();
