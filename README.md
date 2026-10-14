# Ironmax Sport: proposta di sito (demo)

Sito statico (HTML, CSS, JS, nessun framework né dipendenza a runtime) per il negozio **Ironmax Sport** di Azzate (VA). Proposta realizzata da Tramontis.

## Struttura

```
index.html, running.html, ciclismo.html, nuoto.html, triathlon.html,
il-negozio.html, marchi.html, dove-siamo.html, privacy.html, 404.html   pagine generate
assets/css/style.css, assets/js/main.js                                 un solo CSS e un solo JS
assets/fonts/                                                           Barlow Condensed e Inter (OFL), self-hosted
assets/img/{prodotti,marchi,negozio,federazioni,logo}/                  immagini WebP
data/site.json        dati del negozio e interruttore demo
data/prodotti.json    esempi di prodotto per categoria
data/marchi.json      loghi dei marchi
data/foto-negozio.json, data/federazioni.json
scripts/build.js      generatore (Node, solo libreria standard)
```

Non esiste `team.html`: la pagina "Il team" del sito originale è rotta (errore PHP) e non c'è contenuto reale da riusare.

## Modificare i dati e rigenerare

1. Modifica i file in `data/` (orari e telefono in `data/site.json`, testi delle pagine in `scripts/build.js`).
2. Esegui `node scripts/build.js` (Node 18 o successivo). Riscrive tutte le pagine `.html`, `sitemap.xml` e `robots.txt`.
3. Committa sia i sorgenti sia l'HTML generato: il sito servito resta statico e funziona anche senza build.

Gli orari mostrati nel testo sono in `scripts/build.js` (funzione `hoursRows`, blocco orari del footer) e in `assets/js/main.js` (`SCHEDULE`, usato dall'indicatore Aperto/Chiuso, fuso Europe/Rome). Se cambiano, aggiorna entrambi.

## Aggiungere foto o prodotti

- **Prodotto**: copia l'immagine (meglio WebP, senza ingrandirla oltre la risoluzione naturale) in `assets/img/prodotti/` e aggiungi una voce in `data/prodotti.json`:
  `{ "id", "nome", "marchio", "categorie": ["running"], "sintesi", "descrizione", "immagine": { "src", "w", "h", "alt" } }`.
  Il nome del marchio deve esistere in `data/marchi.json` per comparire nel filtro e in "Marchi".
- **Marchio**: logo in `assets/img/marchi/` e voce in `data/marchi.json`.
- **Foto del negozio**: file in `assets/img/negozio/` e voce in `data/foto-negozio.json` (compare nella galleria con lightbox).
- Poi `node scripts/build.js`.

## Rimuovere la demo (quando il cliente acquista)

Un solo punto di controllo: in `data/site.json` imposta `"demo": false` e lancia `node scripts/build.js`. Il generatore:

- toglie il banner giallo "VERSIONE DEMO" e la riga "Proposta di sito realizzata da Tramontis" dal footer;
- toglie `data-demo` dal `<body>` (e con lui la filigrana "DEMO", che è solo CSS);
- toglie `<meta name="robots" content="noindex, nofollow">` e il prefisso `[DEMO]` dai `<title>`;
- scrive un `robots.txt` che consente l'indicizzazione e cita la sitemap.

Prima della messa online:

- imposta `siteUrl` in `data/site.json` con il dominio definitivo (usato da sitemap, Open Graph e JSON-LD; ora è `https://www.ironmax.it`);
- compila `[DA COMPILARE]` in `privacy.html` (P. IVA) e, se esiste, `email` in `data/site.json` (compare in footer e JSON-LD).

Senza rigenerare, la demo si spegne anche a mano: togliendo l'attributo `data-demo` dal `<body>` spariscono banner e filigrana (il JS rimuove gli elementi `[data-demo-only]`); `noindex` e prefisso nel titolo vanno però tolti dall'HTML.

## Pubblicare

Il sito è statico con percorsi relativi, e `.nojekyll` è già presente. Su GitHub Pages: Settings, Pages, branch `main`, cartella `/ (root)`. Va bene anche qualsiasi hosting statico (Netlify, Cloudflare Pages, server web): basta caricare il contenuto della cartella. Per provarlo in locale: `python3 -m http.server` nella radice e apri `http://localhost:8000`.

## Note tecniche

- Animazioni solo con CSS, Web Animations/IntersectionObserver e `requestAnimationFrame`, su `transform` e `opacity` (unica eccezione: il tratto delle linee SVG delle discipline, `stroke-dashoffset`). Tutto è disattivato o ridotto con `prefers-reduced-motion`.
- Nessun cookie, nessun tracciamento, nessuno script o font di terze parti.
- Font: Barlow Condensed (titoli) e Inter (testo), licenza OFL, in `assets/fonts/` con le licenze.
- Palette dal logo: rosso `#D8041F`, nero `#181418`.
