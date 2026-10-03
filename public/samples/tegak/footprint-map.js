/*
 * <footprint-map active="wj"> — dot-matrix map of Indonesia with selectable project regions.
 * Emits  window 'footprint:select' (detail = region key) when a region is clicked.
 * Listens window 'footprint:set'   (detail = region key) to change the highlighted region.
 * Outlines are deliberately simplified (illustrative, not cartographic).
 */
(function () {
  if (customElements.get('footprint-map')) return;

  var LON0 = 94.5, LAT0 = 6.5, K = 20, STEP = 0.3;
  var W = (141.5 - LON0) * K, H = (LAT0 + 11.5) * K;
  var px = function (lon) { return (lon - LON0) * K; };
  var py = function (lat) { return (LAT0 - lat) * K; };

  var LAND = [
    // Sumatra
    [[95.3, 5.6], [97.5, 5.2], [100.3, 2.5], [101.5, 2.0], [103.8, 1.0], [104.5, -1.0], [106.0, -3.0], [105.8, -5.8], [104.5, -5.9], [102.3, -4.0], [100.8, -2.0], [99.0, 0.3], [97.5, 2.3], [95.5, 4.5]],
    // Bangka & Belitung
    [[105.4, -1.5], [106.3, -1.9], [106.8, -3.0], [106.0, -3.1], [105.4, -2.2]],
    [[107.5, -2.6], [108.3, -2.6], [108.3, -3.2], [107.5, -3.2]],
    // Java
    [[105.2, -6.8], [106.0, -5.9], [106.8, -6.05], [108.3, -6.25], [110.4, -6.85], [111.5, -6.55], [112.7, -6.85], [114.45, -7.7], [114.45, -8.6], [112.0, -8.35], [110.0, -8.15], [108.0, -7.85], [106.4, -7.45], [105.3, -6.9]],
    // Madura
    [[112.7, -6.85], [114.1, -6.85], [114.1, -7.2], [112.7, -7.2]],
    // Bali
    [[114.5, -8.05], [115.2, -8.0], [115.75, -8.4], [115.2, -8.9], [114.5, -8.45]],
    // Nusa Tenggara
    [[115.9, -8.2], [119.0, -8.1], [123.0, -8.15], [125.1, -8.4], [127.0, -8.3], [127.0, -8.9], [124.2, -10.3], [123.0, -10.4], [120.8, -10.3], [119.0, -9.6], [115.9, -9.0]],
    // Kalimantan
    [[109.0, 1.5], [109.6, 2.0], [111.0, 1.8], [113.0, 3.1], [115.5, 4.3], [117.0, 6.8], [118.5, 5.0], [119.0, 1.0], [117.8, 0.5], [117.5, -1.0], [116.5, -2.5], [116.0, -3.9], [114.5, -4.0], [112.5, -3.4], [111.0, -3.0], [110.0, -1.8], [109.0, -0.5]],
    // Sulawesi
    [[119.4, -5.6], [120.4, -5.6], [120.4, -3.0], [121.3, -4.6], [122.8, -4.9], [122.3, -3.0], [121.0, -1.8], [123.3, -0.9], [121.5, -0.7], [120.6, 0.6], [122.0, 1.0], [124.9, 1.7], [124.2, 0.4], [120.2, 0.4], [119.8, -0.2], [118.8, -2.6], [119.5, -3.5]],
    // Maluku
    [[127.4, 2.2], [128.8, 1.4], [128.0, 0.5], [128.9, -0.8], [127.8, -0.4], [127.4, 0.8]],
    [[127.9, -2.8], [131.0, -3.0], [130.8, -3.7], [128.0, -3.6]],
    [[126.0, -3.1], [127.2, -3.2], [127.2, -3.8], [126.0, -3.8]],
    // Papua
    [[131.0, -1.0], [134.0, -0.8], [135.0, -3.3], [138.0, -1.6], [141.0, -2.6], [141.0, -9.1], [139.0, -8.1], [138.0, -8.4], [137.5, -5.2], [134.0, -3.9], [132.0, -2.8], [132.5, -2.2]]
  ];

  var REGIONS = {
    jk: { name: 'Jakarta', n: 32, at: [106.82, -6.25], label: [104.8, -3.7], test: function (lon, lat) { return lon > 106.6 && lon < 107.05 && lat > -6.45; } },
    wj: { name: 'West Java', n: 41, at: [107.6, -6.95], label: [107.0, -9.7], test: function (lon) { return lon >= 105.1 && lon < 108.8; } },
    cj: { name: 'Central Java', n: 14, at: [110.2, -7.25], label: [112.4, -4.7], test: function (lon) { return lon >= 108.8 && lon < 111.3; } },
    ej: { name: 'East Java', n: 18, at: [112.6, -7.6], label: [112.6, -10.0], test: function (lon, lat) { return lon >= 111.3 && lon <= 114.46 && lat > -8.7; } },
    ba: { name: 'Bali', n: 7, at: [115.15, -8.4], label: [117.0, -11.0], test: function (lon, lat) { return lon > 114.46 && lon < 115.8 && lat < -7.95 && lat > -9; } }
  };
  var JAVA_BALI = [3, 4, 5];

  function inside(pt, poly) {
    var x = pt[0], y = pt[1], hit = false;
    for (var i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      var xi = poly[i][0], yi = poly[i][1], xj = poly[j][0], yj = poly[j][1];
      if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) hit = !hit;
    }
    return hit;
  }

  // Precompute dot grid once
  var DOTS = [];
  for (var lat = LAT0 - STEP / 2; lat > -11.5; lat -= STEP) {
    for (var lon = LON0 + STEP / 2; lon < 141.5; lon += STEP) {
      var pt = [lon, lat], land = -1;
      for (var i = 0; i < LAND.length; i++) if (inside(pt, LAND[i])) { land = i; break; }
      if (land < 0) continue;
      var region = null;
      if (JAVA_BALI.indexOf(land) >= 0) for (var k in REGIONS) if (REGIONS[k].test(lon, lat)) { region = k; break; }
      DOTS.push({ x: px(lon), y: py(lat), r: region });
    }
  }

  var NS = 'http://www.w3.org/2000/svg';
  function el(tag, attrs, parent) {
    var e = document.createElementNS(NS, tag);
    for (var a in attrs) e.setAttribute(a, attrs[a]);
    if (parent) parent.appendChild(e);
    return e;
  }

  class FootprintMap extends HTMLElement {
    constructor() {
      super();
      this.active = null;
      this.onSet = this.onSet.bind(this);
      var root = this.attachShadow({ mode: 'open' });
      var style = document.createElement('style');
      style.textContent = [
        ':host{display:flex;align-items:center;position:relative}',
        'svg{display:block;width:100%;height:auto;overflow:visible}',
        '.dot{fill:rgba(23,24,26,.16)}',
        '.dot.reg{fill:rgba(23,24,26,.5);cursor:pointer;transition:fill .25s}',
        '.dot.reg.on{fill:#E2601B}',
        '.mk{cursor:pointer}',
        '.mk .ring{fill:none;stroke:#17181A;stroke-width:1.6;transition:stroke .25s}',
        '.mk .core{fill:#17181A;transition:fill .25s}',
        '.mk .lead{stroke:rgba(23,24,26,.45);stroke-width:1;stroke-dasharray:3 3}',
        '.mk text{font-family:"IBM Plex Mono",monospace;fill:#17181A;transition:fill .25s;paint-order:stroke;stroke:#EAE7E1;stroke-width:5px;stroke-linejoin:round}',
        '.mk .nm{font-size:17px;font-weight:600;letter-spacing:.06em}',
        '.mk .ct{font-size:14px;fill:#5E5D59}',
        '.mk.on .ring{stroke:#E2601B}.mk.on .core{fill:#E2601B}.mk.on .nm{fill:#E2601B}.mk.on .lead{stroke:#E2601B}',
        '.mk.on .pulse{animation:p 1.8s ease-out infinite}',
        '.pulse{fill:none;stroke:#E2601B;stroke-width:1.5;opacity:0}',
        '@keyframes p{0%{r:8;opacity:.9}100%{r:30;opacity:0}}',
        '.grid{stroke:rgba(23,24,26,.12);stroke-width:1;stroke-dasharray:2 5}',
        '.ax{font-family:"IBM Plex Mono",monospace;font-size:14px;fill:#8B8A85;letter-spacing:.06em}',
        '@media (prefers-reduced-motion:reduce){.mk.on .pulse{animation:none}}'
      ].join('');
      root.appendChild(style);

      var svg = el('svg', { viewBox: '-10 -10 ' + (W + 20) + ' ' + (H + 44), role: 'img', 'aria-label': 'Map of Indonesia showing project regions' }, root);

      var grid = el('g', {}, svg);
      [100, 110, 120, 130, 140].forEach(function (lon) {
        el('line', { 'class': 'grid', x1: px(lon), y1: 0, x2: px(lon), y2: H }, grid);
        var t = el('text', { 'class': 'ax', x: px(lon) + 5, y: H + 22 }, grid); t.textContent = lon + '°E';
      });
      el('line', { 'class': 'grid', x1: 0, y1: py(0), x2: W, y2: py(0) }, grid);
      var eq = el('text', { 'class': 'ax', x: 2, y: py(0) - 6 }, grid); eq.textContent = 'EQ 0°';

      var self = this;
      this.dotEls = [];
      var dots = el('g', {}, svg);
      DOTS.forEach(function (d) {
        var c = el('circle', { cx: d.x.toFixed(1), cy: d.y.toFixed(1), r: d.r ? 2.4 : 2.1, 'class': d.r ? 'dot reg' : 'dot' }, dots);
        if (d.r) { c.addEventListener('click', function () { self.pick(d.r); }); self.dotEls.push([c, d.r]); }
      });

      this.markers = {};
      var marks = el('g', {}, svg);
      Object.keys(REGIONS).forEach(function (k) {
        var R = REGIONS[k], x = px(R.at[0]), y = py(R.at[1]), lx = px(R.label[0]), ly = py(R.label[1]);
        var g = el('g', { 'class': 'mk', tabindex: 0, role: 'button', 'aria-label': R.name + ', ' + R.n + ' projects' }, marks);
        var above = ly < y;
        el('line', { 'class': 'lead', x1: x, y1: y, x2: lx, y2: above ? ly + 10 : ly - 22 }, g);
        el('circle', { 'class': 'pulse', cx: x, cy: y, r: 8 }, g);
        el('circle', { 'class': 'ring', cx: x, cy: y, r: 10 }, g);
        el('circle', { 'class': 'core', cx: x, cy: y, r: 4.5 }, g);
        var nm = el('text', { 'class': 'nm', x: lx, y: above ? ly - 10 : ly, 'text-anchor': 'middle' }, g); nm.textContent = R.name.toUpperCase();
        var ct = el('text', { 'class': 'ct', x: lx, y: above ? ly + 6 : ly + 17, 'text-anchor': 'middle' }, g); ct.textContent = R.n + ' PROJECTS';
        g.addEventListener('click', function () { self.pick(k); });
        g.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); self.pick(k); } });
        self.markers[k] = g;
      });
    }
    static get observedAttributes() { return ['active']; }
    attributeChangedCallback(name, _, v) { if (name === 'active') this.setActive(v); }
    connectedCallback() {
      window.addEventListener('footprint:set', this.onSet);
      this.setActive(this.active || this.getAttribute('active') || 'wj');
    }
    disconnectedCallback() { window.removeEventListener('footprint:set', this.onSet); }
    onSet(e) { this.setActive(e.detail); }
    pick(k) {
      if (k === this.active) return;
      this.setActive(k);
      window.dispatchEvent(new CustomEvent('footprint:select', { detail: k }));
    }
    setActive(k) {
      if (!REGIONS[k]) return;
      this.active = k;
      this.dotEls.forEach(function (p) { p[0].classList.toggle('on', p[1] === k); });
      for (var m in this.markers) this.markers[m].classList.toggle('on', m === k);
    }
  }
  customElements.define('footprint-map', FootprintMap);
})();
