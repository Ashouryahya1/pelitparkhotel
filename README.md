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
and KTÜ Farabi Hospital landing pages, the guest-review pages, normalized
Hotel structured data, campaign-page indexing rules, and `sitemap.xml`.

Stable contact, booking, parking, room-view, breakfast, and arrival facts are
maintained in `data/hotel-facts.json`. Update that reviewed source before
changing the same claim across languages or generators.

## Guest reviews

`tools/build-review-pages.js` owns the Turkish, English and Arabic review
pages. Their exact historical Google and Booking.com quotations are stored
in `data/review-selections.json`, restored from commit `76198a6`. The Booking
score is 9/10 as requested by the hotel owner. These are static selections;
they are not a connected or automatically refreshed feed. No review count
or Google aggregate score is asserted by these pages.

Each review page reads the footer from its localized homepage. The general
language generator skips these pages so it cannot overwrite their content.

There is no paid widget, subscription or billing-enabled Google Places
integration. Google Business Profile API itself is free, but activating
automatic Google reviews still requires an approved Cloud project and
authorization for the hotel's verified Business Profile. That connection
has not been activated. A future integration must keep OAuth credentials
on the server and follow Google's retention rules; do not commit fetched
API review data or credentials into the public repository.

## Publishing

GitHub Pages publishes the custom domain from the repository's configured
production branch. Validate first, then merge or push the reviewed changes to
that branch.

