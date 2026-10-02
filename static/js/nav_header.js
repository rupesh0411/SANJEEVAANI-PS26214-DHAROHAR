/**
 * Global Navigation, Header HUD & Real-time State Hub:
 * Provides unified cross-page header synchronization:
 * - Active Artifact selection (?id=DH-IND-XXXX & localStorage sync)
 * - WebSocket real-time broadcast listener
 * - Hardware vs Demo Mode switcher
 * - Camera connection indicator
 * - 10-Second Judge Quick Pitch Briefing modal
 * - Tourist Phone Passport QR & Simulator modal
 */

export class HeritageNavHeader {
  constructor(activePageName = 'dashboard') {
    this.activePage = activePageName;
    this.ws = null;
    this.artifacts = [];
    this.activeArtifactId = this.getUrlArtifactId() || localStorage.getItem('dh_active_artifact_id') || 'DH-IND-0001';
    this.activeArtifact = null;
    this.demoMode = true;
    this.scannerStream = null;
    this.scannerLoopTimer = null;
    this.isScanningActive = false;
    this.initTheme();
    this.initHeaderElements();
    this.initModals();
    this.initPortalScanner();
    this.initWebSocket();
    this.loadInitialArtifact();
  }

  getUrlArtifactId() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id');
  }

  setUrlArtifactId(id) {
    const url = new URL(window.location.href);
    url.searchParams.set('id', id);
    window.history.replaceState({}, '', url.toString());
  }

  async loadInitialArtifact() {
    try {
      const res = await fetch('/api/artifacts');
      if (res.ok) {
        this.artifacts = await res.json();
        this.populateArtifactDropdown();
        const found = this.artifacts.find(a => a.id === this.activeArtifactId) || this.artifacts[0];
        if (found) {
          this.setActiveArtifact(found);
        }
      }
    } catch (e) {
      console.warn("Could not load artifacts list:", e);
    }
  }

  initHeaderElements() {
    // Mode toggles
    document.getElementById('mode-live-hw')?.addEventListener('click', () => this.setMode(false));
    document.getElementById('mode-demo')?.addEventListener('click', () => this.setMode(true));

    // Artifact Dropdown
    const selector = document.getElementById('artifact-selector');
    if (selector) {
      selector.value = this.activeArtifactId;
      selector.addEventListener('change', (e) => {
        this.selectArtifact(e.target.value);
      });
    }

    // Highlight active nav link
    document.querySelectorAll('.main-navigation .nav-link').forEach(link => {
      const pageTarget = link.dataset.page;
      if (pageTarget === this.activePage) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }

  initTheme() {
    // Default theme is light as requested
    const savedTheme = localStorage.getItem('dh_theme') || 'light';
    this.applyTheme(savedTheme);
    this.setupThemeToggle(savedTheme);
  }

  setupThemeToggle(currentTheme) {
    let toggleBtn = document.getElementById('btn-theme-toggle');
    if (!toggleBtn) {
      const headerActions = document.querySelector('.header-actions');
      if (headerActions) {
        toggleBtn = document.createElement('button');
        toggleBtn.id = 'btn-theme-toggle';
        toggleBtn.className = 'theme-toggle-btn';
        toggleBtn.title = 'Toggle Light / Dark Mode';
        toggleBtn.setAttribute('aria-label', 'Toggle Theme');
        headerActions.insertBefore(toggleBtn, headerActions.firstChild);
      }
    }

    if (toggleBtn) {
      this.updateThemeButtonUI(toggleBtn, currentTheme);
      toggleBtn.onclick = () => {
        const active = document.documentElement.getAttribute('data-theme') || 'light';
        const next = active === 'dark' ? 'light' : 'dark';
        this.applyTheme(next);
      };
    }
  }

  updateThemeButtonUI(btn, theme) {
    if (!btn) return;
    const isDark = theme === 'dark';
    btn.innerHTML = `<span class="theme-toggle-icon">${isDark ? '🌙' : '☀️'}</span> <span class="theme-toggle-text">${isDark ? 'DARK' : 'LIGHT'}</span>`;
    btn.setAttribute('title', isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme');
  }

  applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem('dh_theme', theme);
    } catch (e) {
      console.warn("Could not save theme to localStorage", e);
    }

    document.querySelectorAll('#btn-theme-toggle, .theme-toggle-btn').forEach(btn => {
      this.updateThemeButtonUI(btn, theme);
    });

    // Notify any reactive components (e.g. Heritage Map)
    window.dispatchEvent(new CustomEvent('heritage-theme-changed', { detail: { theme } }));
  }

  initModals() {
    // 10-Second Briefing Modal
    const pitchModal = document.getElementById('modal-pitch');
    document.getElementById('btn-open-pitch')?.addEventListener('click', () => {
      this.updatePitchAnswers(this.activeArtifact);
      pitchModal?.showModal();
    });
    document.getElementById('btn-close-pitch')?.addEventListener('click', () => {
      pitchModal?.close();
    });
    pitchModal?.addEventListener('click', (e) => {
      if (e.target === pitchModal) pitchModal.close();
    });

    // Tourist Phone Modal
    const touristModal = document.getElementById('modal-tourist-phone');
    document.getElementById('btn-close-tourist-phone')?.addEventListener('click', () => {
      touristModal?.close();
    });
    touristModal?.addEventListener('click', (e) => {
      if (e.target === touristModal) touristModal.close();
    });

    // Copy link
    document.getElementById('btn-copy-tourist-link')?.addEventListener('click', (e) => {
      const linkEl = document.getElementById('tourist-phone-lan-url');
      if (linkEl && linkEl.href) {
        navigator.clipboard.writeText(linkEl.href).then(() => {
          const orig = e.target.textContent;
          e.target.textContent = "✓ COPIED!";
          setTimeout(() => { e.target.textContent = orig; }, 2000);
        }).catch(() => {
          prompt("Copy URL:", linkEl.href);
        });
      }
    });

    // Any button triggering tourist modal
    document.querySelectorAll('.trigger-tourist-phone').forEach(btn => {
      btn.addEventListener('click', () => {
        this.openTouristPhoneModal(this.activeArtifactId);
      });
    });
  }

  populateArtifactDropdown() {
    const sel = document.getElementById('artifact-selector');
    if (!sel || !this.artifacts.length) return;
    sel.innerHTML = '';
    this.artifacts.forEach(art => {
      const opt = document.createElement('option');
      opt.value = art.id;
      opt.textContent = `${art.id} - ${art.name}`;
      if (art.id === this.activeArtifactId) opt.selected = true;
      sel.appendChild(opt);
    });
  }

  selectArtifact(id) {
    this.activeArtifactId = id;
    localStorage.setItem('dh_active_artifact_id', id);
    this.setUrlArtifactId(id);

    const art = this.artifacts.find(a => a.id === id);
    if (art) {
      this.setActiveArtifact(art);
    }

    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ action: 'SELECT_ARTIFACT', artifact_id: id }));
    }

    // Dispatch custom event for page controllers
    window.dispatchEvent(new CustomEvent('artifactChanged', { detail: { artifactId: id, artifact: art } }));
  }

  setActiveArtifact(art) {
    if (!art) return;
    this.activeArtifact = art;
    this.activeArtifactId = art.id;

    // Update Header Text Badges
    const idEl = document.getElementById('active-artifact-id-text');
    const nameEl = document.getElementById('active-artifact-name-text');
    if (idEl) idEl.textContent = art.id;
    if (nameEl) nameEl.textContent = art.name;

    // Update Dropdown
    const sel = document.getElementById('artifact-selector');
    if (sel && sel.value !== art.id) sel.value = art.id;

    // Update Verification badge in header
    const verifPill = document.getElementById('global-verif-status');
    if (verifPill) {
      verifPill.innerHTML = `<span class="dot-pulse"></span> ${art.verification_status || 'PENDING'}`;
      verifPill.className = 'status-pill ' + (art.verification_status === 'INSTITUTION-VERIFIED' ? 'verified' : 'pending');
    }

    // Update 3D badge in header
    const d3Pill = document.getElementById('global-3d-status');
    if (d3Pill) {
      d3Pill.innerHTML = `<span class="dot-pulse"></span> 3D ${art["3d_status"] || 'READY'}`;
    }

    // Update passport links
    document.querySelectorAll('.passport-nav-link').forEach(link => {
      link.href = `/passport.html?id=${art.id}`;
    });

    this.updatePitchAnswers(art);
  }

  updatePitchAnswers(art) {
    if (!art) return;
    const d = art.dimensions || {};
    const dimsStr = d.height ? `${d.width} × ${d.height} × ${d.depth} cm [${d.scale_mode || 'SCALED'}]` : 'Calibrated via ArUco 50mm';
    const origin = art.map_data?.cultural_origin?.name || art.region || 'India';
    const display = art.map_data?.current_display?.name || 'National Museum';

    this.setText('pitch-q1', `${art.name} (${art.artifact_type})`);
    this.setText('pitch-q2', `${art.region} (${art.community || 'Artisan Guild'})`);
    this.setText('pitch-q3', '36 Multi-angle Photogrammetric Frames (360° turntable coverage)');
    this.setText('pitch-q4', `Watertight Manifold GLB Mesh (${art.structure_3d?.polygon_count || 2160} Polys, PBR Textures)`);
    this.setText('pitch-q5', dimsStr);
    this.setText('pitch-q6', art.cultural_significance || art.traditional_use || 'Sacred Cultural Artifact');
    this.setText('pitch-q7', `${art.oral_knowledge?.speaker || 'Master Artisan'} (${art.oral_knowledge?.community || 'Artisan Lineage'})`);
    this.setText('pitch-q8', `Origin: ${origin} • Display: ${display}`);
    this.setText('pitch-q9', `${art.verification_status || 'INSTITUTION-VERIFIED'} (Registry Entry Ratified)`);
    this.setText('pitch-q10', `Physical Caliper Validated (${art.caliper_validation?.caliper_height || d.height} cm)`);
    this.setText('pitch-q11', `Yes, via Mobile Digital Passport (/passport.html?id=${art.id})`);
  }

  setText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  }

  async setMode(demoModeEnabled) {
    try {
      const res = await fetch('/api/mode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ demo_mode: demoModeEnabled })
      });
      if (res.ok) {
        this.demoMode = demoModeEnabled;
        this.updateModeUI(demoModeEnabled);
      }
    } catch (e) {
      console.error("Error setting mode:", e);
    }
  }

  updateModeUI(isDemo) {
    const liveBtn = document.getElementById('mode-live-hw');
    const demoBtn = document.getElementById('mode-demo');
    const banner = document.getElementById('demo-mode-indicator-bar');

    if (liveBtn && demoBtn) {
      if (isDemo) {
        demoBtn.classList.add('demo-active');
        liveBtn.classList.remove('live-active');
        if (banner) {
          banner.style.display = 'flex';
          banner.innerHTML = `<span><strong>DEMO SIMULATION ACTIVE:</strong> Using precomputed photogrammetry rig stream and verified cultural telemetry. Switch to Live Hardware to engage physical webcams.</span>
            <span style="font-family: var(--font-mono); font-size: 0.7rem;">CALIBRATION: 50mm ArUco #42 LOCKED</span>`;
        }
      } else {
        liveBtn.classList.add('live-active');
        demoBtn.classList.remove('demo-active');
        if (banner) {
          banner.style.display = 'flex';
          banner.style.background = 'rgba(16, 185, 129, 0.15)';
          banner.style.borderColor = 'rgba(16, 185, 129, 0.3)';
          banner.style.color = '#10B981';
          banner.innerHTML = `<span><strong>LIVE HARDWARE ACTIVE:</strong> Connected to physical camera feed and optical metrology engine.</span>
            <span style="font-family: var(--font-mono); font-size: 0.7rem;">LIVE FPS: 16-24 • 1:1 METRIC SCALE</span>`;
        }
      }
    }

    const camPill = document.getElementById('global-camera-status');
    if (camPill) {
      camPill.innerHTML = `<span class="dot-pulse"></span> ${isDemo ? 'DEMO RIG READY' : 'LIVE CAMERA ACTIVE'}`;
      camPill.className = 'status-pill ' + (isDemo ? 'scanning' : 'camera-connected');
    }
  }

  async openTouristPhoneModal(artifactId) {
    const modal = document.getElementById('modal-tourist-phone');
    if (!modal) return;
    const artId = artifactId || this.activeArtifactId || 'DH-IND-0001';

    try {
      const res = await fetch(`/api/tourist-qr/${artId}`);
      if (!res.ok) throw new Error("Could not fetch QR details");
      const data = await res.json();

      this.setText('tourist-modal-art-name', `${data.artifact_name} (${data.artifact_id})`);
      const vBadge = document.getElementById('tourist-modal-verif-badge');
      if (vBadge) vBadge.textContent = `● ${data.verification_status}`;

      const lanLink = document.getElementById('tourist-phone-lan-url');
      if (lanLink) {
        lanLink.href = data.tourist_phone_url;
        lanLink.textContent = data.tourist_phone_url;
      }

      const openTabBtn = document.getElementById('btn-open-passport-tab');
      if (openTabBtn) {
        openTabBtn.href = `/passport.html?id=${artId}`;
      }

      const d = data.dimensions || {};
      const dimsText = d.height ? `${d.width} cm (W) × ${d.height} cm (H) × ${d.depth} cm (D) [${d.scale_mode || 'SCALED'}]` : 'Calibrated via ArUco 50mm Standard';
      this.setText('tourist-modal-dims', dimsText);

      const qrImg = document.getElementById('tourist-qr-img');
      if (qrImg) {
        qrImg.src = `/api/tourist-qr/${artId}/qr.png?t=${Date.now()}`;
      }

      const iframe = document.getElementById('tourist-simulator-iframe');
      if (iframe) {
        iframe.src = `/passport.html?id=${artId}&t=${Date.now()}`;
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
      setTimeout(() => this.initWebSocket(), 2000);
    };
  }

  handleWSMessage(msg) {
    switch (msg.type) {
      case 'INITIAL_SYNC':
        this.artifacts = msg.artifacts || [];
        this.populateArtifactDropdown();
        if (msg.active_artifact) this.setActiveArtifact(msg.active_artifact);
        this.updateModeUI(msg.status?.demo_mode);
        break;

      case 'HARDWARE_STATUS':
        this.updateModeUI(msg.data?.demo_mode);
        break;

      case 'ACTIVE_ARTIFACT_CHANGED':
      case 'ARTIFACT_UPDATED':
      case 'VERIFICATION_CHANGED':
        if (msg.artifact_id === this.activeArtifactId && msg.data) {
          this.setActiveArtifact(msg.data);
        }
        break;

      case 'TOURIST_PASSPORT_READY':
        // Auto-launch the Tourist Phone Modal when 3D scan completes
        this.openTouristPhoneModal(msg.artifact_id);
        break;
    }

    // Forward message to page-level listeners
    window.dispatchEvent(new CustomEvent('wsMessageReceived', { detail: msg }));
  }

  sendWS(data) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    }
  }

  // =====================================================================
  // ARTIFACT PORTAL SCANNER (CAMERA & QR ACCESS)
  // =====================================================================

  initPortalScanner() {
    // 1. Inject "SCAN TO ACCESS PORTAL" button in main navigation if not present
    const navInner = document.querySelector('.main-navigation .nav-inner');
    if (navInner && !document.getElementById('btn-open-portal-scanner')) {
      const scanBtn = document.createElement('button');
      scanBtn.id = 'btn-open-portal-scanner';
      scanBtn.className = 'btn-portal-scanner trigger-portal-scanner';
      scanBtn.title = 'Open Camera Scanner to Access Artifact Intelligence & Passport';
      scanBtn.innerHTML = '<span>📷 SCAN TO ACCESS PORTAL</span>';
      
      // Insert right before the artifact selector wrapper or at the end
      const selectorWrap = navInner.querySelector('div[style*="margin-left: auto"]');
      if (selectorWrap) {
        navInner.insertBefore(scanBtn, selectorWrap);
      } else {
        navInner.appendChild(scanBtn);
      }
    }

    // 2. Inject Portal Scanner Dialog Modal if not in document
    if (!document.getElementById('modal-portal-scanner')) {
      const modalHtml = `
      <dialog class="modal-portal-scanner" id="modal-portal-scanner">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-gold); padding-bottom: 0.75rem;">
          <div style="display: flex; align-items: center; gap: 0.6rem;">
            <span style="font-size: 1.4rem;">📷</span>
            <div>
              <h2 style="font-size: 1.15rem; color: var(--text-gold); font-weight: 800; margin: 0;">ARTIFACT PORTAL SCANNER</h2>
              <p style="font-size: 0.72rem; color: var(--cyan-hud); font-family: var(--font-mono); margin: 0;">OPTICAL TAG & QR CODE DECODER &bull; INSTANT HERITAGE ACCESS</p>
            </div>
          </div>
          <button class="btn-secondary" id="btn-close-portal-scanner" style="padding: 0.25rem 0.65rem;">✕ CLOSE</button>
        </div>

        <div style="margin-top: 1rem; position: relative;">
          <!-- Viewfinder Camera Area -->
          <div class="scanner-viewfinder-box">
            <video id="portal-scanner-video" class="scanner-video-feed" autoplay playsinline muted></video>
            <canvas id="portal-scanner-canvas" style="display: none;"></canvas>
            
            <div class="scan-laser-line"></div>
            <div class="viewfinder-reticle">
              <div class="viewfinder-corner corner-tl"></div>
              <div class="viewfinder-corner corner-tr"></div>
              <div class="viewfinder-corner corner-bl"></div>
              <div class="viewfinder-corner corner-br"></div>
              <div class="reticle-center-cross"></div>
            </div>

            <!-- Viewfinder HUD Tag -->
            <div style="position: absolute; bottom: 0.75rem; left: 0.75rem; right: 0.75rem; display: flex; justify-content: space-between; align-items: center; z-index: 6; pointer-events: none;">
              <span id="portal-scanner-status-tag" class="hud-telemetry-tag" style="background: rgba(11, 17, 32, 0.85); color: var(--cyan-hud); border-color: var(--cyan-hud);">
                ● SCANNING FOR ARTIFACT TAG...
              </span>
              <span style="font-size: 0.68rem; font-family: var(--font-mono); color: rgba(255,255,255,0.7); background: rgba(0,0,0,0.6); padding: 0.2rem 0.5rem; border-radius: 4px;">
                ALIGN QR IN RETICLE
              </span>
            </div>
          </div>

          <!-- Controls row -->
          <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 0.75rem; gap: 0.75rem; flex-wrap: wrap;">
            <div style="display: flex; gap: 0.5rem; align-items: center;">
              <label class="btn-secondary" style="cursor: pointer; padding: 0.35rem 0.75rem; font-size: 0.72rem; display: inline-flex; align-items: center; gap: 0.4rem;">
                📁 UPLOAD QR / PLACARD PHOTO
                <input type="file" id="portal-scanner-file" accept="image/*" style="display: none;">
              </label>
              <button id="btn-toggle-scanner-cam" class="btn-secondary" style="padding: 0.35rem 0.65rem; font-size: 0.72rem;">🔄 SWITCH CAMERA</button>
            </div>
            <div style="font-size: 0.7rem; color: var(--text-dim); font-family: var(--font-mono);">
              SUPPORTS: Museum QR Badges &bull; Visitor Passports &bull; ArUco Tags
            </div>
          </div>

          <!-- Quick Test Badges for instant evaluation -->
          <div style="margin-top: 0.85rem; padding: 0.75rem; background: rgba(15, 23, 42, 0.6); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm);">
            <div style="font-size: 0.68rem; font-family: var(--font-mono); color: var(--text-gold); text-transform: uppercase; margin-bottom: 0.4rem;">
              ⚡ QUICK-SCAN SIMULATOR (CLICK ANY REGISTERED ARTIFACT TAG TO TEST IMMEDIATELY):
            </div>
            <div id="quick-tags-container" style="display: flex; gap: 0.4rem; flex-wrap: wrap;"></div>
          </div>

          <!-- Detected Artifact Result Card -->
          <div id="scanner-result-box" style="display: none;" class="scanner-result-card">
            <img id="scanner-result-img" src="/static/assets/images/view_front.jpg" alt="Artifact Thumb" class="scanner-result-thumb">
            <div style="flex: 1; display: flex; flex-direction: column; gap: 0.35rem;">
              <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                <div>
                  <div style="font-size: 0.72rem; font-family: var(--font-mono); color: var(--antique-gold);" id="scanner-result-id">DH-IND-0001</div>
                  <h3 style="font-size: 1.05rem; color: #FFFFFF; font-weight: 700; margin: 0.15rem 0;" id="scanner-result-name">Artifact Name</h3>
                </div>
                <span id="scanner-result-verif" class="status-pill verified">● INSTITUTION-VERIFIED</span>
              </div>
              <div style="font-size: 0.75rem; color: var(--text-muted);" id="scanner-result-meta">
                Origin: Bastar, Chhattisgarh &bull; Traditional Metalwork
              </div>
              <div style="font-size: 0.72rem; font-family: var(--font-mono); color: var(--cyan-hud);" id="scanner-result-dims">
                H: 24.5 cm &bull; W: 18.2 cm &bull; D: 14.6 cm [SCALED]
              </div>
              <!-- Action Buttons to access the portal -->
              <div style="display: flex; gap: 0.4rem; flex-wrap: wrap; margin-top: 0.5rem;" id="scanner-action-buttons"></div>
            </div>
          </div>

        </div>
      </dialog>`;
      document.body.insertAdjacentHTML('beforeend', modalHtml);
    }

    // 3. Bind open/close and click handlers
    document.querySelectorAll('.trigger-portal-scanner').forEach(btn => {
      btn.addEventListener('click', () => this.openPortalScannerModal());
    });

    const modal = document.getElementById('modal-portal-scanner');
    document.getElementById('btn-close-portal-scanner')?.addEventListener('click', () => {
      this.closePortalScannerModal();
    });
    modal?.addEventListener('click', (e) => {
      if (e.target === modal) this.closePortalScannerModal();
    });

    // File input scan
    document.getElementById('portal-scanner-file')?.addEventListener('change', (e) => {
      const file = e.target.files?.[0];
      if (file) this.handleUploadedImageScan(file);
    });

    // Populate quick tags
    this.loadQuickTags();
  }

  async loadQuickTags() {
    try {
      const res = await fetch('/api/scan/quick-tags');
      if (res.ok) {
        const tags = await res.json();
        const container = document.getElementById('quick-tags-container');
        if (container) {
          container.innerHTML = '';
          tags.forEach(tag => {
            const chip = document.createElement('button');
            chip.className = 'quick-scan-tag-chip';
            chip.innerHTML = `<span>🏷️ ${tag.artifact_id}: ${tag.name.split(' ')[0]} ${tag.name.split(' ')[1] || ''}</span>`;
            chip.addEventListener('click', () => {
              this.simulateQuickTagScan(tag.artifact_id);
            });
            container.appendChild(chip);
          });
        }
      }
    } catch (e) {
      console.warn("Could not load quick tags:", e);
    }
  }

  async openPortalScannerModal() {
    const modal = document.getElementById('modal-portal-scanner');
    if (!modal) return;

    // Reset result box
    const resBox = document.getElementById('scanner-result-box');
    if (resBox) resBox.style.display = 'none';

    modal.showModal();
    await this.startCameraScanner();
  }

  closePortalScannerModal() {
    this.stopCameraScanner();
    const modal = document.getElementById('modal-portal-scanner');
    modal?.close();
  }

  async startCameraScanner() {
    const video = document.getElementById('portal-scanner-video');
    const statusTag = document.getElementById('portal-scanner-status-tag');
    if (!video) return;

    this.isScanningActive = true;

    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        this.scannerStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" }, width: { ideal: 1280 }, height: { ideal: 720 } }
        });
        video.srcObject = this.scannerStream;
        await video.play().catch(e => console.log(e));
        if (statusTag) {
          statusTag.textContent = "● LIVE CAMERA SCANNING & DETECTING...";
          statusTag.style.color = "var(--cyan-hud)";
          statusTag.style.borderColor = "var(--cyan-hud)";
        }
      } else {
        throw new Error("getUserMedia not supported");
      }
    } catch (err) {
      console.warn("Could not access camera for scanner, using fallback stream:", err);
      // Fallback: draw scanner studio feed or prompt image upload
      if (statusTag) {
        statusTag.textContent = "● WEBCAM OFFLINE - READY FOR PHOTO UPLOAD OR QUICK TAG";
        statusTag.style.color = "var(--text-gold)";
        statusTag.style.borderColor = "var(--text-gold)";
      }
    }

    // Start periodic scanning loop (every 300ms)
    if (this.scannerLoopTimer) clearInterval(this.scannerLoopTimer);
    this.scannerLoopTimer = setInterval(() => {
      if (this.isScanningActive) {
        this.scanCurrentFrame();
      }
    }, 350);
  }

  stopCameraScanner() {
    this.isScanningActive = false;
    if (this.scannerLoopTimer) {
      clearInterval(this.scannerLoopTimer);
      this.scannerLoopTimer = null;
    }
    if (this.scannerStream) {
      this.scannerStream.getTracks().forEach(t => t.stop());
      this.scannerStream = null;
    }
    const video = document.getElementById('portal-scanner-video');
    if (video) {
      video.srcObject = null;
    }
  }

  async scanCurrentFrame() {
    const video = document.getElementById('portal-scanner-video');
    const canvas = document.getElementById('portal-scanner-canvas');
    if (!video || !canvas || video.videoWidth === 0) return;

    canvas.width = 640;
    canvas.height = 480;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, 640, 480);
    const b64 = canvas.toDataURL('image/jpeg', 0.70);

    try {
      const res = await fetch('/api/scan/decode-qr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image_base64: b64 })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.detected && data.artifact) {
          this.handleScanSuccess(data);
        }
      }
    } catch (e) {
      // Ignore background loop network ticks
    }
  }

  async handleUploadedImageScan(file) {
    const statusTag = document.getElementById('portal-scanner-status-tag');
    if (statusTag) statusTag.textContent = "● ANALYZING UPLOADED IMAGE...";

    const reader = new FileReader();
    reader.onload = async (e) => {
      const b64 = e.target.result;
      try {
        const res = await fetch('/api/scan/decode-qr', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image_base64: b64 })
        });
        if (res.ok) {
          const data = await res.json();
          if (data.detected && data.artifact) {
            this.handleScanSuccess(data);
          } else {
            alert(data.message || "No recognized QR code or heritage badge found in this image. Try another photo or click a Quick Test Tag.");
            if (statusTag) statusTag.textContent = "● SCAN READY - ALIGN ARTIFACT TAG";
          }
        }
      } catch (err) {
        console.error(err);
      }
    };
    reader.readAsDataURL(file);
  }

  async simulateQuickTagScan(artifactId) {
    const statusTag = document.getElementById('portal-scanner-status-tag');
    if (statusTag) {
      statusTag.textContent = `● SCANNING TAG FOR ${artifactId}...`;
      statusTag.style.color = "var(--text-gold)";
    }

    try {
      const res = await fetch(`/api/artifacts/${artifactId}`);
      if (res.ok) {
        const art = await res.json();
        this.handleScanSuccess({
          detected: true,
          artifact_id: art.id,
          artifact: art
        });
      }
    } catch (e) {
      console.error(e);
    }
  }

  handleScanSuccess(result) {
    const art = result.artifact;
    if (!art) return;

    // Visual recognition confirmation
    const statusTag = document.getElementById('portal-scanner-status-tag');
    if (statusTag) {
      statusTag.textContent = `✓ ARTIFACT RECOGNIZED: ${art.name}`;
      statusTag.style.color = "#10B981";
      statusTag.style.borderColor = "#10B981";
    }

    // Populate Result Card
    const resBox = document.getElementById('scanner-result-box');
    const resImg = document.getElementById('scanner-result-img');
    const resId = document.getElementById('scanner-result-id');
    const resName = document.getElementById('scanner-result-name');
    const resVerif = document.getElementById('scanner-result-verif');
    const resMeta = document.getElementById('scanner-result-meta');
    const resDims = document.getElementById('scanner-result-dims');
    const actionsBox = document.getElementById('scanner-action-buttons');

    if (resBox) resBox.style.display = 'flex';
    if (resId) resId.textContent = art.id;
    if (resName) resName.textContent = art.name;
    if (resVerif) resVerif.textContent = `● ${art.verification_status || 'INSTITUTION-VERIFIED'}`;
    if (resMeta) resMeta.textContent = `Origin: ${art.region || 'India'} • Material: ${art.material || 'Mixed'} • ${art.community || 'Heritage Community'}`;
    
    if (resDims && art.dimensions) {
      const d = art.dimensions;
      resDims.textContent = `H: ${d.height} cm • W: ${d.width} cm • D: ${d.depth} cm [${d.scale_mode || 'SCALED'}]`;
    }

    if (resImg) {
      const imgPath = (art.images && art.images.front) ? art.images.front : '/static/assets/images/view_front.jpg';
      resImg.src = imgPath;
    }

    // Create action buttons to access the portal
    if (actionsBox) {
      actionsBox.innerHTML = `
        <a href="/index.html?id=${art.id}" class="btn-primary" style="text-decoration: none; padding: 0.4rem 0.85rem; font-size: 0.75rem; font-weight: 700;">
          ⚡ ENTER PORTAL (COMMAND CENTER)
        </a>
        <a href="/viewer.html?id=${art.id}" class="btn-cyan" style="text-decoration: none; padding: 0.4rem 0.75rem; font-size: 0.72rem;">
          🏺 3D LAB
        </a>
        <a href="/scanner.html?id=${art.id}" class="btn-secondary" style="text-decoration: none; padding: 0.4rem 0.75rem; font-size: 0.72rem;">
          📷 SCANNER
        </a>
        <a href="/cultural.html?id=${art.id}" class="btn-secondary" style="text-decoration: none; padding: 0.4rem 0.75rem; font-size: 0.72rem;">
          📜 CULTURAL LORE
        </a>
        <a href="/map.html?id=${art.id}" class="btn-secondary" style="text-decoration: none; padding: 0.4rem 0.75rem; font-size: 0.72rem;">
          🗺️ GIS MAP
        </a>
        <a href="/registry.html?id=${art.id}" class="btn-secondary" style="text-decoration: none; padding: 0.4rem 0.75rem; font-size: 0.72rem;">
          🛡️ REGISTRY
        </a>
        <a href="/passport.html?id=${art.id}" target="_blank" class="btn-secondary" style="text-decoration: none; padding: 0.4rem 0.75rem; font-size: 0.72rem; color: var(--text-gold); border-color: var(--border-gold);">
          📱 VISITOR PASSPORT ↗
        </a>
      `;
    }

    // Switch active artifact across the application
    this.selectArtifact(art.id);
  }
}

