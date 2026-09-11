# Pelit Park Hotel SEO handover — 2026-09-11

This handover reconciles the 18 actions in the supplied workbook with the repository, live-account actions and remaining external dependencies. Deployment and URL submissions are milestones, not proof that the SEO programme is complete or that a URL is indexed.

## 18-task reconciliation

| # | Priority | Task | Status | Implementation evidence | Remaining |
|---|---|---|---|---|---|
| 1 | P0 | Factual service/room/breakfast terms | Completed | `data/hotel-facts.json`; generated service/location pages; Twin view and hotel-operated transfer claims removed; breakfast tied to selected rate. | Keep the facts file current when operations change. |
| 2 | P0 | Mobile and booking, 320–430 px | Completed | `styles.css`, `main.js`; live desktop/mobile screenshots for TR/EN/AR/KA; room-card and open-menu checks. | Re-test after future header changes. |
| 3 | P1 | Language redirect | Completed | `assets/js/lang-redirect.js` uses an optional dismissible suggestion; no forced redirect. | None now. |
| 4 | P1 | Arabic HTML links | Completed | Booking, room and priority location links are directly present in Arabic HTML. | None now. |
| 5 | P1 | Room categories | Partially completed | Four room-comparison pages; bed/view and breakfast wording normalized; verified image crop. | Maximum occupancy, detailed policies and some exact view/balcony allocations await hotel confirmation. |
| 6 | P1 | TR/EN/AR/KA homepages | Completed | `/`, `/en/`, `/ar/`, `/ka/` target general Trabzon-hotel intent and link to the location and room groups. | Measure after post-launch data accumulates. |
| 7 | P1 | Landmark pages | Completed | Airport, Forum Trabzon and KTÜ Farabi groups published in four languages. | Monitor impressions, queries and conversions. |
| 8 | P1 | Georgian depth | Partially completed | `/ka/` plus Forum, Farabi, airport, Batumi and room-comparison pages. | Native Georgian editorial review and confirmation of any changing operational details. |
| 9 | P1 | Overlapping Arabic content | Completed | Google Ads, summer offer and WhatsApp-discount pages are `noindex,follow`; family and sea-view pages retain distinct roles; unsupported special-price wording removed. | Merge or redirect further only if performance proves continued cannibalisation. |
| 10 | P1 | Performance and images | Partially completed | Room cards use 1600:1160 aspect ratio, `object-fit: cover`, intrinsic dimensions and responsive loading; unused `header2` is not on the active loading path. | No supplied before/after Lighthouse or field CWV baseline; monitor Core Web Vitals after release. |
| 11 | P1 | Reviews | Partially completed / intentionally preserved | A later `main` update explicitly restored Booking 9/10 and selected reviews in TR/EN/AR; this handover preserved that newer repository decision. | Recheck the live Booking score and each quotation, record the snapshot date and reuse permission, then update or replace stale values. |
| 12 | P1 | Measurement | Partially completed | Shared `assets/js/booking-events.js` now records language/path and avoids duplicate events; 45 pages normalized. | Events are outbound clicks only. Confirmed bookings require a booking-provider callback/postback or provider analytics access. |
| 13 | P1 | Maps / NAP | Partially blocked | Google and Booking show No:77; website shows No:77/1; no speculative correction made. | Obtain the hotel’s current government/municipal/UAVT address record, then update every citation and add current entrance/parking photos. |
| 14 | P1 | Google Hotels | Provider-blocked | The hotel and partner rates are visible in Google Hotels, but the current account alone does not establish who owns the Hotel Center/feed connection. | Ask ElektraWeb/Rezervasyonal for Property ID, feed status, Free Booking Links status and access/activation requirements. |
| 15 | P1 | Indexing | Partially completed | `robots.txt`, sitemap, canonical and hreflang are valid; Yandex 10 queued + 2 processed; Google 11 requests accepted, while the remaining Georgian Farabi URL was already indexed at inspection and was not resubmitted. | Submission/processing is not indexing. Monitor coverage and do not resubmit accepted or already indexed URLs. |
| 16 | P2 | Articles | Partially completed | Twelve localized location/arrival pages and the Georgian Batumi guide are published. | Broader “where to stay” and other long-form articles are editorially deferred until original local evidence, appropriate language review and post-launch demand data exist. |
| 17 | P2 | Local links | Intentionally deferred | No invented or paid-looking partnership links were created. | Requires genuine, documented external partnerships and appropriate local directories. |
| 18 | P2 | Optimisation cycle | Partially completed | GSC baseline exported through 2026-09-08: 979 query rows, 27 page rows and 113 countries. | Run 30/60/90-day reviews after new pages have data and after confirmed-booking measurement is connected. |

## Published content

### Airport

- Turkish: https://pelitparkhotel.com/trabzon-havalimanina-yakin-otel/
- English: https://pelitparkhotel.com/en/hotel-near-trabzon-airport/
- Arabic: https://pelitparkhotel.com/ar/hotel-near-trabzon-airport/
- Georgian: https://pelitparkhotel.com/ka/hotel-near-trabzon-airport/

### Forum Trabzon

- Turkish: https://pelitparkhotel.com/forum-trabzon-yakin-otel/
- English: https://pelitparkhotel.com/en/hotel-near-forum-trabzon/
- Arabic: https://pelitparkhotel.com/ar/hotel-near-forum-trabzon/
- Georgian: https://pelitparkhotel.com/ka/hotel-near-forum-trabzon/

### KTÜ Farabi Hospital

- Turkish: https://pelitparkhotel.com/farabi-hastanesi-yakin-otel/
- English: https://pelitparkhotel.com/en/hotel-near-farabi-hospital/
- Arabic: https://pelitparkhotel.com/ar/hotel-near-farabi-hospital/
- Georgian: https://pelitparkhotel.com/ka/hotel-near-farabi-hospital/

### Georgian travel guide

- Georgian: https://pelitparkhotel.com/ka/batumi-trabzon/

No separate blog section was invented. These are practical location/arrival content pages within the existing site architecture.

## Existing-page improvements

- Homepages: strengthened general Trabzon intent and internal links on TR/EN/AR/KA.
- Room pages: four-language comparison, neutral Twin/Standard view wording, rate-dependent breakfast and corrected image proportions.
- Service pages: airport transport, flexible booking and concierge pages in TR/EN/AR rewritten to avoid unsupported transfer, rate or service guarantees.
- Review pages: the later `main` update restored Booking 9/10 and selected guest reviews with links to Booking.com; those values were preserved and remain a documented verification task rather than being silently overwritten.
- Arabic campaigns: three overlapping promotion pages noindexed; family and sea-view pages retained as distinct indexable intents, with unsupported price promises removed.

## URL submission record

| Group | Language | Google | Yandex |
|---|---|---|---|
| Airport | Turkish | Accepted 2026-09-11; not indexed at inspection time | In queue, 2026-09-10 12:33 |
| Airport | English | Accepted, prior confirmed | In queue, 2026-09-10 12:33 |
| Airport | Arabic | Accepted, prior confirmed | In queue, 2026-09-10 12:33 |
| Airport | Georgian | Accepted, prior confirmed | In queue, 2026-09-10 12:33 |
| Forum | Turkish | Accepted, prior confirmed | In queue, 2026-09-10 12:33 |
| Forum | English | Accepted 2026-09-11; not indexed at inspection time | In queue, 2026-09-10 12:33 |
| Forum | Arabic | Accepted 2026-09-11; not indexed at inspection time | In queue, 2026-09-10 12:33 |
| Forum | Georgian | Accepted, prior confirmed | Request processed, 2026-09-09 12:49 |
| Farabi | Turkish | Accepted 2026-09-11; not indexed at inspection time | In queue, 2026-09-10 12:33 |
| Farabi | English | Accepted 2026-09-11; not indexed at inspection time | In queue, 2026-09-10 12:33 |
| Farabi | Arabic | Accepted 2026-09-11; not indexed at inspection time | In queue, 2026-09-10 12:33 |
| Farabi | Georgian | Indexed at inspection 2026-09-11; not resubmitted | Request processed, 2026-09-09 12:49 |

Accepted Google requests and processed Yandex requests are not confirmed indexing. Google showed the Georgian Farabi URL as indexed, with HTTPS and one valid breadcrumb item; that indexed state is distinct from the other 11 accepted requests. The Yandex property was verified; after the submissions, the displayed daily recrawl allowance had 140 remaining. The sitemap was also shown in processing.

## Search Console baseline

- Verified property: `sc-domain:pelitparkhotel.com`
- Available range: 2025-12-21 to 2026-09-08
- Clicks: 705
- Impressions: 37,923
- CTR: 1.9%
- Average position: 6.8
- Exported: 979 query rows, 27 page rows and 113 country rows
- Top countries included Türkiye (514 clicks / 29,210 impressions), Egypt (66 / 814), Azerbaijan (19 / 255), Germany (18 / 1,572), Saudi Arabia (11 / 1,209) and Georgia (11 / 199).
- Georgian page-path data is unavailable/insufficient in this range because the Georgian expansion was released after the report end date. Georgia-country traffic is not equivalent to Georgian-language page traffic.
- Query rows total fewer clicks/impressions than the property KPI because anonymized/low-volume queries are not shown.

## Click tracking versus bookings

The shared tracking code records:

- `booking_click`
- `whatsapp_click`
- `directions_click`
- `page_language`, `page_path`, destination host/path
- `conversion_stage: outbound_click`
- `booking_confirmed: false`

This verifies measurement of outbound intent, not completed bookings. A confirmed-booking metric must come from Rezervasyonal/ElektraWeb via a success-page event, server postback/API or provider reporting access. The existing Google Ads WhatsApp conversion label is therefore still a WhatsApp outbound click, not a reservation.

## No:77 versus No:77/1

- Website/footer/structured data: `No:77/1`.
- Google Hotels/Business Profile and Booking.com: `No:77` (postal codes also differ across secondary sources).
- Authoritative source required: the current hotel operating licence, official municipal/UAVT address registration or another current government-issued address record controlled by the hotel.
- No correction is proposed until that record is supplied. Once confirmed, update the website, structured data, GBP, booking engine and OTAs together.

## Provider message (Turkish)

Merhaba, Pelit Park Hotel (pelitparkhotel.com) için Rezervasyonal/ElektraWeb tarafında mevcut aktif bir Google Hotel Center bağlantısı ve Ücretsiz Rezervasyon Bağlantıları (Free Booking Links) entegrasyonu bulunuyor mu? Varsa bağlı Hotel Center hesabı veya Property ID’yi, fiyat/müsaitlik feed’inin son başarılı güncelleme durumunu ve erişim/yetki sürecini paylaşabilir misiniz? Bağlantı yoksa canlı fiyat ve müsaitliğin Google Hotels’e gönderilmesi için gerekli aktivasyon adımları, ücret/şartlar, teknik gereksinimler ve bizden istenen bilgiler nelerdir? Ayrıca doğrudan rezervasyon URL’sinin https://pelit-park.rezervasyonal.com/ olarak tanımlandığını teyit eder misiniz? Teşekkürler.

