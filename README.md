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

## Publishing

GitHub Pages publishes the custom domain from the repository's configured
production branch. Validate first, then merge or push the reviewed changes to
that branch.

