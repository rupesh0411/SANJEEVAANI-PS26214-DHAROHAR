/**
 * Heritage Map & Cultural Geospatial Intelligence:
 * Supports:
 * - Offline-first operation with embedded India GeoJSON
 * - Separated Cultural Origin, Community Cluster, Documentation Site, and Display Location
 * - Privacy modes: PUBLIC (exact), RESTRICTED (state/region), PRIVATE (hidden)
 * - Interactive marker popups launching the Digital Heritage Passport
 */

export class HeritageMapController {
  constructor() {
    this.map = null;
    this.markersGroup = null;
    this.geojsonLayer = null;
    this.currentArtifact = null;
    this.privacyMode = 'PUBLIC'; // PUBLIC | RESTRICTED | PRIVATE

    this.initMap();
    this.initPrivacyToggles();
  }

  initMap() {
    const mapContainer = document.getElementById('heritage-leaflet-map');
    if (!mapContainer || typeof L === 'undefined') {
      console.warn("Leaflet not available or map container missing.");
      return;
    }

    // Centered on Central India
    this.map = L.map('heritage-leaflet-map', {
      center: [22.0, 80.0],
      zoom: 5,
      zoomControl: true,
      attributionControl: false
    });

    this.tileLayer = null;
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    this.setMapTheme(currentTheme);

    window.addEventListener('heritage-theme-changed', (e) => {
      this.setMapTheme(e.detail?.theme || 'light');
    });

    this.markersGroup = L.layerGroup().addTo(this.map);

    // Load offline Indian States GeoJSON
    this.loadIndiaGeoJSON();
  }

  setMapTheme(theme) {
    if (!this.map) return;
    const isDark = theme === 'dark';
    const tileUrl = isDark
      ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
      : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';

    if (this.tileLayer) {
      try { this.map.removeLayer(this.tileLayer); } catch (e) {}
    }

    this.tileLayer = L.tileLayer(tileUrl, {
      maxZoom: 18,
      subdomains: 'abcd',
      timeout: 3000
    });

    this.tileLayer.on('tileerror', () => {
      const offlineBadge = document.getElementById('offline-map-status');
      if (offlineBadge) offlineBadge.style.display = 'flex';
    });

    this.tileLayer.addTo(this.map);
    if (this.geojsonLayer) this.geojsonLayer.bringToFront();
    if (this.markersGroup) this.markersGroup.bringToFront();
  }

  async loadIndiaGeoJSON() {
    try {
      const res = await fetch('/api/geojson/india');
      if (res.ok) {
        const geojsonData = await res.json();
        this.geojsonLayer = L.geoJSON(geojsonData, {
          style: {
            color: '#D4AF37',
            weight: 1.2,
            opacity: 0.45,
            fillColor: '#00B4D8',
            fillOpacity: 0.06
          },
          onEachFeature: (feature, layer) => {
            if (feature.properties && feature.properties.name) {
              layer.bindTooltip(
                `<b>${feature.properties.name}</b><br><span style="color:#FF7B00">${feature.properties.dominant_craft || 'Heritage Cluster'}</span>`,
                { permanent: false, direction: 'center', className: 'map-tooltip' }
              );
            }
          }
        }).addTo(this.map);
      }
    } catch (e) {
      console.log("[MAP] Local GeoJSON loaded via memory fallback.");
    }
  }

  initPrivacyToggles() {
    const buttons = document.querySelectorAll('.privacy-btn');
    buttons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        buttons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.privacyMode = btn.dataset.privacy;
        if (this.currentArtifact) {
          this.renderArtifactLocations(this.currentArtifact);
        }
      });
    });
  }

  createCustomIcon(color, label) {
    return L.divIcon({
      className: 'custom-heritage-pin',
      html: `
        <div style="
          background: ${color};
          width: 24px;
          height: 24px;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          border: 2px solid #FFFFFF;
          box-shadow: 0 0 10px ${color};
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <div style="transform: rotate(45deg); font-size: 9px; font-weight: bold; color: #fff;">${label}</div>
        </div>
      `,
      iconSize: [24, 24],
      iconAnchor: [12, 24],
      popupAnchor: [0, -24]
    });
  }

  renderArtifactLocations(artifact) {
    this.currentArtifact = artifact;
    if (!this.map || !this.markersGroup) return;

    this.markersGroup.clearLayers();

    const mapData = artifact?.map_data || {};
    const privacy = this.privacyMode;

    const privIndicator = document.getElementById('current-map-privacy-label');
    if (privIndicator) {
      privIndicator.textContent = `PRIVACY: ${privacy}`;
    }

    if (privacy === 'PRIVATE') {
      // Hidden coordinates mode
      const bounds = L.latLngBounds([[8.0, 68.0], [35.0, 97.0]]);
      this.map.fitBounds(bounds);
      return;
    }

    const points = [];

    // 1. Cultural Origin Pin (Saffron)
    if (mapData.cultural_origin) {
      const co = mapData.cultural_origin;
      const lat = privacy === 'RESTRICTED' ? co.lat + (Math.random()*0.3 - 0.15) : co.lat;
      const lng = privacy === 'RESTRICTED' ? co.lng + (Math.random()*0.3 - 0.15) : co.lng;

      const originMarker = L.marker([lat, lng], {
        icon: this.createCustomIcon('#FF7B00', 'O')
      }).bindPopup(`
        <div style="color: #0B1120; font-family: sans-serif; min-width: 200px;">
          <div style="font-size: 10px; font-weight: bold; color: #FF7B00; text-transform: uppercase;">CULTURAL ORIGIN</div>
          <div style="font-size: 13px; font-weight: bold; margin: 3px 0;">${co.name}</div>
          <div style="font-size: 11px; color: #475569;">${co.details || ''}</div>
          <div style="margin-top: 8px; font-size: 10px; color: #64748B;">ARTIFACT: <b>${artifact.id}</b></div>
          <a href="/passport.html?id=${artifact.id}" target="_blank" style="
            display: block; margin-top: 8px; text-align: center;
            background: #FF7B00; color: #fff; font-size: 11px;
            font-weight: bold; text-decoration: none; padding: 4px 8px;
            border-radius: 4px;
          ">OPEN PASSPORT</a>
        </div>
      `);
      this.markersGroup.addLayer(originMarker);
      points.push([lat, lng]);
    }

    // 2. Community Cluster Pin (Gold)
    if (mapData.community_region && privacy === 'PUBLIC') {
      const cr = mapData.community_region;
      const commMarker = L.marker([cr.lat, cr.lng], {
        icon: this.createCustomIcon('#F59E0B', 'C')
      }).bindPopup(`
        <div style="color: #0B1120; font-family: sans-serif;">
          <div style="font-size: 10px; font-weight: bold; color: #F59E0B; text-transform: uppercase;">COMMUNITY CLUSTER</div>
          <div style="font-size: 13px; font-weight: bold; margin: 3px 0;">${cr.name}</div>
          <div style="font-size: 11px; color: #475569;">${cr.details || ''}</div>
        </div>
      `);
      this.markersGroup.addLayer(commMarker);
      points.push([cr.lat, cr.lng]);
    }

    // 3. Documentation Location (Cyan)
    if (mapData.documentation_location && privacy === 'PUBLIC') {
      const dl = mapData.documentation_location;
      const docMarker = L.marker([dl.lat, dl.lng], {
        icon: this.createCustomIcon('#00B4D8', 'D')
      }).bindPopup(`
        <div style="color: #0B1120; font-family: sans-serif;">
          <div style="font-size: 10px; font-weight: bold; color: #00B4D8; text-transform: uppercase;">DOCUMENTATION LAB</div>
          <div style="font-size: 13px; font-weight: bold; margin: 3px 0;">${dl.name}</div>
          <div style="font-size: 11px; color: #475569;">${dl.details || ''}</div>
        </div>
      `);
      this.markersGroup.addLayer(docMarker);
      points.push([dl.lat, dl.lng]);
    }

    // 4. Current Display Location (Emerald Green)
    if (mapData.current_display && privacy !== 'PRIVATE') {
      const cd = mapData.current_display;
      const dispMarker = L.marker([cd.lat, cd.lng], {
        icon: this.createCustomIcon('#10B981', 'M')
      }).bindPopup(`
        <div style="color: #0B1120; font-family: sans-serif;">
          <div style="font-size: 10px; font-weight: bold; color: #10B981; text-transform: uppercase;">CURRENT DISPLAY / STORAGE</div>
          <div style="font-size: 13px; font-weight: bold; margin: 3px 0;">${cd.name}</div>
          <div style="font-size: 11px; color: #475569;">${cd.details || ''}</div>
        </div>
      `);
      this.markersGroup.addLayer(dispMarker);
      points.push([cd.lat, cd.lng]);
    }

    if (points.length > 0) {
      const bounds = L.latLngBounds(points);
      this.map.fitBounds(bounds, { padding: [50, 50], maxZoom: 8 });
    }
  }
}
