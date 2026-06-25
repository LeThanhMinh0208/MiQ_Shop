"""
split-sprite.py — Cắt sprite sheet 360° thành 36 frames riêng lẻ
============================================================
Cách dùng:
    pip install Pillow
    cd scripts
    python split-sprite.py

    # Tuỳ chỉnh layout:
    python split-sprite.py --rows 6 --cols 7 --frames 36
    python split-sprite.py --rows 4 --cols 9 --frames 36
    python split-sprite.py --inspect   # chỉ xem info, không cắt

Output: public/3d-shoe/frame-000.png → frame-350.png (mỗi 10°)
"""

import os
import sys
import argparse
from pathlib import Path

try:
    from PIL import Image
except ImportError:
    print("❌  Thiếu Pillow. Cài bằng:  pip install Pillow")
    sys.exit(1)

# ── Paths (tương đối từ thư mục scripts/) ────────────────────────────────────
SCRIPT_DIR   = Path(__file__).parent
SPRITE_PATH  = SCRIPT_DIR / "../public/3d-shoe/sprite-sheet.png"
OUTPUT_DIR   = SCRIPT_DIR / "../public/3d-shoe"
WEBP_OUTPUT  = True      # True → xuất thêm .webp (~30% nhỏ hơn PNG)


def inspect(img, rows, cols):
    w, h = img.size
    cw, ch = w // cols, h // rows
    print(f"\n📐  Sprite  : {w} × {h} px")
    print(f"📦  Grid    : {rows} rows × {cols} cols = {rows*cols} cells")
    print(f"🔲  Cell    : {cw} × {ch} px")
    print(f"🗂️   Output  : {OUTPUT_DIR.resolve()}\n")


def split(rows, cols, total_frames, reverse, trim_alpha):
    sprite_path = SPRITE_PATH.resolve()
    if not sprite_path.exists():
        print(f"❌  Không tìm thấy file:\n   {sprite_path}")
        print("👉  Đặt sprite sheet vào:  public/3d-shoe/sprite-sheet.png")
        sys.exit(1)

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    img = Image.open(sprite_path).convert("RGBA")
    w, h = img.size
    cw   = w // cols
    ch   = h // rows

    inspect(img, rows, cols)

    # Collect cells row-by-row
    cells = []
    for r in range(rows):
        for c in range(cols):
            box   = (c * cw, r * ch, (c + 1) * cw, (r + 1) * ch)
            frame = img.crop(box)
            cells.append(frame)

    # Use only first `total_frames` cells
    cells = cells[:total_frames]
    if reverse:
        cells = list(reversed(cells))

    saved = 0
    for i, cell in enumerate(cells):
        angle    = i * (360 // total_frames)
        stem     = f"frame-{angle:03d}"

        # Optionally auto-trim transparent padding
        if trim_alpha:
            try:
                bbox = cell.getbbox()
                if bbox:
                    pad  = 8
                    l, t, r2, b = bbox
                    l  = max(0, l - pad)
                    t  = max(0, t - pad)
                    r2 = min(cw, r2 + pad)
                    b  = min(ch, b  + pad)
                    # Keep square crop centred
                    size  = max(r2 - l, b - t)
                    cx, cy = (l + r2) // 2, (t + b) // 2
                    l  = max(0, cx - size // 2)
                    t  = max(0, cy - size // 2)
                    cell = cell.crop((l, t, l + size, t + size))
            except Exception:
                pass   # skip trim if it fails

        # Save PNG
        png_path = OUTPUT_DIR / f"{stem}.png"
        cell.save(png_path, "PNG", optimize=True)

        # Save WebP (optional — better compression)
        if WEBP_OUTPUT:
            webp_path = OUTPUT_DIR / f"{stem}.webp"
            cell.save(webp_path, "WEBP", quality=88, method=6)

        saved += 1
        print(f"  ✅  {stem}.png  ({cell.size[0]}×{cell.size[1]})")

    fmt = "PNG + WebP" if WEBP_OUTPUT else "PNG"
    print(f"\n🎉  Xong! Đã lưu {saved} frames ({fmt}) vào:\n   {OUTPUT_DIR.resolve()}\n")
    print("📌  Bước tiếp theo:")
    print("   1. Kiểm tra ảnh trong  public/3d-shoe/")
    print("   2. Nếu thứ tự bị ngược, chạy lại:  python split-sprite.py --reverse")
    print("   3. Khởi động lại dev server để thấy hiệu ứng 3D.\n")


def main():
    parser = argparse.ArgumentParser(description="Cắt sprite sheet 360° → 36 frames")
    parser.add_argument("--rows",    type=int,  default=6,     help="Số hàng trong sprite sheet")
    parser.add_argument("--cols",    type=int,  default=7,     help="Số cột trong sprite sheet")
    parser.add_argument("--frames",  type=int,  default=36,    help="Số frames cần lấy (mặc định 36)")
    parser.add_argument("--reverse", action="store_true",      help="Đảo ngược thứ tự frames")
    parser.add_argument("--no-trim", action="store_true",      help="Không tự cắt viền trong suốt")
    parser.add_argument("--inspect", action="store_true",      help="Chỉ xem thông tin, không cắt")
    args = parser.parse_args()

    sprite_path = SPRITE_PATH.resolve()
    if not sprite_path.exists():
        if args.inspect:
            print(f"❌  File chưa tồn tại: {sprite_path}")
            return
        # run split (will error inside)
    else:
        img = Image.open(sprite_path)
        if args.inspect:
            inspect(img, args.rows, args.cols)
            return

    split(
        rows         = args.rows,
        cols         = args.cols,
        total_frames = args.frames,
        reverse      = args.reverse,
        trim_alpha   = not args.no_trim,
    )


if __name__ == "__main__":
    main()
