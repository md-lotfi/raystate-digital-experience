#!/usr/bin/env python3
"""Check static routes, links, translations, provenance and generated-file drift."""
import hashlib
import json
import re
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit
from xml.etree import ElementTree
from render_pages import ROOT, LANGS, PAGES, route, render_all


class Page(HTMLParser):
    def __init__(self, text):
        super().__init__(convert_charrefs=True)
        self.tags, self.ids, self.refs = [], [], []
        self.feed(text)

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        self.tags.append((tag, attrs))
        if 'id' in attrs:
            self.ids.append(attrs['id'])
        for key in ('href', 'src'):
            if key in attrs:
                self.refs.append((tag, attrs[key]))


def shape(obj):
    if isinstance(obj, dict):
        return {k: shape(v) for k, v in obj.items()}
    if isinstance(obj, list):
        return [shape(v) for v in obj]
    return type(obj).__name__


def main():
    errors = []
    def check(ok, message):
        if not ok:
            errors.append(message)
    expected = render_all()
    parsed = {}
    for name, text in expected.items():
        p = ROOT / name
        check(p.exists() and p.read_text() == text, f'{name}: generated output drift')
        if name.endswith('.html'):
            parsed[name] = Page(text)
            check(not re.search(r'@@|\{\{|/__l5e|react-dom|vite/client', text), f'{name}: unresolved template/framework')
    config = json.loads((ROOT / 'content/site.json').read_text())
    translations = json.loads((ROOT / 'content/translations.json').read_text())
    check(all(shape(translations[l]) == shape(translations['en']) for l in LANGS), 'Translation keys/list counts do not match')
    for lang in LANGS:
        for kind in PAGES:
            name = route(lang, kind) + 'index.html'
            page = parsed[name]
            check(len(page.ids) == len(set(page.ids)), f'{name}: duplicate IDs')
            check(sum(tag == 'h1' for tag, _ in page.tags) == 1, f'{name}: expected one H1')
            check(sum(tag == 'main' for tag, _ in page.tags) == 1, f'{name}: expected one main')
            root = next(a for tag, a in page.tags if tag == 'html')
            check(root.get('lang') == lang and root.get('dir') == ('rtl' if lang == 'ar' else 'ltr'), f'{name}: language/direction')
            canonical = [a for tag, a in page.tags if tag == 'link' and a.get('rel') == 'canonical']
            check(len(canonical) == 1 and canonical[0]['href'] == config['origin'] + '/' + route(lang, kind), f'{name}: canonical')
            check(sum(tag == 'link' and a.get('rel') == 'alternate' for tag, a in page.tags) == 4, f'{name}: alternate links')
            check(any(tag == 'a' and 'privacy-policy/' in a.get('href', '') for tag, a in page.tags), f'{name}: privacy link missing')
            if not kind:
                frame = [a for tag, a in page.tags if tag == 'iframe']
                check(len(frame) == 1 and frame[0].get('loading') == 'lazy', f'{name}: lazy map')
                coords = f"{config['location']['latitude']},{config['location']['longitude']}"
                check(coords in unquote(frame[0]['src']), f'{name}: incorrect map coordinates')
                check(sum(tag == 'details' for tag, _ in page.tags) == 8, f'{name}: native FAQ and mobile menu')
                for ident, product in config['products'].items():
                    check(any(tag == 'a' and a.get('href') == product['play'] for tag, a in page.tags), f'{name}: {ident} store link')
            else:
                check(sum(tag == 'h2' and a.get('id', '').startswith('section-') for tag, a in page.tags) >= 7, f'{name}: incomplete legal text')
    # Resolve every internal URL, including fragments, relative to its real page.
    for name, page in parsed.items():
        for tag, ref in page.refs:
            url = urlsplit(ref)
            if url.scheme or url.netloc:
                continue
            check(not url.path.startswith('/'), f'{name}: root-absolute link breaks prefix hosting: {ref}')
            dest = ((ROOT / name).parent / unquote(url.path)).resolve() if url.path else ROOT / name
            check(dest.is_relative_to(ROOT), f'{name}: link escapes site: {ref}')
            if dest.is_dir():
                dest /= 'index.html'
            check(dest.exists(), f'{name}: missing local target {ref}')
            if url.fragment and dest.suffix == '.html' and dest.exists():
                dest_page = parsed.get(str(dest.relative_to(ROOT))) or Page(dest.read_text())
                check(unquote(url.fragment) in dest_page.ids, f'{name}: missing fragment {ref}')
    # CSS font/image dependencies must also resolve locally.
    css_path = ROOT / 'assets/styles.css'
    for ref in re.findall(r'url\([\'"]?([^\)\'\"]+)', css_path.read_text()):
        check(not urlsplit(ref).scheme and (css_path.parent / ref).is_file(), 'Missing/nonlocal CSS asset: ' + ref)
    manifest = json.loads((ROOT / 'tools/asset_checksums.json').read_text())
    for name, digest in manifest.items():
        p = ROOT / name
        check(p.exists() and hashlib.sha256(p.read_bytes()).hexdigest() == digest, 'Asset checksum mismatch: ' + name)
    for record in json.loads((ROOT / 'tools/asset_sources.json').read_text()):
        p = ROOT / record['local']
        check(p.exists() and p.stat().st_size == record['size'], 'Original asset missing/changed: ' + record['local'])
    qr = json.loads((ROOT / 'tools/qr.json').read_text())
    check(qr['destination'] == config['origin'] + '/', 'QR destination differs from configured origin; regenerate both QR files')
    sitemap = ElementTree.fromstring((ROOT / 'sitemap.xml').read_text())
    check(len(sitemap) == 9, 'Expected nine sitemap entries')
    check((ROOT / 'CNAME').read_text().strip() == urlsplit(config['origin']).netloc, 'CNAME mismatch')
    for obsolete in ('package.json', 'bun.lock', 'vite.config.ts', 'tsconfig.json', 'src', 'public'):
        check(not (ROOT / obsolete).exists(), 'Obsolete framework file/directory: ' + obsolete)
    check(hashlib.sha256((ROOT / 'AGENTS.md').read_bytes()).hexdigest() == json.loads((ROOT / 'tools/conversion.json').read_text())['agents_sha256'], 'AGENTS.md changed')
    if errors:
        raise SystemExit('\n'.join(errors))
    print(f'PASS: 9 localized pages, links/fragments, metadata, translations, {len(manifest)} asset checksums, hosting files and source/output parity.')


if __name__ == '__main__':
    main()
