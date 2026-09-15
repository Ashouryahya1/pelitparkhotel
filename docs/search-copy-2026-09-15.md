# Search copy and booking discovery

The homepage and airport pages now explain the room choices, location and arrival details more directly. Price guides identify their subject clearly and offer a booking link near the introduction. Existing URLs are retained.

- `data/home-booking.json` owns the seven homepage titles, descriptions, headings and room/rate summaries. `tools/build-home-booking.js` runs after the locale generators and preserves the surrounding homepage content.
- Homepage values in `translations/{tr,en,ar}.json` and `data/locales/{ru,az,fa}.json` remain aligned with the shared homepage copy. EN/AR About paragraphs correct Meydan to approximately 10 minutes by car, subject to traffic.
- Airport copy is maintained in `tools/build-location-pages.js` for TR/EN/AR/KA and `data/locales/{ru,az,fa}.json` for the other languages. Approximate travel times and arrival policies come from `data/hotel-facts.json`.
- A guide can set its own `updatedAt` in `data/guides/<language>.json`. The visible date, Article schema, Open Graph metadata and guide sitemap use that date. Unchanged articles retain their original dates.
- Run `npm install`, `npm run build` and `npm test`. A second complete build should leave the generated files unchanged. Build output remains the checked-in static site served by the existing GitHub Pages deployment.

Validation covered all existing site checks, the seven homepage booking sections, matching language links and metadata, the seven price-guide booking links and dates, and a repeat build with identical output. Search performance figures remain outside this public repository.
