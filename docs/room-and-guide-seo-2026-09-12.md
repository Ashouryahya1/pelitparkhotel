# Room information and contextual SEO — 12 September 2026

This update connects the management interview to the pages where guests choose their room. The scope is seven room pages, 70 existing articles and 21 airport/Forum/Farabi pages. No new URLs are created.

## Content and publishing

- `data/room-details.json` supplies localized wording in Turkish, English, Arabic, Georgian, Russian, Azerbaijani and Persian. Numeric capacities, fees, floors, television size and operating times are rendered from `data/hotel-facts.json`.
- `build:room-details` runs after the legacy/international builders and before guide generation. It adds a four-category comparison, a family-suite section and practical bed, arrival and breakfast details.
- Suite information states two bedrooms, two bathrooms, four guests or five with an extra bed, a panoramic sea view from one bedroom only, floor five, lift to floor four, a final staircase and a sloping attic ceiling.
- Extra beds cost EUR 10 per day and baby cots EUR 5 per day. These are supplementary charges, never nightly room rates in structured data. Early check-in from 09:00 is free only when a room is available and ready. Breakfast inclusion depends on the rate.
- Bidet wording stays Arabic only. Existing room photographs and the restored homepage/reviews are preserved.
- Seven room-page titles, H1s, descriptions and social metadata now describe rooms and the family suite. HotelRoom structured data matches the visible capacity and access information; no new review markup or room-price offers are added.

## Search intent and links

| Page group | Main purpose | Supporting information |
| --- | --- | --- |
| Homepage | Hotel in Trabzon / Trabzon otel / فندق في طرابزون, localized in each edition | Hotel identity, quiet stay, location, rooms and booking |
| Room types | Compare beds, sea-view categories and the two-bedroom family suite | Capacity, stair access, additional beds, breakfast and arrival |
| Airport | Hotel near Trabzon Airport | Airport-arrival and parking guides |
| Forum | Hotel near Forum Trabzon | Shopping/walking and first-visit guides |
| Farabi | Hotel near KTÜ Farabi Hospital | Practical companion/university stay and family room guides |
| Articles | Specific questions about location choice, costs, family arrangements, parking, sea views, arrival, shopping, a three-day visit, direct booking and work/visits | Contextual links to the relevant hotel page or section |

These are editorial intent assignments, not measured search-volume or ranking claims. Existing homepage titles already express the general hotel intent and are retained.

Each article carries explicit localized `inlineLinks` annotations. The renderer escapes prose and inserts normal HTML anchors around the chosen existing words; it does not rewrite paragraphs or link every keyword. Each article has two or three contextual links. Room and landmark pages link back to selected guides; room policies also link to the relevant practical articles.

Technical references: [Google's link best practices](https://developers.google.com/search/docs/crawling-indexing/links-crawlable) and [HotelRoom vocabulary](https://schema.org/HotelRoom).

The main sitemap remains 142 canonical URLs and the guide sitemap 77 URLs. Existing paths, canonical links and reciprocal hreflang remain stable. This release does not itself constitute a new Search Console/Yandex submission or confirmation of indexing.

## Verification

Run `npm run build`, `npm test` and `git diff --check`. The room validation checks unique section anchors, suite occupancy/access, fees, Arabic-only bidet copy, contextual targets and reverse guide discovery. Before release, compare a second complete build and check that unrelated HTML pages match the previous commit; this guards against the earlier language-generation regression.
