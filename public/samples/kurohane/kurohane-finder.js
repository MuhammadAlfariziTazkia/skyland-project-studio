/* KUROHANE — AI 似合わせ診断 (DEMO ENGINE).
   Everything runs in the visitor's browser: the photo is never uploaded or stored.
   In a production build the "analyze" step would be a vision model and "compose" an image-generation
   model; here analysis is a deterministic mock and the preview is a procedural hair render drawn onto
   the visitor's own photo, aligned by the oval guide they framed their face in — either live in the
   in-page camera, or afterwards by dragging an album photo into the same oval.
   Concept demo built by Skyland Project Studio. */
(function () {
  var W = 768, H = 1024;
  // Face oval in frame coordinates. The alignment guide, the sample portrait and every hair template share it.
  var O = { cx: 384, cy: 476, rx: 178, ry: 238 };
  var MAX_BYTES = 12 * 1024 * 1024;

  function P(u, v) { return [O.cx + u * O.rx, O.cy + v * O.ry]; }
  function canvas(w, h) { var c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
  function rng(seed) {
    var h = 1779033703 ^ seed.length;
    for (var i = 0; i < seed.length; i++) { h = Math.imul(h ^ seed.charCodeAt(i), 3432918353); h = (h << 13) | (h >>> 19); }
    return function () { h = Math.imul(h ^ (h >>> 16), 2246822507); h = Math.imul(h ^ (h >>> 13), 3266489909); h ^= h >>> 16; return (h >>> 0) / 4294967296; };
  }

  // ---------- colour helpers ----------
  function hexRgb(h) { h = h.replace('#', ''); return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]; }
  function shade(rgb, k) { // k<0 darker, k>0 lighter
    return rgb.map(function (c) { return Math.round(k < 0 ? c * (1 + k) : c + (255 - c) * k); });
  }
  function css(rgb, a) { return 'rgba(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ',' + (a == null ? 1 : a) + ')'; }
  function lum(r, g, b) { return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255; }

  // ---------- loading & framing ----------
  function load(file) {
    return new Promise(function (resolve, reject) {
      if (!file) return reject(new Error('no_file'));
      if (!/^image\//.test(file.type || '')) return reject(new Error('not_image'));
      if (file.size > MAX_BYTES) return reject(new Error('too_large'));
      var url = URL.createObjectURL(file);
      var img = new Image();
      img.onload = function () {
        // Modern browsers apply EXIF orientation to <img>, so naturalWidth/Height are already upright.
        var w = img.naturalWidth, h = img.naturalHeight, m = Math.max(w, h), k = m > 2000 ? 2000 / m : 1;
        var c = canvas(Math.round(w * k), Math.round(h * k));
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        URL.revokeObjectURL(url);
        resolve({ src: c, url: c.toDataURL('image/jpeg', 0.9), w: c.width, h: c.height, sample: false });
      };
      img.onerror = function () { URL.revokeObjectURL(url); reject(new Error('decode')); };
      img.src = url;
    });
  }

  // Width of the image at scale 1, as a fraction of the frame width ("cover" fit into a 3:4 frame).
  function baseWidth(w, h) { return Math.max(1, (H / W) * (w / h)); }
  function clampTf(tf, w, h) {
    var bw = baseWidth(w, h) * tf.s, bh = bw * (h / w) * (W / H);
    var mx = Math.max(0, (bw - 1) / 2), my = Math.max(0, (bh - 1) / 2);
    return { s: tf.s, x: Math.max(-mx, Math.min(mx, tf.x)), y: Math.max(-my, Math.min(my, tf.y)) };
  }
  function crop(photo, tf) {
    var c = canvas(W, H), x = c.getContext('2d');
    var dw = baseWidth(photo.w, photo.h) * tf.s * W, dh = dw * photo.h / photo.w;
    x.fillStyle = '#E6E0D3'; x.fillRect(0, 0, W, H);
    x.drawImage(photo.src, W * (0.5 + tf.x) - dw / 2, H * (0.5 + tf.y) - dh / 2, dw, dh);
    return c;
  }

  // ---------- mock analysis ----------
  var WEIGHTS = {
    face: [['oval', 3], ['round', 3], ['long', 2], ['square', 2], ['heart', 1.4]],
    head: [['flat', 3], ['round', 2], ['wide', 2]],
    texture: [['straight', 4], ['wavy', 2.4], ['curly', 1]],
    density: [['thick', 3], ['normal', 3], ['thin', 1.6]]
  };
  function pick(r, list) {
    var t = list.reduce(function (a, b) { return a + b[1]; }, 0), v = r() * t;
    for (var i = 0; i < list.length; i++) { v -= list[i][1]; if (v <= 0) return list[i][0]; }
    return list[0][0];
  }
  function fingerprint(c) { // 16×16 luminance thumbnail → stable seed for the same photo
    var t = canvas(16, 16), x = t.getContext('2d');
    x.drawImage(c, 0, 0, 16, 16);
    var d = x.getImageData(0, 0, 16, 16).data, s = '';
    for (var i = 0; i < d.length; i += 4) s += String.fromCharCode(48 + Math.round(lum(d[i], d[i + 1], d[i + 2]) * 40));
    return s;
  }
  function hairTone(cropped) {
    var a = P(-0.55, -1.32), b = P(0.55, -1.0);
    var w = Math.round(b[0] - a[0]), h = Math.round(b[1] - a[1]);
    var d = cropped.getContext('2d').getImageData(Math.round(a[0]), Math.round(a[1]), w, h).data, px = [];
    for (var i = 0; i < d.length; i += 16) px.push([d[i], d[i + 1], d[i + 2], lum(d[i], d[i + 1], d[i + 2])]);
    px.sort(function (p, q) { return p[3] - q[3]; });
    var m = px[Math.floor(px.length * 0.15)] || [34, 28, 25, 0.1];
    // A bright crown (shaved head, light background) is not a hair colour; fall back to a natural dark brown.
    if (m[3] > 0.36) return '#221c19';
    var k = m[3] < 0.06 ? 1.6 : 1; // lift pure-black hair slightly so strands stay visible
    return '#' + m.slice(0, 3).map(function (c) { return Math.min(255, Math.round(c * k + 6)).toString(16).padStart(2, '0'); }).join('');
  }
  function analyze(photo, cropped) {
    if (photo.sample) return { profile: { face: 'round', head: 'flat', texture: 'straight', density: 'thick' }, tone: '#1f1a17' };
    var r = rng('khf' + fingerprint(photo.src));
    return {
      profile: { face: pick(r, WEIGHTS.face), head: pick(r, WEIGHTS.head), texture: pick(r, WEIGHTS.texture), density: pick(r, WEIGHTS.density) },
      tone: hairTone(cropped)
    };
  }

  // ---------- hair templates ----------
  // vol: extra height on top · t0: hair thickness off the skull · sides: skin|taper|short|full|buzz
  var T = {
    skinfade:   { fringe: 'up',     sides: 'skin',  vol: 0.30, t0: 0.10, flow: 'back',   tex: 'textured' },
    natural:    { fringe: 'short',  sides: 'short', vol: 0.12, t0: 0.10, flow: 'down',   tex: 'soft' },
    twist:      { fringe: 'curl',   sides: 'taper', vol: 0.34, t0: 0.15, flow: 'curl',   tex: 'curl' },
    business7:  { fringe: 'part',   sides: 'short', vol: 0.20, t0: 0.08, flow: 'part',   tex: 'sleek', partU: 0.42 },
    crop:       { fringe: 'crop',   sides: 'skin',  vol: 0.14, t0: 0.09, flow: 'down',   tex: 'textured' },
    wave:       { fringe: 'mash',   sides: 'full',  vol: 0.26, t0: 0.17, flow: 'wave',   tex: 'wave' },
    taper:      { fringe: 'up',     sides: 'taper', vol: 0.20, t0: 0.08, flow: 'back',   tex: 'sleek' },
    centre:     { fringe: 'centre', sides: 'full',  vol: 0.18, t0: 0.12, flow: 'centre', tex: 'sleek' },
    mash:       { fringe: 'mash',   sides: 'full',  vol: 0.22, t0: 0.15, flow: 'down',   tex: 'soft' },
    buzz:       { fringe: 'buzz',   sides: 'buzz',  vol: 0.00, t0: 0.025, flow: 'stipple', tex: 'buzz' },
    softmohawk: { fringe: 'up',     sides: 'skin',  vol: 0.40, t0: 0.08, flow: 'back',   tex: 'textured', mohawk: true }
  };
  var SKULL = { cv: -0.30, ax: 1.08, ay: 1.02 };
  var FRINGE = {
    up:     [[0.93, -0.42], [0.78, -0.78], [0.45, -0.97], [0, -1.03], [-0.45, -0.97], [-0.78, -0.78], [-0.93, -0.42]],
    short:  [[0.93, -0.42], [0.8, -0.6], [0.45, -0.71], [0, -0.70], [-0.45, -0.73], [-0.8, -0.6], [-0.93, -0.42]],
    crop:   [[0.93, -0.42], [0.84, -0.64], [0.55, -0.72], [0, -0.73], [-0.55, -0.72], [-0.84, -0.64], [-0.93, -0.42]],
    mash:   [[0.97, -0.22], [0.86, -0.47], [0.5, -0.58], [0, -0.56], [-0.5, -0.58], [-0.86, -0.47], [-0.97, -0.22]],
    part:   [[0.93, -0.42], [0.78, -0.8], [0.5, -0.95], [0.2, -0.99], [-0.25, -0.93], [-0.66, -0.76], [-0.93, -0.44]],
    centre: [[0.97, -0.22], [0.85, -0.5], [0.5, -0.74], [0.04, -0.98], [-0.5, -0.74], [-0.85, -0.5], [-0.97, -0.22]],
    curl:   [[0.93, -0.42], [0.75, -0.7], [0.4, -0.8], [0, -0.79], [-0.4, -0.8], [-0.75, -0.7], [-0.93, -0.42]],
    buzz:   [[0.9, -0.46], [0.72, -0.84], [0.35, -0.98], [0, -1.0], [-0.35, -0.98], [-0.72, -0.84], [-0.9, -0.46]]
  };
  var SIDE_BOTTOM = { skin: 0.04, taper: 0.04, short: 0.06, full: 0.22, buzz: 0.02 };

  function catmull(pts, n) { // smooth polyline through control points
    var out = [];
    for (var i = 0; i < pts.length - 1; i++) {
      var p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
      for (var k = 0; k < n; k++) {
        var t = k / n, t2 = t * t, t3 = t2 * t;
        out.push([0, 1].map(function (j) {
          return 0.5 * (2 * p1[j] + (-p0[j] + p2[j]) * t + (2 * p0[j] - 5 * p1[j] + 4 * p2[j] - p3[j]) * t2 + (-p0[j] + 3 * p1[j] - 3 * p2[j] + p3[j]) * t3);
        }));
      }
    }
    out.push(pts[pts.length - 1]);
    return out;
  }

  // Returns the hair outline in (u,v) space: outer contour left→over the top→right, then the inner edge back.
  function outline(t, r) {
    var bottom = SIDE_BOTTOM[t.sides], pts = [];
    var sideT = t.sides === 'full' ? t.t0 + 0.06 : t.sides === 'short' ? t.t0 : t.t0 * 0.6;
    var rough = t.tex === 'curl' ? 0.035 : t.tex === 'wave' ? 0.02 : t.tex === 'textured' ? 0.012 : 0.004;
    var phiEnd = -Math.asin(Math.min(0.9, (bottom - SKULL.cv) / (SKULL.ay * (1 + sideT))));
    for (var i = 0; i <= 90; i++) {
      var phi = Math.PI - phiEnd - (Math.PI - 2 * phiEnd) * (i / 90); // from left-bottom over the top to right-bottom
      var up = Math.max(0, Math.sin(phi));
      var prof = t.mohawk ? Math.exp(-Math.pow((phi - Math.PI / 2) / 0.36, 2)) : Math.pow(up, 1.6);
      // front lift: quiff-style templates carry a little more height toward the face
      var s = 1 + sideT + (t.t0 - sideT) * up + t.vol * prof + (r() - 0.5) * rough * 2;
      pts.push([SKULL.ax * s * Math.cos(phi), SKULL.cv - SKULL.ay * s * Math.sin(phi)]);
    }
    // inner edge: right bottom → right temple → fringe → left temple → left bottom
    var f = FRINGE[t.fringe].slice();
    var inner = [];
    var sideIn = t.sides === 'full' ? 0.99 : 0.965;
    var outerU = pts[pts.length - 1][0];
    // side ends: a pointed sideburn for short sides, uneven ends for longer hair
    var ends = t.sides === 'full'
      ? [[outerU - 0.03, bottom + 0.05], [outerU - 0.07, bottom - 0.01], [sideIn + 0.03, bottom + 0.07], [sideIn, bottom - 0.04]]
      : [[(outerU + sideIn) / 2 + 0.01, bottom + 0.06], [sideIn - 0.005, bottom - 0.09]];
    ends.forEach(function (e) { inner.push(e); });
    var fr = catmull(f, 10);
    var amp = t.tex === 'curl' ? 0.05 : t.tex === 'textured' ? 0.035 : t.tex === 'soft' ? 0.025 : t.tex === 'wave' ? 0.03 : 0.006;
    fr.forEach(function (p, i) {
      var edge = i < 4 || i > fr.length - 5;
      var dv = edge ? 0 : (t.tex === 'curl' || t.tex === 'wave') ? Math.abs(Math.sin(i * 0.9)) * amp : (r() - 0.25) * amp;
      inner.push([p[0], p[1] + dv]);
    });
    ends.slice().reverse().forEach(function (e) { inner.push([-e[0], e[1]]); });
    return pts.concat(inner);
  }

  function pathFrom(ctx, uv) {
    ctx.beginPath();
    uv.forEach(function (q, i) { var p = P(q[0], q[1]); if (i) ctx.lineTo(p[0], p[1]); else ctx.moveTo(p[0], p[1]); });
    ctx.closePath();
  }

  function flowDir(t, u, v) {
    var dx, dy;
    switch (t.flow) {
      case 'back': dx = u * 0.55; dy = -(v + 0.35) - 0.6; break;            // swept up and back from the forehead
      case 'down': dx = u; dy = v + 1.3; break;                              // from the crown toward the fringe
      case 'part': dx = u - t.partU; dy = 0.25; if (u > t.partU) { dx = 1; dy = 0.5; } else { dx = -1; dy = 0.18 + (v + 1) * 0.3; } break;
      case 'centre': dx = u >= 0 ? 1 : -1; dy = 0.9; break;
      case 'wave': dx = u + Math.sin(v * 9) * 0.6; dy = v + 1.3; break;
      default: dx = u; dy = v + 1.3;
    }
    var l = Math.hypot(dx, dy) || 1;
    return [dx / l, dy / l];
  }

  function renderHair(styleId, toneHex, seed) {
    var t = T[styleId] || T.natural, r = rng('hair' + styleId + (seed || ''));
    var bottom = SIDE_BOTTOM[t.sides];
    var tone = hexRgb(toneHex || '#221c19');
    var uv = outline(t, r);
    var hc = canvas(W, H), x = hc.getContext('2d');

    if (t.sides === 'buzz') {
      x.save(); pathFrom(x, uv); x.clip();
      x.fillStyle = css(tone, 0.5); x.fillRect(0, 0, W, H);
      for (var d = 0; d < 9000; d++) {
        var bx = O.cx + (r() - 0.5) * O.rx * 2.4, by = O.cy - O.ry * 1.45 + r() * O.ry * 1.5;
        x.fillStyle = css(shade(tone, (r() - 0.6) * 0.5), 0.35 + r() * 0.4);
        x.fillRect(bx, by, 1.6, 1.6);
      }
      x.restore();
      soften(x, uv, tone, 0.45);
      return hc;
    }

    // 1) base mass with a soft edge
    x.save();
    x.shadowColor = css(tone, 0.9); x.shadowBlur = 7;
    var top = P(0, -1.4), bot = P(0, 0.2);
    var g = x.createLinearGradient(top[0], top[1], bot[0], bot[1]);
    g.addColorStop(0, css(shade(tone, 0.06))); g.addColorStop(0.6, css(tone)); g.addColorStop(1, css(shade(tone, -0.3)));
    x.fillStyle = g; pathFrom(x, uv); x.fill();
    x.restore();

    // 2) strands, clipped to the mass
    x.save(); pathFrom(x, uv); x.clip();
    var n = t.tex === 'curl' ? 1500 : 1700;
    var a = P(-1.3, -1.6), b = P(1.3, 0.3);
    for (var i = 0; i < n; i++) {
      var px = a[0] + r() * (b[0] - a[0]), py = a[1] + r() * (b[1] - a[1]);
      if (!x.isPointInPath(px, py)) continue;
      var u = (px - O.cx) / O.rx, v = (py - O.cy) / O.ry;
      var hi = r() < 0.22;
      var k = hi ? 0.18 + r() * 0.22 + (v < -0.9 ? 0.08 : 0) : -(0.15 + r() * 0.4);
      x.strokeStyle = css(shade(tone, k), hi ? 0.35 + r() * 0.3 : 0.4 + r() * 0.45);
      x.lineWidth = 0.7 + r() * 1.6; x.lineCap = 'round';
      x.beginPath();
      if (t.flow === 'curl') {
        var rad = 5 + r() * 9, st = r() * Math.PI * 2;
        x.arc(px, py, rad, st, st + Math.PI * (0.9 + r() * 0.8));
      } else {
        var dir = flowDir(t, u, v), len = (t.tex === 'sleek' ? 34 : 22) + r() * 30;
        var bend = (r() - 0.5) * (t.tex === 'sleek' ? 6 : 14);
        x.moveTo(px, py);
        x.quadraticCurveTo(px + dir[0] * len / 2 - dir[1] * bend, py + dir[1] * len / 2 + dir[0] * bend, px + dir[0] * len, py + dir[1] * len);
      }
      x.stroke();
    }
    // sheen band
    var sh = P(-0.2, -1.12);
    var sg = x.createRadialGradient(sh[0], sh[1], 10, sh[0], sh[1], O.rx * 0.9);
    sg.addColorStop(0, 'rgba(255,240,225,' + (t.tex === 'sleek' ? 0.2 : 0.12) + ')'); sg.addColorStop(1, 'rgba(255,240,225,0)');
    x.fillStyle = sg; x.fillRect(0, 0, W, H);
    x.restore();

    if (t.tex === 'textured' || t.tex === 'curl' || t.tex === 'wave') {
      for (var fa = 6; fa < 85; fa += 2) {
        if (r() < 0.4) continue;
        var o = P(uv[fa][0], uv[fa][1]), c0 = P(0, -0.3), ox = o[0] - c0[0], oy = o[1] - c0[1], ol = Math.hypot(ox, oy);
        x.strokeStyle = css(shade(tone, (r() - 0.3) * 0.4), 0.5);
        x.lineWidth = 0.8 + r();
        x.beginPath(); x.moveTo(o[0] - ox / ol * 6, o[1] - oy / ol * 6);
        x.quadraticCurveTo(o[0] + (r() - 0.5) * 10, o[1] + (r() - 0.5) * 10, o[0] + ox / ol * (4 + r() * 9), o[1] + oy / ol * (4 + r() * 9)); x.stroke();
      }
    }
    // 3) fringe tips break the hard edge
    if (t.tex !== 'sleek') {
      var fr = catmull(FRINGE[t.fringe], 10);
      for (var j = 3; j < fr.length - 3; j++) {
        if (r() < 0.35) continue;
        var q = P(fr[j][0], fr[j][1] - 0.04), dl = (t.flow === 'back' ? -1 : 1) * (6 + r() * 14);
        x.strokeStyle = css(shade(tone, (r() - 0.5) * 0.4), 0.55);
        x.lineWidth = 1 + r() * 1.4;
        x.beginPath(); x.moveTo(q[0], q[1]); x.lineTo(q[0] + (r() - 0.5) * 8, q[1] + dl); x.stroke();
      }
    }

    // 4) side fades: hair dissolves into stubble toward the ears
    if (t.sides === 'skin' || t.sides === 'taper') {
      var y0 = P(0, t.sides === 'skin' ? -0.6 : -0.38)[1], y1 = P(0, t.sides === 'skin' ? -0.2 : 0.02)[1];
      var keep = t.sides === 'skin' ? 0 : 0.28;
      x.save();
      x.globalCompositeOperation = 'destination-in';
      var mg = x.createLinearGradient(0, y0, 0, y1);
      mg.addColorStop(0, 'rgba(0,0,0,1)'); mg.addColorStop(1, 'rgba(0,0,0,' + keep + ')');
      x.fillStyle = mg; x.fillRect(0, 0, W, H);
      x.restore();
      // stubble
      x.save(); pathFrom(x, uv); x.clip();
      for (var s2 = 0; s2 < 2600; s2++) {
        var sx = O.cx + (r() - 0.5) * O.rx * 2.4, sy = y0 + r() * (P(0, 0.06)[1] - y0);
        var fade = 1 - (sy - y0) / (P(0, 0.06)[1] - y0);
        x.fillStyle = css(tone, (0.12 + 0.4 * fade) * (0.5 + r() * 0.5));
        x.fillRect(sx, sy, 1.4, 1.4);
      }
      x.restore();
    }

    if (t.sides === 'short' || t.sides === 'full') {
      x.save(); x.globalCompositeOperation = 'destination-in';
      var ny0 = P(0, bottom - 0.25)[1], ny1 = P(0, bottom + 0.08)[1];
      var ng = x.createLinearGradient(0, ny0, 0, ny1);
      ng.addColorStop(0, 'rgba(0,0,0,1)'); ng.addColorStop(1, 'rgba(0,0,0,.55)');
      x.fillStyle = ng; x.fillRect(0, 0, W, H); x.restore();
    }
    // 5) part line
    if (t.flow === 'part') {
      var p1 = P(t.partU, -0.95), p2 = P(t.partU + 0.12, -1.38);
      x.strokeStyle = 'rgba(0,0,0,.35)'; x.lineWidth = 2.2;
      x.beginPath(); x.moveTo(p1[0], p1[1]); x.quadraticCurveTo(p1[0] + 6, (p1[1] + p2[1]) / 2, p2[0], p2[1]); x.stroke();
    }
    soften(x, uv, tone, 0.18);
    return hc;
  }

  // light from upper left, a little shadow toward the nape
  function soften(x, uv, tone, k) {
    x.save(); x.globalCompositeOperation = 'source-atop';
    var a = P(-1, -1.4), b = P(0.8, 0.2);
    var g = x.createLinearGradient(a[0], a[1], b[0], b[1]);
    g.addColorStop(0, 'rgba(255,245,235,' + (k * 0.5) + ')'); g.addColorStop(0.5, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,' + k + ')');
    x.fillStyle = g; x.fillRect(0, 0, W, H);
    x.restore();
  }

  // ---------- realism passes (demo) ----------
  // Average colour of a frame region, as [r, g, b, luminance].
  function meanColor(c, a, b) {
    var w = Math.max(1, Math.round(b[0] - a[0])), h = Math.max(1, Math.round(b[1] - a[1]));
    var d = c.getContext('2d').getImageData(Math.round(a[0]), Math.round(a[1]), w, h).data, r = 0, g = 0, bl = 0, n = 0;
    for (var i = 0; i < d.length; i += 16) { r += d[i]; g += d[i + 1]; bl += d[i + 2]; n++; }
    r /= n; g /= n; bl /= n;
    return [r, g, bl, lum(r, g, bl)];
  }
  var statsCache = typeof WeakMap === 'function' ? new WeakMap() : null;
  function photoStats(cropped) {
    var hit = statsCache && statsCache.get(cropped);
    if (hit) return hit;
    var st = { face: meanColor(cropped, P(-0.45, -0.2), P(0.45, 0.45)) };
    statsCache && statsCache.set(cropped, st);
    return st;
  }
  var pixCache = typeof WeakMap === 'function' ? new WeakMap() : null;
  function pixels(c) {
    var hit = pixCache && pixCache.get(c);
    if (hit) return hit;
    var d = c.getContext('2d').getImageData(0, 0, W, H).data;
    pixCache && pixCache.set(c, d);
    return d;
  }
  var canFilter = (function () { try { return typeof canvas(1, 1).getContext('2d').filter === 'string'; } catch (e) { return false; } })();

  // Paints the background back over the visitor's own hair where the new style is smaller, so a tall or
  // wide original cut does not poke out from under a short one. Only pixels that differ clearly from the
  // background (read per row at the frame edges) are replaced, and only above the temples, outside the
  // face and outside the new silhouette — so a plain background, the ears and the face are never touched.
  function rowEdge(d, y, x0, x1) {
    var r = 0, g = 0, b = 0, n = 0;
    for (var yy = Math.max(0, y - 2); yy <= Math.min(H - 1, y + 2); yy += 2)
      for (var xx = x0; xx < x1; xx += 2) { var i = (yy * W + xx) * 4; r += d[i]; g += d[i + 1]; b += d[i + 2]; n++; }
    return [r / n, g / n, b / n];
  }
  function cleanup(x, cropped, uv) {
    var src = pixels(cropped);
    var hm = canvas(W, H), hx = hm.getContext('2d');
    hx.fillStyle = '#000'; pathFrom(hx, uv); hx.fill();
    var hd = hx.getImageData(0, 0, W, H).data;
    var zcy = P(0, SKULL.cv)[1] - O.ry * 0.08, zrx = O.rx * SKULL.ax * 1.42, zry = O.ry * SKULL.ay * 1.42;
    var y0 = Math.max(0, Math.floor(zcy - zry)), y1 = Math.round(P(0, -0.32)[1]), skY = P(0, SKULL.cv)[1];
    var x0 = Math.max(0, Math.floor(O.cx - zrx)), x1 = Math.min(W, Math.ceil(O.cx + zrx));
    var patch = canvas(W, H), px = patch.getContext('2d'), pd = px.createImageData(W, H), out = pd.data, hits = 0;
    for (var y = y0; y < y1; y++) {
      var l = rowEdge(src, y, 0, 28), r = rowEdge(src, y, W - 28, W);
      for (var xx = x0; xx < x1; xx++) {
        var dx = (xx - O.cx) / zrx, dy = (y - zcy) / zry;
        if (dx * dx + dy * dy > 1) continue;
        var fx = (xx - O.cx) / (O.rx * 0.97), fy = (y - O.cy - O.ry * 0.06) / (O.ry * 0.99);
        if (fx * fx + fy * fy < 1) continue;
        // the head itself: under the new style it is scalp and forehead, never background
        var kx = (xx - O.cx) / (O.rx * SKULL.ax * 0.98), ky = (y - skY) / (O.ry * SKULL.ay * 0.98);
        if (kx * kx + ky * ky < 1) continue;
        var i = (y * W + xx) * 4;
        if (hd[i + 3]) continue;
        var t = xx / W, er = l[0] + (r[0] - l[0]) * t, eg = l[1] + (r[1] - l[1]) * t, eb = l[2] + (r[2] - l[2]) * t;
        var dist = Math.abs(src[i] - er) + Math.abs(src[i + 1] - eg) + Math.abs(src[i + 2] - eb);
        if (lum(src[i], src[i + 1], src[i + 2]) < lum(er, eg, eb) - 0.06 || dist > 54) {
          out[i] = er; out[i + 1] = eg; out[i + 2] = eb; out[i + 3] = 255; hits++;
        }
      }
    }
    if (hits < 40) return; // a few stray pixels are noise, not hair
    px.putImageData(pd, 0, 0);
    // drawn twice through a blur: grows over stray strands and leaves no hard edge
    x.save();
    if (canFilter) x.filter = 'blur(4px)';
    x.drawImage(patch, 0, 0); x.drawImage(patch, 0, 0); x.drawImage(patch, 0, 0);
    x.restore();
  }

  // Matches the drawn hair to the photo: darker in a dim photo, a touch of the photo's colour cast, and
  // camera-like grain so it does not look cleaner than the skin next to it.
  var grainTile = null;
  function grain() {
    if (grainTile) return grainTile;
    grainTile = canvas(96, 96);
    var g = grainTile.getContext('2d'), d = g.createImageData(96, 96), r = rng('grain');
    for (var i = 0; i < d.data.length; i += 4) { var v = Math.round(r() * 255); d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 26; }
    g.putImageData(d, 0, 0);
    return grainTile;
  }
  function matchLight(hair, st) {
    var x = hair.getContext('2d'), f = st.face;
    x.save(); x.globalCompositeOperation = 'source-atop';
    var dim = Math.max(0, Math.min(0.38, (0.52 - f[3]) * 0.9));
    if (dim > 0) { x.fillStyle = 'rgba(0,0,0,' + dim.toFixed(3) + ')'; x.fillRect(0, 0, W, H); }
    var lift = Math.max(0, Math.min(0.12, (f[3] - 0.72) * 0.5));
    if (lift > 0) { x.fillStyle = 'rgba(255,255,255,' + lift.toFixed(3) + ')'; x.fillRect(0, 0, W, H); }
    x.fillStyle = css([f[0], f[1], f[2]].map(Math.round), 0.07); x.fillRect(0, 0, W, H);
    x.fillStyle = x.createPattern(grain(), 'repeat'); x.fillRect(0, 0, W, H);
    x.restore();
  }

  function compose(cropped, styleId, tone) {
    var c = canvas(W, H), x = c.getContext('2d');
    x.drawImage(cropped, 0, 0);
    var t = T[styleId] || T.natural, st = photoStats(cropped);
    if (t.sides !== 'buzz') cleanup(x, cropped, outline(t, rng('hair' + styleId)));
    var hair = renderHair(styleId, tone);
    matchLight(hair, st);
    // a feathered copy underneath softens the cut-out edge without blurring the strands
    if (canFilter) { x.save(); x.filter = 'blur(2.5px)'; x.globalAlpha = 0.55; x.drawImage(hair, 0, 0); x.restore(); }
    // contact shadow so the hair sits on the head instead of floating
    // (drawn off-canvas so only the shadow lands; works in browsers without ctx.filter)
    x.save();
    x.shadowColor = 'rgba(0,0,0,.34)'; x.shadowBlur = 22; x.shadowOffsetX = W * 2; x.shadowOffsetY = 10;
    x.drawImage(hair, -W * 2, 0);
    x.restore();
    x.drawImage(hair, 0, 0);
    return c;
  }

  // ---------- sample portrait: an illustration, not a photo of a real person ----------
  function samplePortrait() {
    var c = canvas(W, H), x = c.getContext('2d');
    var bg = x.createLinearGradient(0, 0, 0, H); bg.addColorStop(0, '#E9E4D9'); bg.addColorStop(1, '#D9D2C4');
    x.fillStyle = bg; x.fillRect(0, 0, W, H);
    x.strokeStyle = 'rgba(23,27,26,.045)'; x.lineWidth = 1;
    for (var i = -H; i < W; i += 14) { x.beginPath(); x.moveTo(i, H); x.lineTo(i + H, 0); x.stroke(); }
    var skin = '#E0BC9F', skinD = '#C99C7E', skinDD = '#B5866A';
    // cape
    x.fillStyle = '#29483F';
    x.beginPath(); x.moveTo(-20, H); x.bezierCurveTo(10, 900, 150, 850, 300, 830); x.lineTo(468, 830); x.bezierCurveTo(618, 850, 758, 900, 788, H); x.closePath(); x.fill();
    x.fillStyle = '#B76E50'; x.fillRect(300, 826, 168, 8);
    // neck
    x.fillStyle = skinD; x.beginPath(); x.moveTo(318, 640); x.lineTo(450, 640); x.lineTo(462, 832); x.lineTo(306, 832); x.closePath(); x.fill();
    x.fillStyle = 'rgba(0,0,0,.12)'; x.beginPath(); x.ellipse(384, 700, 80, 34, 0, 0, Math.PI * 2); x.fill();
    // ears
    [-1, 1].forEach(function (sd) {
      var e = P(sd * 1.0, 0.05);
      x.fillStyle = skinD; x.beginPath(); x.ellipse(e[0] + sd * 8, e[1], 26, 48, sd * 0.12, 0, Math.PI * 2); x.fill();
      x.strokeStyle = skinDD; x.lineWidth = 3; x.beginPath(); x.ellipse(e[0] + sd * 10, e[1], 12, 28, sd * 0.12, -Math.PI / 2, Math.PI / 2 * (sd > 0 ? 1 : -1) + (sd > 0 ? 0 : Math.PI)); x.stroke();
    });
    // head (the skull a touch narrower than the hair templates so try-on hair always covers it)
    x.fillStyle = skin;
    var sk = P(0, SKULL.cv);
    x.beginPath(); x.ellipse(sk[0], sk[1], SKULL.ax * 1.02 * O.rx, SKULL.ay * 1.02 * O.ry, 0, Math.PI, 0); x.fill();
    // face
    var fp = [[0, -1.0], [0.62, -0.88], [0.95, -0.42], [1.0, 0.05], [0.9, 0.5], [0.62, 0.84], [0.25, 1.0], [0, 1.02], [-0.25, 1.0], [-0.62, 0.84], [-0.9, 0.5], [-1.0, 0.05], [-0.95, -0.42], [-0.62, -0.88], [0, -1.0]];
    var fc = catmull(fp, 8);
    x.fillStyle = skin; pathFrom(x, fc); x.fill();
    var fs = x.createLinearGradient(P(-1, 0)[0], 0, P(1, 0)[0], 0);
    fs.addColorStop(0, 'rgba(150,95,70,.18)'); fs.addColorStop(0.3, 'rgba(0,0,0,0)'); fs.addColorStop(0.75, 'rgba(0,0,0,0)'); fs.addColorStop(1, 'rgba(150,95,70,.22)');
    x.fillStyle = fs; pathFrom(x, fc); x.fill();
    // very short "before" hair, so the try-on reads clearly
    var buzz = renderHair('buzz', '#2a221e', 'before');
    x.save(); x.globalAlpha = 0.6; x.drawImage(buzz, 0, 0); x.restore();
    // brows
    x.strokeStyle = '#2b2320'; x.lineCap = 'round';
    [-1, 1].forEach(function (sd) {
      x.lineWidth = 10; x.beginPath();
      var a1 = P(sd * 0.2, -0.24), a2 = P(sd * 0.48, -0.31), a3 = P(sd * 0.7, -0.25);
      x.moveTo(a1[0], a1[1]); x.quadraticCurveTo(a2[0], a2[1], a3[0], a3[1]); x.stroke();
      // eyes
      var e = P(sd * 0.44, -0.1);
      x.fillStyle = '#F6EFE6'; x.beginPath(); x.ellipse(e[0], e[1], 30, 11, 0, 0, Math.PI * 2); x.fill();
      x.fillStyle = '#2b2320'; x.beginPath(); x.arc(e[0] + sd * -2, e[1], 9, 0, Math.PI * 2); x.fill();
      x.lineWidth = 3.5; x.beginPath(); x.ellipse(e[0], e[1] + 2, 32, 13, 0, Math.PI * 1.05, Math.PI * 1.95); x.stroke();
    });
    // nose & mouth
    x.strokeStyle = skinDD; x.lineWidth = 4;
    var n1 = P(0.02, -0.02), n2 = P(0.08, 0.3), n3 = P(-0.06, 0.34);
    x.beginPath(); x.moveTo(n1[0], n1[1]); x.quadraticCurveTo(n2[0] + 6, n2[1] - 10, n2[0], n2[1]); x.quadraticCurveTo(n2[0] - 10, n2[1] + 8, n3[0], n3[1]); x.stroke();
    x.strokeStyle = '#A0614F'; x.lineWidth = 6;
    var m1 = P(-0.22, 0.58), m2 = P(0, 0.62), m3 = P(0.22, 0.58);
    x.beginPath(); x.moveTo(m1[0], m1[1]); x.quadraticCurveTo(m2[0], m2[1] + 6, m3[0], m3[1]); x.stroke();
    return { src: c, url: c.toDataURL('image/jpeg', 0.92), w: W, h: H, sample: true };
  }

  // ---------- in-page camera ----------
  // The live preview is a 3:4 <video> with object-fit:cover under the same oval as everything else, so a
  // frame grabbed with the same cover maths is already aligned: no separate framing step after a shot.
  var cam = { stream: null };
  function camSupported() { return !!(window.isSecureContext && navigator.mediaDevices && navigator.mediaDevices.getUserMedia); }
  function camStop() {
    if (cam.stream) cam.stream.getTracks().forEach(function (t) { t.stop(); });
    cam.stream = null;
  }
  function camStart(facing) {
    camStop();
    if (!camSupported()) return Promise.reject(new Error('unsupported'));
    return navigator.mediaDevices.getUserMedia({ audio: false, video: { facingMode: facing || 'user', width: { ideal: 1280 }, height: { ideal: 960 } } })
      .then(function (s) { cam.stream = s; return s; });
  }
  function camCount() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) return Promise.resolve(1);
    return navigator.mediaDevices.enumerateDevices().then(function (d) { return d.filter(function (x) { return x.kind === 'videoinput'; }).length; }, function () { return 1; });
  }
  // Maps a getUserMedia failure to what the visitor can do about it.
  function camError(err) {
    var n = (err && (err.name || err.message)) || '';
    if (n === 'NotAllowedError' || n === 'SecurityError' || n === 'PermissionDeniedError') return 'denied';
    if (n === 'NotFoundError' || n === 'OverconstrainedError' || n === 'DevicesNotFoundError') return 'nocam';
    if (n === 'NotReadableError' || n === 'TrackStartError' || n === 'AbortError') return 'busy';
    return 'unsupported';
  }
  function coverDraw(x, video, w, h, mirror) {
    var vw = video.videoWidth, vh = video.videoHeight, k = Math.max(w / vw, h / vh), dw = vw * k, dh = vh * k;
    x.save();
    if (mirror) { x.translate(w, 0); x.scale(-1, 1); }
    x.drawImage(video, (w - dw) / 2, (h - dh) / 2, dw, dh);
    x.restore();
  }
  // The shot, exactly as the visitor saw it (mirrored for the selfie camera), already in frame coordinates.
  function capture(video, mirror) {
    var c = canvas(W, H);
    coverDraw(c.getContext('2d'), video, W, H, mirror);
    return { src: c, url: c.toDataURL('image/jpeg', 0.9), w: W, h: H, sample: false, shot: true };
  }
  // Mean luminance inside the face oval, 0..1, from a tiny copy of the current frame.
  var meter = null;
  function brightness(video) {
    if (!video || !video.videoWidth) return null;
    meter = meter || canvas(48, 64);
    var x = meter.getContext('2d');
    coverDraw(x, video, 48, 64, false);
    var a = [O.cx - O.rx * 0.6, O.cy - O.ry * 0.6], b = [O.cx + O.rx * 0.6, O.cy + O.ry * 0.6];
    var d = x.getImageData(Math.round(a[0] / 16), Math.round(a[1] / 16), Math.round((b[0] - a[0]) / 16), Math.round((b[1] - a[1]) / 16)).data, t = 0, n = 0;
    for (var i = 0; i < d.length; i += 4) { t += lum(d[i], d[i + 1], d[i + 2]); n++; }
    return n ? t / n : null;
  }

  // Shareable card: the try-on plus the style name, made for saving to the camera roll.
  function poster(composite, info) {
    var c = canvas(W, H + 150), x = c.getContext('2d');
    x.fillStyle = '#0E1110'; x.fillRect(0, 0, c.width, c.height);
    x.drawImage(composite, 0, 0);
    x.fillStyle = '#B76E50'; x.fillRect(0, H, W, 3);
    x.fillStyle = '#E3A487'; x.font = '600 18px "Inter Tight", sans-serif'; x.fillText('KUROHANE  ·  AI STYLE MATCH  ' + info.score + '%', 40, H + 52);
    x.fillStyle = '#F3EFE6'; x.font = '500 40px "Noto Serif JP", serif'; x.fillText(info.name, 40, H + 108);
    x.fillStyle = '#A9AEA8'; x.font = '400 16px "Inter Tight", sans-serif'; x.fillText(info.en + '  —  DEMO / 合成イメージ', 40, H + 134);
    return c.toDataURL('image/png');
  }

  window.KHF = { W: W, H: H, OVAL: O, MAX_BYTES: MAX_BYTES, TEMPLATES: T, load: load, baseWidth: baseWidth, clampTf: clampTf, crop: crop, analyze: analyze, renderHair: renderHair, compose: compose, samplePortrait: samplePortrait, poster: poster,
    camera: { supported: camSupported, start: camStart, stop: camStop, count: camCount, error: camError }, capture: capture, brightness: brightness };
})();
