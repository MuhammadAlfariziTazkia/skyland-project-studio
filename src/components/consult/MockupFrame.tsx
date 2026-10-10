import { useLayoutEffect, useRef, useState } from 'preact/hooks';

interface Props {
  html: string;
  device: 'desktop' | 'mobile';
  title: string;
  /** Label for the touch overlay that hands scrolling over to the preview. */
  exploreLabel: string;
}

const WIDTHS = { desktop: 1280, mobile: 390 };
/** Never taller than this share of the viewport, so there is always page left to scroll. */
const MAX_VIEWPORT_SHARE = 0.68;

/** Shows the generated page at a real viewport width, scaled down to fit; the page scrolls inside the frame. */
export function MockupFrame({ html, device, title, exploreLabel }: Props) {
  const box = useRef<HTMLDivElement>(null);
  /*
   * null until measured. The old default of 0.5 was almost never right — on a 360px screen the real fit
   * is 0.92 — so every visitor watched the preview jump size once the ResizeObserver fired.
   */
  const [scale, setScale] = useState<number | null>(null);
  const [live, setLive] = useState(false);
  const w = WIDTHS[device];

  useLayoutEffect(() => {
    const el = box.current;
    if (!el) return;
    const fit = () => setScale(Math.min(1, el.clientWidth / w));
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, [w]);

  // A desktop page is framed by its aspect ratio; a phone page is as tall as the screen it imitates,
  // capped so the preview never fills the whole viewport and strands the visitor inside it.
  const viewH = device === 'desktop'
    ? Math.round(w * 0.62)
    : Math.min(700, Math.max(480, Math.round((typeof window === 'undefined' ? 800 : window.innerHeight) * 0.9)));

  return (
    <div class={`mf ${device}${live ? ' live' : ''}`}>
      <div class="browser">
        <div class="browser-bar">
          <i></i>
          <i></i>
          <i></i>
          <span>{title.toLowerCase().replace(/[^a-z0-9]+/g, '') || 'preview'}.com</span>
        </div>
        <div
          class="mf-box"
          ref={box}
          style={{
            height: scale == null ? undefined : `min(${Math.round(viewH * scale)}px, ${Math.round(MAX_VIEWPORT_SHARE * 100)}vh)`,
            aspectRatio: scale == null ? `${w} / ${viewH}` : undefined,
          }}
        >
          {scale != null && (
            <iframe
              title={title}
              srcDoc={html}
              sandbox="allow-same-origin"
              style={{
                width: `${w}px`,
                height: `${Math.round(viewH)}px`,
                transform: device === 'mobile' ? `translateX(-50%) scale(${scale})` : `scale(${scale})`,
                left: device === 'mobile' ? '50%' : '0',
              }}
            />
          )}
          {/*
            * On a phone the frame is most of the screen, and an iframe swallows every touch inside it —
            * there was no way to scroll past the preview and reach the price. This invisible overlay
            * keeps the gesture on the page until the visitor asks for the preview instead. It carries no
            * label of its own: anything drawn over the preview covered either the mockup's own header or
            * its draft watermark, so the wording sits under the frame instead. A mouse has a scrollbar
            * and never had the problem, so CSS hides all of this for a fine pointer.
            */}
          {!live && <button type="button" class="mf-tap" aria-label={exploreLabel} onClick={() => setLive(true)} />}
        </div>
      </div>
      {!live && <p class="mf-hint">{exploreLabel}</p>}
    </div>
  );
}
