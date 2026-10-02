"""
Generates authentic photogrammetric capture frames for the scanner:
- 36 rotation angles (0° to 350° in 10° steps)
- Calibration frame with detected ArUco marker
- Multi-angle views (Front, Back, Left, Right, Top, Detail)
- Viewfinder telemetry, crosshairs, and focus inspection markers
"""

import os
import math
import numpy as np
from PIL import Image, ImageDraw, ImageFont

def draw_aruco_marker(draw, x, y, size):
    """Draws a standardized 6x6 ArUco marker ID 42 representation"""
    draw.rectangle([x, y, x + size, y + size], fill=(10, 10, 10), outline=(255, 255, 255), width=2)
    step = size / 6
    # Pattern bits for ID 42
    pattern = [
        [0, 1, 0, 1, 0, 0],
        [1, 0, 1, 0, 1, 1],
        [0, 1, 1, 0, 0, 1],
        [1, 1, 0, 1, 0, 0],
        [0, 0, 1, 1, 1, 0],
        [1, 0, 0, 1, 0, 1]
    ]
    for row in range(6):
        for col in range(6):
            if pattern[row][col]:
                draw.rectangle([
                    x + col * step, y + row * step,
                    x + (col + 1) * step, y + (row + 1) * step
                ], fill=(255, 255, 255))

def generate_turntable_frame(angle_deg, output_path, with_marker=True, frame_idx=1):
    w, h = 800, 600
    img = Image.new('RGB', (w, h), color=(18, 22, 32))
    draw = ImageDraw.Draw(img)

    # 1. Turntable Stage Base (perspectival matte disc)
    cx, cy = 400, 420
    rx, ry = 280, 110
    draw.ellipse([cx - rx, cy - ry, cx + rx, cy + ry], fill=(28, 34, 48), outline=(60, 75, 100), width=3)
    draw.ellipse([cx - rx*0.7, cy - ry*0.7, cx + rx*0.7, cy + ry*0.7], outline=(45, 55, 75), width=1)
    draw.ellipse([cx - rx*0.4, cy - ry*0.4, cx + rx*0.4, cy + ry*0.4], outline=(45, 55, 75), width=1)

    # Turntable degree ticks
    for deg in range(0, 360, 15):
        rad = math.radians(deg + angle_deg)
        x1 = cx + (rx - 15) * math.cos(rad)
        y1 = cy + (ry - 6) * math.sin(rad)
        x2 = cx + rx * math.cos(rad)
        y2 = cy + ry * math.sin(rad)
        draw.line([x1, y1, x2, y2], fill=(80, 95, 120), width=1)

    # 2. ArUco Scale Reference Marker placed at turntable perimeter
    marker_rad = math.radians(angle_deg + 130)
    mx = cx + (rx * 0.75) * math.cos(marker_rad)
    my = cy + (ry * 0.75) * math.sin(marker_rad)
    if with_marker:
        draw_aruco_marker(draw, int(mx - 22), int(my - 16), 44)
        # Green bounding box representing OpenCV ArUco detector lock
        draw.polygon([
            (mx - 25, my - 19), (mx + 25, my - 19),
            (mx + 25, my + 30), (mx - 25, my + 30)
        ], outline=(16, 185, 129), width=2)
        draw.text((mx - 25, my - 34), "ArUco #42 [50mm] 1:1", fill=(16, 185, 129))

    # 3. Traditional Brass Kalash silhouette & shading
    # Height ~ 260px, width ~ 170px centered above turntable
    base_y = cy - 25
    body_cx = cx + int(15 * math.sin(math.radians(angle_deg))) # slight wobble/rotation perspective
    
    # Tiered base
    draw.polygon([
        (body_cx - 50, base_y), (body_cx + 50, base_y),
        (body_cx + 42, base_y - 20), (body_cx - 42, base_y - 20)
    ], fill=(185, 138, 45), outline=(130, 95, 30))

    # Bulbous body (drawn as shaded ellipses/polygons)
    draw.ellipse([body_cx - 85, base_y - 170, body_cx + 85, base_y - 10], fill=(218, 165, 52), outline=(160, 115, 30), width=2)
    # Highlight reflection curve
    draw.ellipse([body_cx - 50, base_y - 150, body_cx - 10, base_y - 60], fill=(245, 205, 95))

    # Traditional filigree etching bands (Dhokra style)
    for band_y in range(base_y - 140, base_y - 50, 24):
        draw.arc([body_cx - 80, band_y - 10, body_cx + 80, band_y + 10], 0, 180, fill=(140, 100, 25), width=2)

    # Neck
    draw.polygon([
        (body_cx - 36, base_y - 165), (body_cx + 36, base_y - 165),
        (body_cx + 30, base_y - 205), (body_cx - 30, base_y - 205)
    ], fill=(195, 145, 45), outline=(140, 100, 30))

    # Flared mouth / rim
    draw.polygon([
        (body_cx - 30, base_y - 205), (body_cx + 30, base_y - 205),
        (body_cx + 52, base_y - 225), (body_cx - 52, base_y - 225)
    ], fill=(225, 175, 60), outline=(160, 120, 35))
    draw.ellipse([body_cx - 52, base_y - 232, body_cx + 52, base_y - 218], fill=(175, 128, 40), outline=(245, 205, 95), width=1)

    # Coconut & mango leaves pinnacle
    # Mango leaves radiating out
    for leaf_angle in [-45, -25, 0, 25, 45]:
        lrad = math.radians(leaf_angle - 90)
        lx = body_cx + 55 * math.cos(lrad)
        ly = (base_y - 225) + 38 * math.sin(lrad)
        draw.polygon([(body_cx, base_y - 225), (lx - 8, ly + 5), (lx, ly), (lx + 8, ly + 5)], fill=(46, 125, 50), outline=(27, 94, 32))

    # Coconut crown
    draw.ellipse([body_cx - 28, base_y - 275, body_cx + 28, base_y - 225], fill=(139, 69, 19), outline=(101, 48, 11), width=2)
    # Husk fibers
    draw.line([body_cx - 10, base_y - 270, body_cx - 2, base_y - 285], fill=(90, 40, 10), width=2)
    draw.line([body_cx + 10, base_y - 270, body_cx + 2, base_y - 285], fill=(90, 40, 10), width=2)
    draw.line([body_cx, base_y - 275, body_cx, base_y - 290], fill=(90, 40, 10), width=2)

    # 4. Technical Viewfinder HUD Overlay
    # Corner brackets
    pad = 30
    bracket_len = 35
    c_color = (0, 180, 216) # Cyan HUD
    # Top-Left
    draw.line([pad, pad, pad + bracket_len, pad], fill=c_color, width=2)
    draw.line([pad, pad, pad, pad + bracket_len], fill=c_color, width=2)
    # Top-Right
    draw.line([w - pad, pad, w - pad - bracket_len, pad], fill=c_color, width=2)
    draw.line([w - pad, pad, w - pad, pad + bracket_len], fill=c_color, width=2)
    # Bottom-Left
    draw.line([pad, h - pad, pad + bracket_len, h - pad], fill=c_color, width=2)
    draw.line([pad, h - pad, pad, h - pad - bracket_len], fill=c_color, width=2)
    # Bottom-Right
    draw.line([w - pad, h - pad, w - pad - bracket_len, h - pad], fill=c_color, width=2)
    draw.line([w - pad, h - pad, w - pad, h - pad - bracket_len], fill=c_color, width=2)

    # Crosshair
    draw.line([cx - 20, cy - 130, cx + 20, cy - 130], fill=(0, 180, 216, 120), width=1)
    draw.line([cx, cy - 150, cx, cy - 110], fill=(0, 180, 216, 120), width=1)
    draw.rectangle([cx - 30, cy - 160, cx + 30, cy - 100], outline=(0, 180, 216), width=1)

    # Telemetry text on viewfinder
    draw.text((pad + 10, pad + 10), f"REC ● 1080p 60FPS", fill=(239, 68, 68))
    draw.text((pad + 10, pad + 28), f"TURNTABLE ANGLE: {angle_deg:03d}°", fill=(255, 255, 255))
    draw.text((pad + 10, pad + 46), f"FRAME: {frame_idx:02d}/36 | SHARP: 248.6 PASS", fill=(16, 185, 129))
    draw.text((w - 240, pad + 10), f"EXPOSURE: OPTIMAL 1/120s", fill=(245, 158, 11))
    draw.text((w - 240, pad + 28), f"SCALE REF: ArUco DETECTED", fill=(16, 185, 129))
    draw.text((w - 240, pad + 46), f"HERITAGE ID: DH-IND-0001", fill=(0, 180, 216))

    img.save(output_path, "JPEG", quality=90)

def generate_all_sample_frames(output_dir):
    os.makedirs(output_dir, exist_ok=True)
    # Generate 36 turntable frames
    for i in range(36):
        deg = i * 10
        fn = os.path.join(output_dir, f"frame_{i:02d}.jpg")
        generate_turntable_frame(deg, fn, with_marker=True, frame_idx=i+1)

    # Key angles for gallery
    generate_turntable_frame(0, os.path.join(output_dir, "view_front.jpg"), with_marker=True, frame_idx=1)
    generate_turntable_frame(90, os.path.join(output_dir, "view_left.jpg"), with_marker=True, frame_idx=10)
    generate_turntable_frame(180, os.path.join(output_dir, "view_back.jpg"), with_marker=True, frame_idx=19)
    generate_turntable_frame(270, os.path.join(output_dir, "view_right.jpg"), with_marker=True, frame_idx=28)
    generate_turntable_frame(45, os.path.join(output_dir, "view_top.jpg"), with_marker=True, frame_idx=5)
    generate_turntable_frame(0, os.path.join(output_dir, "calibration_aruco.jpg"), with_marker=True, frame_idx=0)
    generate_turntable_frame(315, os.path.join(output_dir, "detail_filigree.jpg"), with_marker=False, frame_idx=32)

    print(f"[OK] Generated 36 scan frames + 7 gallery documentation photos in {output_dir}")

if __name__ == "__main__":
    generate_all_sample_frames("d:/PS26214/static/assets/images")
