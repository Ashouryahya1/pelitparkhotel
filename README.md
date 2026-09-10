# Pelit Park Hotel website

Static HTML, CSS, and JavaScript site published with GitHub Pages at
`https://pelitparkhotel.com/`.

## Local preview

From the repository root:

```powershell
python -m http.server 8000
```

Then open `http://127.0.0.1:8000/`.

## Validation

```powershell
npm test
```

The checks validate local links and images, Georgian SEO metadata, structured
data, language menus, hreflang reciprocity, robots.txt, and sitemap entries.

Run the complete deterministic build before validation:

```powershell
npm run build
npm test
```

## Localized page generation

Run the localization maintenance command with:

```powershell
npm run build:i18n
```

Pages that still contain `data-translate` markers are generated from the
Turkish source. When those markers are absent, the command preserves the
existing English and Arabic content and updates only canonical, hreflang,
language-menu, and asset-path markup. This guard prevents localized content
from being overwritten by Turkish copy.

The Georgian landing pages are maintained directly under `ka/`.

The complete build also regenerates the multilingual airport, Forum Trabzon,
and KTÜ Farabi Hospital landing pages, the review-source pages, normalized
Hotel structured data, campaign-page indexing rules, and `sitemap.xml`.

Stable contact, booking, parking, room-view, breakfast, and arrival facts are
maintained in `data/hotel-facts.json`. Update that reviewed source before
changing the same claim across languages or generators.

## Publishing

GitHub Pages publishes the custom domain from the repository's configured
production branch. Validate first, then merge or push the reviewed changes to
that branch.

