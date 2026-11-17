"""Regenerates the Cheat & Anal brand assets in public/ from scripts/brand-src/.

Usage: python3 scripts/brand-assets.py   (needs Pillow; WOFF2 font: pip install fonttools brotli, then
pyftsubset RubikGlitch.ttf --unicodes="U+0000-00FF,U+2000-206F,U+20AC,U+2122" --flavor=woff2 \
  --output-file=app/fonts/RubikGlitch-latin.woff2)
"""
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / 'scripts' / 'brand-src'
PUB = ROOT / 'public'
(PUB / 'brand').mkdir(exist_ok=True)

# Header/footer wordmark: white on transparent, trimmed to its artwork plus 8px, then pre-sized webp + png fallback.
logo = Image.open(SRC / 'logo-cheat-anal.png').convert('RGBA')
logo = logo.crop(logo.getbbox())
pad = 8
canvas = Image.new('RGBA', (logo.width + 2 * pad, logo.height + 2 * pad), (0, 0, 0, 0))
canvas.paste(logo, (pad, pad))
for w in (160, 240, 320, 480):
    im = canvas.resize((w, round(canvas.height * w / canvas.width)), Image.LANCZOS)
    im.save(PUB / 'brand' / f'logo-{w}.webp', 'WEBP', quality=88, method=6)
    if w == 320:
        im.save(PUB / 'brand' / 'logo-320.png', optimize=True)

# Opaque logo for places that need a solid background.
dark = Image.open(SRC / 'logo-cheat-anal-dark.png').convert('RGBA')
dark.convert('RGB').resize((600, 360), Image.LANCZOS).save(PUB / 'brand' / 'logo-dark-600.png', optimize=True)

# Open Graph card: 1200x630, dark logo centred on #141414.
og = Image.new('RGB', (1200, 630), (0x14, 0x14, 0x14))
w = 945
d = dark.resize((w, round(dark.height * w / dark.width)), Image.LANCZOS)
og.paste(d, ((1200 - d.width) // 2, (630 - d.height) // 2), d)
og.save(PUB / 'og.png', optimize=True)

# Icons: "C&A" on dark with a red slash.
fav = Image.open(SRC / 'favicon-512.png').convert('RGBA')
for s, name in ((16, 'icon-16.png'), (32, 'icon-32.png'), (180, 'apple-touch-icon.png'), (192, 'icon-192.png'), (512, 'icon-512.png')):
    fav.resize((s, s), Image.LANCZOS).save(PUB / name, optimize=True)
fav.resize((48, 48), Image.LANCZOS).save(PUB / 'favicon.ico', sizes=[(16, 16), (32, 32), (48, 48)])
