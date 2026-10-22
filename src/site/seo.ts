import { DICTS, LANG_PATH, LANGS, type Lang } from "./i18n";
import { CONTACT_EMAIL, OG_IMAGE, SITE_ORIGIN, SOCIAL } from "./config";

const OG_LOCALE: Record<Lang, string> = { en: "en_US", fr: "fr_FR", ar: "ar_AR" };

export function pageHead(lang: Lang) {
  const t = DICTS[lang];
  const url = SITE_ORIGIN + LANG_PATH[lang];
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${SITE_ORIGIN}/#org`,
        name: "RayState",
        url: SITE_ORIGIN,
        email: CONTACT_EMAIL,
        slogan: "Innovative Apps. Smarter Everyday.",
        sameAs: [SOCIAL.facebook, SOCIAL.instagram],
      },
      {
        "@type": "WebSite",
        name: "RayState",
        url,
        inLanguage: lang,
        publisher: { "@id": `${SITE_ORIGIN}/#org` },
      },
    ],
  };
  return {
    meta: [
      { title: t.meta.title },
      { name: "description", content: t.meta.description },
      { property: "og:title", content: t.meta.title },
      { property: "og:description", content: t.meta.description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: url },
      { property: "og:locale", content: OG_LOCALE[lang] },
      { property: "og:image", content: OG_IMAGE },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: t.meta.title },
      { name: "twitter:description", content: t.meta.description },
      { name: "twitter:image", content: OG_IMAGE },
    ],
    links: [
      { rel: "canonical", href: url },
      ...LANGS.map((l) => ({ rel: "alternate", hrefLang: l, href: SITE_ORIGIN + LANG_PATH[l] })),
      { rel: "alternate", hrefLang: "x-default", href: SITE_ORIGIN + "/" },
    ],
    scripts: [{ type: "application/ld+json", children: JSON.stringify(jsonLd) }],
  };
}
