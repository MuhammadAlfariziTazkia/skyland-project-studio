import type { ImageMetadata } from 'astro';
import arden from '../../assets/work/arden.png';
import kurohane from '../../assets/work/kurohane.png';
import lembar from '../../assets/work/lembar.png';
import tegak from '../../assets/work/tegak.png';
import type { ConceptKey } from '../../i18n/routes';

/**
 * Each concept's own palette and full-page capture, shared by the landing rail and the detail page so the
 * card and the page it opens cannot look like two different projects. The shot is a tall capture produced
 * by `scripts/capture-portfolio.mjs`.
 */
export const CONCEPT_VISUALS: Record<ConceptKey, { shot: ImageMetadata; bg: string; fg: string; accent: string; link: string }> = {
  tegak: { shot: tegak, bg: '#17181a', fg: '#f3f1ec', accent: '#e2601b', link: '#f39a63' },
  lembar: { shot: lembar, bg: '#2f4a3a', fg: '#f5f1e8', accent: '#d9b55a', link: '#e8dcc4' },
  kurohane: { shot: kurohane, bg: '#171b1a', fg: '#f4f1e9', accent: '#b76e50', link: '#ddd8cd' },
  arden: { shot: arden, bg: '#172333', fg: '#fafaf7', accent: '#9a7754', link: '#d9c2a5' },
};
