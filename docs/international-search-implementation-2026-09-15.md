# International search and booking implementation

This release strengthens the English, Georgian, Russian, Azerbaijani and Persian hotel pages, and adds one complete German landing page at `/de/`.

- Homepage search copy and room/rate links are maintained in `data/home-booking.json`. Existing translated homepage content is preserved.
- Forum pages now explain the approximate two-minute drive, fifteen-minute walk and uphill return, with reception taxi assistance. Russian, Azerbaijani and Persian copy is owned by their locale packs; English and Georgian copy is owned by the location generator.
- The Georgian Batumi–Sarpi–Trabzon page now connects arrival, parking, shopping and room selection without inventing border waiting times, transport schedules or fares.
- `tools/build-german-landing.js` owns the German page. It describes all four room options, breakfast/rate conditions, arrival, parking and direct booking. Links to detailed English content are labelled as English. It makes no German-speaking-staff or star-rating promise.
- The seven full language editions retain their existing guide groups. German is a standalone landing language: it appears in all navigation menus and only the equivalent homepage hreflang group. No nonexistent German guides or subpages are advertised.
- Shared language preference and outbound-click attribution support German. Outbound clicks remain distinct from confirmed reservations.
- No Google Maps profile, paid campaign, booking policy or price was changed.

Validation: full build and existing test suite, including local links/images, canonical and reciprocal hreflang, all seven guide collections, room facts, dropdown interaction and tracking attribution. A repeated build produced identical HTML. Search account performance figures are intentionally excluded from this public repository.

Google's live test found the Persian homepage eligible for indexing on 15 September 2026. Its indexing request was accepted into the priority crawl queue; this is not confirmation of completed indexing.
