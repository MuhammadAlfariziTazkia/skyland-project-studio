/*
 * <image-slot placeholder="…" src="…"> — fills its positioned parent with an image,
 * or a labelled placeholder when no src is set. Local preview stand-in.
 */
(function () {
  if (customElements.get('image-slot')) return;
  class ImageSlot extends HTMLElement {
    static get observedAttributes() { return ['src', 'placeholder']; }
    connectedCallback() { this.paint(); }
    attributeChangedCallback() { if (this.isConnected) this.paint(); }
    paint() {
      var root = this.shadowRoot || this.attachShadow({ mode: 'open' });
      var src = this.getAttribute('src'), ph = this.getAttribute('placeholder') || 'Image';
      root.innerHTML = '<style>:host{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;padding:24px;text-align:center;font:500 11px/1.5 "IBM Plex Mono",monospace;letter-spacing:.08em}img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}</style>';
      if (src) { var img = document.createElement('img'); img.src = src; img.alt = ph; root.appendChild(img); }
      else { var s = document.createElement('span'); s.textContent = ph; root.appendChild(s); }
    }
  }
  customElements.define('image-slot', ImageSlot);
})();
