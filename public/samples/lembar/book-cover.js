/*
 * <dc-import name="BookCover" title="…" author="…" color="#hex" ink="#hex">
 * Draws a typographic book cover, the way a small literary publisher would: a solid colour field,
 * a spine, the title set in the page's serif, and the author at the foot.
 *
 * It is one inline SVG on a 200×300 viewBox, so the same code is used from the 52px cart thumbnail
 * up to the 340px cover on the product page. Type does not scale linearly with the box, though:
 * a 9pt author line is unreadable at 52px, so the cover simplifies itself as it gets smaller —
 * full cover, then title only, then a monogram.
 */
(function () {
  if (customElements.get('dc-import')) return;

  var NS = 'http://www.w3.org/2000/svg';
  var W = 200;
  var H = 300;
  var PAD = 26;
  var INNER = W - PAD * 2;


  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  // Greedy word wrap by character budget; a word longer than the budget keeps its own line.
  function wrap(text, perLine) {
    var words = String(text || '').split(/\s+/).filter(Boolean);
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
      '<text x="' + x + '" y="' + y + '" font-family="' + family + '" font-size="' + size + '" font-weight="' + weight +
      '" letter-spacing="' + spacing + '" fill="' + fill + '" fill-opacity="' + opacity + '">' + esc(content) + '</text>'
    );
  }

  var SERIF = "'Newsreader', Georgia, serif";
  var SANS = "'Instrument Sans', system-ui, sans-serif";

  function draw(title, author, color, ink, width) {
    var parts = [
      '<rect width="' + W + '" height="' + H + '" fill="' + color + '"/>',
      // spine: a darker band plus a hairline, so a flat rectangle reads as a book
      '<rect width="16" height="' + H + '" fill="#000" fill-opacity=".13"/>',
      '<rect x="16" width="1" height="' + H + '" fill="' + ink + '" fill-opacity=".22"/>',
    ];

    if (width < 72) {
      // micro: a monogram is the only thing still legible at this size
      var initial = (String(title || '?').trim()[0] || '?').toUpperCase();
      parts.push(text(W / 2 + 8, H / 2 + 34, 108, ink, 0.9, SERIF, 400, 0, initial).replace('<text ', '<text text-anchor="middle" '));
      parts.push('<rect x="' + (PAD + 8) + '" y="' + (H - 42) + '" width="44" height="2" fill="' + ink + '" fill-opacity=".45"/>');
      return parts.join('');
    }

    if (width < 130) {
      // compact: title only, set large enough to survive the downscale
      var c = fit(title, [40, 34, 29, 25], 3, W - (PAD + 8) * 2, 0.48);
      var cy = 104;
      for (var i = 0; i < c.lines.length; i++) {
        parts.push(text(PAD + 8, cy, c.size, ink, 0.95, SERIF, 400, '-0.01em', c.lines[i]));
        cy += c.size * 1.12;
      }
      parts.push('<rect x="' + (PAD + 8) + '" y="' + (H - 46) + '" width="38" height="2" fill="' + ink + '" fill-opacity=".45"/>');
      return parts.join('');
    }

    // full cover: keyline, title block, rule, author, publisher ornament
    parts.push('<rect x="' + PAD + '" y="20" width="' + INNER + '" height="' + (H - 40) + '" fill="none" stroke="' + ink + '" stroke-opacity=".2"/>');

    var f = fit(title, [30, 26, 23, 20, 18], 5, W - PAD * 2 - 24, 0.48);
    var y = 88;
    for (var j = 0; j < f.lines.length; j++) {
      parts.push(text(PAD + 12, y, f.size, ink, 0.96, SERIF, 400, '-0.015em', f.lines[j]));
      y += f.size * 1.14;
    }

    parts.push('<rect x="' + (PAD + 12) + '" y="' + (H - 76) + '" width="34" height="1.5" fill="' + ink + '" fill-opacity=".5"/>');

    var who = String(author || '').toUpperCase();
    var a = fit(who, [12, 11, 10, 9], 2, W - PAD * 2 - 24, 0.66);
    var ay = H - 52;
    for (var k = 0; k < a.lines.length; k++) {
      parts.push(text(PAD + 12, ay, a.size, ink, 0.8, SANS, 500, '0.14em', a.lines[k]));
      ay += a.size * 1.5;
    }

    // publisher device: three dots, no invented name
    for (var d = 0; d < 3; d++) {
      parts.push('<circle cx="' + (W - PAD - 12 - d * 9) + '" cy="' + (H - 32) + '" r="2" fill="' + ink + '" fill-opacity=".45"/>');
    }
    return parts.join('');
  }

  class DcImport extends HTMLElement {
    static get observedAttributes() {
      return ['name', 'title', 'author', 'color', 'ink'];
    }
    connectedCallback() {
      if (!this.shadowRoot) this.attachShadow({ mode: 'open' });
      if (!this.ro && typeof ResizeObserver !== 'undefined') {
        this.ro = new ResizeObserver(() => this.paint());
        this.ro.observe(this);
      }
      this.paint();
    }
    disconnectedCallback() {
      if (this.ro) this.ro.disconnect();
      this.ro = null;
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
      var color = this.getAttribute('color') || '#2F4A3A';
      var ink = this.getAttribute('ink') || '#F5F1E8';
      var width = this.getBoundingClientRect().width || parseFloat(this.style.width) || 160;
      // Re-rendering identical output on every resize tick would throw away the font rendering for nothing.
      var key = [this.getAttribute('title'), this.getAttribute('author'), color, ink, width < 72 ? 'a' : width < 130 ? 'b' : 'c'].join('|');
      if (key === this.key) return;
      this.key = key;
      root.innerHTML =
        '<style>:host{display:block;aspect-ratio:2/3;line-height:0}svg{display:block;width:100%;height:100%;' +
        'box-shadow:0 1px 2px rgba(30,28,25,.16),0 10px 24px rgba(30,28,25,.14)}</style>' +
        '<svg viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="xMidYMid meet" role="img" aria-label="' +
        esc((this.getAttribute('title') || '') + (this.getAttribute('author') ? ' oleh ' + this.getAttribute('author') : '')) + '">' +
        draw(this.getAttribute('title'), this.getAttribute('author'), color, ink, width) +
        '</svg>';
    }
  }
  customElements.define('dc-import', DcImport);
})();
