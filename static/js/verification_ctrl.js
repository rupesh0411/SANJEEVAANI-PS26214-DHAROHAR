/**
 * Progressive Verification Manager:
 * Implements the core principle:
 * "VERIFICATION IS NOT AN ACCESS GATE. IT IS A TRUST STATUS."
 * 
 * Levels:
 * 1. PENDING (Initial capture)
 * 2. COMMUNITY-PROVIDED (Artisan oral / lore recorded)
 * 3. SOURCE-VERIFIED (Regional survey / field docket confirmed)
 * 4. INSTITUTION-VERIFIED (National museum / academic ratification)
 */

export class VerificationController {
  constructor(onStatusUpdated) {
    this.currentArtifact = null;
    this.onStatusUpdated = onStatusUpdated;
    this.initPills();
  }

  initPills() {
    const pills = document.querySelectorAll('.verification-step-pill');
    pills.forEach(pill => {
      pill.addEventListener('click', async () => {
        const targetStatus = pill.dataset.status;
        if (!this.currentArtifact || this.currentArtifact.verification_status === targetStatus) return;

        try {
          const res = await fetch(`/api/artifacts/${this.currentArtifact.id}/verify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: targetStatus })
          });

          if (res.ok) {
            const updated = await res.json();
            this.currentArtifact = updated;
            this.updateUI(updated);
            if (this.onStatusUpdated) this.onStatusUpdated(updated);
          }
        } catch (e) {
          console.error("Verification update error:", e);
        }
      });
    });
  }

  updateUI(artifact) {
    this.currentArtifact = artifact;
    const status = artifact.verification_status || 'PENDING';

    const pills = document.querySelectorAll('.verification-step-pill');
    pills.forEach(p => {
      if (p.dataset.status === status) {
        p.classList.add('active');
      } else {
        p.classList.remove('active');
      }
    });

    // Update global status badges
    const globalVerifPill = document.getElementById('global-verif-status');
    if (globalVerifPill) {
      globalVerifPill.textContent = `● ${status}`;
      globalVerifPill.className = 'status-pill ' + (status === 'INSTITUTION-VERIFIED' ? 'verified' : 'pending');
    }
  }
}
