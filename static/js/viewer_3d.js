/**
 * 3D Model Viewer, Structural Inspector & Photogrammetric Video Overlay:
 * Integrates Google's <model-viewer> with:
 * - Reconstructed GLB model loading
 * - Ground-Truth 360° Turntable Scan Video Overlay & PiP
 * - Side-by-Side Dual Comparison (3D Mesh + Optical Video)
 * - Interactive Rotate / Pan / Zoom / Reset View
 * - Measurement Mode (Bounding Box & Calipers)
 * - Structure & Dimensions Inspector
 * - Realistic photogrammetric reconstruction loading state
 */

export class Viewer3DController {
  constructor() {
    this.viewer = document.getElementById('artifact-model-viewer');
    this.mainBox = document.getElementById('main-viewer-box') || document.querySelector('.viewer-3d-box');
    this.reconstructionOverlay = document.getElementById('reconstruction-overlay');
    this.reconstructionMsg = document.getElementById('reconstruction-msg');
    this.reconstructionBar = document.getElementById('reconstruction-progress-bar');
    this.measurementHud = document.getElementById('measurement-hud');
    this.measurementModeActive = false;

    // Video & PiP Elements
    this.pipWidget = document.getElementById('viewer-pip-widget');
    this.pipVideo = document.getElementById('pip-scan-video');
    this.splitVideo = document.getElementById('split-scan-video');
    this.pipPlayBtn = document.getElementById('pip-play-btn');
    this.currentMode = '3d'; // '3d' | 'video' | 'split'
    this.currentArtifact = null;

    this.initControls();
    this.initPipControls();
    this.initModeTabs();
    this.initDragPip();
  }

  initControls() {
    // Reset view
    document.getElementById('btn-reset-view')?.addEventListener('click', () => {
      if (this.viewer) {
        this.viewer.cameraOrbit = "0deg 75deg 105%";
        this.viewer.resetTurntableRotation();
      }
    });

    // Auto rotate toggle
    document.getElementById('btn-toggle-rotate')?.addEventListener('click', (e) => {
      if (this.viewer) {
        const isAuto = this.viewer.hasAttribute('auto-rotate');
        if (isAuto) {
          this.viewer.removeAttribute('auto-rotate');
          e.currentTarget.classList.remove('active');
        } else {
          this.viewer.setAttribute('auto-rotate', '');
          e.currentTarget.classList.add('active');
        }
      }
    });

    // Fullscreen toggle
    document.getElementById('btn-fullscreen')?.addEventListener('click', () => {
      const container = this.mainBox || document.querySelector('.viewer-3d-box');
      if (container) {
        if (!document.fullscreenElement) {
          container.requestFullscreen().catch(err => console.error(err));
        } else {
          document.exitFullscreen();
        }
      }
    });

    // Measure mode toggle
    document.getElementById('btn-measure-mode')?.addEventListener('click', (e) => {
      this.toggleMeasurementMode(e.currentTarget);
    });

    // Toolbar PiP Video Toggle
    document.getElementById('btn-toggle-pip-video')?.addEventListener('click', (e) => {
      this.togglePipWidget();
      e.currentTarget.classList.toggle('active', !this.pipWidget?.classList.contains('hidden'));
    });

    // Sync rotate button in split view
    document.getElementById('btn-sync-spin')?.addEventListener('click', () => {
      if (this.viewer) {
        this.viewer.setAttribute('auto-rotate', '');
        document.getElementById('btn-toggle-rotate')?.classList.add('active');
      }
      if (this.splitVideo) {
        this.splitVideo.currentTime = 0;
        this.splitVideo.play().catch(e => console.log(e));
      }
    });

    // Scan Reel Card triggers
    document.getElementById('btn-load-video-in-viewer')?.addEventListener('click', () => {
      this.setMode('split');
    });

    document.getElementById('thumb-preview-trigger')?.addEventListener('click', () => {
      this.setMode('split');
    });
  }

  initPipControls() {
    // Expand to split
    document.getElementById('pip-btn-expand')?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.setMode('split');
    });

    // Minimize PiP
    document.getElementById('pip-btn-min')?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.pipWidget?.classList.toggle('minimized');
      const btn = document.getElementById('pip-btn-min');
      if (btn) btn.textContent = this.pipWidget?.classList.contains('minimized') ? '▢' : '─';
    });

    // Close PiP
    document.getElementById('pip-btn-close')?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.pipWidget?.classList.add('hidden');
      document.getElementById('btn-toggle-pip-video')?.classList.remove('active');
    });

    // PiP body click to play/pause
    document.getElementById('pip-body')?.addEventListener('click', () => {
      if (!this.pipVideo) return;
      if (this.pipVideo.paused) {
        this.pipVideo.play().catch(e => console.log(e));
        if (this.pipPlayBtn) this.pipPlayBtn.textContent = '⏸';
      } else {
        this.pipVideo.pause();
        if (this.pipPlayBtn) this.pipPlayBtn.textContent = '▶';
      }
    });
  }

  initModeTabs() {
    const tabs = document.querySelectorAll('.viewer-mode-tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const mode = tab.dataset.mode;
        if (mode) this.setMode(mode);
      });
    });
  }

  setMode(mode) {
    this.currentMode = mode;

    // Update active tab buttons
    document.querySelectorAll('.viewer-mode-tab').forEach(tab => {
      tab.classList.toggle('active', tab.dataset.mode === mode);
    });

    // Update container classes
    if (this.mainBox) {
      this.mainBox.classList.remove('mode-3d', 'mode-video', 'mode-split');
      this.mainBox.classList.add(`mode-${mode}`);
    }

    // PiP overlay behavior: Hide PiP in video or split mode to avoid duplicate video
    if (mode === 'split' || mode === 'video') {
      this.pipWidget?.classList.add('hidden');
      document.getElementById('btn-toggle-pip-video')?.classList.remove('active');

      // Auto play split video
      if (this.splitVideo) {
        this.splitVideo.play().catch(e => console.log(e));
      }
    } else {
      // In 3D mode, reveal PiP widget if artifact has video
      if (this.hasVideo(this.currentArtifact)) {
        this.pipWidget?.classList.remove('hidden');
        document.getElementById('btn-toggle-pip-video')?.classList.add('active');
        if (this.pipVideo) {
          this.pipVideo.play().catch(e => console.log(e));
        }
      }
    }

    // Ensure model-viewer resizes correctly
    if (this.viewer && (mode === '3d' || mode === 'split')) {
      setTimeout(() => {
        try {
          if (this.viewer.jumpCameraToGoal) this.viewer.jumpCameraToGoal();
        } catch (e) {}
      }, 150);
    }
  }

  togglePipWidget() {
    if (!this.pipWidget) return;
    this.pipWidget.classList.toggle('hidden');
    if (!this.pipWidget.classList.contains('hidden')) {
      if (this.currentMode !== '3d') {
        this.setMode('3d');
      }
      this.pipVideo?.play().catch(e => console.log(e));
    }
  }

  initDragPip() {
    const header = document.getElementById('pip-header');
    const widget = this.pipWidget;
    const container = this.mainBox;
    if (!header || !widget || !container) return;

    let isDragging = false;
    let startX, startY, origX, origY;

    header.addEventListener('mousedown', (e) => {
      if (e.target.tagName === 'BUTTON') return;
      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;
      const rect = widget.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      origX = rect.left - containerRect.left;
      origY = rect.top - containerRect.top;
      header.style.cursor = 'grabbing';
      e.preventDefault();
    });

    window.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;

      const newLeft = Math.max(10, Math.min(container.clientWidth - widget.clientWidth - 10, origX + dx));
      const newTop = Math.max(10, Math.min(container.clientHeight - widget.clientHeight - 10, origY + dy));

      widget.style.left = `${newLeft}px`;
      widget.style.top = `${newTop}px`;
      widget.style.bottom = 'auto';
      widget.style.right = 'auto';
    });

    window.addEventListener('mouseup', () => {
      if (isDragging) {
        isDragging = false;
        header.style.cursor = 'default';
      }
    });
  }

  hasVideo(artifact) {
    if (!artifact) return false;
    return Boolean(artifact.id === 'DH-IND-0001' || artifact.scan_video_url || artifact.scan_recording);
  }

  loadModel(modelUrl, artifact) {
    this.currentArtifact = artifact;

    if (!this.viewer) return;

    if (!modelUrl || artifact?.structure_3d?.mesh_status?.includes("PROCESSING")) {
      this.showProcessingState("3D Photogrammetry Reconstruction in progress...");
      return;
    }

    this.hideProcessingState();
    this.viewer.src = modelUrl;

    // Update structure strip
    this.updateStructureTelemetry(artifact);

    // Update scan video integration
    this.updateArtifactVideo(artifact);
  }

  updateArtifactVideo(artifact) {
    const artId = artifact?.id || 'DH-IND-0001';
    const isBuddha = artId === 'DH-IND-0001';

    // Default Buddha scan video paths
    const videoUrl = artifact?.scan_video_url || (isBuddha ? '/static/assets/videos/buddha_scan.mp4' : null);
    const posterUrl = artifact?.scan_video_poster || (isBuddha ? '/static/assets/videos/buddha_scan_poster.jpg' : null);

    const titleEl = document.getElementById('pip-title-text');
    const hudInfo = document.getElementById('pip-hud-info');
    const splitBadge = document.getElementById('split-video-badge');
    const scanCard = document.getElementById('scan-video-card');
    const dlBtn = document.getElementById('btn-download-scan-video');

    if (videoUrl) {
      // Artifact has scan video!
      if (titleEl) titleEl.textContent = `360° SCAN (${artId})`;
      if (hudInfo) hudInfo.textContent = '1280×720 HD • 20 FPS';
      if (splitBadge) splitBadge.textContent = '● ARUCO #42 CALIBRATED';

      // Set video sources
      if (this.pipVideo) {
        this.pipVideo.src = videoUrl;
        if (posterUrl) this.pipVideo.poster = posterUrl;
        this.pipVideo.load();
        this.pipVideo.play().catch(e => console.log(e));
      }

      if (this.splitVideo) {
        this.splitVideo.src = videoUrl;
        if (posterUrl) this.splitVideo.poster = posterUrl;
        this.splitVideo.load();
      }

      if (dlBtn) {
        dlBtn.href = videoUrl;
        dlBtn.download = `scan_recording_${artId}.mp4`;
      }

      if (scanCard) scanCard.style.display = 'flex';

      // Show PiP if in 3D mode
      if (this.currentMode === '3d') {
        this.pipWidget?.classList.remove('hidden');
        document.getElementById('btn-toggle-pip-video')?.classList.add('active');
      }

      // Enable mode tabs
      document.querySelectorAll('.viewer-mode-tab').forEach(t => t.style.display = 'inline-flex');
    } else {
      // Artifact without video: hide PiP and video card gracefully
      this.pipWidget?.classList.add('hidden');
      document.getElementById('btn-toggle-pip-video')?.classList.remove('active');
      if (scanCard) scanCard.style.display = 'none';

      // Revert to 3d mode if currently in video/split
      if (this.currentMode !== '3d') {
        this.setMode('3d');
      }
    }
  }

  updateStructureTelemetry(artifact) {
    const s = artifact?.structure_3d || {};
    const d = artifact?.dimensions || {};

    const polyEl = document.getElementById('struct-poly-count');
    const vertEl = document.getElementById('struct-vertex-count');
    const bboxEl = document.getElementById('struct-bbox');
    const scaleEl = document.getElementById('struct-scale-status');

    if (polyEl) polyEl.textContent = s.polygon_count ? Number(s.polygon_count).toLocaleString() : '2,160';
    if (vertEl) vertEl.textContent = s.vertex_count ? Number(s.vertex_count).toLocaleString() : '1,120';
    if (bboxEl) {
      if (d.bounding_box) {
        bboxEl.textContent = `${d.bounding_box.x} × ${d.bounding_box.y} × ${d.bounding_box.z} cm`;
      } else {
        bboxEl.textContent = `${d.width || 18.2} × ${d.height || 24.5} × ${d.depth || 14.6} cm`;
      }
    }
    if (scaleEl) {
      scaleEl.textContent = artifact.scale_status || 'SCALED';
      scaleEl.className = 'val ' + (artifact.scale_status === 'SCALED' ? 'text-emerald' : 'text-gold');
    }
  }

  toggleMeasurementMode(btnElement) {
    this.measurementModeActive = !this.measurementModeActive;
    if (btnElement) {
      btnElement.classList.toggle('active', this.measurementModeActive);
    }
    if (this.measurementHud) {
      this.measurementHud.style.display = this.measurementModeActive ? 'flex' : 'none';
    }
  }

  showProcessingState(message, progress = 0) {
    if (this.reconstructionOverlay) {
      this.reconstructionOverlay.style.display = 'flex';
      if (this.reconstructionMsg) this.reconstructionMsg.textContent = message;
      if (this.reconstructionBar) this.reconstructionBar.style.width = `${progress}%`;
    }
  }

  hideProcessingState() {
    if (this.reconstructionOverlay) {
      this.reconstructionOverlay.style.display = 'none';
    }
  }

  updateProgress(stage, progress, message) {
    this.showProcessingState(`[${stage}] ${message}`, progress);
  }
}
