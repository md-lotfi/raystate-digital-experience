# Asset provenance

All 14 RayState brand images, product icons and screenshots are the original Lovable assets, not recreated product screens. Original metadata and chosen local paths are recorded in `tools/asset_sources.json`; SHA-256 hashes of shipped media/fonts are in `tools/asset_checksums.json`.

Twelve matching product binaries were reused read-only from the existing Staffly, UBee and CoachIn static websites. The RayState logo and banner were downloaded from the original project's public Lovable asset URLs. The banner's original metadata called it `.png`, but its content type and verified binary are WebP; it is served locally as `raystate-banner.webp`. The existing favicon is preserved.

Manrope and Cairo WOFF2 files were reused from CoachIn's local assets to preserve the original typography. Their accompanying Open Font License files are under `fonts/`. Inline outline icons were preserved from the original Lucide rendering; its ISC license is included as `lucide-LICENSE.txt`. The original design's utility CSS is compiled, ordinary native CSS, with upstream license comments preserved; no Tailwind compiler or JavaScript library is required by the site.

The website QR was generated once with qrcode 1.5.4 (MIT) and composed into a branded PNG with Pillow. Neither generation library is included in the site. Both SVG and PNG are independently decoded during conversion checks using jsQR 1.4.0, which is also a temporary verification tool, not a shipped dependency. The QR encodes `https://raystate.com/`, with high error correction and a four-module quiet zone. The downloadable PNG is 1480 × 1840.

RayState/product marks, screenshots and third-party brands remain subject to their respective owners' rights. Retain real captures and verify provenance, dimensions, file types, QR decoding and hashes when intentionally changing assets.
