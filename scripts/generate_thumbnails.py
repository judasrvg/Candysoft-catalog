#!/usr/bin/env python3
from pathlib import Path
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[1]
IMAGES_DIR = ROOT / "images"
THUMB_DIR = ROOT / "thumbnails"
MAX_SIZE = (560, 560)
JPEG_QUALITY = 72
SUPPORTED_EXT = {".jpg", ".jpeg", ".png", ".webp"}


def make_thumbnail(source: Path, target: Path) -> bool:
    target.parent.mkdir(parents=True, exist_ok=True)

    with Image.open(source) as img:
        img = ImageOps.exif_transpose(img)
        if img.mode not in ("RGB", "L"):
            img = img.convert("RGB")
        elif img.mode == "L":
            img = img.convert("RGB")

        img.thumbnail(MAX_SIZE, Image.Resampling.LANCZOS)
        img.save(target, quality=JPEG_QUALITY, optimize=True, progressive=True)

    return True


def main() -> None:
    if not IMAGES_DIR.exists():
        raise SystemExit(f"No existe la carpeta de imágenes: {IMAGES_DIR}")

    count = 0
    for source in sorted(IMAGES_DIR.rglob("*")):
        if not source.is_file() or source.suffix.lower() not in SUPPORTED_EXT:
            continue

        relative = source.relative_to(IMAGES_DIR)
        target = THUMB_DIR / relative
        make_thumbnail(source, target)
        count += 1

    print(f"Miniaturas generadas: {count}")


if __name__ == "__main__":
    main()
