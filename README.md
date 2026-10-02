# DIGITAL HERITAGE ARTIFACT SCANNER & HERITAGE MAPPING EXTENSION
### Smart India Hackathon &bull; Problem Statement: PS-26214
**"ONE PHYSICAL ARTIFACT &rarr; ONE COMPLETE, TRACEABLE DIGITAL HERITAGE RECORD."**

---

## 🏛️ Executive Summary

The **Digital Heritage Artifact Scanner** is an end-to-end cyber-archaeology metrology system designed for automated 3D photogrammetric digitization, structural metric analysis, cultural knowledge preservation, auditable provenance tracking, and progressive verification of India's tangible cultural heritage.

This repository extends the scanning architecture into a unified **Digital Heritage Command Center** featuring:
1. **Live Camera & Quality Gate Telemetry**: Real-time Pi Camera/webcam streaming with automated Laplacian blur detection, exposure histogram analysis, and 50.0mm metric ArUco fiducial recognition.
2. **Turntable Stepper Control**: Precision 0°–360° rotational motor synchronization and automated 36-frame photogrammetric capture sequence.
3. **Interactive 3D GLB Viewer & Structural Inspector**: Google `<model-viewer>` integration rendering watertight manifold PBR 3D meshes with interactive measurement calipers, bounding box dimensions, and polygon/vertex counts.
4. **Cultural Intelligence & Oral Lore Room**: Embedded audio playback of native artisan oral lore, synchronized regional transcripts (Hindi/Halbi, Tamil, Bengali, Gujarati, Urdu), English translations, and explicit `AI-ASSISTED` / `HUMAN-ENTERED` trust labeling.
5. **Heritage Mapping with Offline-First Operation**: Leaflet-powered GIS engine decoupling **Cultural Origin**, **Community Cluster**, **Documentation Lab**, and **Current Display** locations with strict privacy tiers (`PUBLIC`, `RESTRICTED`, `PRIVATE`) and local India GeoJSON vector fallback.
6. **Progressive Verification Lifecycle**: Non-blocking trust progression (`PENDING` &rarr; `COMMUNITY-PROVIDED` &rarr; `SOURCE-VERIFIED` &rarr; `INSTITUTION-VERIFIED`) with immutable provenance logging.
7. **Mobile-First Visitor Digital Heritage Passport**: Clean, respectful museum visitor interface accessible via QR code without operator controls.
8. **Seamless Hardware & Demo Mode Isolation**: One-click toggle between physical sensor GPIO capture and reproducible Hackathon demo simulation.

---

## ⚡ 10-Second Judge Pitch (Evaluation Matrix)

| # | SIH Evaluation Question | Scanner Telemetry & Heritage Answer |
|---|---|---|
| **1** | **What is being scanned?** | **Traditional Brass Kalash** (Ritual Vessel, ID: `DH-IND-0001`) |
| **2** | **Where is it from?** | **Bastar, Chhattisgarh** (Ghadwa Metalcraft Community) |
| **3** | **What has been captured?** | **36 Multi-angle Photogrammetric Frames** (360° turntable coverage) |
| **4** | **What does the 3D model look like?** | **Watertight Manifold GLB Mesh** (2,592 Polygons, 1,332 Vertices, 2K PBR Diffuse) |
| **5** | **What are its dimensions?** | **12.2 cm (W) × 18.4 cm (H) × 11.8 cm (D)** [SCALED via 50mm ArUco] |
| **6** | **What is its cultural context?** | Sacred Purna Kumbha vessel holding river water and mango leaves during Griha Pravesh |
| **7** | **Who contributed the knowledge?** | **Mansingh Baghel** (Master Ghadwa Artisan, Kondagaon Craft Guild) |
| **8** | **Where is it located?** | Origin: *Bastar, CG* &bull; Field Scan: *Bhilai, CG* &bull; Display: *National Museum, Delhi* |
| **9** | **What is verified?** | **INSTITUTION-VERIFIED** (National Heritage Registry Docket #NR-8841) |
| **10** | **What is still pending?** | Physical Digital Vernier Caliper cross-validation (Recorded: 18.1 cm &bull; Status: VALIDATED) |
| **11** | **Can a visitor access it?** | **Yes, via Mobile Digital Passport** (`/passport.html?id=DH-IND-0001`) |

---

## 🚀 Quick Start Guide

### 1. Requirements
- Python 3.10+ (tested on Python 3.12)
- Dependencies: `fastapi`, `uvicorn`, `opencv-python`, `pillow`, `numpy`, `websockets`, `pydantic`

### 2. Launch Server
```bash
python run_server.py
```

### 3. Open Web Interfaces
- **Master Command Center**: [`http://localhost:8000/`](http://localhost:8000/)
- **Mobile Visitor Passport**: [`http://localhost:8000/passport.html?id=DH-IND-0001`](http://localhost:8000/passport.html?id=DH-IND-0001)
- **Interactive REST API Docs**: [`http://localhost:8000/docs`](http://localhost:8000/docs)

---

## 🖥️ System Architecture

```
Physical Artifact
       │
       ▼
[ STEP 1: CALIBRATION ] ──> Zero Turntable (0°) + ArUco #42 Fiducial Recognition
       │
       ▼
[ STEP 2: AUTOMATED CAPTURE ] ──> 36-Step 360° Stepper Rotation + Camera Trigger
       │
       ▼
[ STEP 3: QUALITY GATE ] ──> Laplacian Blur (>100) + Histogram Exposure + Marker Lock
       │
       ▼
[ STEP 4: 3D RECONSTRUCTION ] ──> SIFT &bull; SfM Sparse Cloud &bull; Dense Cloud &bull; Poisson Mesh &bull; GLB
       │
       ▼
[ STEP 5: CULTURAL METADATA ] ──> Material, Craft Technique, Ritual Use, Community
       │
       ▼
[ STEP 6: ORAL KNOWLEDGE ] ──> Native Audio Recording + Regional Transcript + Translation
       │
       ▼
[ STEP 7: HERITAGE MAPPING ] ──> Cultural Origin &bull; Community &bull; Lab &bull; Display Location (Privacy Filter)
       │
       ▼
[ STEP 8: PROVENANCE LEDGER ] ──> Auditable Chronological Chain of Custody
       │
       ▼
[ STEP 9: PROGRESSIVE VERIFICATION ] ──> Pending &rarr; Community &rarr; Source &rarr; Institution
       │
       ▼
[ STEP 10: DIGITAL HERITAGE PASSPORT ] ──> Cryptographic ID + QR Code
       │
       ▼
[ VISITOR PHONE ] ──> Mobile-First 3D Exploration & Audio Listening Room (No Operator Controls)
```

---

## 🗄️ Database & Pre-Seeded Indian Heritage Catalog

1. **`DH-IND-0001`**: Traditional Brass Kalash (Ritual Vessel &bull; Bastar, Chhattisgarh &bull; Ghadwa Community &bull; Institution-Verified)
2. **`DH-IND-0002`**: Chola Bronze Nataraja (Sacred Sculpture &bull; Thanjavur, Tamil Nadu &bull; Swamimalai Sthapathi &bull; Institution-Verified)
3. **`DH-IND-0003`**: Terracotta Horse of Bankura (Folk Votive Earthenware &bull; Panchmura, West Bengal &bull; Kumbhakar Guild &bull; Community-Provided)
4. **`DH-IND-0004`**: Kutch Rogan Painted Textile (Endangered Fabric Art &bull; Nirona, Gujarat &bull; Khatri Master Artisan &bull; Source-Verified)
5. **`DH-IND-0005`**: Bidriware Silver Inlay Huqqa Base (Deccan Sultanate Metalware &bull; Bidar, Karnataka &bull; Quadri Guild &bull; Institution-Verified)

---

## 🔒 Location Privacy Modes

- **`PUBLIC`**: Displays exact geospatial pinpoint and institution coordinates for public heritage appreciation.
- **`RESTRICTED`**: Coarsens geographic coordinates to a regional/state boundary polygon (e.g., Kutch, Gujarat) to protect vulnerable artisan hamlets.
- **`PRIVATE`**: Completely hides location telemetry on visitor passport views for sensitive tribal or privately held artifacts.

---

## 📡 Hardware & GPIO Wiring Reference (Raspberry Pi Rig)

- **Camera**: Raspberry Pi Camera Module 3 (Sony IMX708, Picamera2) / 1080p UVC USB Web Camera
- **Turntable Stepper Driver**: A4988 / TMC2209 StepStick
  - `STEP_PIN`: GPIO 18 (PWM)
  - `DIR_PIN`: GPIO 23
  - `ENABLE_PIN`: GPIO 24
- **Scale Marker**: 50.0mm × 50.0mm standardized ArUco Dictionary `DICT_6X6_250` (ID: #42)
- **Caliper Validation**: Mitutoyo 500-196-30 Digital Vernier Caliper (0.01 mm precision)
