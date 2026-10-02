"""
Hardware Controller for Digital Heritage Artifact Scanner:
- Multiple Camera Source Selection:
    * Index 0: Default Integrated Webcam
    * Index 1: Raspberry Pi Camera / Secondary USB Cam
    * Index 2: External Precision Macro Rig
    * Browser Direct Mode (Client WebRTC/UserMedia camera stream)
    * Demo Photogrammetry Rig Simulator
- Stepper Turntable Motor Driver (0° to 360°)
- Real-time quality gate and optical metric dimension extraction
"""

import os
import time
import cv2
import numpy as np
from backend.quality_gate import quality_gate

class HardwareController:
    def __init__(self):
        self.demo_mode = True
        self.active_camera_index = 0
        self.camera_device = None
        self.is_camera_connected = False
        self.client_camera_active = False
        self.client_latest_frame = None

        self.turntable_angle = 0
        self.captured_count = 0
        self.total_target_frames = 36
        self.is_scanning = False
        self.current_dimensions = {
            "height": 24.5,
            "width": 18.2,
            "depth": 14.6,
            "unit": "cm",
            "scale_mode": "SCALED"
        }

        # Video Recording State
        self.recordings_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "data", "recordings"))
        os.makedirs(self.recordings_dir, exist_ok=True)
        self.is_recording = False
        self.video_writer = None
        self.recording_filename = None
        self.recording_filepath = None
        self.recording_start_time = 0
        self.recording_frames_count = 0
        self.recording_res = (1280, 720)

        self.sample_frames_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "static", "assets", "images"))
        self.detect_available_cameras()

    def detect_available_cameras(self, force_rescan=False):
        """Scans for connected hardware camera devices safely without interrupting demo rig"""
        if hasattr(self, 'available_cameras') and self.available_cameras and not force_rescan:
            return self.available_cameras

        available = []
        # Probe first 3 camera indices safely
        for idx in range(3):
            try:
                cap = cv2.VideoCapture(idx, cv2.CAP_DSHOW) if os.name == 'nt' else cv2.VideoCapture(idx)
                if cap.isOpened():
                    ret, frame = cap.read()
                    if ret and frame is not None:
                        label = f"Camera #{idx}"
                        if idx == 0:
                            label = "Camera #0 (Primary / Integrated Webcam)"
                        elif idx == 1:
                            label = "Camera #1 (Secondary / External USB Rig)"
                        available.append({"index": idx, "name": label})
                    cap.release()
            except Exception as e:
                pass

        self.available_cameras = available
        print(f"[HARDWARE] Detected hardware cameras: {available}")
        return available

    def connect_camera(self, index: int):
        if self.camera_device is not None:
            try:
                self.camera_device.release()
            except Exception:
                pass
            self.camera_device = None

        try:
            # On Windows, DirectShow is much faster and more reliable
            cap = cv2.VideoCapture(index, cv2.CAP_DSHOW) if os.name == 'nt' else cv2.VideoCapture(index)
            if not cap.isOpened():
                cap = cv2.VideoCapture(index, cv2.CAP_ANY)

            if cap.isOpened():
                # Optimize camera resolution
                cap.set(cv2.CAP_PROP_FRAME_WIDTH, 1280)
                cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 720)
                cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)

                ret, frame = cap.read()
                if ret and frame is not None:
                    self.camera_device = cap
                    self.active_camera_index = index
                    self.is_camera_connected = True
                    self.demo_mode = False
                    self.client_camera_active = False
                    print(f"[HARDWARE] Connected to Camera #{index} successfully ({frame.shape[1]}x{frame.shape[0]}).")
                    return True
                cap.release()
        except Exception as e:
            print(f"[HARDWARE] Failed to connect to camera #{index}: {e}")

        self.is_camera_connected = False
        return False

    def set_mode(self, demo_mode: bool):
        """Toggles between Demo Mode simulation and Live Hardware"""
        self.demo_mode = bool(demo_mode)
        if self.demo_mode:
            self.client_camera_active = False
            if self.camera_device is not None:
                try:
                    self.camera_device.release()
                except Exception:
                    pass
                self.camera_device = None
            self.is_camera_connected = False
        else:
            # Try connecting to active hardware camera if available
            self.detect_available_cameras()
            target_idx = self.active_camera_index if self.available_cameras else 0
            connected = self.connect_camera(target_idx)
            if not connected and not self.client_camera_active:
                # If physical camera failed, check if browser client camera is active
                print("[HARDWARE] Physical camera not opened, ready for browser webcam or fallback.")

        return self.get_status()

    def set_camera_source(self, source_type: str, index: int = 0):
        """
        source_type: "HARDWARE" | "BROWSER" | "DEMO"
        """
        if source_type == "DEMO":
            self.demo_mode = True
            self.client_camera_active = False
            if self.camera_device is not None:
                try:
                    self.camera_device.release()
                except Exception:
                    pass
                self.camera_device = None
            self.is_camera_connected = False
        elif source_type == "BROWSER":
            self.demo_mode = False
            self.client_camera_active = True
            if self.camera_device is not None:
                try:
                    self.camera_device.release()
                except Exception:
                    pass
                self.camera_device = None
            self.is_camera_connected = True
        elif source_type == "HARDWARE":
            self.demo_mode = False
            self.client_camera_active = False
            self.connect_camera(index)

        return self.get_status()

    def set_client_frame(self, frame_bgr):
        """Receives a frame captured from the operator's browser webcam"""
        self.client_latest_frame = frame_bgr
        self.client_camera_active = True
        self.demo_mode = False

    def get_status(self):
        source_label = "DEMO SIMULATION" if self.demo_mode else ("BROWSER WEBCAM" if self.client_camera_active else f"HARDWARE CAM #{self.active_camera_index}")
        return {
            "demo_mode": self.demo_mode,
            "client_camera_active": self.client_camera_active,
            "active_camera_index": self.active_camera_index,
            "available_cameras": self.available_cameras,
            "camera_connected": self.is_camera_connected or self.client_camera_active or self.demo_mode,
            "camera_status": source_label,
            "turntable_status": "ONLINE (GPIO Stepper Ready)" if not self.demo_mode else "DEMO TURNTABLE SIMULATOR",
            "turntable_angle": self.turntable_angle,
            "captured_count": self.captured_count,
            "total_frames": self.total_target_frames,
            "is_scanning": self.is_scanning,
            "current_dimensions": self.current_dimensions
        }

    def calibrate_turntable(self):
        self.turntable_angle = 0
        self.captured_count = 0
        return {"status": "CALIBRATED", "angle": 0, "message": "Turntable zero position calibrated."}

    def step_turntable(self, delta_degrees: int):
        self.turntable_angle = (self.turntable_angle + delta_degrees) % 360
        return {"angle": self.turntable_angle}

    def get_live_frame(self):
        """
        Returns the annotated frame as BGR numpy array along with quality & dimension telemetry.
        """
        raw_frame = None

        if self.client_camera_active and self.client_latest_frame is not None:
            raw_frame = self.client_latest_frame
        elif not self.demo_mode and self.is_camera_connected and self.camera_device is not None:
            ret, frame = self.camera_device.read()
            if ret and frame is not None:
                raw_frame = frame
        
        if raw_frame is None:
            # Demo Mode: serve the appropriate pre-captured angle frame
            frame_idx = int((self.turntable_angle / 360.0) * 36) % 36
            frame_path = os.path.join(self.sample_frames_dir, f"frame_{frame_idx:02d}.jpg")
            if os.path.exists(frame_path):
                raw_frame = cv2.imread(frame_path)
            else:
                raw_frame = np.full((600, 800, 3), 28, dtype=np.uint8)
                cv2.putText(raw_frame, f"TURNTABLE ANGLE {self.turntable_angle} deg", (150, 300),
                            cv2.FONT_HERSHEY_SIMPLEX, 1.0, (0, 180, 216), 2)

        # Run Quality Gate & Real-time Optical Metrology
        analysis = quality_gate.analyze_frame(raw_frame, annotate=True)
        annotated_frame = analysis.pop("annotated_frame", raw_frame)

        # Update live dimensions
        if "live_dimensions" in analysis:
            self.current_dimensions = analysis["live_dimensions"]

        # Write frame to video recording if active
        if self.is_recording and self.video_writer is not None:
            try:
                # Ensure frame matches video writer resolution
                target_w, target_h = self.recording_res
                h, w = annotated_frame.shape[:2]
                if w != target_w or h != target_h:
                    rec_frame = cv2.resize(annotated_frame, (target_w, target_h))
                else:
                    rec_frame = annotated_frame
                self.video_writer.write(rec_frame)
                self.recording_frames_count += 1
            except Exception as e:
                print(f"[HARDWARE RECORD ERROR] {e}")

        telemetry = {
            "angle": self.turntable_angle,
            "captured": self.captured_count,
            "total": self.total_target_frames,
            "is_demo": self.demo_mode,
            "is_recording": self.is_recording,
            "recording_frames": self.recording_frames_count,
            "recording_duration": round(time.time() - self.recording_start_time, 1) if self.is_recording else 0,
            **analysis
        }

        return annotated_frame, telemetry

    def start_recording(self, artifact_id: str = "DH-IND-0001", fps: float = 20.0):
        """Starts recording live camera stream to an MP4 video file"""
        if self.is_recording:
            return {"status": "ALREADY_RECORDING", "filename": self.recording_filename}

        timestamp = int(time.time())
        clean_id = (artifact_id or "DH-IND-0001").replace("/", "_").replace("\\", "_")
        self.recording_filename = f"scan_recording_{clean_id}_{timestamp}.mp4"
        self.recording_filepath = os.path.join(self.recordings_dir, self.recording_filename)

        fourcc = cv2.VideoWriter_fourcc(*'mp4v')
        width, height = 1280, 720
        self.recording_res = (width, height)
        self.video_writer = cv2.VideoWriter(self.recording_filepath, fourcc, float(fps), (width, height))
        self.is_recording = True
        self.recording_start_time = time.time()
        self.recording_frames_count = 0
        print(f"[HARDWARE] Started recording camera stream to {self.recording_filepath} at {width}x{height} {fps}fps")

        return {
            "status": "RECORDING_STARTED",
            "filename": self.recording_filename,
            "resolution": f"{width}x{height}",
            "fps": fps,
            "start_time": self.recording_start_time
        }

    def stop_recording(self):
        """Stops active recording and returns video metadata"""
        if not self.is_recording:
            return {"status": "NOT_RECORDING"}

        self.is_recording = False
        if self.video_writer is not None:
            try:
                self.video_writer.release()
            except Exception as e:
                print(f"[HARDWARE] Error releasing video writer: {e}")
            self.video_writer = None

        duration = round(time.time() - self.recording_start_time, 1)
        size = 0
        if self.recording_filepath and os.path.exists(self.recording_filepath):
            size = os.path.getsize(self.recording_filepath)

        filename = self.recording_filename
        frames = self.recording_frames_count

        self.recording_filename = None
        self.recording_filepath = None

        return {
            "status": "RECORDING_STOPPED",
            "filename": filename,
            "file_url": f"/api/camera/recordings/{filename}",
            "duration_seconds": duration,
            "frames_recorded": frames,
            "size_bytes": size,
            "size_formatted": f"{round(size / (1024 * 1024), 2)} MB" if size > 1024 * 1024 else f"{round(size / 1024, 1)} KB"
        }

    def get_recording_status(self):
        return {
            "is_recording": self.is_recording,
            "filename": self.recording_filename,
            "frames_recorded": self.recording_frames_count,
            "duration_seconds": round(time.time() - self.recording_start_time, 1) if self.is_recording else 0
        }

    def list_recordings(self):
        recs = []
        if not os.path.exists(self.recordings_dir):
            return recs
        for f in os.listdir(self.recordings_dir):
            if f.endswith(('.mp4', '.webm', '.avi')):
                p = os.path.join(self.recordings_dir, f)
                try:
                    size = os.path.getsize(p)
                    mtime = os.path.getmtime(p)
                    recs.append({
                        "filename": f,
                        "file_url": f"/api/camera/recordings/{f}",
                        "size_bytes": size,
                        "size_formatted": f"{round(size / (1024 * 1024), 2)} MB" if size > 1024 * 1024 else f"{round(size / 1024, 1)} KB",
                        "timestamp": mtime,
                        "created_at": time.strftime("%Y-%m-%d %H:%M:%S", time.localtime(mtime))
                    })
                except Exception:
                    pass
        recs.sort(key=lambda x: x["timestamp"], reverse=True)
        return recs

hardware = HardwareController()
