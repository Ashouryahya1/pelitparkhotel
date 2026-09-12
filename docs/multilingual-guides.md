# Trabzon multilingual guides

Published content set: 10 topics in each of TR, EN, AR, KA, RU, AZ and FA (70 articles), with a ten-article index per language.

## Routes and discovery
- Turkish: /guides/
- Other editions: /en/guides/, /ar/guides/, /ka/guides/, /ru/guides/, /az/guides/, /fa/guides/
- The same article slug is used across editions; the language dropdown retains the selected topic.
- Each homepage includes three featured guides and a link to its complete index.
- Indexable existing pages receive one localized guide link in their existing footer.
- sitemap.xml contains the full site; sitemap-guides.xml contains the 77 new article/index URLs.
- guide-indexing-urls.txt is the exact new URL list for submission. Its presence does not mean submission or indexing succeeded.

## Editorial intent
Topics cover where to stay, total hotel cost, families, parking, sea-view categories, airport arrival, Forum shopping, a flexible first visit, direct reservations, and work/KTÜ/Farabi visits.
Each article has an introduction, four distinct sections, a practical checklist, two relevant questions, related guides and a useful hotel page.
The articles address different decisions, rather than creating multiple pages for spelling variants of the same query. These are editorial search-intent choices, not measured search-volume estimates or a ranking guarantee.

## Sources and accuracy
Hotel details come from data/hotel-facts.json and the owner's confirmed room requirements.
Official sources for the few external destination/transport facts are linked in the relevant articles:
- DHMİ Trabzon Airport: https://www.dhmi.gov.tr/Sayfalar/Havalimani/Trabzon/Ulasim.aspx
- Forum Trabzon: https://www.forumtrabzon.com/
- GoTürkiye Trabzon: https://goturkiye.com/trabzon
- KTÜ Farabi: https://www.ktu.edu.tr/farabi/iletisim

The three-day plan is an editorial example, not an offered tour.
No fixed room prices, journey durations, airport transfers, partnerships, extra-bed inventory or universal balconies were invented.
Deluxe Double carries the published sea view; Twin and Standard do not.
All room amenity references use a 50-inch Smart TV. Bidet wording remains Arabic only.
Authorship identifies the hotel organization, without inventing an individual expert or claiming independent review.
No rating or FAQ rich-result claims were added.

## Build ownership
- data/guide-catalog.json: shared topic IDs, slugs, related links, illustrations, official sources and actual publication dates.
- data/guides/<language>.json: complete localized text, with no fallback to Turkish.
- tools/build-guide-pages.js: 70 articles, seven indexes, marked homepage additions, footer discovery and dedicated sitemap.
- assets/css/guides.css: scoped editorial presentation; existing hero, room, About and review layouts are preserved.
- tools/lib/site-languages.js: editorial equivalence groups are separate from core generator slugs.
- tools/build-i18n.js excludes guides; a legacy rebuild must not overwrite article translations.
- npm run build performs core generation, guide generation and normalization in the required order.
- npm test includes all existing checks and tests/validate_guides.js.

Before publication the full build and tests passed. Repeating the complete build produced no output differences. A comparison of all 70 pre-existing HTML bodies, after removing only the new marked guide additions and normalizing formatting whitespace, found no content changes.
Dates describe real publication/content changes. Do not advance them solely to make unchanged articles appear recent.

Search Console/Yandex submission results must be recorded from their actual responses after deployment. A sitemap file, an accepted request and a confirmed indexed page are separate states.

