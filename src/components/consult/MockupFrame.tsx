import { useEffect, useRef, useState } from 'preact/hooks';

interface Props {
  html: string;
  device: 'desktop' | 'mobile';
  title: string;
}

const WIDTHS = { desktop: 1280, mobile: 390 };

/** Shows the generated page at a real viewport width, scaled down to fit; the page scrolls inside the frame. */
export function MockupFrame({ html, device, title }: Props) {
  const box = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.5);
  const w = WIDTHS[device];

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const fit = () => setScale(Math.min(1, el.clientWidth / w));
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, [w]);

  const viewH = device === 'desktop' ? Math.round(w * 0.62) : 700;
  return (
    <div class={`mf ${device}`}>
      <div class="browser">
        <div class="browser-bar">
          <i></i>
          <i></i>
          <i></i>
          <span>{title.toLowerCase().replace(/[^a-z0-9]+/g, '') || 'preview'}.com</span>
        </div>
        <div class="mf-box" ref={box} style={{ height: `${Math.round(viewH * scale)}px` }}>
          <iframe
            title={title}
            srcDoc={html}
            sandbox="allow-same-origin"
            style={{ width: `${w}px`, height: `${Math.round(viewH)}px`, transform: `scale(${scale})`, left: device === 'mobile' ? `calc(50% - ${(w * scale) / 2}px)` : '0' }}
          />
        </div>
      </div>
    </div>
  );
}
