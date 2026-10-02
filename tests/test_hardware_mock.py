"""
Hardware and stepper motor simulation test:
- Simulates 36-frame 360-degree turntable capture sequence
- Validates step angle calculations (10 degrees per step)
- Tests demo mode initialization
"""

import sys, os
import unittest

# Add parent path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from backend.hardware import HardwareController

class TestHardwareMock(unittest.TestCase):
    def test_hardware_demo_mode_initialization(self):
        hw = HardwareController()
        self.assertTrue(hw.demo_mode, "Hardware controller should initialize with demo_mode=True")
        print(f"[OK] HardwareController initialized in mode: {'DEMO' if hw.demo_mode else 'HARDWARE'}")

    def test_turntable_capture_sequence(self):
        hw = HardwareController()
        target_frames = hw.total_target_frames
        step_deg = 360.0 / target_frames
        
        positions = []
        for step in range(target_frames):
            angle = step * step_deg
            positions.append(angle)
            
        self.assertEqual(len(positions), 36, "Should generate exactly 36 capture points")
        self.assertEqual(positions[0], 0.0, "First capture must be at 0 degrees")
        self.assertEqual(positions[-1], 350.0, "Last capture must be at 350 degrees")
        print(f"[OK] Turntable 36-step sequence verified: 0° to 350° at {step_deg}° intervals")

if __name__ == "__main__":
    print("Testing DHAROHAR Hardware & Turntable Simulation...")
    unittest.main()
