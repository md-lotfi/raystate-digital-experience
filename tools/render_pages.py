#!/usr/bin/env python3
"""Render checked-in static pages with Python's standard library. Not a deployment build."""
import argparse
import html
import json
import re
from pathlib import Path
from urllib.parse import quote

ROOT = Path(__file__).resolve().parents[1]
LANGS = ('en', 'fr', 'ar')
PAGES = ('', 'privacy-policy', 'terms-of-use')
TOKEN = re.compile(r'@@([\w:.]+)@@')


def load(name):
    return json.loads((ROOT / 'content' / name).read_text())


def get(obj, path):
    for part in path.split('.'):
        obj = obj[int(part)] if isinstance(obj, list) else obj[part]
    return obj


def esc(value):
    return html.escape(str(value), quote=True)


def route(lang, page=''):
    return ('' if lang == 'en' else lang + '/') + (page + '/' if page else '')


def relative_root(lang, page=''):
    return '../' * len([s for s in route(lang, page).split('/') if s]) or './'


def inline(text):
    text = esc(text)
    text = re.sub(r'\[([^\]]+)\]\(([^\s)]+)\)', lambda m: '<a href="' + m[2] + '">' + m[1] + '</a>', text)
    return re.sub(r'\*\*([^*]+)\*\*', r'<strong>\1</strong>', text)


def markdown(text):
    """Small intentional Markdown subset: H2, paragraphs, lists and inline links/strong."""
    blocks, headings = [], []
    for block in text.strip().split('\n\n'):
        if block.startswith('## '):
            title = block[3:].strip()
            ident = 'section-' + str(len(headings) + 1)
            headings.append((ident, title))
            blocks.append(f'<h2 id="{ident}">{inline(title)}</h2>')
        elif block.startswith('- '):
            blocks.append('<ul>' + ''.join('<li>' + inline(line[2:]) + '</li>' for line in block.splitlines()) + '</ul>')
        else:
            blocks.append('<p>' + inline(' '.join(block.splitlines())) + '</p>')
    return '\n'.join(blocks), headings


def render_all():
    config, translations = load('site.json'), load('translations.json')
    templates = {n: (ROOT / 'tools/templates' / (n + '.html')).read_text() for n in ('header', 'footer', 'home', 'contact')}
    output = {}
    for lang in LANGS:
        t = translations[lang]
        for page in PAGES:
            base = relative_root(lang, page)
            home = base + route(lang)
            canonical = config['origin'].rstrip('/') + '/' + route(lang, page)
            labels = {'en': 'EN', 'fr': 'FR', 'ar': 'العربية'}
            switch = '<nav class="language-switch" aria-label="' + esc(t['a11y']['language']) + '">'
            for i, other in enumerate(LANGS):
                if i:
                    switch += '<span aria-hidden="true">|</span>'
                switch += '<a href="' + base + route(other, page) + '" hreflang="' + other + '" lang="' + other + '"' + (' aria-current="true"' if lang == other else '') + '>' + labels[other] + '</a>'
            switch += '</nav>'
            mailto = 'mailto:' + config['email'] + '?subject=' + quote(t['contact']['subject'])
            mobile = '<details class="mobile-nav"><summary aria-label="' + esc(t['a11y']['menuOpen']) + '"><svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 6h16M4 12h16M4 18h16"/></svg></summary><div class="mobile-panel"><nav aria-label="' + esc(t['a11y']['mainNav']) + '">'
            for section in ('products', 'services', 'approach', 'about', 'contact'):
                mobile += f'<a class="nav-link" href="{home if page else ""}#{section}">{esc(t["nav"][section])}</a>'
            mobile += '</nav>' + switch + '<a class="btn btn-primary" href="' + esc(mailto) + '">' + esc(t['nav']['cta']) + '</a></div></details>'
            privacy_url = base + route(lang, 'privacy-policy')
            terms_url = base + route(lang, 'terms-of-use')
            links = f'<a href="{privacy_url}">{esc(t["extra"]["privacy"])}</a><a href="{terms_url}">{esc(t["extra"]["terms"])}</a>'
            loc = config['location']
            coords = f'{loc["latitude"]},{loc["longitude"]}'
            replacements = {
                'root': base, 'language_switch': switch, 'language_class': 'font-arabic leading-arabic' if lang == 'ar' else '',
                'mobile_nav': mobile, 'year': config['document_date'][:4], 'mailto': esc(mailto),
                'legal_links': links, 'privacy_url': privacy_url,
                'map_url': esc(f'https://www.google.com/maps?q={quote(coords)}&z={loc["zoom"]}&hl={lang}&output=embed'),
                'directions': esc('https://www.google.com/maps/dir/?api=1&destination=' + quote(coords)),
            }

            def token(m):
                key = m[1]
                if key.startswith('copy:'):
                    return esc(get(t, key[5:]))
                if key.startswith('site:'):
                    return esc(get(config, key[5:]))
                return replacements[key]

            def fill(template):
                return TOKEN.sub(token, template)

            header = fill(templates['header'])
            # The original initial header is transparent. JS sets is-scrolled as needed.
            header = header.replace('border-b border-border bg-background/85 backdrop-blur-md', 'border-b border-transparent')
            footer = fill(templates['footer'])
            if page:
                # Header/footer section links go to the correct localized homepage.
                for section in ('top', 'products', 'services', 'approach', 'about', 'contact'):
                    header = header.replace(f'href="#{section}"', f'href="{home}#{section}"')
                    footer = footer.replace(f'href="#{section}"', f'href="{home}#{section}"')
                title = t['extra']['privacy' if page == 'privacy-policy' else 'terms']
                source = (ROOT / 'legal-source' / lang / (page + '.md')).read_text()
                for key, val in {'publisher': config['publisher'], 'country': t['extra']['country'], 'email': config['email'], 'origin': config['origin']}.items():
                    source = source.replace('{{' + key + '}}', val)
                body, headings = markdown(source)
                toc = '<nav class="legal-toc" aria-label="' + esc(t['extra']['contents']) + '"><h2>' + esc(t['extra']['contents']) + '</h2><ol>' + ''.join(f'<li><a href="#{ident}">{esc(text.partition('. ')[2] if text.partition('. ')[0].isdigit() else text)}</a></li>' for ident, text in headings) + '</ol></nav>'
                product_links = ''
                for ident, product in config['products'].items():
                    prefix = f'/legal/{lang}/' if ident == 'ubee' else '/' + (lang + '/' if lang != 'en' else '')
                    product_links += '<li><bdi dir="ltr">' + esc(product['name']) + '</bdi>: <a href="' + product['site'] + prefix + 'privacy-policy/">' + esc(t['extra']['privacy']) + '</a> · <a href="' + product['site'] + prefix + 'terms-of-use/">' + esc(t['extra']['terms']) + '</a></li>'
                main = '<main id="main" class="container-x legal-main"><a class="back-link" href="' + home + '">← ' + esc(t['extra']['back']) + '</a><h1>' + esc(title) + '</h1><p class="legal-meta">' + esc(t['extra']['documentDate']) + ': <time datetime="' + config['document_date'] + '">' + config['document_date'] + '</time><br>' + esc(t['extra']['publisher']) + ': <bdi dir="ltr">' + esc(config['publisher']) + '</bdi> · ' + esc(t['extra']['country']) + '<br><a href="mailto:' + config['email'] + '" dir="ltr">' + config['email'] + '</a></p>' + toc + '<article class="legal-content">' + body + '</article><aside class="legal-products"><h2>' + esc(t['footer']['products']) + '</h2><ul>' + product_links + '</ul></aside></main>'
                description = title + ' · RayState · ' + config['publisher']
                full_title = title + ' — RayState'
            else:
                main = '<main id="main">' + fill(templates['home']) + fill(templates['contact']) + '</main>'
                full_title, description = t['meta']['title'], t['meta']['description']
            head = f'<!doctype html>\n<html lang="{lang}" dir="{"rtl" if lang == "ar" else "ltr"}">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n<title>{esc(full_title)}</title>\n<meta name="description" content="{esc(description)}">\n<meta name="theme-color" content="#050817">\n<meta name="author" content="RayState">\n<link rel="canonical" href="{esc(canonical)}">\n'
            for other in LANGS:
                head += '<link rel="alternate" hreflang="' + other + '" href="' + esc(config['origin'] + '/' + route(other, page)) + '">\n'
            head += '<link rel="alternate" hreflang="x-default" href="' + esc(config['origin'] + '/' + route('en', page)) + '">\n'
            for prop, value in {'og:title': full_title, 'og:description': description, 'og:type': 'website', 'og:url': canonical, 'og:locale': {'en': 'en_US', 'fr': 'fr_FR', 'ar': 'ar_AR'}[lang], 'og:image': config['origin'] + '/' + config['brand']['banner'], 'twitter:card': 'summary_large_image', 'twitter:title': full_title, 'twitter:description': description, 'twitter:image': config['origin'] + '/' + config['brand']['banner']}.items():
                head += '<meta ' + ('name' if prop.startswith('twitter:') else 'property') + '="' + prop + '" content="' + esc(value) + '">\n'
            graph = {'@context': 'https://schema.org', '@graph': [{'@type': 'Organization', '@id': config['origin'] + '/#org', 'name': 'RayState', 'url': config['origin'], 'email': config['email'], 'logo': config['origin'] + '/' + config['brand']['mark'], 'sameAs': list(config['social'].values())}, {'@type': 'WebPage' if page else 'WebSite', 'name': full_title, 'url': canonical, 'inLanguage': lang, 'publisher': {'@id': config['origin'] + '/#org'}}]}
            head += '<script type="application/ld+json">' + json.dumps(graph, ensure_ascii=False).replace('<', '\\u003c') + '</script>\n'
            head += '<link rel="icon" href="' + base + 'assets/favicon.ico">\n<link rel="stylesheet" href="' + base + 'assets/styles.css">\n<script src="' + base + 'assets/script.js" defer></script>\n</head>\n<body>\n'
            # Newlines between block elements keep generated output reviewable.
            content = header + main + footer
            content = re.sub(r'(</(?:section|article|header|footer|main|h1|h2|h3|p|ul|ol|figure|nav)>)', r'\1\n', content)
            output[route(lang, page) + 'index.html'] = head + content + '\n</body>\n</html>\n'
    output['CNAME'] = config['origin'].split('://')[1].rstrip('/') + '\n'
    output['.nojekyll'] = ''
    output['robots.txt'] = 'User-agent: *\nAllow: /\nSitemap: ' + config['origin'] + '/sitemap.xml\n'
    output['sitemap.xml'] = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + ''.join('  <url><loc>' + config['origin'] + '/' + route(lang, page) + '</loc></url>\n' for lang in LANGS for page in PAGES) + '</urlset>\n'
    # Self-contained: no relative assets that fail on an unknown nested URL.
    cards = ''.join('<section lang="' + lang + '" dir="' + ('rtl' if lang == 'ar' else 'ltr') + '"><h2>' + esc(translations[lang]['extra']['notFound']['title']) + '</h2><p>' + esc(translations[lang]['extra']['notFound']['lead']) + '</p><a href="' + config['origin'] + '/' + route(lang) + '">' + esc(translations[lang]['extra']['back']) + '</a></section>' for lang in LANGS)
    output['404.html'] = '<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>404 — RayState</title><style>body{margin:0;padding:3rem 1.25rem;background:#050817;color:#f5f8ff;font:1rem/1.7 system-ui}main{max-width:800px;margin:auto}h1{font-size:4rem;color:#67e8f9}section{padding-block:1rem;border-top:1px solid #30415b}a{color:#67e8f9}</style><main><h1>404 · RayState</h1>' + cards + '</main></html>\n'
    return output


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--check', action='store_true', help='Fail if committed output differs; write nothing')
    args = parser.parse_args()
    output = render_all()
    drift = []
    for name, text in output.items():
        path = ROOT / name
        if args.check:
            if not path.exists() or path.read_text() != text:
                drift.append(name)
        else:
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_text(text)
    if drift:
        raise SystemExit('Generated output differs: ' + ', '.join(drift))
    print(('Checked' if args.check else 'Rendered') + f' {len(output)} static files.')


if __name__ == '__main__':
    main()
