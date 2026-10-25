codex resume 01a162f6-b813-74c2-a0ba-557e4bf9815a

# RayState

The English, French and Arabic website for **https://raystate.com/**. GitHub Pages serves these checked-in HTML, CSS, JavaScript and media files directly. There is no React, TanStack, Tailwind compiler, Vite, Nitro, package manager, backend or required build step.

The original Lovable layout, typography, real product screenshots and animations are preserved. Google Maps and a downloadable website QR extend the contact area; website Privacy Policy and Terms of Use pages are available in all three languages.

## Preview

```sh
python3 -m http.server 8080 --bind 127.0.0.1
```

Visit `http://localhost:8080/`, `/fr/` and `/ar/`. Legal routes are `privacy-policy/` and `terms-of-use/`, beneath each language root. All nine pages have complete content without JavaScript. Mobile navigation and FAQ use native HTML disclosures; JavaScript adds scroll effects, menu dismissal and the hero canvas. Reduced motion is respected. No browser storage is required.

## Edit and validate

- `content/translations.json`: all three languages' showcase copy, accessibility labels, and contact/map/QR labels. Keep keys and list counts aligned.
- `content/site.json`: domain, contact/publisher details, document date, map coordinates, product/store links and social links.
- `legal-source/{en,fr,ar}/`: the six legal Markdown sources. Supported syntax: H2 headings, paragraphs, bullet lists, links and bold text. Publisher/email placeholders come from public configuration.
- `tools/templates/`: shared header, homepage, contact additions and footer. These preserve the original design markup. They contain template tokens, not browser code.
- `assets/styles.css` and `assets/script.js`: plain CSS and progressive enhancements. The original utility selectors are ordinary checked-in CSS; edit them directly, with no compiler required.
- `assets/`: original image binaries, local fonts/licenses, icon, and local SVG/PNG website QR.

After editing source content or templates, regenerate the checked-in HTML and hosting files:

```sh
python3 tools/render_pages.py
python3 tools/render_pages.py --check
python3 tools/check_static.py
node --check assets/script.js
```

Python uses only its standard library. Node is optional for syntax/browser checks. Neither is required by hosting. The checker verifies source/output parity, translation completeness, local links and fragments, metadata, coordinates, original asset sizes and asset hashes. For intentional media replacements, update `tools/asset_sources.json` and `tools/asset_checksums.json` after checking provenance and actual file types.

Optional browser checks require Node 22+ and Chrome, with the preview server already running:

```sh
RAYSTATE_PREVIEW_ORIGIN=http://127.0.0.1:8080/ node tools/check_browser.mjs
```

Set `CHROME_PATH` if Chrome is installed elsewhere. The checker launches its own temporary headless profile and closes it afterward. It checks all nine pages at 320, 390, 768 and 1440 pixels, native menus/FAQ, language switching, blocked storage, reduced motion and JavaScript-disabled content. It deliberately blocks Google Maps to test the site independently of the provider; check live map display separately. Reports and screenshots go to `/tmp/raystate-*`. For independent QR verification, optionally set `RAYSTATE_QR_DECODER` to the absolute path of a separately available jsQR-compatible module. No decoder is shipped or loaded by the site.

## Contact, map and legal information

The map uses Djouri's lazy Google Maps iframe method, centered at **36.810866, 5.778244**, zoom 17, with localized labels and a direct directions link. It is not gated behind a click and may connect to Google as the visitor approaches it. The privacy policy describes that behavior. The website itself has no analytics, advertising SDK, contact form or geolocation request; email links open the visitor's mail application.

The QR encodes **https://raystate.com/**. Its SVG is displayed locally; the native download offers a 1480 × 1840 branded PNG. If the public origin changes, regenerate both QR files using a real QR encoder and independently decode them before updating `tools/qr.json` and the asset hashes. The HTML renderer does not silently regenerate QR images.

Read [legal-review.md](legal-review.md) for scope, sources and publisher review notes. The documents concern this website and inquiries. App privacy, purchase and subscription obligations remain in the respective product documents. Do not copy app-specific guarantees into RayState's website policy.

## GitHub Pages

1. Review the changes and commit/push normally to the connected branch. Never force-push or rewrite published Lovable history.
2. In **Settings → Pages**, select **Deploy from a branch**, the publishing branch, and **/ (root)**. No Actions build is required.
3. Set the custom domain to **raystate.com**, matching the checked-in `CNAME`. Configure the apex DNS records with the domain owner and enable HTTPS when available.
4. Verify the nine routes, local media, map, directions, QR download, sitemap and HTTPS on the published site.

Relative assets and internal links also support a project-path preview. Canonical URLs, QR destination, and the self-contained 404 page intentionally target the selected public domain. `tools/render_pages.py` regenerates `CNAME`, `.nojekyll`, robots, sitemap and the 404 along with the pages. See [GitHub publishing-source guidance](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site) and [apex-domain guidance](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site#configuring-an-apex-domain).

## Design and product references

Consult the existing `/var/www/html/staffly-showcase`, `/var/www/html/ubee-shop-showcase` and `/var/www/html/coachin-showcase` websites when updating product facts, legal destinations, screenshots or static-site conventions. They were inspected read-only for this conversion. Only genuine product captures are used. The map and website QR treatment follow `/var/www/html/djouri-showcase-forge/contact/index.html`.

`AGENTS.md` is preserved unchanged as requested. Its former React-specific paths describe the previous architecture; the explicitly requested static conversion replaces those paths with the equivalent centralized content/configuration and complete localized HTML described above. Lovable provenance remains in `.lovable/` and Git history. Review future Lovable framework changes before integrating them into the static site.
