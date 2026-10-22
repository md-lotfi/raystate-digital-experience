# Conversion checks — 22 October 2026

## Verified locally

- Root-level static HTML, CSS and JavaScript replace the React/TanStack/Vite/Nitro stack and package-manager files. No build or runtime backend is required.
- All nine content routes render complete English, French and Arabic pages. Arabic uses RTL and locally hosted Cairo; Manrope and original design styling are retained.
- Original-source SSR desktop and Arabic mobile screenshots were captured before removing the framework, then compared visually with the replacement. This is a source-rendered baseline, not a claim that the original Lovable app was deployed or device-tested.
- All 14 original brand/product image binaries are present and checked against their recorded sizes. SHA-256 verification covers 22 shipped image/font assets. No product screens were fabricated.
- `python3 tools/render_pages.py --check`, `python3 tools/check_static.py`, JavaScript syntax checks and `git diff --check` pass. Static checks cover local links/fragments, translation keys/list counts, legal body completeness, metadata, sitemap, map coordinates, provenance and unchanged `AGENTS.md`.
- Chrome checks passed 36 route/viewport combinations at the root and another 36 under `/raystate-digital-experience/`: all nine pages at 320, 390, 768 and 1440 pixels, with no horizontal overflow, missing images or browser exceptions.
- Interaction checks cover native mobile menu, Escape/focus return, section navigation, native FAQ, language switching preserving section/document, reduced motion, blocked browser storage and all nine pages without JavaScript. The final root run also checks keyboard focus visibility on the skip link.
- Both website QR files were independently decoded using jsQR: SVG and the 1480 × 1840 downloadable PNG resolve to **https://raystate.com/**. No generation/decoder library is a website dependency.
- Deterministic browser checks block Google Maps and confirm that the coordinates and direct directions link remain available. A separate Chrome run allowed Google requests and visually confirmed the real map and location pin at **36.810866, 5.778244**. This verifies the provider embed locally, not its permanent availability.
- The three named product repositories were consulted read-only for product facts, authentic media, legal destinations, fonts and static-site conventions. Djouri's local contact implementation supplied the map/QR method. `AGENTS.md` was preserved byte-for-byte.

Screenshots, original baseline and detailed browser reports are temporary local artifacts under `/tmp/raystate-*` and `/tmp/raystate-conversion/`.

## Publication checks still belong to deployment

The conversion does not push commits, change GitHub Pages settings, DNS or the current production website. After publication, verify custom-domain DNS/HTTPS, all nine public routes, redirects, metadata/share image, external product links, Google Maps/directions and the native QR download. Physical Safari/iOS and printed QR scanning were not tested here; Chrome decoding and responsive checks are recorded above.

Review the prepared legal documents and translations as described in `legal-review.md`. No app, Play Console configuration, subscription terms or provider account settings were changed.
