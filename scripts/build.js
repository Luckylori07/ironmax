#!/usr/bin/env node
/*
 * Ironmax Sport - generatore del sito statico (solo Node, nessuna dipendenza).
 *   node scripts/build.js
 * Legge data/*.json e scrive le pagine .html, sitemap.xml e robots.txt nella radice.
 * Il sito servito resta statico: l'HTML generato è committato e funziona senza build.
 */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const read = (f) => JSON.parse(fs.readFileSync(path.join(ROOT, 'data', f), 'utf8'));
const site = read('site.json');
const { prodotti } = read('prodotti.json');
const { marchi } = read('marchi.json');
const { federazioni } = read('federazioni.json');
const { foto } = read('foto-negozio.json');

const DEMO = site.demo === true;
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const slugify = (s) => s.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const TEL = site.telefono, TEL_HREF = 'tel:' + site.telefonoIntl;
const ADDR_LINE = `${site.indirizzo.via} - ${site.indirizzo.cap} ${site.indirizzo.citta} (${site.indirizzo.provincia})`;
const FOOT_LINE = `${site.nome} - ${site.indirizzo.via} - ${site.indirizzo.cap} ${site.indirizzo.citta} (${site.indirizzo.provincia}) - Tel ${TEL}`;
const LOGO = 'assets/img/logo/team-ironmax-triathlon-logo.webp';
const LOGO_LIGHT = 'assets/img/logo/team-ironmax-triathlon-logo-light.webp';

const ICON = {
  phone: '<svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor"><path d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.6a1 1 0 0 1-.25 1z"/></svg>',
  pin: '<svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor"><path d="M12 2a7 7 0 0 0-7 7c0 5.2 7 13 7 13s7-7.8 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z"/></svg>',
  close: '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M5 5l14 14M19 5L5 19"/></svg>',
  prev: '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M15 4l-8 8 8 8"/></svg>',
  next: '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M9 4l8 8-8 8"/></svg>',
};

const NAV = [
  ['il-negozio.html', 'Il negozio'],
  ['running.html', 'Running'],
  ['ciclismo.html', 'Ciclismo'],
  ['nuoto.html', 'Nuoto'],
  ['triathlon.html', 'Triathlon'],
  ['marchi.html', 'Marchi'],
  ['dove-siamo.html', 'Dove siamo'],
];

/* ---------- categorie ---------- */
const CATS = {
  running: {
    nome: 'Running',
    title: 'Negozio running ad Azzate: scarpe, abbigliamento e GPS',
    desc: 'Scarpe running, abbigliamento tecnico, orologi GPS, integratori e accessori da Ironmax Sport ad Azzate (VA). Alcuni dei marchi e articoli che trovi in negozio.',
    lead: 'Scarpe, abbigliamento tecnico, orologi GPS, integratori e accessori per correre su strada e sentiero.',
    hero: 'hoka-bondi-5',
  },
  ciclismo: {
    nome: 'Ciclismo',
    title: 'Negozio ciclismo ad Azzate: abbigliamento, scarpe, caschi',
    desc: 'Abbigliamento ciclismo, scarpe bici, caschi, occhiali, gomme e ciclocomputer da Ironmax Sport ad Azzate (VA). Alcuni dei marchi e articoli che trovi in negozio.',
    lead: 'Abbigliamento, scarpe, caschi, occhiali, gomme e ciclocomputer per chi pedala su strada e fuori.',
    hero: 'castelli-free-jersey-fz',
  },
  nuoto: {
    nome: 'Nuoto',
    title: 'Negozio nuoto ad Azzate: occhialini, mute e accessori',
    desc: 'Occhialini, mute, cuffie, orologi e accessori per il nuoto da Ironmax Sport ad Azzate (VA). Alcuni dei marchi e articoli che trovi in negozio.',
    lead: 'Mute, occhialini, cuffie e accessori per allenarti in acqua, dal primo bagno alla gara.',
    hero: 'zoggs-predator-flex',
  },
  triathlon: {
    nome: 'Triathlon',
    title: 'Negozio triathlon ad Azzate: body, mute, scarpe e caschi',
    desc: 'Tutto per il triathlon da Ironmax Sport ad Azzate (VA): body, mute, scarpe bici, caschi, orologi multisport. Alcuni dei marchi e articoli che trovi in negozio.',
    lead: 'Body, mute, scarpe per la bici, caschi e orologi: tutto per le tre discipline, in un solo negozio.',
    hero: 'castelli-free-tri-distance-suit',
  },
};
const CAT_ORDER = ['running', 'ciclismo', 'nuoto', 'triathlon'];
const BRAND_PRIORITY = ['Brooks', 'HOKA', 'Mizuno', 'Newton', 'Castelli', 'Garmin', 'Suunto', 'Zoggs', 'Zoot', '2XU', 'DMT', "Fi'zi:k", 'LAS', 'Salice', 'Schwalbe', 'Ultimate Direction', 'Black Diamond', 'Joma', 'Under Armour', 'Oxyburn', 'PowerBar', 'Moving Comfort', 'BV Sport', 'NOENE', 'IRONMAN', 'Lock Laces', 'CorSport', 'PYRO Platforms'];
const brandRank = (b) => { const i = BRAND_PRIORITY.indexOf(b); return i < 0 ? 999 : i; };
const marchioSlug = (nome) => (marchi.find((m) => m.nome === nome) || {}).slug || slugify(nome);

function productsFor(cat) {
  const byBrand = new Map();
  prodotti.filter((p) => p.categorie.includes(cat)).forEach((p) => {
    if (!byBrand.has(p.marchio)) byBrand.set(p.marchio, []);
    byBrand.get(p.marchio).push(p);
  });
  const brands = [...byBrand.keys()].sort((a, b) => brandRank(a) - brandRank(b) || a.localeCompare(b));
  const out = [];
  for (let i = 0; out.length < [...byBrand.values()].reduce((n, l) => n + l.length, 0); i++) {
    brands.forEach((b) => { const l = byBrand.get(b); if (l[i]) out.push(l[i]); });
  }
  return { list: out, brands: brands.map((b) => ({ nome: b, slug: marchioSlug(b), n: byBrand.get(b).length })) };
}
const CAT_DATA = Object.fromEntries(CAT_ORDER.map((c) => [c, productsFor(c)]));
const brandCats = (nome) => CAT_ORDER.filter((c) => CAT_DATA[c].brands.some((b) => b.nome === nome));

/* ---------- layout ---------- */
function layout({ file, title, desc, body, jsonld, intro, navCurrent, bodyClass }) {
  const fullTitle = (DEMO ? '[DEMO] ' : '') + title;
  const og = `${site.siteUrl}/assets/img/og-image.jpg`;
  const nav = NAV.map(([h, l]) => `<li><a href="${h}"${h === navCurrent ? ' aria-current="page"' : ''}>${l}</a></li>`).join('');
  const mnav = NAV.map(([h, l]) => `<a class="mlink" href="${h}"${h === navCurrent ? ' aria-current="page"' : ''}>${l}</a>`).join('');
  return `<!doctype html>
<html lang="it"${intro ? ' data-intro' : ''}>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(fullTitle)}</title>
<meta name="description" content="${esc(desc)}">
${DEMO ? '<meta name="robots" content="noindex, nofollow">\n' : ''}<meta name="theme-color" content="#181418">
<meta property="og:type" content="website">
<meta property="og:locale" content="it_IT">
<meta property="og:site_name" content="${esc(site.nome)}">
<meta property="og:title" content="${esc(fullTitle)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:image" content="${og}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="favicon.ico" sizes="48x48">
<link rel="icon" type="image/png" sizes="32x32" href="assets/img/logo/favicon-32.png">
<link rel="apple-touch-icon" href="assets/img/logo/apple-touch-icon.png">
<link rel="preload" href="assets/fonts/barlow-condensed-latin-800-italic.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="assets/fonts/inter-latin-wght-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="assets/css/style.css">
<script>(function(){var d=document.documentElement;d.classList.add('js');try{if(d.hasAttribute('data-intro')&&!sessionStorage.getItem('ironmax-intro')&&!matchMedia('(prefers-reduced-motion: reduce)').matches)d.classList.add('has-intro')}catch(e){}})()</script>
${jsonld ? `<script type="application/ld+json">${JSON.stringify(jsonld)}</script>\n` : ''}</head>
<body${DEMO ? ' data-demo' : ''}${bodyClass ? ` class="${bodyClass}"` : ''}>
<a class="skip" href="#main">Vai al contenuto</a>
${DEMO ? `<div class="demo-banner" role="note" data-demo-only>VERSIONE DEMO - Proposta di sito non ancora attiva. Per averla online sul vostro dominio contatta <a href="${site.tramontisUrl}" target="_blank" rel="noopener">Tramontis</a></div>\n` : ''}${intro ? `<div class="intro" aria-hidden="true"><div><img class="intro__logo" src="${LOGO_LIGHT}" alt="" width="966" height="299"><span class="intro__bar"></span></div></div>\n` : ''}<header class="site-header">
  <div class="container">
    <a class="brand" href="index.html" aria-label="Ironmax Sport, home"><b>Ironmax</b> <span>Sport</span></a>
    <nav class="nav" aria-label="Principale"><ul>${nav}</ul></nav>
    <div class="header-cta"><a class="btn" data-magnetic href="${TEL_HREF}">${ICON.phone}Chiama</a></div>
    <button class="menu-btn" type="button" aria-expanded="false" aria-controls="mobile-nav" aria-label="Apri il menu"><span></span></button>
  </div>
</header>
<nav class="mobile-nav" id="mobile-nav" aria-label="Menu mobile">${mnav}<a class="btn" href="${TEL_HREF}">${ICON.phone}Chiama in negozio</a></nav>
<main id="main">
${body}
</main>
${footer()}
<script src="assets/js/main.js" defer></script>
</body>
</html>
`;
}

function hoursRows(withData = true) {
  const rows = [
    ['Lunedì', 1, null], ['Martedì', 2, '9:00-12:00 e 15:00-19:00'], ['Mercoledì', 3, '9:00-12:00 e 15:00-19:00'], ['Giovedì', 4, '9:00-12:00 e 15:00-19:00'],
    ['Venerdì', 5, '9:00-12:00 e 15:00-19:00'], ['Sabato', 6, '9:00-12:00 e 15:00-19:00'], ['Domenica', 0, null],
  ];
  return rows.map(([n, d, h]) => `<tr${withData ? ` data-day="${d}"` : ''}${h ? '' : ' class="closed"'}><th scope="row">${n}</th><td>${h || 'Chiuso'}</td></tr>`).join('');
}

function footer() {
  return `<footer class="site-footer">
  <div class="container">
    <div class="foot-grid">
      <div>
        <img class="foot-logo" src="${LOGO_LIGHT}" alt="Logo Team Ironmax Triathlon" width="966" height="299" loading="lazy">
        <address style="margin-top:18px">${esc(site.indirizzo.via)}<br>${site.indirizzo.cap} ${site.indirizzo.citta} (${site.indirizzo.provincia})<br><a href="${TEL_HREF}">Tel ${TEL}</a>${site.email ? `<br><a href="mailto:${site.email}">${site.email}</a>` : ''}</address>
      </div>
      <div>
        <h2>Il sito</h2>
        <ul>${NAV.map(([h, l]) => `<li><a href="${h}">${l}</a></li>`).join('')}<li><a href="privacy.html">Privacy</a></li></ul>
      </div>
      <div>
        <h2>Orari</h2>
        <address>Martedì-Sabato<br>9:00-12:00 e 15:00-19:00<br>Domenica e lunedì chiuso</address>
        <p style="margin-top:14px"><span class="status" data-open-status>Orari in negozio</span></p>
      </div>
    </div>
    <div class="foot-line">
      <p>${esc(FOOT_LINE)}</p>
      ${DEMO ? `<p data-demo-only>Proposta di sito realizzata da <a href="${site.tramontisUrl}" target="_blank" rel="noopener">Tramontis</a></p>` : ''}
    </div>
  </div>
</footer>`;
}

/* ---------- componenti ---------- */
function productCard(p) {
  const i = p.immagine;
  return `<article class="card" data-brand="${marchioSlug(p.marchio)}">
  <div class="card__img"><img src="${i.src}" alt="${esc(i.alt)}" width="${i.w}" height="${i.h}" loading="lazy" decoding="async"></div>
  <div class="card__body"><p class="card__brand">${esc(p.marchio)}</p><h3>${esc(p.nome)}</h3>${p.sintesi ? `<p class="card__txt">${esc(p.sintesi)}</p>` : ''}</div>
</article>`;
}

function marqueeSet(hidden) {
  const items = marchi.map((m) => {
    let h = Math.min(64, m.logo.h), w = Math.round((m.logo.w * h) / m.logo.h);
    if (w > 150) { h = Math.round((h * 150) / w); w = 150; }
    return `<li><img src="${m.logo.src}" alt="${hidden ? '' : esc(m.nome)}" width="${w}" height="${h}" style="height:${h}px" loading="lazy"></li>`;
  }).join('');
  return `<ul class="marquee__set" role="list"${hidden ? ' aria-hidden="true"' : ''}>${items}</ul>`;
}

const swim = 'M4 62 C 24 30, 44 30, 64 62 S 104 94, 124 62 S 164 30, 184 62 S 224 94, 244 62 S 284 30, 304 62';
const bikeFrame = 'M62 78 L112 38 L198 40 L232 78 M138 78 L112 38 M138 78 L198 40 M62 78 L138 78 M198 40 L212 32 M102 33 L124 33';
const trackOut = 'M70 22 H250 A44 44 0 0 1 250 110 H70 A44 44 0 0 1 70 22 Z';
const trackIn = 'M70 40 H250 A26 26 0 0 1 250 92 H70 A26 26 0 0 1 70 40 Z';
const svgOpen = '<svg class="disc__svg" viewBox="0 0 320 124" aria-hidden="true" focusable="false">';
const dp = (d) => `<path class="disc__base" d="${d}"/><path class="disc__draw" pathLength="1" d="${d}"/>`;
const dc = (cx, cy, r) => `<circle class="disc__base" cx="${cx}" cy="${cy}" r="${r}"/><circle class="disc__draw" pathLength="1" cx="${cx}" cy="${cy}" r="${r}"/>`;

/* ---------- JSON-LD ---------- */
function storeJsonLd() {
  const spec = (days) => days.map((d) => [
    { '@type': 'OpeningHoursSpecification', dayOfWeek: d, opens: '09:00', closes: '12:00' },
    { '@type': 'OpeningHoursSpecification', dayOfWeek: d, opens: '15:00', closes: '19:00' },
  ]).flat();
  const o = {
    '@context': 'https://schema.org',
    '@type': 'SportingGoodsStore',
    name: site.nome,
    description: 'Negozio di articoli sportivi per triathlon, running, ciclismo e nuoto ad Azzate (VA).',
    image: `${site.siteUrl}/assets/img/negozio/facciata-negozio-via-piave.webp`,
    telephone: site.telefonoIntl,
    address: { '@type': 'PostalAddress', streetAddress: site.indirizzo.via, postalCode: site.indirizzo.cap, addressLocality: site.indirizzo.citta, addressRegion: site.indirizzo.provincia, addressCountry: 'IT' },
    openingHoursSpecification: spec(['Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']),
    foundingDate: '2006',
    hasMap: site.mapsUrl,
  };
  if (site.email) o.email = site.email;
  return o;
}

/* ---------- pagine ---------- */
const pages = {};

pages['index.html'] = () => {
  const catCards = CAT_ORDER.map((c) => {
    const cd = CATS[c], hero = prodotti.find((p) => p.id === cd.hero) || CAT_DATA[c].list[0];
    const brands = CAT_DATA[c].brands.slice(0, 5).map((b) => b.nome).join(', ');
    return `<a class="cat" href="${c}.html" data-tilt>
  <div class="cat__img"><img src="${hero.immagine.src}" alt="${esc(hero.immagine.alt)}" width="${hero.immagine.w}" height="${hero.immagine.h}" loading="lazy"></div>
  <div class="cat__body"><h3>${cd.nome}</h3><p>${esc(brands)} e altri</p></div>
</a>`;
  }).join('');
  const strip = [foto[0], foto[2], foto[4]].map((f) => `<figure><img data-parallax="0.08" src="${f.file}" alt="${esc(f.alt)}" width="${f.w}" height="${f.h}" loading="lazy"></figure>`).join('');
  const facade = foto.find((f) => f.file.includes('facciata'));
  const hero = foto[3];
  return layout({
    file: 'index.html', intro: true, navCurrent: 'index.html',
    title: 'Ironmax Sport Azzate: negozio running, triathlon, ciclismo e nuoto',
    desc: `Negozio di articoli sportivi ad Azzate (VA) per running, triathlon, ciclismo e nuoto. Consulenza di Max, marchi come Brooks, HOKA, Mizuno, Castelli e Garmin. ${site.indirizzo.via}, tel. ${TEL}.`,
    jsonld: storeJsonLd(),
    body: `
<section class="band band-dark band--cut hero" aria-labelledby="h-hero">
  <div class="hero__ghost" aria-hidden="true" data-parallax="-0.05">Ironmax</div>
  <div class="container hero__grid">
    <div class="hero__copy">
      <p class="status hero-fade" data-open-status style="--d:0">Orari: martedì-sabato 9:00-12:00 e 15:00-19:00</p>
      <h1 id="h-hero" data-hero-title><span class="line">Nuoto.</span><span class="line">Bici.</span><span class="line">Corsa.</span></h1>
      <p class="lead hero-fade" style="--d:4">Dal debuttante all'agonista: ad Azzate trovi articoli per triathlon, running, ciclismo e nuoto, con i consigli di Max, in negozio ogni giorno.</p>
      <div class="btn-row hero-fade" style="--d:5">
        <a class="btn" data-magnetic href="${TEL_HREF}">${ICON.phone}Chiama in negozio</a>
        <a class="btn btn--ghost" data-magnetic href="il-negozio.html">Scopri il negozio</a>
      </div>
    </div>
    <div class="hero__media hero-fade" style="--d:3">
      <figure class="slab"><img data-parallax="0.1" src="${hero.file}" alt="${esc(hero.alt)}" width="${hero.w}" height="${hero.h}" fetchpriority="high"></figure>
      <img class="hero__badge" src="${LOGO_LIGHT}" alt="Logo Team Ironmax Triathlon" width="966" height="299">
    </div>
  </div>
</section>

<section class="band band-dark-2 after-cut" id="discipline" aria-labelledby="h-disc">
  <div class="container">
    <div class="section-head">
      <h2 id="h-disc" data-reveal-title>Tre sport, una sola gara</h2>
      <p class="lead reveal">Ironman vuol dire 3,8 km a nuoto, 180 km in bici e 42,195 km di corsa. Da qui viene anche il nome del negozio: IRON, il ferro, e MAX, il nome del titolare.</p>
    </div>
    <div class="disc">
      <article class="disc__item">
        ${svgOpen}${dp(swim)}</svg>
        <p class="disc__num"><span data-count="3.8" data-dec="1">3,8</span><small>km</small></p>
        <h3 class="disc__name">Nuoto</h3>
        <p>Mute, occhialini, cuffie e accessori per allenarti in acqua.</p>
      </article>
      <article class="disc__item">
        ${svgOpen}${dc(62, 78, 34)}${dc(232, 78, 34)}${dp(bikeFrame)}</svg>
        <p class="disc__num"><span data-count="180" data-dec="0">180</span><small>km</small></p>
        <h3 class="disc__name">Bici</h3>
        <p>Abbigliamento, scarpe, caschi, occhiali, gomme e ciclocomputer.</p>
      </article>
      <article class="disc__item">
        ${svgOpen}${dp(trackOut)}${dp(trackIn)}</svg>
        <p class="disc__num"><span data-count="42.195" data-dec="3">42,195</span><small>km</small></p>
        <h3 class="disc__name">Corsa</h3>
        <p>Scarpe, abbigliamento tecnico, orologi GPS e integratori.</p>
      </article>
    </div>
    <div class="disc-foot">
      <p>Nel triathlon le tre discipline si incontrano: in negozio trovi articoli per ognuna, dal debutto alla gara.</p>
      <a class="btn btn--ghost" data-magnetic href="triathlon.html">Vai al triathlon</a>
    </div>
  </div>
</section>

<section class="band band-light" id="categorie" aria-labelledby="h-cat">
  <div class="container">
    <div class="section-head">
      <h2 id="h-cat" data-reveal-title>Cosa trovi in negozio</h2>
      <p class="measure reveal">Quattro reparti, da principianti ad agonisti. Alcuni dei marchi e degli articoli che trovi in negozio: per modelli e disponibilità chiedi a Max.</p>
    </div>
    <div class="cats" data-stagger>${catCards}</div>
  </div>
</section>

<section class="band band-white" aria-labelledby="h-brands" style="padding-block:clamp(48px,6vw,88px)">
  <div class="container"><div class="section-head" style="margin-bottom:28px">
    <h2 id="h-brands" data-reveal-title style="font-size:clamp(2rem,4.4vw,3.4rem)">Alcuni dei marchi in negozio</h2>
  </div></div>
  <div class="marquee" role="group" aria-label="Logo dei marchi">
    <div class="marquee__track">${marqueeSet(false)}${marqueeSet(true)}</div>
  </div>
  <div class="container" style="margin-top:28px"><a class="link" href="marchi.html">Tutti i marchi</a></div>
</section>

<section class="band band-dark" id="trovarci" aria-labelledby="h-visit">
  <div class="container visit">
    <div class="visit__addr">
      <h2 id="h-visit" data-reveal-title>Passa a trovarci</h2>
      <p class="status" data-open-status>Martedì-sabato 9:00-12:00 e 15:00-19:00</p>
      <address class="addr">${esc(site.nome)}<br>${esc(site.indirizzo.via)}<br>${site.indirizzo.cap} ${site.indirizzo.citta} (${site.indirizzo.provincia})</address>
      <a class="bigtel" href="${TEL_HREF}" aria-label="Chiama lo ${TEL.replace(/ /g, ' ')}">${TEL}</a>
      <div class="btn-row">
        <a class="btn" data-magnetic href="${TEL_HREF}">${ICON.phone}Chiama in negozio</a>
        <a class="btn btn--ghost" data-magnetic href="${site.mapsUrl}" target="_blank" rel="noopener">${ICON.pin}Apri su Google Maps</a>
      </div>
      <p class="mute" style="max-width:46ch">Siamo sulla strada provinciale che attraversa Azzate, al numero 94 di Via Piave.</p>
    </div>
    <table class="hours"><caption>Orari del negozio</caption><tbody>${hoursRows()}</tbody></table>
  </div>
</section>

<section class="band band-light" id="storia" aria-labelledby="h-story">
  <div class="container story">
    <div class="story__text">
      <h2 id="h-story" data-reveal-title>Dal 2006, per chi ama lo sport</h2>
      <p class="lead reveal">Ironmax Sport nasce nella primavera del 2006 da una passione sfrenata per tutto lo sport e, in particolare, per il triathlon.</p>
      <p class="reveal">Nel negozio trovi un vasto assortimento di articoli per nuoto, ciclismo, running e triathlon, per il debuttante come per l'agonista che cerca prodotti sempre più tecnologici. I prodotti vengono testati sui campi gara di tutte le specialità, anche dal titolare.</p>
      <p class="reveal">Max, il titolare, è in negozio ogni giorno per aiutarti a scegliere l'articolo più adatto a te.</p>
      <p class="sign reveal">Max</p>
      <div class="btn-row reveal"><a class="btn btn--line" data-magnetic href="il-negozio.html">Scopri il negozio</a></div>
    </div>
    <figure class="frame reveal">
      <img src="${facade.file}" alt="${esc(facade.alt)}" width="${facade.w}" height="${facade.h}" loading="lazy">
      <figcaption>L'ingresso in Via Piave 94, Azzate.</figcaption>
    </figure>
  </div>
</section>

<section class="band band-dark" aria-labelledby="h-photos" style="padding-bottom:clamp(64px,9vw,120px)">
  <div class="container">
    <div class="section-head">
      <h2 id="h-photos" data-reveal-title>Il negozio da dentro</h2>
    </div>
    <div class="strip">${strip}</div>
    <div class="btn-row" style="margin-top:36px"><a class="btn btn--ghost" data-magnetic href="il-negozio.html#galleria">Guarda tutte le foto</a></div>
  </div>
</section>`,
  });
};

function catPage(c) {
  const cd = CATS[c], { list, brands } = CAT_DATA[c];
  const chips = [`<button class="chip" type="button" data-filter="all" aria-pressed="true">Tutti<small>${list.length}</small></button>`]
    .concat(brands.map((b) => `<button class="chip" type="button" data-filter="${b.slug}" aria-pressed="false">${esc(b.nome)}<small>${b.n}</small></button>`)).join('');
  return layout({
    file: `${c}.html`, navCurrent: `${c}.html`,
    title: cd.title + ' | Ironmax Sport', desc: cd.desc,
    body: `
<section class="band band-dark band--cut page-hero" aria-labelledby="h-page">
  <div class="page-hero__ghost" aria-hidden="true">${cd.nome}</div>
  <div class="container">
    <h1 id="h-page" data-reveal-title>${cd.nome}</h1>
    <p class="lead">${esc(cd.lead)}</p>
    <div class="btn-row"><a class="btn" data-magnetic href="${TEL_HREF}">${ICON.phone}Chiama in negozio</a></div>
  </div>
</section>
<section class="band band-light after-cut" aria-labelledby="h-cat-list">
  <div class="container">
    <h2 id="h-cat-list" class="sr-only">Articoli ${cd.nome}</h2>
    <p class="notice"><span>Alcuni dei marchi e articoli che trovi in negozio. Sono esempi dell'assortimento: modelli, taglie e disponibilità vanno chiesti in negozio, al ${TEL}. Nessun prezzo online.</span></p>
    <div class="filters" role="group" aria-label="Filtra per marchio" data-js-only hidden>${chips}</div>
    <p class="count" data-count-label aria-live="polite">${list.length} articoli</p>
    <div class="grid" data-grid>
${list.map(productCard).join('\n')}
    </div>
    <div class="more" hidden><button class="btn btn--dark" type="button" data-more>Mostra altri articoli</button></div>
  </div>
</section>
<section class="band band-dark" aria-labelledby="h-cta">
  <div class="container cta-band">
    <h2 id="h-cta" data-reveal-title>Non trovi il modello giusto?</h2>
    <p class="lead">Chiedi a Max: ti consiglia l'articolo più adatto alle tue esigenze.</p>
    <div class="btn-row">
      <a class="btn" data-magnetic href="${TEL_HREF}">${ICON.phone}Chiama in negozio</a>
      <a class="btn btn--ghost" data-magnetic href="dove-siamo.html">Dove siamo</a>
    </div>
  </div>
</section>`,
  });
}
CAT_ORDER.forEach((c) => { pages[`${c}.html`] = () => catPage(c); });

pages['il-negozio.html'] = () => {
  const facade = foto.find((f) => f.file.includes('facciata'));
  const gal = foto.map((f) => `<button type="button" class="${f.file.includes('facciata') ? 'tall' : ''}" data-lightbox data-full="${f.file}" data-alt="${esc(f.alt)}" data-w="${f.w}" data-h="${f.h}" aria-label="Ingrandisci: ${esc(f.alt)}"><img src="${f.file}" alt="${esc(f.alt)}" width="${f.w}" height="${f.h}" loading="lazy"></button>`).join('');
  return layout({
    file: 'il-negozio.html', navCurrent: 'il-negozio.html',
    title: 'Il negozio di Azzate: dal 2006 sport e consulenza | Ironmax Sport',
    desc: 'La storia di Ironmax Sport, negozio di Azzate (VA) nato nel 2006 dalla passione per il triathlon. Consulenza personalizzata di Max, articoli per nuoto, ciclismo, running e triathlon.',
    body: `
<section class="band band-dark band--cut page-hero" aria-labelledby="h-page">
  <div class="page-hero__ghost" aria-hidden="true">Dal 2006</div>
  <div class="container">
    <h1 id="h-page" data-reveal-title>Il negozio</h1>
    <p class="lead">Dal 2006 ad Azzate, in Via Piave 94: articoli per nuoto, ciclismo, running e triathlon, scelti e consigliati da chi li prova.</p>
  </div>
</section>
<section class="band band-light after-cut" aria-labelledby="h-storia">
  <div class="container story">
    <div class="story__text">
      <h2 id="h-storia" data-reveal-title>La storia</h2>
      <p class="lead reveal">Il negozio nasce nella primavera del 2006 da una passione sfrenata per tutto lo sport e in particolare per il triathlon.</p>
      <p class="reveal">Ironman: 3,8 km di nuoto, 180 km di bici e 42,195 km di corsa, il sogno di tutti i triatleti. Non solo da qui deriva il nome del negozio: IRON, il ferro, e MAX, il nome del titolare.</p>
      <p class="reveal">All'interno puoi trovare un vasto assortimento di articoli sportivi per nuoto, ciclismo, running e triathlon, per soddisfare le esigenze dello sportivo, dal debuttante all'agonista che cerca prodotti sempre più tecnologici.</p>
      <p class="sign reveal">Max</p>
    </div>
    <figure class="frame reveal">
      <img src="${facade.file}" alt="${esc(facade.alt)}" width="${facade.w}" height="${facade.h}" loading="lazy">
      <figcaption>La facciata del negozio in Via Piave 94.</figcaption>
    </figure>
  </div>
</section>
<section class="band band-dark" aria-labelledby="h-serv">
  <div class="container">
    <div class="section-head"><h2 id="h-serv" data-reveal-title>Come lavoriamo</h2></div>
    <div class="feat-grid" data-stagger>
      <article class="feature"><h3>Consulenza personalizzata</h3><p>Max, il titolare, è in negozio ogni giorno e ti aiuta a scegliere l'articolo più adatto alle tue esigenze.</p></article>
      <article class="feature"><h3>Provato sul campo</h3><p>I prodotti vengono testati continuamente sui campi gara di tutte le specialità, anche dal titolare, per conoscerne al meglio le caratteristiche.</p></article>
      <article class="feature"><h3>Quattro sport, un solo negozio</h3><p>Nuoto, ciclismo, running e triathlon: dal debuttante all'agonista, con marchi della tecnologia sportiva come Brooks, Mizuno e Castelli.</p></article>
      <article class="feature"><h3>Prezzi vantaggiosi</h3><p>Max promette trattamenti particolari e prezzi vantaggiosi. Per saperne di più passa in negozio o chiama.</p></article>
    </div>
    <div class="btn-row" style="margin-top:40px"><a class="btn" data-magnetic href="${TEL_HREF}">${ICON.phone}Chiama in negozio</a></div>
  </div>
</section>
<section class="band band-light" id="galleria" aria-labelledby="h-gal">
  <div class="container">
    <div class="section-head"><h2 id="h-gal" data-reveal-title>Galleria</h2><p class="mute">Foto del negozio. Clicca su un'immagine per ingrandirla.</p></div>
    <div class="gallery" data-stagger>${gal}</div>
  </div>
</section>
<dialog class="lightbox" aria-label="Galleria fotografica del negozio">
  <div class="lb">
    <button class="lb__btn lb__close" type="button" aria-label="Chiudi">${ICON.close}</button>
    <button class="lb__btn lb__prev" type="button" aria-label="Foto precedente">${ICON.prev}</button>
    <button class="lb__btn lb__next" type="button" aria-label="Foto successiva">${ICON.next}</button>
    <div class="lb__stage"><img alt="" src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="></div>
    <p class="lb__cap" aria-live="polite"></p>
  </div>
</dialog>`,
  });
};

pages['marchi.html'] = () => {
  const inCat = marchi.filter((m) => m.inCatalogo > 0);
  const others = marchi.filter((m) => m.inCatalogo === 0);
  const tile = (m, link) => {
    const inner = `<figure><img src="${m.logo.src}" alt="Logo ${esc(m.nome)}" width="${m.logo.w}" height="${m.logo.h}" loading="lazy"></figure><span class="n">${esc(m.nome)}</span>`;
    return link ? `<a class="logo-tile" href="${link}">${inner}</a>` : `<div class="logo-tile">${inner}</div>`;
  };
  const cardLink = (m) => { const cs = brandCats(m.nome); return cs.length ? `${cs[0]}.html?marchio=${m.slug}` : null; };
  return layout({
    file: 'marchi.html', navCurrent: 'marchi.html',
    title: 'Marchi sportivi: Brooks, HOKA, Mizuno, Castelli, Garmin | Ironmax Sport',
    desc: 'I marchi di running, ciclismo, nuoto e triathlon che trovi da Ironmax Sport ad Azzate: Brooks, HOKA, Mizuno, Castelli, Garmin, Suunto, Zoggs, 2XU e molti altri.',
    body: `
<section class="band band-dark band--cut page-hero" aria-labelledby="h-page">
  <div class="page-hero__ghost" aria-hidden="true">Marchi</div>
  <div class="container">
    <h1 id="h-page" data-reveal-title>I nostri marchi</h1>
    <p class="lead">Alcuni dei marchi che trovi in negozio. Per modelli e disponibilità chiedi a Max.</p>
  </div>
</section>
<section class="band band-light after-cut" aria-labelledby="h-in">
  <div class="container">
    <div class="section-head"><h2 id="h-in" data-reveal-title>Con articoli di esempio</h2><p class="measure mute">Clicca su un marchio per vedere alcuni degli articoli.</p></div>
    <div class="logos" data-stagger>${inCat.map((m) => tile(m, cardLink(m))).join('')}</div>
  </div>
</section>
<section class="band band-white" aria-labelledby="h-others">
  <div class="container">
    <div class="section-head"><h2 id="h-others" data-reveal-title>Altri marchi</h2></div>
    <div class="logos" data-stagger>${others.map((m) => tile(m, null)).join('')}</div>
  </div>
</section>
<section class="band band-light fed" aria-labelledby="h-fed">
  <div class="container">
    <div class="section-head"><h2 id="h-fed" data-reveal-title>Federazioni</h2><p class="measure mute">Le sigle delle federazioni degli sport del negozio, mostrate anche sul sito attuale di Ironmax.</p></div>
    <div class="logos" data-stagger>${federazioni.map((f) => `<div class="logo-tile" style="background:#fff"><figure><img src="${f.logo.src}" alt="Logo ${esc(f.nome)}" width="${f.logo.w}" height="${f.logo.h}" loading="lazy"></figure><span class="n">${esc(f.nome)}</span></div>`).join('')}</div>
    <p class="mute" style="margin-top:28px;max-width:62ch">I loghi sono dei rispettivi titolari e sono mostrati come in un normale catalogo del negozio.</p>
  </div>
</section>`,
  });
};

pages['dove-siamo.html'] = () => {
  const facade = foto.find((f) => f.file.includes('facciata'));
  return layout({
    file: 'dove-siamo.html', navCurrent: 'dove-siamo.html',
    title: 'Dove siamo: Via Piave 94, Azzate (VA), orari e telefono | Ironmax Sport',
    desc: `Ironmax Sport si trova ad Azzate (VA), in Via Piave 94, sulla strada provinciale che attraversa il paese. Aperto da martedì a sabato 9:00-12:00 e 15:00-19:00. Tel ${TEL}.`,
    jsonld: storeJsonLd(),
    body: `
<section class="band band-dark band--cut page-hero" aria-labelledby="h-page">
  <div class="page-hero__ghost" aria-hidden="true">Azzate</div>
  <div class="container">
    <h1 id="h-page" data-reveal-title>Dove siamo</h1>
    <p class="lead">Via Piave 94, Azzate, in provincia di Varese.</p>
    <p class="status" data-open-status>Martedì-sabato 9:00-12:00 e 15:00-19:00</p>
  </div>
</section>
<section class="band band-light after-cut" aria-labelledby="h-info">
  <div class="container where">
    <div class="panel dark">
      <h2 id="h-info" style="font-size:2.4rem">Indirizzo e telefono</h2>
      <address class="addr">${esc(site.nome)}<br>${esc(site.indirizzo.via)}<br>${site.indirizzo.cap} ${site.indirizzo.citta} (${site.indirizzo.provincia})</address>
      <a class="bigtel" href="${TEL_HREF}" aria-label="Chiama lo ${TEL}">${TEL}</a>
      <div class="btn-row">
        <a class="btn" data-magnetic href="${TEL_HREF}">${ICON.phone}Chiama in negozio</a>
        <a class="btn btn--ghost" data-magnetic href="${site.mapsUrl}" target="_blank" rel="noopener">${ICON.pin}Apri su Google Maps</a>
      </div>
    </div>
    <div class="panel">
      <table class="hours"><caption>Orari del negozio</caption><tbody>${hoursRows()}</tbody></table>
    </div>
  </div>
</section>
<section class="band band-white" aria-labelledby="h-how">
  <div class="container how">
    <div class="how__list">
      <h2 id="h-how" data-reveal-title>Come arrivare</h2>
      <p class="lead reveal">Il negozio si trova ad Azzate, in provincia di Varese, al numero 94 di Via Piave: la strada provinciale che attraversa il paese.</p>
      <p class="reveal">Cerca l'insegna Ironmax Sport sulla strada principale. Se vuoi essere sicuro di trovarci aperti, chiama prima: ${TEL}.</p>
      <div class="btn-row reveal"><a class="btn btn--dark" data-magnetic href="${site.mapsUrl}" target="_blank" rel="noopener">${ICON.pin}Apri su Google Maps</a></div>
    </div>
    <figure class="frame reveal">
      <img src="${facade.file}" alt="${esc(facade.alt)}" width="${facade.w}" height="${facade.h}" loading="lazy">
      <figcaption>L'ingresso del negozio.</figcaption>
    </figure>
  </div>
</section>`,
  });
};

pages['privacy.html'] = () => layout({
  file: 'privacy.html', navCurrent: '',
  title: 'Informativa sulla privacy | Ironmax Sport',
  desc: 'Informativa sulla privacy del sito di Ironmax Sport: nessun cookie, nessun tracciamento, nessun dato raccolto.',
  body: `
<section class="band band-dark band--cut page-hero" aria-labelledby="h-page">
  <div class="container">
    <h1 id="h-page" style="font-size:clamp(3rem,10vw,7rem)">Privacy</h1>
    <p class="lead">Questo sito non raccoglie dati personali.</p>
  </div>
</section>
<section class="band band-light after-cut">
  <div class="container prose">
    <h2>Titolare</h2>
    <p>${esc(site.nome)}, ${esc(site.indirizzo.via)}, ${site.indirizzo.cap} ${site.indirizzo.citta} (${site.indirizzo.provincia}). Telefono ${TEL}. P. IVA: [DA COMPILARE].</p>
    <h2>Quali dati raccogliamo</h2>
    <p>Nessuno. Il sito è composto solo da pagine statiche: non ci sono moduli, registrazioni, account o carrelli, e non viene richiesto né salvato alcun dato personale.</p>
    <h2>Cookie e tracciamento</h2>
    <p>Il sito non usa cookie, né propri né di terze parti. Non usa strumenti di analisi o di tracciamento e non carica script, font o immagini da servizi esterni: tutto è ospitato sul sito stesso.</p>
    <h2>Telefono e mappa</h2>
    <ul>
      <li>Il pulsante "Chiama" apre l'app telefono del tuo dispositivo con il numero del negozio. Nessun dato passa dal sito.</li>
      <li>Il link "Apri su Google Maps" ti porta sul sito di Google: da quel momento valgono le condizioni e l'informativa di Google.</li>
    </ul>
    <h2>I tuoi diritti</h2>
    <p>Poiché il sito non tratta dati personali, non ci sono dati da consultare, correggere o cancellare. Per qualsiasi domanda puoi chiamare il negozio al ${TEL}.</p>
  </div>
</section>`,
});

pages['404.html'] = () => layout({
  file: '404.html', navCurrent: '',
  title: 'Pagina non trovata | Ironmax Sport', desc: 'La pagina cercata non esiste. Torna alla home di Ironmax Sport.',
  body: `
<section class="band band-dark page-hero" style="min-height:70svh">
  <div class="container">
    <h1 id="h-page" style="font-size:clamp(3rem,12vw,9rem)">404</h1>
    <p class="lead">Questa pagina non esiste o è stata spostata.</p>
    <div class="btn-row"><a class="btn" href="index.html">Torna alla home</a><a class="btn btn--ghost" href="${TEL_HREF}">${ICON.phone}Chiama in negozio</a></div>
  </div>
</section>`,
});

/* ---------- scrittura ---------- */
const written = [];
Object.entries(pages).forEach(([f, fn]) => { fs.writeFileSync(path.join(ROOT, f), fn()); written.push(f); });

const today = new Date().toISOString().slice(0, 10);
const urls = written.filter((f) => f !== '404.html' && f !== 'privacy.html').concat(['privacy.html']);
fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((f) => `  <url><loc>${site.siteUrl}/${f === 'index.html' ? '' : f}</loc><lastmod>${today}</lastmod></url>`).join('\n')}
</urlset>
`);
fs.writeFileSync(path.join(ROOT, 'robots.txt'), DEMO
  ? `# Versione demo: non indicizzare.\nUser-agent: *\nDisallow: /\n`
  : `User-agent: *\nAllow: /\n\nSitemap: ${site.siteUrl}/sitemap.xml\n`);
console.log(`Generate ${written.length} pagine, sitemap.xml e robots.txt (demo: ${DEMO}).`);
