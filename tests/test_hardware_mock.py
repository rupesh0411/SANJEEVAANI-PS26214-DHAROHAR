"""
Hardware and stepper motor simulation test:
- Simulates 36-frame 360-degree turntable capture sequence
- Validates step angle calculations (10 degrees per step)
- Tests demo mode initialization
"""

import sys, os

# Add parent path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from backend.hardware import HardwareController

def test_hardware_demo_mode_initialization():
    hw = HardwareController()
    assert hw.demo_mode, "Hardware controller should initialize with demo_mode=True"
    print(f"[OK] HardwareController initialized in mode: {'DEMO' if hw.demo_mode else 'HARDWARE'}")

def test_turntable_capture_sequence():
    hw = HardwareController()
    target_frames = hw.total_target_frames
    step_deg = 360.0 / target_frames
    
    positions = []
    for step in range(target_frames):
        angle = step * step_deg
        positions.append(angle)
        
    assert len(positions) == 36, "Should generate exactly 36 capture points"
    assert positions[0] == 0.0, "First capture must be at 0 degrees"
    assert positions[-1] == 350.0, "Last capture must be at 350 degrees"
    print(f"[OK] Turntable 36-step sequence verified: 0° to 350° at {step_deg}° intervals")

if __name__ == "__main__":
    print("Testing DHAROHAR Hardware & Turntable Simulation...")
    test_hardware_demo_mode_initialization()
    test_turntable_capture_sequence()
    print("[ALL TESTS PASSED] Hardware simulation verified successfully.")
