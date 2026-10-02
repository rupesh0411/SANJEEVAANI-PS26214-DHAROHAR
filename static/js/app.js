/**
 * Main Application Orchestrator:
 * Manages:
 * - Real-time WebSocket connectivity & live broadcast distribution
 * - System KPI stats update
 * - Artifact switching (DH-IND-0001 .. DH-IND-0005)
 * - LIVE HARDWARE MODE vs DEMO MODE toggle
 * - 10-Second Judge Quick Pitch Modal
 * - Tourist Phone Passport QR & Live Mobile Simulator Modal
 */

import { Viewer3DController } from './viewer_3d.js';
import { HeritageMapController } from './heritage_map.js';
import { CulturalIntelController } from './cultural_intel.js';
import { ScannerStudioController } from './scanner_studio.js';
import { VerificationController } from './verification_ctrl.js';

class DigitalHeritageApp {
  constructor() {
    this.ws = null;
    this.artifacts = [];
    this.activeArtifact = null;

    // Sub-controllers
    this.viewer3D = new Viewer3DController();
    this.heritageMap = new HeritageMapController();
    this.culturalIntel = new CulturalIntelController();
    this.verificationCtrl = new VerificationController((updated) => this.onVerificationUpdated(updated));
    this.scannerStudio = new ScannerStudioController((msg) => this.sendWS(msg));

    this.initWebSocket();
    this.initUI();
    this.initTouristModalControls();
  }

  initUI() {
    // Mode switcher buttons
    document.getElementById('mode-live-hw')?.addEventListener('click', () => this.setMode(false));
    document.getElementById('mode-demo')?.addEventListener('click', () => this.setMode(true));

    // Artifact Switcher Dropdown
    const selector = document.getElementById('artifact-selector');
    if (selector) {
      selector.addEventListener('change', (e) => {
        this.selectArtifact(e.target.value);
      });
    }

    // 10-Second Judge Pitch Modal
    const pitchModal = document.getElementById('modal-pitch');
    document.getElementById('btn-open-pitch')?.addEventListener('click', () => {
      pitchModal?.showModal();
    });
    document.getElementById('btn-close-pitch')?.addEventListener('click', () => {
      pitchModal?.close();
    });

    pitchModal?.addEventListener('click', (e) => {
      if (e.target === pitchModal) pitchModal.close();
    });
  }

  initTouristModalControls() {
    const touristModal = document.getElementById('modal-tourist-phone');
    document.getElementById('btn-close-tourist-phone')?.addEventListener('click', () => {
      touristModal?.close();
    });

    touristModal?.addEventListener('click', (e) => {
      if (e.target === touristModal) touristModal.close();
    });

    // Copy link button
    document.getElementById('btn-copy-tourist-link')?.addEventListener('click', (e) => {
      const linkEl = document.getElementById('tourist-phone-lan-url');
      if (linkEl && linkEl.href) {
        navigator.clipboard.writeText(linkEl.href).then(() => {
          const originalText = e.target.textContent;
          e.target.textContent = "✓ COPIED!";
          setTimeout(() => { e.target.textContent = originalText; }, 2000);
        }).catch(err => {
          prompt("Copy this URL for Tourist Phone:", linkEl.href);
        });
      }
    });
  }

  async openTouristPhoneModal(artifactId) {
    const modal = document.getElementById('modal-tourist-phone');
    if (!modal) return;

    try {
      const res = await fetch(`/api/tourist-qr/${artifactId}`);
      if (!res.ok) throw new Error("Could not fetch QR details");
      const data = await res.json();

      // Update titles and badge
      this.setText('tourist-modal-art-name', `${data.artifact_name} (${data.artifact_id})`);
      const vBadge = document.getElementById('tourist-modal-verif-badge');
      if (vBadge) vBadge.textContent = `● ${data.verification_status}`;

      // Update links
      const lanLink = document.getElementById('tourist-phone-lan-url');
      if (lanLink) {
        lanLink.href = data.tourist_phone_url;
        lanLink.textContent = data.tourist_phone_url;
      }

      const openTabBtn = document.getElementById('btn-open-passport-tab');
      if (openTabBtn) {
        openTabBtn.href = `/passport.html?id=${artifactId}`;
      }

      // Update dimensions text
      const d = data.dimensions || {};
      const dimsText = d.height ? `${d.width} cm (W) × ${d.height} cm (H) × ${d.depth} cm (D) [${d.scale_mode || 'SCALED'}]` : 'Calibrated via ArUco 50mm Standard';
      this.setText('tourist-modal-dims', dimsText);

      // Direct server-rendered QR image (guaranteed to render immediately)
      const qrImg = document.getElementById('tourist-qr-img');
      if (qrImg) {
        qrImg.src = `/api/tourist-qr/${artifactId}/qr.png?t=${Date.now()}`;
      }
      const qrThumb = document.getElementById('scanner-qr-thumb');
      if (qrThumb) {
        qrThumb.src = `/api/tourist-qr/${artifactId}/qr.png?t=${Date.now()}`;
      }
      const tabQrImg = document.getElementById('tab-qr-img');
      if (tabQrImg) {
        tabQrImg.src = `/api/tourist-qr/${artifactId}/qr.png?t=${Date.now()}`;
      }

      // Update live iframe inside the phone simulator bezel
      const iframe = document.getElementById('tourist-simulator-iframe');
      if (iframe) {
        iframe.src = `/passport.html?id=${artifactId}&t=${Date.now()}`;
      }

      modal.showModal();
    } catch (e) {
      console.error("Error opening tourist phone modal:", e);
    }
  }

  initWebSocket() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;

    this.ws = new WebSocket(wsUrl);

    this.ws.onopen = () => {
      console.log("[WS] Connected to Heritage Command Center WebSocket.");
      const indicator = document.getElementById('ws-sync-indicator');
      if (indicator) indicator.textContent = 'LIVE SYNC';
    };

    this.ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        this.handleWSMessage(msg);
      } catch (err) {
        console.error("WS Parse error:", err);
      }
    };

    this.ws.onclose = () => {
      console.warn("[WS] Disconnected. Reconnecting in 2 seconds...");
      setTimeout(() => this.initWebSocket(), 2000);
    };
  }

  sendWS(data) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    }
  }

  handleWSMessage(msg) {
    switch (msg.type) {
      case 'INITIAL_SYNC':
        this.artifacts = msg.artifacts || [];
        this.populateArtifactDropdown();
        this.updateKPIs(msg.kpi);
        this.setActiveArtifact(msg.active_artifact);
        this.scannerStudio.updateTelemetry(msg.status);
        this.updateModeUI(msg.status?.demo_mode);
        break;

      case 'SCAN_TELEMETRY':
      case 'HARDWARE_STATUS':
        this.scannerStudio.updateTelemetry(msg.data);
        this.updateModeUI(msg.data?.demo_mode);
        break;

      case 'CAPTURE_PROGRESS':
        this.scannerStudio.onCaptureProgress(msg);
        break;

      case 'SCAN_COMPLETED':
        this.scannerStudio.onScanCompleted(msg);
        this.refreshKPIs();
        break;

      case 'TOURIST_PASSPORT_READY':
        // Auto-launch the Tourist Phone Modal when processing is complete!
        const autoLaunch = document.getElementById('chk-auto-tourist-qr');
        if (!autoLaunch || autoLaunch.checked) {
          this.openTouristPhoneModal(msg.artifact_id);
        }
        this.refreshKPIs();
        break;

      case '3D_RECONSTRUCTION_PROGRESS':
        this.viewer3D.updateProgress(msg.stage, msg.progress, msg.message);
        const pill3d = document.getElementById('global-3d-status');
        if (pill3d) {
          pill3d.textContent = `● 3D: ${msg.progress}%`;
          pill3d.className = 'status-pill processing-3d';
        }
        break;

      case 'ARTIFACT_UPDATED':
      case 'ACTIVE_ARTIFACT_CHANGED':
        if (msg.artifact_id === this.activeArtifact?.id) {
          this.setActiveArtifact(msg.data);
        }
        this.refreshKPIs();
        break;

      case 'VERIFICATION_CHANGED':
        if (msg.artifact_id === this.activeArtifact?.id) {
          this.setActiveArtifact(msg.data);
        }
        this.refreshKPIs();
        break;
    }
  }

  async setMode(demoModeEnabled) {
    try {
      const res = await fetch('/api/mode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ demo_mode: demoModeEnabled })
      });
      if (res.ok) {
        this.updateModeUI(demoModeEnabled);
      }
    } catch (e) {
      console.error(e);
    }
  }

  updateModeUI(isDemo) {
    const liveBtn = document.getElementById('mode-live-hw');
    const demoBtn = document.getElementById('mode-demo');
    const banner = document.getElementById('demo-mode-indicator-bar');

    if (liveBtn && demoBtn) {
      if (isDemo) {
        liveBtn.classList.remove('active');
        demoBtn.classList.add('active', 'demo-active');
        if (banner) banner.style.display = 'flex';
      } else {
        liveBtn.classList.add('active');
        demoBtn.classList.remove('active', 'demo-active');
        if (banner) banner.style.display = 'none';
      }
    }
  }

  populateArtifactDropdown() {
    const selector = document.getElementById('artifact-selector');
    if (!selector) return;

    selector.innerHTML = '';
    this.artifacts.forEach(art => {
      const opt = document.createElement('option');
      opt.value = art.id;
      opt.textContent = `${art.id} - ${art.name} (${art.region})`;
      selector.appendChild(opt);
    });
  }

  async selectArtifact(artifactId) {
    try {
      const res = await fetch(`/api/artifacts/${artifactId}`);
      if (res.ok) {
        const art = await res.json();
        this.setActiveArtifact(art);
      }
    } catch (e) {
      console.error(e);
    }
  }

  setActiveArtifact(artifact) {
    if (!artifact) return;
    this.activeArtifact = artifact;

    // Header pills
    const idEl = document.getElementById('active-artifact-id-text');
    const nameEl = document.getElementById('active-artifact-name-text');
    if (idEl) idEl.textContent = artifact.id;
    if (nameEl) nameEl.textContent = artifact.name;

    const selector = document.getElementById('artifact-selector');
    if (selector && selector.value !== artifact.id) {
      selector.value = artifact.id;
    }

    // 3D Status Pill
    const pill3d = document.getElementById('global-3d-status');
    if (pill3d) {
      if (artifact.3d_status === 'COMPLETED') {
        pill3d.textContent = '● 3D MODEL READY';
        pill3d.className = 'status-pill camera-connected';
      } else {
        pill3d.textContent = '● 3D PROCESSING';
        pill3d.className = 'status-pill processing-3d';
      }
    }

    // Delegate to controllers
    this.viewer3D.loadModel(artifact["3d_model_url"], artifact);
    this.culturalIntel.renderArtifact(artifact);
    this.verificationCtrl.updateUI(artifact);
    this.heritageMap.renderArtifactLocations(artifact);

    // Update QR image previews
    const qrThumb = document.getElementById('scanner-qr-thumb');
    if (qrThumb) qrThumb.src = `/api/tourist-qr/${artifact.id}/qr.png?t=${Date.now()}`;
    const tabQrImg = document.getElementById('tab-qr-img');
    if (tabQrImg) tabQrImg.src = `/api/tourist-qr/${artifact.id}/qr.png?t=${Date.now()}`;

    // Update 10-second pitch modal dynamic texts
    this.updatePitchAnswers(artifact);
  }

  updatePitchAnswers(art) {
    document.getElementById('pitch-q1')?.setAttribute('title', art.name);
    this.setText('pitch-q1', `${art.name} (${art.artifact_type})`);
    this.setText('pitch-q2', `${art.region} - ${art.community}`);
    this.setText('pitch-q3', `${art.photo_gallery?.length || 36} Photogrammetric Frames (360°)`);
    this.setText('pitch-q4', art["3d_model_url"] ? 'Watertight Manifold GLB with 2K PBR Textures' : 'Reconstruction In Progress');
    this.setText('pitch-q5', `${art.dimensions?.height} × ${art.dimensions?.width} × ${art.dimensions?.depth} cm [${art.scale_status}]`);
    this.setText('pitch-q6', art.cultural_significance?.slice(0, 100) + '...');
    this.setText('pitch-q7', `${art.contributor} (${art.oral_knowledge?.speaker_role || 'Artisan'})`);
    this.setText('pitch-q8', `${art.map_data?.cultural_origin?.name} (Display: ${art.map_data?.current_display?.name})`);
    this.setText('pitch-q9', `${art.verification_status} (Audit trail preserved)`);
    this.setText('pitch-q10', art.dimensions?.validation_status === 'VALIDATED' ? 'Caliper Validated' : 'Physical Vernier Caliper Entry Pending');
    this.setText('pitch-q11', `Yes, via Mobile Digital Passport (${art.passport_url})`);
  }

  updateKPIs(kpi) {
    if (!kpi) return;
    this.setText('kpi-total-artifacts', kpi.total_artifacts);
    this.setText('kpi-scanned-today', kpi.scanned_today);
    this.setText('kpi-3d-models', kpi.models_3d);
    this.setText('kpi-pending-verif', kpi.pending_verification);
    this.setText('kpi-community-records', kpi.community_records);
    this.setText('kpi-institution-verified', kpi.institution_verified);
  }

  async refreshKPIs() {
    try {
      const res = await fetch('/api/kpi');
      if (res.ok) {
        const data = await res.json();
        this.updateKPIs(data);
      }
    } catch (e) {
      console.error(e);
    }
  }

  onVerificationUpdated(artifact) {
    this.setActiveArtifact(artifact);
  }

  setText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  }
}

// Instantiate on DOM load
window.addEventListener('DOMContentLoaded', () => {
  window.heritageApp = new DigitalHeritageApp();
});
