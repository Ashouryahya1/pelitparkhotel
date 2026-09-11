# Russian, Azerbaijani and Persian editions

Added 2026-09-11. Persian and the site-wide language dropdown were added the same day. Each edition has a homepage, about page, room types, guest reviews, and airport, Forum Trabzon and Farabi hospital pages.

## Editing and building

- Edit copy in `data/locales/ru.json`, `data/locales/az.json` and `data/locales/fa.json`.
- Shared templates: `tools/build-international-pages.js`.
- Seven-language routes and actual translation groups: `tools/lib/site-languages.js`.
- Run `npm run build`, then `npm test` and `git diff --check`.
- The language normalizer runs after the page generators. It produces reciprocal HTML-head hreflang, seven static links in a native details/summary dropdown and content-hashed shared assets.
- RU/AZ/FA directories are excluded from the legacy Turkish-to-English/Arabic generator. Never add translation markers to manually maintained Turkish home/room pages: this can cause wholesale regeneration of established EN/AR copy.
- Keep Russian/Azerbaijani/Persian locale packs separate from the legacy translations directory. Missing copy must fail validation rather than silently fall back to Turkish.
- Generated HTML is committed for GitHub Pages. No runtime translation or new service subscription is needed.

## Content and layout requirements

Preserve the established TR/EN/AR/KA body copy, reviews, homepage hero, About section, room photos and statistics. There are no visible breadcrumb trails on the new pages. New localized footers come from one shared template and use four columns in one row on desktop. A single language button opens native language names on desktop and phones. Native details/summary works without JavaScript; the shared script adds outside-click and Escape dismissal. Persian uses RTL and a suitable font stack; ratings and phone numbers retain their intended direction.

Room descriptions include the management-confirmed 50-inch Smart TV. Bidet copy is Arabic only. Sea view is a Deluxe feature; do not promise it or a balcony for every Twin/Standard room. Prices, breakfast inclusion, transport options and exact availability depend on current information. Do not add guaranteed travel times, operated transfers, medical partnerships or guaranteed staff languages.

Reviews are translations of the existing manually selected quotations in `data/review-selections.json`, keeping the original authors and stay details. The page labels them as translated selections. Booking 9/10, Google 4.9/5 and 6,000+ completed bookings are management-supplied, manually maintained figures from `data/home-stats.json`; they are not a live API feed. No aggregateRating markup was added.

## Search targeting and metadata

Russian primary phrase: “отель в Трабзоне”; Azerbaijani: “Trabzonda otel”; Persian: “هتل در ترابزون”. Dedicated landing pages cover airport, Forum and Farabi intent. These are editorial targeting choices, not measured search-volume claims.

Each page has original localized copy, one H1, a unique title and description, a self-referencing canonical, social metadata, consistent Hotel identity, localized WebPage structured data, relevant internal links and sitemap inclusion. All equivalent pages have reciprocal hreflang and a Turkish x-default. Georgian has no About or Reviews equivalent, so its homepage is only a navigation fallback for those pages, not a hreflang alternate.

References:
- [Google localized versions](https://developers.google.com/search/docs/specialty/international/localized-versions)
- [Yandex localized pages](https://yandex.com/support/webmaster/en/yandex-indexing/locale-pages)

Hreflang is in the HTML head for both engines. Updating the sitemap makes the pages discoverable; publication does not establish that a search engine has indexed or ranked them.
