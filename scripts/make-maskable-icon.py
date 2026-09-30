"""Pad the existing artwork inside Android's central 80% safe circle."""
from pathlib import Path
from math import floor, sqrt
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
source = Image.open(ROOT / "public/icons/icon-512.png").convert("RGB")
size = 512
# The entire square fits inside the safe circle, including its corners.
edge = floor(size * 0.8 / sqrt(2))
icon = Image.new("RGB", (size, size), source.getpixel((0, 0)))
art = source.resize((edge, edge), Image.Resampling.LANCZOS)
icon.paste(art, ((size - edge) // 2, (size - edge) // 2))
icon.save(ROOT / "public/icons/icon-maskable-512.png")
