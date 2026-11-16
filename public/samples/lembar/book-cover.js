/*
 * <dc-import name="BookCover" title="…" author="…" color="#hex" ink="#hex">
 * Draws a typographic cover with a title-specific vector illustration and a subtle spine.
 *
 * One 200×300 SVG is shared by the hero, product cards, details, and cart.
 * Titles and authors are escaped; color attributes accept six-digit hex values only.
 */
(function () {
  if (customElements.get('dc-import')) return;

  var W = 200;
  var H = 300;

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  // Greedy word wrap by character budget; a word longer than the budget keeps its own line.
  function wrap(text, perLine) {
    var words = String(text || '')
      .split(/\s+/)
      .filter(Boolean);
    var lines = [];
    var line = '';
    for (var i = 0; i < words.length; i++) {
      var next = line ? line + ' ' + words[i] : words[i];
      if (next.length <= perLine || !line) line = next;
      else {
        lines.push(line);
        line = words[i];
      }
    }
    if (line) lines.push(line);
    return lines;
  }

  // Pick the largest size whose wrapped text still fits in maxLines inside `avail` viewBox units.
  // `factor` is the average glyph width in ems: ~0.48 for Newsreader, wider for letter-spaced caps.
  function fit(str, sizes, maxLines, avail, factor) {
    var budget = function (size) {
      return Math.max(5, Math.floor(avail / (size * (factor || 0.48))));
    };
    for (var i = 0; i < sizes.length; i++) {
      var lines = wrap(str, budget(sizes[i]));
      if (lines.length <= maxLines) return { size: sizes[i], lines: lines };
    }
    var last = sizes[sizes.length - 1];
    return { size: last, lines: wrap(str, budget(last)).slice(0, maxLines) };
  }

  function text(x, y, size, fill, opacity, family, weight, spacing, content) {
    return (
      '<text x="' +
      x +
      '" y="' +
      y +
      '" font-family="' +
      family +
      '" font-size="' +
      size +
      '" font-weight="' +
      weight +
      '" letter-spacing="' +
      spacing +
      '" fill="' +
      fill +
      '" fill-opacity="' +
      opacity +
      '">' +
      esc(content) +
      '</text>'
    );
  }

  var SERIF = "'Newsreader', Georgia, serif";
  var SANS = "'DM Sans', system-ui, sans-serif";

  // Small vector illustrations keep every fictional title distinctive at every size.
  function artwork(title, ink) {
    var open = '<g fill="' + ink + '" stroke="' + ink + '">';
    if (/Laut|Pelabuhan/.test(title)) {
      return (
        open +
        '<circle cx="145" cy="173" r="18" stroke="none" opacity=".85"/>' +
        [0, 18, 36, 54]
          .map(function (y) {
            return (
              '<path d="M22 ' +
              (194 + y) +
              ' Q55 ' +
              (169 + y) +
              ' 90 ' +
              (194 + y) +
              ' T200 ' +
              (194 + y) +
              '" fill="none" stroke-width="8" opacity="' +
              (0.75 - y / 120) +
              '"/>'
            );
          })
          .join('') +
        '</g>'
      );
    }
    if (/Teh|Rumah Kaca|Anak Hujan/.test(title)) {
      return (
        open +
        '<path d="M110 255 Q88 210 130 161" fill="none" stroke-width="2"/>' +
        '<ellipse cx="98" cy="224" rx="25" ry="11" transform="rotate(38 98 224)" stroke="none" opacity=".65"/>' +
        '<ellipse cx="126" cy="204" rx="29" ry="12" transform="rotate(-30 126 204)" stroke="none" opacity=".8"/>' +
        '<ellipse cx="111" cy="183" rx="22" ry="10" transform="rotate(45 111 183)" stroke="none" opacity=".55"/>' +
        '<circle cx="161" cy="162" r="11" fill="none" stroke-width="1" opacity=".6"/></g>'
      );
    }
    if (/Kota|Arsitektur/.test(title)) {
      return (
        open +
        '<path d="M35 255V191a29 29 0 0 1 58 0v64Z" stroke="none" opacity=".35"/><path d="M86 255V172a37 37 0 0 1 74 0v83Z" stroke="none" opacity=".65"/><path d="M106 255V179a18 18 0 0 1 36 0v76Z" fill="none" stroke-width="2"/><path d="M28 256h150" stroke-width="1" opacity=".7"/></g>'
      );
    }
    if (/Memperhatikan|Batin|Kalimat/.test(title)) {
      return (
        open +
        '<g transform="translate(108 206)">' +
        [0, 45, 90, 135, 180, 225, 270, 315]
          .map(function (r) {
            return (
              '<ellipse cx="0" cy="-28" rx="12" ry="29" transform="rotate(' +
              r +
              ')" stroke="none" opacity=".7"/>'
            );
          })
          .join('') +
        '<circle r="12" stroke-width="2" fill="none"/></g></g>'
      );
    }
    return (
      open +
      '<circle cx="107" cy="206" r="49" fill="none" stroke-width="1" opacity=".65"/><circle cx="107" cy="206" r="34" fill="none" stroke-width="1" opacity=".7"/><circle cx="107" cy="206" r="17" stroke="none" opacity=".75"/><path d="M45 206h124M107 145v122M63 162l88 88M63 250l88-88" stroke-width="1" opacity=".6"/></g>'
    );
  }

  function draw(title, author, color, ink) {
    var parts = [
      '<rect width="200" height="300" rx="2" fill="' + color + '"/>',
      '<rect width="9" height="300" fill="#000" fill-opacity=".12"/>',
      '<path d="M10 0v300M13 0v300" stroke="' + ink + '" stroke-opacity=".12"/>',
      '<path d="M197 3v294" stroke="#fff" stroke-opacity=".22"/>',
      text(25, 22, 6, ink, 0.7, SANS, 500, '0.2em', 'LEMBAR  /  PILIHAN PEMBACA'),
    ];
    var f = fit(title, [29, 26, 23, 21, 19], 4, 153, 0.52);
    var y = 52;
    for (var j = 0; j < f.lines.length; j++) {
      parts.push(text(25, y, f.size, ink, 1, SERIF, 500, '-0.02em', f.lines[j]));
      y += f.size * 1.04;
    }
    parts.push(artwork(title, ink));
    parts.push('<path d="M25 270h152" stroke="' + ink + '" stroke-opacity=".3"/>');
    var who = fit(String(author || '').toUpperCase(), [9, 8, 7], 1, 153, 0.7);
    parts.push(text(25, 285, who.size, ink, 0.9, SANS, 500, '0.08em', who.lines[0] || ''));
    return parts.join('');
  }

  class DcImport extends HTMLElement {
    static get observedAttributes() {
      return ['name', 'title', 'author', 'color', 'ink'];
    }
    connectedCallback() {
      if (!this.shadowRoot) this.attachShadow({ mode: 'open' });
      this.paint();
    }
    attributeChangedCallback() {
      if (this.isConnected) this.paint();
    }
    paint() {
      var root = this.shadowRoot;
      if (!root) return;
      if (this.getAttribute('name') !== 'BookCover') {
        root.innerHTML = '';
        return;
      }
      var color = /^#[0-9a-f]{6}$/i.test(this.getAttribute('color') || '')
        ? this.getAttribute('color')
        : '#2F4A3A';
      var ink = /^#[0-9a-f]{6}$/i.test(this.getAttribute('ink') || '') ? this.getAttribute('ink') : '#F5F1E8';
      // CSS scales the SVG; only content changes require a new drawing.
      var key = [
        this.getAttribute('title'),
        this.getAttribute('author'),
        color,
        ink,
      ].join('|');
      if (key === this.key) return;
      this.key = key;
      root.innerHTML =
        '<style>:host{display:block;aspect-ratio:2/3;line-height:0}svg{display:block;width:100%;height:100%;' +
        'border-radius:2px 4px 4px 2px;box-shadow:1px 2px 2px rgba(30,28,25,.12),4px 9px 15px rgba(30,28,25,.12)}</style>' +
        '<svg viewBox="0 0 ' +
        W +
        ' ' +
        H +
        '" preserveAspectRatio="xMidYMid meet" role="img" aria-label="' +
        esc(
          (this.getAttribute('title') || '') +
            (this.getAttribute('author') ? ' oleh ' + this.getAttribute('author') : ''),
        ) +
        '">' +
        draw(this.getAttribute('title'), this.getAttribute('author'), color, ink) +
        '</svg>';
    }
  }
  customElements.define('dc-import', DcImport);
})();
