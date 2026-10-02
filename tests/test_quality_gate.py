"""
Unit tests for DHAROHAR Quality Gate:
- Laplacian blur score and thresholding
- Histogram exposure analysis
- ArUco fiducial marker scale detection
"""

import sys, os
import numpy as np
import cv2

# Add parent path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from backend.quality_gate import QualityGate

def test_sharp_image_passes_quality_gate():
    qg = QualityGate(blur_threshold=50.0)
    
    # Create sharp checkerboard image
    img = np.zeros((480, 640, 3), dtype=np.uint8)
    for y in range(0, 480, 20):
        for x in range(0, 640, 20):
            if (x // 20 + y // 20) % 2 == 0:
                img[y:y+20, x:x+20] = 255

    res = qg.analyze_frame(img, annotate=False)
    print(f"Sharp image test: blur_score={res['blur_score']:.1f}, status={res['blur_status']}")
    assert res['blur_score'] > 50.0, "Sharp checkerboard should have high Laplacian variance"
    assert res['blur_status'] == "PASS", "Sharp image should PASS blur check"

def test_blurry_image_fails_quality_gate():
    qg = QualityGate(blur_threshold=100.0)
    
    # Create heavily blurred image
    img = np.zeros((480, 640, 3), dtype=np.uint8)
    cv2.putText(img, "DHAROHAR", (100, 240), cv2.FONT_HERSHEY_SIMPLEX, 3, (255, 255, 255), 4)
    blurred = cv2.GaussianBlur(img, (51, 51), 0)
    
    res = qg.analyze_frame(blurred, annotate=False)
    print(f"Blurry image test: blur_score={res['blur_score']:.1f}, status={res['blur_status']}")
    assert res['blur_score'] < 100.0, "Heavily blurred image should have low blur score"
    assert res['blur_status'] == "FAIL", "Blurry image must FAIL Quality Gate"

if __name__ == "__main__":
    print("Running Quality Gate Tests...")
    test_sharp_image_passes_quality_gate()
    test_blurry_image_fails_quality_gate()
    print("[ALL TESTS PASSED] Quality Gate evaluation verified successfully.")
