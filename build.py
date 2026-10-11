"""Assemble src/ en un seul index.html autonome (à relancer après chaque modification)."""
from pathlib import Path
d = Path(__file__).parent
r = lambda f: (d / "src" / f).read_text(encoding="utf8")
head = r("head.html").replace("</style>", r("extra.css") + "\n</style>")
js = "\n".join(r(f) for f in ["data.js", "app.js", "anim.js", "start.js"])
page = head + "\n" + r("body.html") + "\n<script>\n" + js + "\n</script>\n"
i = page.index("</style>") + 8
meta = """<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="description" content="Registre non officiel du lore de Warframe : frise chronologique interactive, carte du système Origine, archives, index des personnages et Warframes.">
<meta name="theme-color" content="#000000">
<meta property="og:title" content="Archives Orokin">
<meta property="og:description" content="Le lore de Warframe remis dans l'ordre : chronologie, carte, archives et index.">
<meta property="og:type" content="website">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'%3E%3Crect width='40' height='40' fill='%23000'/%3E%3Cg fill='none' stroke='%23f0bd4f' stroke-width='2'%3E%3Ccircle cx='20' cy='20' r='16'/%3E%3Crect x='10' y='10' width='20' height='20' transform='rotate(45 20 20)'/%3E%3C/g%3E%3Ccircle cx='20' cy='20' r='4' fill='%23ffe9b0'/%3E%3C/svg%3E">
"""
html = ('<!doctype html>\n<html lang="fr">\n<head>\n' + meta + page[:i] +
        '\n</head>\n<body>\n' + page[i:] + '</body>\n</html>\n')
(d / "index.html").write_text(html, encoding="utf8")
print(f"index.html : {len(html)//1024} Ko")
