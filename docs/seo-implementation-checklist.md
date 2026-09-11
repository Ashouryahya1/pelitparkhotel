# Multilingual SEO implementation checklist

Source baseline: the September 9, 2026 workbook and Arabic audit supplied by the hotel. Priorities in those files are qualitative; they do not contain search volume, keyword difficulty, rank, Lighthouse, or field Core Web Vitals data.

## P0 — factual and release safety

- [x] Remove unverified airport-transfer availability from visible copy and structured data.
- [x] Describe Twin-room view and balcony as subject to the selected room; never promise a sea view.
- [x] State that breakfast inclusion depends on the selected rate.
- [x] Remove unsupported booking-count, price, discount, distance and room/service claims from the new location and Georgian work.
- [ ] Reconcile the later repository decision that restored Booking 9/10 and selected guest reviews with a dated live-source check and reuse permission.
- [x] Keep live availability and price behind the existing booking engine or WhatsApp.
- [x] Run the localization generator and confirm that English and Arabic content is unchanged.
- [x] Keep manual location pages outside the legacy Turkish-to-language generator.

Acceptance: every published claim is supported by the maintained hotel facts or is explicitly presented as something to confirm before booking; generation produces no language regression.

## P1 — technical SEO and booking usability

- [x] Replace automatic language redirection with an optional, dismissible suggestion.
- [x] Keep all four language links in the server-rendered HTML.
- [x] Link language equivalents only where a real translated equivalent exists.
- [x] Add reciprocal hreflang groups for home, room types, airport, Forum Trabzon, and Farabi Hospital pages.
- [x] Add unique title, description, canonical, social metadata, one H1, visible breadcrumb, and BreadcrumbList to every location page.
- [x] Keep Hotel structured data consistent with the visible facts and stable `@id`.
- [x] Keep primary booking and WhatsApp actions visible on mobile.
- [x] Verify the header, RTL/LTR menu, overflow, and tap targets at 320, 360, 390, and 430 CSS pixels.
- [x] Verify room-image proportions against the English reference on desktop and mobile.
- [x] Put priority internal links in HTML rather than injecting them with JavaScript.

Acceptance: local-link/image/schema/hreflang/sitemap tests pass; browser checks show no horizontal overflow, controls overlap, or distorted room images; booking and WhatsApp destinations open correctly.

## P1 — content and page groups

- [x] Strengthen the four language homepages around a general Trabzon hotel intent.
- [x] Strengthen the four room-type pages with neutral view wording and rate-dependent breakfast wording.
- [x] Publish the airport page group in Turkish, English, Arabic, and Georgian.
- [x] Publish the Forum Trabzon page group in Turkish, English, Arabic, and Georgian.
- [x] Publish the Farabi Hospital page group in Turkish, English, Arabic, and Georgian.
- [x] Deepen the existing Georgian Forum, Farabi, Batumi, and room pages rather than duplicating them.
- [ ] Record Georgian copy for native-language review after launch.

Acceptance: each page answers a distinct visitor need, uses localized language, provides live routes or official changing-information sources where relevant, and links to rooms and booking.

## P2 — editorial and off-site work

- [ ] Publish an original “where to stay in Trabzon” guide, English and Arabic first, then Turkish.
- [ ] Publish or deepen Batumi–Trabzon, airport-arrival, Forum-shopping, and room-choice guides in the workbook’s language order.
- [x] Review overlapping Arabic family, summer, WhatsApp, and sea-view landing pages; merge or noindex where intent is not distinct.
- [ ] Verify review-source permissions and dates for the numeric summary and selected reviews restored by the later main-branch update.
- [ ] Review Google Business Profile NAP, category, entrance/parking photography, and review workflow.
- [ ] Confirm Google Hotels/free booking links with the booking-engine provider.
- [x] Export the pre-launch Search Console baseline by query, page, country and language path.
- [x] Submit the 12 airport/Forum/Farabi URLs to Yandex recrawl without treating submission as indexing.
- [ ] Continue Google URL requests only after status inspection and without re-submitting accepted requests.
- [ ] Monitor Search Console and Yandex by page group, country, language, query, and booking-intent event.

Current record and evidence: `docs/seo-handover-2026-09-11.md` and `outputs/seo-handover-2026-09-11/Pelit_Park_SEO_Baseline_and_Handover_2026-09-11.xlsx`.

Acceptance: editorial pages contain original practical evidence, sources and update dates; off-site claims distinguish configuration from actual live status.
