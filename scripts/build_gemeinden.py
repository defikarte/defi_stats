#!/usr/bin/env python3
"""Erzeugt reports/kantone/<kt>.json (Gemeindegrenzen pro Kanton) und einwohner.json aus swissBOUNDARIES3D (swisstopo).

    python3 scripts/build_gemeinden.py                  # neuester Stand
    python3 scripts/build_gemeinden.py --tolerance 20   # Vereinfachung in Metern (Standard 10)

Einmal pro Jahr (nach den Gemeindefusionen per 1.1.) neu laufen lassen.
Nur Python-Standardbibliothek; lädt ca. 40 MB herunter.
"""
import argparse, io, json, sqlite3, struct, tempfile, urllib.request, zipfile
from pathlib import Path

STAC = 'https://data.geo.admin.ch/api/stac/v0.9/collections/ch.swisstopo.swissboundaries3d/items?limit=100'
ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / 'reports' / 'kantone'
EINWOHNER = ROOT / 'einwohner.json'
KANTONE = 'zh be lu ur sz ow nw gl zg fr so bs bl sh ar ai sg gr ag tg ti vd vs ne ge ju'.split()  # BFS-Kantonsnummer 1–26


def latest_gpkg_url():
    items = json.load(urllib.request.urlopen(STAC))['features']
    item = max(items, key=lambda i: i['id'])
    href = next(a['href'] for k, a in item['assets'].items() if k.endswith('.gpkg.zip'))
    return item['id'], href


def lv95_to_wgs84(e, n):
    # Näherungsformeln swisstopo, Genauigkeit ~1 m
    y, x = (e - 2_600_000) / 1e6, (n - 1_200_000) / 1e6
    lon = 2.6779094 + 4.728982 * y + 0.791484 * y * x + 0.1306 * y * x * x - 0.0436 * y ** 3
    lat = 16.9023892 + 3.238272 * x - 0.270978 * y * y - 0.002528 * x * x - 0.0447 * y * y * x - 0.0140 * x ** 3
    return round(lon * 100 / 36, 5), round(lat * 100 / 36, 5)


def simplify(pts, tol):
    """Douglas-Peucker (iterativ), Toleranz in Metern auf LV95-Koordinaten."""
    if len(pts) < 5:
        return pts
    keep = [False] * len(pts)
    keep[0] = keep[-1] = True
    stack = [(0, len(pts) - 1)]
    while stack:
        a, b = stack.pop()
        (ax, ay), (bx, by) = pts[a], pts[b]
        dx, dy = bx - ax, by - ay
        norm = (dx * dx + dy * dy) ** .5
        best, idx = -1, -1
        for i in range(a + 1, b):
            px, py = pts[i]
            d = abs(dy * (px - ax) - dx * (py - ay)) / norm if norm else ((px - ax) ** 2 + (py - ay) ** 2) ** .5
            if d > best:
                best, idx = d, i
        if best > tol:
            keep[idx] = True
            stack += [(a, idx), (idx, b)]
    out = [p for p, k in zip(pts, keep) if k]
    return out if len(out) >= 4 else pts


def read_wkb_rings(buf):
    """Alle Ringe (aussen + Löcher) eines (Multi)Polygons, Z wird verworfen."""
    rings, off = [], 0

    def geom():
        nonlocal off
        bo = '<' if buf[off] == 1 else '>'
        t, = struct.unpack_from(bo + 'I', buf, off + 1)
        off += 5
        has_z = t & 0x80000000 or 1000 <= (t & 0xFFFF) < 2000 or 3000 <= (t & 0xFFFF) < 4000
        base = (t & 0xFFFF) % 1000
        dim = 3 if has_z else 2
        if base == 3:
            nr, = struct.unpack_from(bo + 'I', buf, off); off += 4
            for _ in range(nr):
                n, = struct.unpack_from(bo + 'I', buf, off); off += 4
                vals = struct.unpack_from(bo + 'd' * n * dim, buf, off); off += 8 * n * dim
                rings.append([(vals[i], vals[i + 1]) for i in range(0, len(vals), dim)])
        elif base == 6:
            n, = struct.unpack_from(bo + 'I', buf, off); off += 4
            for _ in range(n):
                geom()
        else:
            raise ValueError(f'Unerwarteter Geometrietyp {t}')

    geom()
    return rings


def gpkg_geometry(blob):
    flags = blob[3]
    env = (flags >> 1) & 7
    return read_wkb_rings(blob[8 + [0, 32, 48, 48, 64][env]:])


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--tolerance', type=float, default=10, help='Vereinfachung in Metern (Standard 10)')
    ap.add_argument('--gpkg', help='lokale .gpkg-Datei statt Download')
    ap.add_argument('--out', type=Path, default=OUT, help='Zielordner')
    args = ap.parse_args()

    with tempfile.TemporaryDirectory() as tmp:
        if args.gpkg:
            stand, path = Path(args.gpkg).stem, args.gpkg
        else:
            stand, url = latest_gpkg_url()
            print(f'Lade {url}')
            with zipfile.ZipFile(io.BytesIO(urllib.request.urlopen(url).read())) as z:
                name = next(n for n in z.namelist() if n.endswith('.gpkg'))
                path = z.extract(name, tmp)
        db = sqlite3.connect(path)
        rows = db.execute("""select bfs_nummer, name, kantonsnummer, geom from tlm_hoheitsgebiet
                             where icc = 'CH' and objektart in ('Gemeindegebiet', 'Kommunanz')""").fetchall()
        einwohner = db.execute("""select kantonsnummer, sum(einwohnerzahl) from tlm_kantonsgebiet
                                  where icc = 'CH' group by kantonsnummer""").fetchall()

    per_canton = {}
    for bfs, name, ktnr, blob in rows:
        rings = [[lv95_to_wgs84(e, n) for e, n in simplify(r, args.tolerance)] for r in gpkg_geometry(blob)]
        per_canton.setdefault(KANTONE[ktnr - 1], []).append({'bfs': bfs, 'name': name, 'rings': rings})

    args.out.mkdir(parents=True, exist_ok=True)
    for kt, lst in sorted(per_canton.items()):
        lst.sort(key=lambda g: g['name'])
        body = {'canton': kt, 'stand': stand, 'quelle': f'swisstopo swissBOUNDARIES3D ({stand}), vereinfacht {args.tolerance:g} m', 'gemeinden': lst}
        (args.out / f'{kt}.json').write_text(json.dumps(body, ensure_ascii=False, separators=(',', ':')), encoding='utf-8')
        print(f'{kt}: {len(lst)} Gemeinden')

    # Einwohner pro Kanton für die Statistik-Seite (Defis pro 10'000 Einwohner)
    pop = {'stand': stand, 'quelle': 'swisstopo swissBOUNDARIES3D', 'einwohner': {KANTONE[nr - 1]: n for nr, n in sorted(einwohner)}}
    EINWOHNER.write_text(json.dumps(pop, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(f'Einwohner: {sum(pop["einwohner"].values()):,}')


if __name__ == '__main__':
    main()
