# RayState website legal review — 22 October 2026

## Identity and scope

The owner confirmed the identity already used by the three reference sites: **Laissaoui Mohammed Lotfi, Algeria, contact@raystate.com**. Privacy Policy and Terms of Use are prepared in English, French and Modern Standard Arabic. Their date is a **document date**, not a retroactive claim of adoption by existing customers.

These documents cover the RayState studio website and voluntarily sent inquiries. Each product has its own separate privacy and terms documents, linked directly using its actual route structure: UBee uses `/legal/{language}/`; Staffly and CoachIn use language-prefixed routes. No subscription agreement, app SDK behavior, cloud account, app-record access or payment processing is introduced by this conversion.

## Implementation evidence

- The original `src/site/Site.tsx`, `config.ts`, `i18n.ts` and stylesheet supplied the website design, content and links before the framework was removed. The replacement serves complete HTML with local scripts, images, icons and fonts.
- There is no site analytics SDK, advertising script, registration, hosted contact form, cookie-setting code, browser-storage use or device-geolocation request. Email uses `mailto:`; information is transmitted when the visitor sends their message through their email provider.
- Google Maps is the deliberate third-party embed. Its native lazy iframe loads automatically when the browser considers it near the viewport. It can connect before the map is visible; this is not a consent gate or guarantee of zero third-party requests. The policy distinguishes publisher code from Google's possible cookies/identifiers and information processing.
- The map uses the requested **36.810866, 5.778244**. No postal address, opening hours, office-access promise or guaranteed appointment availability was inferred from those coordinates.
- The map method and prominent downloadable QR treatment were inspected in Djouri's local contact page. Its live URL was inaccessible through the browsing tool during planning.
- The website QR and download are local images pointing directly to `https://raystate.com/`; there is no online QR API or publisher QR tracking service.
- GitHub Pages is the intended host. Its processing must not be described as the publisher collecting no information anywhere. Email provider identities and account-specific retention/security settings were not supplied or audited; the policy uses functional provider categories rather than inventing them.

## Primary references checked during preparation

- [GitHub General Privacy Statement](https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement): host-side connection information, provider purposes and rights. The retrieved statement lists an effective date of 27 April 2026.
- [Google Privacy Policy](https://policies.google.com/privacy): Google services, embedded Maps, connection/device information, identifiers, user controls and provider practices. The retrieved version lists an effective date of 16 October 2026.
- [GitHub Pages publishing-source instructions](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site): branch/root publication for checked-in static files.

The Staffly, UBee and CoachIn reference repositories were read-only sources for the publisher identity, product facts, legal routes and static-site patterns. Their app-specific legal clauses were not copied as website behavior. No claim of legal certification or universal compliance is made.

## Publisher review and maintenance

Review/adopt the documents before publication and verify French/Arabic meaning, applicable notice requirements, actual email arrangements and provider settings. The terms preserve mandatory rights and avoid an invented exclusive court, arbitrary minimum age, fixed retention period, blanket refund exclusion or automatic project contract by email. Reassess the disclosures if forms, analytics, payments, trackers, hosting or external embeds change.

Edit the relevant Markdown and translations, then run `python3 tools/render_pages.py` and `python3 tools/check_static.py`. This website change does not alter app behavior, Play Console disclosures, product policies, DNS or GitHub account settings.
