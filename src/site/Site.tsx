import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, ArrowUpRight, Check, Mail, Menu, Plus, X, Facebook, Instagram } from "lucide-react";
import { NetworkCanvas } from "./NetworkCanvas";
import { BRAND, CONTACT_EMAIL, PRODUCTS, SECTIONS, SOCIAL, type SectionId } from "./config";
import { DICTS, LANG_LABEL, LANG_PATH, LANGS, type Dict, type Lang } from "./i18n";

const Arrow = ({ className = "" }: { className?: string }) => (
  <ArrowRight aria-hidden className={`size-4 shrink-0 rtl:-scale-x-100 ${className}`} />
);
const Ltr = ({ children }: { children: React.ReactNode }) => (
  <bdi dir="ltr" className="inline-block">
    {children}
  </bdi>
);

function mailto(t: Dict) {
  return `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(t.contact.subject)}`;
}

function useActiveSection() {
  const [active, setActive] = useState<SectionId | "">("");
  useEffect(() => {
    const els = SECTIONS.map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id as SectionId);
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
  return active;
}

function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>(".reveal");
    if (!("IntersectionObserver" in window)) return;
    document.documentElement.classList.add("motion-ready");
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries)
          if (e.isIntersecting) {
            e.target.classList.add("is-visible");
            io.unobserve(e.target);
          }
      },
      { rootMargin: "0px 0px -8% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

function LangSwitch({ lang, t, active, className = "" }: { lang: Lang; t: Dict; active: string; className?: string }) {
  return (
    <nav aria-label={t.a11y.language} className={`flex items-center gap-1 text-sm ${className}`}>
      {LANGS.map((l, i) => (
        <span key={l} className="flex items-center gap-1">
          {i > 0 && <span aria-hidden className="text-border">|</span>}
          <Link
            to={LANG_PATH[l]}
            hash={active || undefined}
            hrefLang={l}
            lang={l}
            aria-current={l === lang ? "true" : undefined}
            className={`rounded-md px-2 py-2 font-semibold transition-colors ${
              l === lang ? "text-accent-cyan" : "text-muted-foreground hover:text-foreground"
            } ${l === "ar" ? "font-arabic" : ""}`}
          >
            {LANG_LABEL[l]}
          </Link>
        </span>
      ))}
    </nav>
  );
}

function Header({ lang, t, active }: { lang: Lang; t: Dict; active: string }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 12);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  useEffect(() => {
    if (!open) return;
    const k = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [open]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        scrolled || open ? "border-b border-border bg-background/85 backdrop-blur-md" : "border-b border-transparent"
      }`}
    >
      <div className="container-x flex h-16 items-center justify-between gap-4 lg:h-20">
        <a href="#top" className="flex items-center gap-3" aria-label={t.a11y.home}>
          <img src={BRAND.mark} alt="" width={40} height={40} className="size-10 rounded-lg ring-1 ring-border" />
          <span dir="ltr" className="text-lg font-semibold tracking-[0.08em] text-foreground">RayState</span>
        </a>
        <nav aria-label={t.a11y.mainNav} className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {SECTIONS.map((id) => (
              <li key={id}>
                <a
                  href={`#${id}`}
                  aria-current={active === id ? "location" : undefined}
                  className={`nav-link ${active === id ? "is-active" : ""}`}
                >
                  {t.nav[id]}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="hidden items-center gap-3 lg:flex">
          <LangSwitch lang={lang} t={t} active={active} />
          <a href={mailto(t)} className="btn btn-primary">
            {t.nav.cta}
          </a>
        </div>
        <button
          type="button"
          className="grid size-11 place-items-center rounded-lg border border-border text-foreground lg:hidden"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? t.a11y.menuClose : t.a11y.menuOpen}
          onClick={() => setOpen((o) => !o)}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>
      {open && (
        <div id="mobile-menu" className="container-x border-t border-border pb-6 lg:hidden">
          <ul className="flex flex-col py-3">
            {SECTIONS.map((id) => (
              <li key={id}>
                <a
                  href={`#${id}`}
                  onClick={() => setOpen(false)}
                  className="block border-b border-border/60 py-4 text-lg font-medium text-foreground"
                >
                  {t.nav[id]}
                </a>
              </li>
            ))}
          </ul>
          <LangSwitch lang={lang} t={t} active={active} className="-ms-2 mb-4" />
          <a href={mailto(t)} className="btn btn-primary w-full">
            {t.nav.cta}
          </a>
        </div>
      )}
    </header>
  );
}

function Hero({ t }: { t: Dict }) {
  return (
    <section id="top" className="relative isolate flex min-h-[100svh] items-center overflow-hidden pt-24">
      <div aria-hidden className="hero-glow absolute inset-0 -z-10" />
      <div className="absolute inset-0 -z-10 opacity-90">
        <NetworkCanvas />
      </div>
      <div aria-hidden className="absolute inset-x-0 bottom-0 -z-10 h-40 bg-gradient-to-b from-transparent to-background" />
      <div className="container-x grid w-full items-center gap-14 py-16 lg:grid-cols-[1.25fr_1fr]">
        <div>
          <p className="eyebrow hero-in" style={{ animationDelay: "0ms" }}>{t.hero.eyebrow}</p>
          <h1 className="mt-6 text-balance text-[clamp(2.6rem,7vw,5.4rem)] font-semibold leading-[1.02] tracking-tight text-foreground">
            <span className="hero-in block" style={{ animationDelay: "80ms" }}>{t.hero.title1}</span>
            <span className="hero-in text-gradient block" style={{ animationDelay: "180ms" }}>{t.hero.title2}</span>
          </h1>
          <p className="hero-in mt-7 max-w-xl text-lg leading-relaxed text-muted-foreground" style={{ animationDelay: "280ms" }}>
            {t.hero.lead}
          </p>
          <div className="hero-in mt-10 flex flex-wrap gap-3" style={{ animationDelay: "380ms" }}>
            <a href="#products" className="btn btn-primary btn-lg">
              {t.hero.primary} <Arrow />
            </a>
            <a href={mailto(t)} className="btn btn-outline btn-lg">
              {t.hero.secondary} <Mail aria-hidden className="size-4" />
            </a>
          </div>
        </div>
        <HeroOrbit t={t} />
      </div>
    </section>
  );
}

function HeroOrbit({ t }: { t: Dict }) {
  const pos = ["top-[6%] start-[14%]", "top-[38%] end-[2%]", "bottom-[4%] start-[22%]"];
  return (
    <div className="hero-in relative mx-auto aspect-square w-full max-w-[440px]" style={{ animationDelay: "250ms" }}>
      <div aria-hidden className="absolute inset-[12%] rounded-full border border-accent-cyan/15" />
      <div aria-hidden className="absolute inset-[28%] rounded-full border border-accent-cyan/10" />
      <svg aria-hidden viewBox="0 0 100 100" className="absolute inset-0 h-full w-full">
        <g stroke="var(--accent-cyan)" strokeOpacity="0.35" strokeWidth="0.25" fill="none">
          <line x1="50" y1="50" x2="24" y2="16" />
          <line x1="50" y1="50" x2="88" y2="48" />
          <line x1="50" y1="50" x2="32" y2="86" />
        </g>
      </svg>
      <div className="absolute inset-[34%] overflow-hidden rounded-[22%] shadow-glow ring-1 ring-accent-cyan/30">
        <img src={BRAND.mark} alt="RayState" width={512} height={512} className="h-full w-full object-cover" />
      </div>
      {PRODUCTS.map((p, i) => (
        <a
          key={p.id}
          href={`#${p.id}`}
          className={`float-${i} group absolute ${pos[i]} flex flex-col items-center gap-2`}
        >
          <img
            src={p.icon}
            alt={t.a11y.iconAlt(p.name)}
            width={88}
            height={88}
            className="size-16 rounded-2xl shadow-lg ring-1 ring-border transition-transform duration-300 group-hover:-translate-y-1 sm:size-20"
          />
          <span dir="ltr" className="rounded-full border border-border bg-surface/80 px-3 py-1 text-xs font-semibold text-foreground">
            {p.name}
          </span>
        </a>
      ))}
      <p className="absolute -bottom-6 inset-x-0 text-center text-xs uppercase tracking-[0.2em] text-muted-foreground">
        {t.hero.portfolio} · <Ltr>UBee · CoachIn · Staffly</Ltr>
      </p>
    </div>
  );
}

function SectionHead({ eyebrow, title, lead, center }: { eyebrow: string; title: string; lead?: string; center?: boolean }) {
  return (
    <div className={`reveal max-w-3xl ${center ? "mx-auto text-center" : ""}`}>
      <p className="eyebrow">{eyebrow}</p>
      <h2 className="mt-4 text-balance text-[clamp(2rem,4.4vw,3.4rem)] font-semibold leading-[1.08] tracking-tight text-foreground">
        {title}
      </h2>
      {lead && <p className="mt-5 text-lg leading-relaxed text-muted-foreground">{lead}</p>}
    </div>
  );
}

function Products({ t }: { t: Dict }) {
  return (
    <section id="products" className="section">
      <div className="container-x">
        <SectionHead eyebrow={t.products.eyebrow} title={t.products.title} lead={t.products.lead} />
        <div className="mt-20 flex flex-col gap-28 lg:gap-36">
          {PRODUCTS.map((p, i) => {
            const c = t.products.items[p.id];
            const flip = i % 2 === 1;
            return (
              <article
                id={p.id}
                key={p.id}
                className="product scroll-mt-28 grid items-center gap-12 lg:grid-cols-2 lg:gap-20"
                style={{ "--product": p.accent } as React.CSSProperties}
                aria-labelledby={`${p.id}-title`}
              >
                <div className={`reveal ${flip ? "lg:order-2" : ""}`}>
                  <div className="flex items-center gap-4">
                    <img src={p.icon} alt={t.a11y.iconAlt(p.name)} width={64} height={64} loading="lazy" className="size-16 rounded-2xl ring-1 ring-border" />
                    <div>
                      <h3 id={`${p.id}-title`} dir="ltr" className="text-3xl font-semibold text-foreground sm:text-4xl rtl:text-end">
                        {p.name}
                      </h3>
                      <p className="mt-1 text-sm font-medium text-product">{c.category}</p>
                    </div>
                  </div>
                  <p className="mt-8 text-2xl font-medium leading-snug text-foreground">{c.description}</p>
                  <p className="mt-4 text-sm text-muted-foreground">
                    <span className="font-semibold text-foreground">{t.products.audienceLabel}:</span> {c.audience}
                  </p>
                  <ul className="mt-8 grid gap-3">
                    {c.capabilities.map((cap) => (
                      <li key={cap} className="flex gap-3 text-foreground/90">
                        <Check aria-hidden className="mt-1 size-4 shrink-0 text-product" />
                        <span>{cap}</span>
                      </li>
                    ))}
                  </ul>
                  {c.note && <p className="mt-6 border-s-2 border-product/60 ps-4 text-sm text-muted-foreground">{c.note}</p>}
                  <div className="mt-9 flex flex-wrap gap-3">
                    <a href={p.site} target="_blank" rel="noopener" className="btn btn-primary">
                      {t.products.explore(p.name)} <ArrowUpRight aria-hidden className="size-4 rtl:-scale-x-100" />
                      <span className="sr-only">{t.a11y.newTab}</span>
                    </a>
                    <a href={p.play} target="_blank" rel="noopener" className="btn btn-outline">
                      <PlayGlyph /> {t.products.play}
                      <span className="sr-only">{t.a11y.newTab}</span>
                    </a>
                  </div>
                </div>
                <Screens p={p} alts={c.shotAlts} flip={flip} />
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function Screens({ p, alts, flip }: { p: (typeof PRODUCTS)[number]; alts: string[]; flip: boolean }) {
  return (
    <div className={`reveal relative ${flip ? "lg:order-1" : ""}`} dir="ltr">
      <div aria-hidden className="product-halo absolute inset-[8%] -z-10 rounded-full blur-3xl" />
      <div className="grid grid-cols-3 items-center gap-3 sm:gap-5">
        {p.shots.map((s, i) => (
          <figure
            key={s.src}
            className={`phone overflow-hidden rounded-[1.4rem] border border-border bg-surface shadow-2xl ${
              i === 1 ? "z-10 scale-105 sm:-translate-y-6" : "opacity-90"
            }`}
          >
            <img src={s.src} alt={alts[i]} width={s.w} height={s.h} loading="lazy" decoding="async" className="h-auto w-full" />
          </figure>
        ))}
      </div>
    </div>
  );
}

const PlayGlyph = () => (
  <svg aria-hidden viewBox="0 0 24 24" className="size-4 shrink-0">
    <path fill="currentColor" d="M4 2.8v18.4c0 .5.5.8.9.6l15.8-9.2a.7.7 0 0 0 0-1.2L4.9 2.2C4.5 2 4 2.3 4 2.8Z" />
  </svg>
);

function Services({ t }: { t: Dict }) {
  return (
    <section id="services" className="section relative bg-band">
      <div className="container-x">
        <SectionHead eyebrow={t.services.eyebrow} title={t.services.title} lead={t.services.lead} />
        <div className="mt-16 grid gap-px overflow-hidden rounded-2xl border border-border bg-border lg:grid-cols-3">
          {t.services.items.map((s, i) => (
            <div key={s.title} className="reveal service flex flex-col bg-surface-2 p-8 sm:p-10" style={{ transitionDelay: `${i * 80}ms` }}>
              <span className="font-mono text-sm text-accent-cyan">0{i + 1}</span>
              <h3 className="mt-6 text-2xl font-semibold text-foreground">{s.title}</h3>
              <p className="mt-4 leading-relaxed text-muted-foreground">{s.body}</p>
              <p className="mt-8 text-xs font-semibold uppercase tracking-[0.16em] text-foreground/70">{t.services.deliverables}</p>
              <ul className="mt-3 grid gap-2">
                {s.examples.map((e) => (
                  <li key={e} className="flex items-center gap-2 text-sm text-foreground/90">
                    <span aria-hidden className="size-1.5 rounded-full bg-accent-cyan" />
                    {e}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="reveal mt-10 flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <p className="text-sm text-muted-foreground">{t.services.note}</p>
          <a href={mailto(t)} className="btn btn-primary btn-lg">
            {t.services.cta} <Arrow />
          </a>
        </div>
      </div>
    </section>
  );
}

function Approach({ t }: { t: Dict }) {
  return (
    <section id="approach" className="section">
      <div className="container-x">
        <SectionHead eyebrow={t.approach.eyebrow} title={t.approach.title} />
        <ol className="relative mt-16 grid gap-10 md:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          <div aria-hidden className="absolute inset-x-0 top-5 hidden h-px bg-gradient-to-r from-accent-cyan/50 via-accent-blue/30 to-transparent rtl:bg-gradient-to-l lg:block" />
          {t.approach.steps.map((s, i) => (
            <li key={s.title} className="reveal relative" style={{ transitionDelay: `${i * 90}ms` }}>
              <span className="relative grid size-10 place-items-center rounded-full border border-accent-cyan/50 bg-background font-mono text-sm text-accent-cyan">
                {i + 1}
              </span>
              <h3 className="mt-6 text-xl font-semibold text-foreground">{s.title}</h3>
              <p className="mt-3 leading-relaxed text-muted-foreground">{s.body}</p>
            </li>
          ))}
        </ol>
        <p className="reveal mt-12 text-sm text-muted-foreground">{t.approach.note}</p>
      </div>
    </section>
  );
}

function About({ t }: { t: Dict }) {
  return (
    <section id="about" className="section bg-band">
      <div className="container-x grid items-center gap-14 lg:grid-cols-2">
        <div>
          <SectionHead eyebrow={t.about.eyebrow} title={t.about.title} />
          {t.about.body.map((b) => (
            <p key={b} className="reveal mt-6 text-lg leading-relaxed text-muted-foreground">{b}</p>
          ))}
          <ul className="reveal mt-8 grid gap-3 sm:grid-cols-2">
            {t.about.points.map((pt) => (
              <li key={pt} className="flex items-center gap-3 rounded-xl border border-border px-4 py-3 text-sm text-foreground">
                <Check aria-hidden className="size-4 text-accent-cyan" /> {pt}
              </li>
            ))}
          </ul>
        </div>
        <figure className="reveal">
          <div className="overflow-hidden rounded-2xl border border-border shadow-2xl" dir="ltr">
            <img src={BRAND.banner} alt={t.about.bannerAlt} width={1920} height={1080} loading="lazy" className="h-auto w-full" />
          </div>
          <figcaption className="mt-5 text-xl font-medium text-foreground">“{t.about.tagline}”</figcaption>
        </figure>
      </div>
    </section>
  );
}

function Faq({ t }: { t: Dict }) {
  return (
    <section id="faq" className="section">
      <div className="container-x grid gap-12 lg:grid-cols-[1fr_1.6fr]">
        <SectionHead eyebrow={t.faq.eyebrow} title={t.faq.title} />
        <div className="reveal divide-y divide-border border-y border-border">
          {t.faq.items.map((f) => (
            <details key={f.q} className="faq group">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-6 text-lg font-medium text-foreground">
                {f.q}
                <Plus aria-hidden className="size-5 shrink-0 text-accent-cyan transition-transform group-open:rotate-45" />
              </summary>
              <p className="pb-6 pe-10 leading-relaxed text-muted-foreground">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

function Contact({ t }: { t: Dict }) {
  return (
    <section id="contact" className="section">
      <div className="container-x">
        <div className="reveal contact-panel relative overflow-hidden rounded-3xl border border-border px-6 py-16 text-center sm:px-14 sm:py-24">
          <p className="eyebrow justify-center">{t.contact.eyebrow}</p>
          <h2 className="mx-auto mt-5 max-w-3xl text-balance text-[clamp(2.2rem,5vw,4rem)] font-semibold leading-tight tracking-tight text-foreground">
            {t.contact.title}
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-lg text-muted-foreground">{t.contact.lead}</p>
          <a href={mailto(t)} className="btn btn-primary btn-lg mt-10">
            <Mail aria-hidden className="size-4" /> {t.contact.email} · <Ltr>{CONTACT_EMAIL}</Ltr>
          </a>
          <div className="mt-10">
            <p className="text-sm text-muted-foreground">{t.contact.follow}</p>
            <Socials t={t} className="mt-4 justify-center" />
          </div>
        </div>
      </div>
    </section>
  );
}

function Socials({ t, className = "" }: { t: Dict; className?: string }) {
  return (
    <ul className={`flex flex-wrap gap-3 ${className}`}>
      {[
        { href: SOCIAL.facebook, label: "Facebook", Icon: Facebook },
        { href: SOCIAL.instagram, label: "Instagram", Icon: Instagram },
      ].map(({ href, label, Icon }) => (
        <li key={label}>
          <a href={href} target="_blank" rel="noopener" className="btn btn-outline">
            <Icon aria-hidden className="size-4" /> <span dir="ltr">{label}</span>
            <span className="sr-only">{t.a11y.newTab}</span>
          </a>
        </li>
      ))}
    </ul>
  );
}

function Footer({ lang, t, active }: { lang: Lang; t: Dict; active: string }) {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-border bg-surface-2/60">
      <div className="container-x grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-3">
            <img src={BRAND.mark} alt="" width={40} height={40} loading="lazy" className="size-10 rounded-lg" />
            <span dir="ltr" className="text-lg font-semibold tracking-[0.08em] text-foreground">RayState</span>
          </div>
          <p className="mt-4 max-w-xs text-sm text-muted-foreground">{t.footer.positioning}</p>
          <p className="mt-6 text-xs text-muted-foreground">{t.footer.language}</p>
          <LangSwitch lang={lang} t={t} active={active} className="-ms-2 mt-1" />
        </div>
        <FooterCol title={t.footer.products}>
          {PRODUCTS.map((p) => (
            <li key={p.id}>
              <a href={p.site} target="_blank" rel="noopener" className="footer-link" dir="ltr">
                {p.name}
              </a>
            </li>
          ))}
        </FooterCol>
        <FooterCol title={t.footer.company}>
          {(["services", "approach", "about", "contact"] as const).map((id) => (
            <li key={id}>
              <a href={`#${id}`} className="footer-link">{t.nav[id]}</a>
            </li>
          ))}
          <li>
            <a href={`mailto:${CONTACT_EMAIL}`} className="footer-link"><Ltr>{CONTACT_EMAIL}</Ltr></a>
          </li>
        </FooterCol>
        <FooterCol title={t.footer.social}>
          <li><a href={SOCIAL.facebook} target="_blank" rel="noopener" className="footer-link">Facebook</a></li>
          <li><a href={SOCIAL.instagram} target="_blank" rel="noopener" className="footer-link">Instagram</a></li>
        </FooterCol>
      </div>
      <div className="container-x flex flex-col gap-2 border-t border-border py-6 text-xs text-muted-foreground sm:flex-row sm:justify-between">
        <p>© <span dir="ltr">{year} RayState</span>. {t.footer.rights}</p>
        <p>{t.footer.legalNote}</p>
      </div>
    </footer>
  );
}

const FooterCol = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div>
    <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-foreground/70">{title}</h2>
    <ul className="mt-4 grid gap-2">{children}</ul>
  </div>
);

export function Site({ lang }: { lang: Lang }) {
  const t = DICTS[lang];
  const active = useActiveSection();
  useReveal();
  return (
    <div className={lang === "ar" ? "font-arabic leading-arabic" : ""}>
      <a href="#main" className="skip-link">{t.a11y.skip}</a>
      <Header lang={lang} t={t} active={active} />
      <main id="main">
        <Hero t={t} />
        <Products t={t} />
        <Services t={t} />
        <Approach t={t} />
        <About t={t} />
        <Faq t={t} />
        <Contact t={t} />
      </main>
      <Footer lang={lang} t={t} active={active} />
    </div>
  );
}
