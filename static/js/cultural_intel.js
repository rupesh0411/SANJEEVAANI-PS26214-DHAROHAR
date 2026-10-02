/**
 * Cultural Intelligence & Documentation Manager:
 * Handles:
 * - Right panel tab navigation
 * - Overview metadata rendering
 * - Structural dimensions & Caliper validation form submission
 * - Oral knowledge audio playback & transcript highlighting
 * - Provenance timeline visualization
 * - Condition notes documentation
 * - Documentation photo gallery
 * - QR code generation via local qrcode.min.js
 */

export class CulturalIntelController {
  constructor() {
    this.currentArtifact = null;
    this.audioElement = new Audio();
    this.isPlayingAudio = false;

    this.initTabs();
    this.initAudioPlayer();
    this.initCaliperForm();
  }

  initTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        tabButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const targetTab = btn.dataset.tab;
        document.querySelectorAll('.tab-pane-content').forEach(pane => {
          pane.classList.remove('active');
          if (pane.id === `tab-${targetTab}`) {
            pane.classList.add('active');
          }
        });
      });
    });
  }

  initAudioPlayer() {
    const playBtn = document.getElementById('btn-play-audio');
    if (!playBtn) return;

    playBtn.addEventListener('click', () => {
      if (!this.currentArtifact?.oral_knowledge?.audio_url) return;

      if (this.isPlayingAudio) {
        this.audioElement.pause();
        this.isPlayingAudio = false;
        playBtn.innerHTML = '▶';
      } else {
        this.audioElement.src = this.currentArtifact.oral_knowledge.audio_url;
        this.audioElement.play().catch(e => console.warn(e));
        this.isPlayingAudio = true;
        playBtn.innerHTML = '❚❚';
      }
    });

    this.audioElement.addEventListener('ended', () => {
      this.isPlayingAudio = false;
      if (playBtn) playBtn.innerHTML = '▶';
    });
  }

  initCaliperForm() {
    const form = document.getElementById('caliper-validation-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const valInput = document.getElementById('input-caliper-height');
      const notesInput = document.getElementById('input-caliper-notes');
      if (!valInput || !this.currentArtifact) return;

      const caliperVal = parseFloat(valInput.value);
      if (isNaN(caliperVal) || caliperVal <= 0) {
        alert("Please enter a valid caliper measurement in cm.");
        return;
      }

      try {
        const res = await fetch(`/api/artifacts/${this.currentArtifact.id}/measurements`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: jsonStringifySafe({
            caliper_height: caliperVal,
            notes: notesInput ? notesInput.value : ""
          })
        });
        if (res.ok) {
          const updated = await res.json();
          this.currentArtifact = updated;
          this.renderArtifact(updated);
          alert("Physical caliper measurement validated and logged to provenance!");
        }
      } catch (err) {
        console.error(err);
      }
    });
  }

  renderArtifact(artifact) {
    this.currentArtifact = artifact;
    if (!artifact) return;

    // 1. Overview Tab
    this.setText('meta-id', artifact.id);
    this.setText('meta-name', artifact.name);
    this.setText('meta-type', artifact.artifact_type || 'Ritual Vessel');
    this.setText('meta-material', artifact.material || 'Brass');
    this.setText('meta-region', artifact.region || 'Chhattisgarh');
    this.setText('meta-community', artifact.community || 'Ghadwa Artisans');
    this.setText('meta-use', artifact.traditional_use || 'Not documented');
    this.setText('meta-significance', artifact.cultural_significance || 'Not documented');
    this.setText('meta-practice', artifact.associated_practice || 'Not documented');
    this.setText('meta-date', artifact.documentation_date || '2026-09-15');
    this.setText('meta-contributor', artifact.contributor || 'Community Contributor');
    this.setText('meta-craft', artifact.craft_technique || 'Lost-Wax Casting');

    // 2. Dimensions Tab
    const d = artifact.dimensions || {};
    const scaleMode = artifact.scale_status || 'ESTIMATED';

    this.setText('dim-height', d.height ? `${d.height} cm` : 'NOT AVAILABLE');
    this.setText('dim-height-badge', scaleMode);
    this.setText('dim-width', d.width ? `${d.width} cm` : 'NOT AVAILABLE');
    this.setText('dim-width-badge', scaleMode);
    this.setText('dim-depth', d.depth ? `${d.depth} cm` : 'NOT AVAILABLE');
    this.setText('dim-depth-badge', scaleMode);

    this.setText('val-scale-reference', artifact.scale_reference ? `Marker #42 (50mm) - ${artifact.scale_reference}` : 'UNSCALED');
    this.setText('val-scanned-height', d.scanned_height ? `${d.scanned_height} cm` : `${d.height} cm`);
    this.setText('val-caliper-height', d.caliper_height ? `${d.caliper_height} cm` : 'Pending physical entry');
    this.setText('val-status-badge', d.validation_status || 'PENDING');

    const statusBadgeEl = document.getElementById('val-status-badge');
    if (statusBadgeEl) {
      statusBadgeEl.className = 'tile-badge ' + (d.validation_status === 'VALIDATED' ? 'pass' : 'detected');
    }

    // 3. Oral Knowledge Tab
    const ok = artifact.oral_knowledge || {};
    this.setText('audio-speaker', ok.speaker ? `${ok.speaker} (${ok.speaker_role || ''})` : 'Traditional Knowledge Bearer');
    this.setText('audio-duration', ok.duration || '00:48');
    this.setText('audio-language', ok.language || 'Hindi / Regional dialect');
    this.setText('audio-transcript', ok.transcript || 'Audio transcript being transcribed...');
    this.setText('audio-translation', ok.translation || 'English translation pending...');

    // 4. Provenance Timeline Tab
    this.renderProvenance(artifact.provenance || []);

    // 5. Condition Notes Tab
    this.renderConditionNotes(artifact.condition_notes || {});

    // 6. Documentation Photo Gallery
    this.renderPhotoGallery(artifact.photo_gallery || []);

    // 7. QR Code Generation
    this.renderQRCode(artifact.id);
  }

  renderProvenance(provenanceList) {
    const container = document.getElementById('timeline-list');
    if (!container) return;

    container.innerHTML = '';
    provenanceList.forEach(event => {
      const isVerified = event.status && (event.status.includes('VERIFIED') || event.status === 'VALIDATED');
      const item = document.createElement('div');
      item.className = `timeline-event-item ${isVerified ? 'verified' : ''}`;
      item.innerHTML = `
        <div class="timeline-header">
          <span class="timeline-step">${event.step}</span>
          <span class="timeline-date">${event.date || ''}</span>
        </div>
        <div class="timeline-desc">${event.action || ''}</div>
        <div style="font-size: 0.68rem; color: var(--text-dim); font-family: var(--font-mono); margin-top: 2px;">
          ACTOR: ${event.actor || ''} | SOURCE: ${event.source || ''}
        </div>
      `;
      container.appendChild(item);
    });
  }

  renderConditionNotes(notes) {
    const container = document.getElementById('condition-notes-list');
    if (!container) return;

    container.innerHTML = '';
    const fields = [
      { key: 'cracks', label: 'Cracks' },
      { key: 'breakage', label: 'Breakage' },
      { key: 'surface_damage', label: 'Surface Damage' },
      { key: 'discoloration', label: 'Discoloration' },
      { key: 'missing_parts', label: 'Missing Parts' },
      { key: 'wear', label: 'Wear' },
      { key: 'restoration', label: 'Restoration' }
    ];

    fields.forEach(f => {
      const val = notes[f.key] || 'None documented';
      const row = document.createElement('div');
      row.className = 'info-row';
      row.innerHTML = `
        <div class="info-label">${f.label}</div>
        <div class="info-value" style="font-size: 0.8rem;">${val}</div>
      `;
      container.appendChild(row);
    });
  }

  renderPhotoGallery(photos) {
    const grid = document.getElementById('gallery-thumbnails');
    if (!grid) return;

    grid.innerHTML = '';
    photos.forEach(photo => {
      const card = document.createElement('div');
      card.className = 'gallery-thumbnail-card';
      card.innerHTML = `
        <img src="${photo.url}" alt="${photo.label}" loading="lazy">
        <div class="gallery-label">${photo.label}</div>
      `;
      card.addEventListener('click', () => {
        // Expand photo modal or set main preview
        window.open(photo.url, '_blank');
      });
      grid.appendChild(card);
    });
  }

  renderQRCode(artifactId) {
    const qrContainer = document.getElementById('qrcode-canvas-target');
    if (!qrContainer || typeof QRCode === 'undefined') return;

    qrContainer.innerHTML = '';
    const passportUrl = `${window.location.origin}/passport.html?id=${artifactId}`;

    new QRCode(qrContainer, {
      text: passportUrl,
      width: 140,
      height: 140,
      colorDark: "#0B1120",
      colorLight: "#FFFFFF",
      correctLevel: QRCode.CorrectLevel.M
    });

    const qrLinkEl = document.getElementById('qr-passport-link');
    if (qrLinkEl) {
      qrLinkEl.href = passportUrl;
      qrLinkEl.textContent = `OPEN PASSPORT (${artifactId})`;
    }
  }

  setText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  }
}

function jsonStringifySafe(obj) {
  return JSON.stringify(obj);
}
