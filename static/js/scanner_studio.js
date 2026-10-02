/**
 * Live Scanning Studio & Hardware Telemetry:
 * Handles:
 * - Multi-camera source selection:
 *     * Hardware Camera Devices (#0, #1, Pi Cam via OpenCV DirectShow/UVC)
 *     * Browser Client Camera (HTML5 getUserMedia with metrology frame upload)
 *     * Demo Photogrammetry Rig (36 calibrated 360° angle frames)
 * - Real-time MJPEG video stream with optical metrology HUD overlays
 * - Snapshot capture & download
 * - Stepper turntable controls & 360° automated capture sequence
 * - Real-time metric dimensions & Quality Gate telemetry badges
 */

export class ScannerStudioController {
  constructor(wsSendFn) {
    this.wsSend = wsSendFn;
    this.feedImg = document.getElementById('camera-feed-img');
    this.videoEl = document.getElementById('client-webcam-preview');
    this.canvasEl = document.getElementById('client-webcam-canvas') || document.createElement('canvas');
    this.offlinePlaceholder = document.getElementById('camera-offline-msg');

    this.angleVal = document.getElementById('telemetry-angle-val');
    this.capturedVal = document.getElementById('telemetry-captured-val');
    this.blurStatus = document.getElementById('telemetry-blur-status');
    this.exposureStatus = document.getElementById('telemetry-exposure-status');
    this.markerStatus = document.getElementById('telemetry-marker-status');
    this.liveDimText = document.getElementById('live-dimension-badge-text');

    this.btnStartScan = document.getElementById('btn-start-scan');
    this.btnTrigger3d = document.getElementById('btn-trigger-3d');
    this.btnViewTourist = document.getElementById('btn-view-tourist-phone');
    this.btnSnapshot = document.getElementById('btn-take-snapshot');
    this.cameraSelect = document.getElementById('camera-source-select');

    this.browserStream = null;
    this.frameUploadInterval = null;
    this.currentSource = 'DEMO'; // 'DEMO' | 'HARDWARE_0' | 'HARDWARE_1' | 'BROWSER'

    // Video Recording State
    this.isRecording = false;
    this.mediaRecorder = null;
    this.recordedChunks = [];
    this.recordingStartTime = 0;
    this.recordingTimerInterval = null;
    this.recCanvasInterval = null;

    this.initControls();
    this.loadCameraDevices();
    this.loadSavedRecordings();
    this.startFeedStream();
  }

  async loadCameraDevices() {
    try {
      const res = await fetch('/api/camera/devices');
      if (res.ok) {
        const data = await res.json();
        this.populateCameraDropdown(data.available_cameras, data.active_source);
      }
    } catch (e) {
      console.warn("Could not load camera list:", e);
    }
  }

  populateCameraDropdown(cameras = [], activeSource = 'DEMO') {
    if (!this.cameraSelect) return;
    this.cameraSelect.innerHTML = '';

    // Option 1: Demo 360° Rig
    const optDemo = document.createElement('option');
    optDemo.value = 'DEMO';
    optDemo.textContent = '🔄 Demo 360° Turntable Rig';
    this.cameraSelect.appendChild(optDemo);

    // Option 2: Browser Live Webcam
    const optBrowser = document.createElement('option');
    optBrowser.value = 'BROWSER';
    optBrowser.textContent = '🌐 Browser Live Webcam (Client)';
    this.cameraSelect.appendChild(optBrowser);

    // Hardware Cameras
    if (cameras && cameras.length > 0) {
      cameras.forEach(cam => {
        const opt = document.createElement('option');
        opt.value = `HARDWARE_${cam.index}`;
        opt.textContent = `📷 ${cam.name}`;
        this.cameraSelect.appendChild(opt);
      });
    } else {
      const optHw = document.createElement('option');
      optHw.value = 'HARDWARE_0';
      optHw.textContent = '📷 Hardware Camera #0 (Auto-Detect)';
      this.cameraSelect.appendChild(optHw);
    }

    if (activeSource.startsWith('HARDWARE')) {
      this.cameraSelect.value = activeSource;
    } else if (activeSource === 'BROWSER') {
      this.cameraSelect.value = 'BROWSER';
    } else {
      this.cameraSelect.value = 'DEMO';
    }
  }

  initControls() {
    // Stepper buttons
    document.querySelectorAll('.stepper-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const delta = parseInt(btn.dataset.delta, 10);
        this.stepTurntable(delta);
      });
    });

    // Zero calibrate button
    document.getElementById('btn-calibrate-zero')?.addEventListener('click', async () => {
      try {
        await fetch('/api/scan/calibrate', { method: 'POST' });
      } catch (e) {
        console.error(e);
      }
    });

    // Camera source selector dropdown
    this.cameraSelect?.addEventListener('change', async (e) => {
      const val = e.target.value;
      if (val === 'DEMO') {
        await this.switchToDemoRig();
      } else if (val === 'BROWSER') {
        await this.startBrowserWebcam();
      } else if (val.startsWith('HARDWARE_')) {
        const idx = parseInt(val.split('_')[1], 10) || 0;
        await this.switchToHardwareCamera(idx);
      }
    });

    // Rescan cameras button
    document.getElementById('btn-rescan-cams')?.addEventListener('click', async () => {
      const btn = document.getElementById('btn-rescan-cams');
      if (btn) btn.textContent = 'RESCANNING...';
      try {
        const res = await fetch('/api/camera/scan?rescan=true');
        if (res.ok) {
          const data = await res.json();
          this.populateCameraDropdown(data.available_cameras, data.active_source);
        }
      } catch (e) {
        console.error(e);
      }
      if (btn) btn.textContent = '🔄 SCAN';
    });

    // Start 360° scan sequence
    this.btnStartScan?.addEventListener('click', async () => {
      const artId = document.getElementById('active-artifact-id-text')?.textContent || 'DH-IND-0001';
      this.btnStartScan.disabled = true;
      this.btnStartScan.textContent = "⏳ SCANNING 360°...";
      try {
        await fetch('/api/scan/start', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ artifact_id: artId, total_frames: 36 })
        });
      } catch (e) {
        console.error(e);
        this.btnStartScan.disabled = false;
        this.btnStartScan.textContent = "🚀 START 360° CAPTURE & PROCESS";
      }
    });

    // Trigger 3D Reconstruction
    this.btnTrigger3d?.addEventListener('click', async () => {
      const artId = document.getElementById('active-artifact-id-text')?.textContent || 'DH-IND-0001';
      this.btnTrigger3d.disabled = true;
      this.btnTrigger3d.textContent = "⏳ PROCESSING 3D...";
      try {
        await fetch(`/api/scan/trigger-reconstruction?artifact_id=${artId}`, { method: 'POST' });
      } catch (e) {
        console.error(e);
      }
    });

    // View Tourist Phone button
    this.btnViewTourist?.addEventListener('click', () => {
      const artId = document.getElementById('active-artifact-id-text')?.textContent || 'DH-IND-0001';
      if (window.heritageApp) {
        window.heritageApp.openTouristPhoneModal(artId);
      } else {
        const modal = document.getElementById('modal-tourist-phone');
        modal?.showModal();
      }
    });

    // Toggle browser webcam button
    const toggleWebcamBtn = document.getElementById('btn-toggle-webcam');
    if (toggleWebcamBtn) {
      toggleWebcamBtn.addEventListener('click', async () => {
        if (this.browserStream) {
          await this.switchToDemoRig();
          toggleWebcamBtn.textContent = '📷 BROWSER WEBCAM';
          toggleWebcamBtn.style.color = '#10B981';
          toggleWebcamBtn.style.borderColor = '#10B981';
          toggleWebcamBtn.style.background = 'rgba(16, 185, 129, 0.15)';
        } else {
          toggleWebcamBtn.textContent = '⏹️ DEMO RIG';
          toggleWebcamBtn.style.color = '#EF4444';
          toggleWebcamBtn.style.borderColor = '#EF4444';
          toggleWebcamBtn.style.background = 'rgba(239, 68, 68, 0.25)';
          await this.startBrowserWebcam();
        }
      });
    }

    // Capture Snapshot button
    this.btnSnapshot?.addEventListener('click', () => {
      this.captureSnapshot();
    });

    // Video Recording controls
    this.btnRecord = document.getElementById('btn-toggle-record');
    this.recordTimer = document.getElementById('record-timer');
    this.recordText = document.getElementById('record-btn-text');
    this.overlayRecTag = document.getElementById('overlay-rec-tag');

    this.btnRecord?.addEventListener('click', () => {
      this.toggleRecording();
    });

    // Close video player modal
    document.getElementById('btn-close-video-player')?.addEventListener('click', () => {
      const modal = document.getElementById('modal-video-player');
      const vid = document.getElementById('player-modal-video');
      if (vid) vid.pause();
      modal?.close();
    });
  }

  async toggleRecording() {
    if (this.isRecording) {
      await this.stopRecording();
    } else {
      await this.startRecording();
    }
  }

  async startRecording() {
    this.isRecording = true;
    this.recordedChunks = [];
    this.recordingStartTime = Date.now();

    // UI Updates
    if (this.btnRecord) {
      this.btnRecord.classList.add('is-recording');
    }
    if (this.recordText) {
      this.recordText.textContent = "STOP RECORDING";
    }
    if (this.recordTimer) {
      this.recordTimer.style.display = 'inline-block';
      this.recordTimer.textContent = "00:00";
    }
    if (this.overlayRecTag) {
      this.overlayRecTag.style.display = 'inline-flex';
      this.overlayRecTag.textContent = "● REC 00:00";
    }

    // Timer interval
    if (this.recordingTimerInterval) clearInterval(this.recordingTimerInterval);
    this.recordingTimerInterval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - this.recordingStartTime) / 1000);
      const mins = String(Math.floor(elapsed / 60)).padStart(2, '0');
      const secs = String(elapsed % 60).padStart(2, '0');
      const timeStr = `${mins}:${secs}`;
      if (this.recordTimer) this.recordTimer.textContent = timeStr;
      if (this.overlayRecTag) this.overlayRecTag.textContent = `● REC ${timeStr}`;
    }, 1000);

    // 1. Client-Side MediaRecorder Setup
    try {
      let recordStream = null;
      if (this.browserStream && this.videoEl && this.videoEl.srcObject) {
        recordStream = this.browserStream;
      } else {
        // Create canvas capture stream from live camera feed
        const recCanvas = document.createElement('canvas');
        recCanvas.width = 1280;
        recCanvas.height = 720;
        const recCtx = recCanvas.getContext('2d');
        recordStream = recCanvas.captureStream(25);

        // Continuously draw feedImg to canvas
        this.recCanvasInterval = setInterval(() => {
          if (!this.isRecording) {
            clearInterval(this.recCanvasInterval);
            return;
          }
          if (this.feedImg && this.feedImg.complete && this.feedImg.naturalWidth > 0) {
            try {
              recCtx.drawImage(this.feedImg, 0, 0, 1280, 720);
            } catch (e) {}
          }
        }, 40);
      }

      const mimeType = (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported('video/webm;codecs=vp9'))
        ? 'video/webm;codecs=vp9'
        : ((typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported('video/webm')) ? 'video/webm' : 'video/mp4');

      if (typeof MediaRecorder !== 'undefined' && recordStream) {
        this.mediaRecorder = new MediaRecorder(recordStream, { mimeType });
        this.mediaRecorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) {
            this.recordedChunks.push(e.data);
          }
        };
        this.mediaRecorder.start(250);
      }
    } catch (e) {
      console.warn("Client MediaRecorder setup notice:", e);
    }

    // 2. Server-Side MP4 Recording Start
    const artId = document.getElementById('active-artifact-id-text')?.textContent || 'DH-IND-0001';
    try {
      await fetch('/api/camera/record/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ artifact_id: artId })
      });
    } catch (e) {
      console.error("Server record start error:", e);
    }
  }

  async stopRecording() {
    this.isRecording = false;

    // Stop timers
    if (this.recordingTimerInterval) {
      clearInterval(this.recordingTimerInterval);
      this.recordingTimerInterval = null;
    }
    if (this.recCanvasInterval) {
      clearInterval(this.recCanvasInterval);
      this.recCanvasInterval = null;
    }

    // Reset UI
    if (this.btnRecord) {
      this.btnRecord.classList.remove('is-recording');
    }
    if (this.recordText) {
      this.recordText.textContent = "RECORD VIDEO";
    }
    if (this.recordTimer) {
      this.recordTimer.style.display = 'none';
    }
    if (this.overlayRecTag) {
      this.overlayRecTag.style.display = 'none';
    }

    // Stop MediaRecorder and build client video blob
    let clientBlobUrl = null;
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      try {
        this.mediaRecorder.stop();
        const mime = this.mediaRecorder.mimeType || 'video/webm';
        const blob = new Blob(this.recordedChunks, { type: mime });
        if (blob.size > 0) {
          clientBlobUrl = URL.createObjectURL(blob);
        }
      } catch (e) {
        console.error("Error stopping MediaRecorder:", e);
      }
    }

    // Stop Server Recording
    let serverRes = null;
    try {
      const res = await fetch('/api/camera/record/stop', { method: 'POST' });
      if (res.ok) {
        serverRes = await res.json();
      }
    } catch (e) {
      console.error("Server record stop error:", e);
    }

    // Open video playback player modal
    const videoUrl = clientBlobUrl || serverRes?.file_url;
    const filename = serverRes?.filename || `scan_take_${Date.now()}.webm`;
    const duration = serverRes?.duration_seconds || Math.round((Date.now() - this.recordingStartTime) / 1000);
    const sizeStr = serverRes?.size_formatted || `${Math.round((this.recordedChunks.reduce((acc, c) => acc + c.size, 0)) / 1024)} KB`;

    if (videoUrl) {
      this.openVideoPlayer(videoUrl, filename, `${duration}s • ${sizeStr}`);
    }

    // Refresh recordings gallery
    await this.loadSavedRecordings();
  }

  openVideoPlayer(videoUrl, filename, metaStr) {
    const modal = document.getElementById('modal-video-player');
    const vid = document.getElementById('player-modal-video');
    const meta = document.getElementById('player-modal-meta');
    const dBtn = document.getElementById('btn-download-modal-video');
    const title = document.getElementById('player-modal-title');

    if (title) title.textContent = `🎬 ${filename}`;
    if (meta) meta.textContent = `Duration: ${metaStr} • Format: MP4/WebM`;
    if (vid) {
      vid.src = videoUrl;
      vid.play().catch(e => console.log(e));
    }
    if (dBtn) {
      dBtn.href = videoUrl;
      dBtn.download = filename;
    }
    modal?.showModal();
  }

  async loadSavedRecordings() {
    try {
      const res = await fetch('/api/camera/recordings');
      if (res.ok) {
        const list = await res.json();
        const reel = document.getElementById('recordings-reel');
        const countBadge = document.getElementById('recordings-count-badge');
        if (countBadge) countBadge.textContent = `${list.length} RECORDINGS`;

        if (reel) {
          reel.innerHTML = '';
          if (list.length === 0) {
            reel.innerHTML = `<div style="font-size: 0.75rem; color: var(--text-dim); padding: 0.5rem 0; font-family: var(--font-mono);">
              No video recordings captured yet. Click "RECORD VIDEO" above to capture live camera footage.
            </div>`;
            return;
          }

          list.forEach(rec => {
            const card = document.createElement('div');
            card.className = 'recording-card';
            card.innerHTML = `
              <div class="recording-card-title" title="${rec.filename}">🎬 ${rec.filename}</div>
              <div class="recording-card-meta">
                <span>${rec.created_at || 'Recent'}</span>
                <span>${rec.size_formatted}</span>
              </div>
              <div class="recording-card-actions">
                <button class="btn-cyan btn-play-rec" style="padding: 0.25rem 0.5rem; font-size: 0.68rem; flex: 1;">▶ PLAY</button>
                <a href="${rec.file_url}" download="${rec.filename}" class="btn-secondary" style="padding: 0.25rem 0.5rem; font-size: 0.68rem; text-decoration: none; text-align: center; flex: 1;">💾 SAVE</a>
              </div>
            `;
            card.querySelector('.btn-play-rec').addEventListener('click', () => {
              this.openVideoPlayer(rec.file_url, rec.filename, rec.size_formatted);
            });
            reel.appendChild(card);
          });
        }
      }
    } catch (e) {
      console.warn("Could not load recordings:", e);
    }
  }

  async switchToDemoRig() {
    this.stopBrowserWebcam();
    this.currentSource = 'DEMO';
    if (this.cameraSelect) this.cameraSelect.value = 'DEMO';

    await fetch('/api/camera/select', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ source_type: 'DEMO' })
    });

    this.startFeedStream();
    this.updateCameraStatusBadge('DEMO 360° RIG');
  }

  async switchToHardwareCamera(index = 0) {
    this.stopBrowserWebcam();
    this.currentSource = `HARDWARE_${index}`;
    if (this.cameraSelect) this.cameraSelect.value = `HARDWARE_${index}`;

    try {
      const res = await fetch('/api/camera/select', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source_type: 'HARDWARE', index: index })
      });
      const data = await res.json();
      this.startFeedStream();
      this.updateCameraStatusBadge(`HARDWARE CAM #${index}`);
    } catch (e) {
      console.error("Error switching to hardware camera:", e);
    }
  }

  async startBrowserWebcam() {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert("Browser webcam access is not supported in this browser context (requires localhost or HTTPS).");
        return;
      }

      this.browserStream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: "environment" }
      });

      if (this.videoEl) {
        this.videoEl.srcObject = this.browserStream;
        this.videoEl.style.display = 'block';
        await this.videoEl.play().catch(e => console.log(e));
      }
      if (this.feedImg) this.feedImg.style.display = 'none';
      if (this.offlinePlaceholder) this.offlinePlaceholder.style.display = 'none';

      this.currentSource = 'BROWSER';
      if (this.cameraSelect) this.cameraSelect.value = 'BROWSER';

      // Start continuous frame transmission to backend metrology engine every 200ms
      if (this.frameUploadInterval) clearInterval(this.frameUploadInterval);
      this.frameUploadInterval = setInterval(() => this.captureAndSendBrowserFrame(), 200);

      await fetch('/api/camera/select', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source_type: 'BROWSER' })
      });

      this.updateCameraStatusBadge('BROWSER WEBCAM (LIVE)');
    } catch (err) {
      console.error("Webcam error:", err);
      alert("Could not access camera: " + err.message + "\nReverting to Demo Turntable Rig.");
      this.switchToDemoRig();
    }
  }

  stopBrowserWebcam() {
    if (this.browserStream) {
      this.browserStream.getTracks().forEach(track => track.stop());
      this.browserStream = null;
    }
    if (this.frameUploadInterval) {
      clearInterval(this.frameUploadInterval);
      this.frameUploadInterval = null;
    }
    if (this.videoEl) {
      this.videoEl.style.display = 'none';
      this.videoEl.srcObject = null;
    }
    if (this.feedImg) this.feedImg.style.display = 'block';
  }

  async captureAndSendBrowserFrame() {
    if (!this.videoEl || !this.browserStream) return;
    const v = this.videoEl;
    if (v.videoWidth === 0 || v.videoHeight === 0) return;

    this.canvasEl.width = 640;
    this.canvasEl.height = 480;
    const ctx = this.canvasEl.getContext('2d');
    ctx.drawImage(v, 0, 0, 640, 480);
    const dataUrl = this.canvasEl.toDataURL('image/jpeg', 0.70);

    try {
      const res = await fetch('/api/camera/upload-frame', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image_base64: dataUrl })
      });
      if (res.ok) {
        const json = await res.json();
        if (json.telemetry) {
          this.updateTelemetry(json.telemetry);
        }
      }
    } catch (e) {
      // Ignore background transmission glitches
    }
  }

  startFeedStream() {
    if (this.feedImg && !this.browserStream) {
      this.feedImg.style.display = 'block';
      this.feedImg.src = "/api/camera/stream?t=" + Date.now();
      
      this.feedImg.onerror = () => {
        // Fallback to single frame snapshot polling if MJPEG drops
        if (!this.browserStream && this.feedImg) {
          setTimeout(() => {
            if (!this.browserStream && this.feedImg) {
              this.feedImg.src = "/api/camera/frame?t=" + Date.now();
            }
          }, 400);
        }
      };

      this.feedImg.onload = () => {
        if (this.offlinePlaceholder) {
          this.offlinePlaceholder.style.display = 'none';
        }
      };
    }
  }

  captureSnapshot() {
    if (this.browserStream && this.videoEl) {
      // Capture from HTML5 video element directly
      const canvas = document.createElement('canvas');
      canvas.width = this.videoEl.videoWidth || 1280;
      canvas.height = this.videoEl.videoHeight || 720;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(this.videoEl, 0, 0, canvas.width, canvas.height);
      const url = canvas.toDataURL('image/jpeg', 0.95);
      this.triggerImageDownload(url, 'heritage_scan_snapshot.jpg');
    } else {
      // Fetch backend high-resolution snapshot
      const snapUrl = `/api/camera/snapshot?t=${Date.now()}`;
      const a = document.createElement('a');
      a.href = snapUrl;
      a.download = `heritage_scan_${Date.now()}.jpg`;
      a.target = '_blank';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  }

  triggerImageDownload(dataUrl, filename) {
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  updateCameraStatusBadge(label) {
    const pill = document.getElementById('camera-source-badge') || document.getElementById('global-camera-status');
    if (pill) {
      pill.innerHTML = `<span class="dot-pulse"></span> ${label}`;
    }
  }

  stepTurntable(delta) {
    if (this.wsSend) {
      this.wsSend({ action: 'STEP', delta: delta });
    }
  }

  updateTelemetry(data) {
    if (!data) return;

    if (this.angleVal && data.turntable_angle !== undefined) {
      this.angleVal.textContent = `${String(data.turntable_angle).padStart(3, '0')}°`;
    } else if (this.angleVal && data.angle !== undefined) {
      this.angleVal.textContent = `${String(data.angle).padStart(3, '0')}°`;
    }

    if (this.capturedVal && data.captured_count !== undefined) {
      this.capturedVal.textContent = `${data.captured_count} / ${data.total_frames || 36}`;
    }

    if (this.blurStatus && data.blur_status) {
      const score = data.blur_score ? ` (${data.blur_score})` : '';
      this.blurStatus.textContent = `${data.blur_status}${score}`;
      this.blurStatus.className = 'tile-badge ' + (data.blur_status === 'PASS' ? 'pass' : 'detected');
    }

    if (this.exposureStatus && data.exposure_status) {
      this.exposureStatus.textContent = data.exposure_status;
      this.exposureStatus.className = 'tile-badge ' + (data.exposure_status === 'OPTIMAL' ? 'optimal' : 'detected');
    }

    if (this.markerStatus && data.marker_status) {
      this.markerStatus.textContent = data.marker_status;
      this.markerStatus.className = 'tile-badge ' + (data.marker_status === 'DETECTED' ? 'pass' : 'detected');
    }

    // Real-time calculated optical dimensions
    const dims = data.live_dimensions || data.current_dimensions;
    if (dims && this.liveDimText) {
      this.liveDimText.textContent = `H: ${dims.height} cm • W: ${dims.width} cm • D: ${dims.depth} cm`;
      
      const hEl = document.getElementById('dim-height');
      const wEl = document.getElementById('dim-width');
      const dEl = document.getElementById('dim-depth');
      if (hEl) hEl.textContent = `${dims.height} cm`;
      if (wEl) wEl.textContent = `${dims.width} cm`;
      if (dEl) dEl.textContent = `${dims.depth} cm`;
    }

    if (data.is_scanning) {
      const scanPill = document.getElementById('global-scan-status');
      if (scanPill) {
        scanPill.textContent = '● SCANNING';
        scanPill.className = 'status-pill scanning';
      }
    } else if (this.btnStartScan) {
      this.btnStartScan.disabled = false;
      this.btnStartScan.textContent = "🚀 START 360° CAPTURE & PROCESS";
    }
  }

  onCaptureProgress(frameData) {
    if (this.angleVal) this.angleVal.textContent = `${String(frameData.angle).padStart(3, '0')}°`;
    if (this.capturedVal) this.capturedVal.textContent = `${frameData.current_frame} / ${frameData.total_frames}`;
    if (this.blurStatus) this.blurStatus.textContent = `${frameData.blur_status} (${frameData.blur_score || ''})`;
    if (this.exposureStatus) this.exposureStatus.textContent = frameData.exposure_status;
    if (this.markerStatus) this.markerStatus.textContent = frameData.marker_status;

    if (frameData.live_dimensions && this.liveDimText) {
      const d = frameData.live_dimensions;
      this.liveDimText.textContent = `H: ${d.height} cm • W: ${d.width} cm • D: ${d.depth} cm`;
    }

    if (frameData.frame_preview && this.feedImg && !this.browserStream) {
      this.feedImg.src = frameData.frame_preview;
    }

    // Add thumbnail to live reel if exists
    const filmstrip = document.getElementById('filmstrip-reel');
    if (filmstrip && frameData.frame_preview) {
      const thumb = document.createElement('img');
      thumb.src = frameData.frame_preview;
      thumb.alt = `Frame ${frameData.current_frame}`;
      thumb.className = 'reel-thumb';
      thumb.title = `Frame #${frameData.current_frame} (${frameData.angle}°)`;
      filmstrip.appendChild(thumb);
      filmstrip.scrollLeft = filmstrip.scrollWidth;
    }
  }

  onScanCompleted(msg) {
    if (this.btnStartScan) {
      this.btnStartScan.disabled = false;
      this.btnStartScan.textContent = "🚀 START 360° CAPTURE & PROCESS";
    }
    const scanPill = document.getElementById('global-scan-status');
    if (scanPill) {
      scanPill.textContent = '● CAPTURE COMPLETE';
      scanPill.className = 'status-pill camera-connected';
    }
  }
}
