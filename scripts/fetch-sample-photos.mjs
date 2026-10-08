// Downloads the photography used by the concept demos in public/samples/ and writes each
// sample's CREDITS.md from the same manifest, so provenance can never drift from the files.
//
// Every photo is from Pexels under the Pexels License: free for commercial use, no attribution
// required, no sign-up. We still record the source page for each file. Two house rules the
// licence makes us keep: nothing with an identifiable face presented as a named character, and
// nothing showing a real brand, logo or shopfront name.
//
// Usage: node scripts/fetch-sample-photos.mjs [kurohane|arden] [--force]
// Output: public/samples/<key>/img/*.webp  +  public/samples/<key>/CREDITS.md
import sharp from 'sharp';
import { mkdir, writeFile, access } from 'node:fs/promises';

const page = (slug) => `https://www.pexels.com/photo/${slug}/`;
const cdn = (id, w) => `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${w}`;

// Kurohane's art direction asks for natural light and low saturation, so the whole set is
// pulled down a little; it also keeps the grayscale frames from reading as mistakes.
const KURO = { saturation: 0.78 };

const SETS = {
  kurohane: {
    tone: KURO,
    photos: [
      ['hero', 23349899, 'a-hairdresser-cutting-mans-hair-23349899', 1200, 1500, 'A barber’s hands guiding comb and clipper across the back of a client’s head'],
      ['interior', 3993296, 'black-leather-barber-chair-in-room-3993296', 1200, 1500, 'Two leather barber chairs facing the mirrors of an empty studio'],
      ['style-01', 12074386, 'back-view-of-man-with-black-hair-12074386', 750, 1000, 'Skin fade seen from behind'],
      ['style-02', 7956486, 'grayscale-photo-of-the-back-of-the-head-of-a-person-7956486', 750, 1000, 'Short natural cut, back view, grayscale'],
      ['style-03', 6487911, 'mans-close-crop-hairstyle-6487911', 750, 1000, 'Curled, textured hair over a faded side, seen from behind'],
      ['style-04', 4351726, 'man-having-a-haircut-4351726', 750, 1000, 'Clippers tidying the side of a business cut'],
      ['style-05', 11373111, 'back-view-of-man-head-11373111', 750, 1000, 'Cropped cut with a high fade, back view'],
      ['style-06', 5337944, 'back-view-of-a-man-in-black-shirt-5337944', 750, 1000, 'Longer wave-set hair seen from behind'],
      ['style-07', 39559303, 'close-up-of-haircut-at-a-barbershop-39559303', 750, 1000, 'Scissors and comb tapering the back of the head'],
      ['style-08', 7298902, 'close-up-shot-of-a-man-7298902', 750, 1000, 'Softly grown-out hair at the nape, back view'],
      ['style-09', 18503604, 'a-person-getting-a-haircut-18503604', 750, 1000, 'Clipper work along the nape'],
      ['style-10', 10775085, 'a-person-holding-comb-and-hair-clipper-10775085', 750, 1000, 'Comb and clipper held over a very short cut, grayscale'],
      ['style-11', 10775070, 'grayscale-photo-of-person-holding-a-comb-and-a-razor-to-cut-a-someone-s-hair-10775070', 750, 1000, 'Razor and comb at the neckline, grayscale'],
    ],
  },
  arden: {
    photos: [
      ['hero', 13752348, 'exterior-of-a-modern-villa-13752348', 2400, 1030, 'Contemporary residence lit at dusk'],
      ['feature-cedar', 7031604, 'courtyard-of-modern-villa-with-glass-walls-7031604', 1600, 1200, 'Garden elevation of a contemporary house with full-height glazing', 'centre'],
      ['insight-interior', 30307550, 'rustic-wooden-corridor-with-stone-wall-30307550', 1200, 900, 'Timber-lined corridor opening onto a stone wall'],
      ['insight-a', 35361417, 'modern-minimalist-corridor-with-wood-accents-35361417', 480, 480, 'Timber and glass corridor of a house being inspected'],
      ['insight-b', 34573691, 'detailed-architectural-blueprints-on-desk-34573691', 480, 480, 'Architectural drawings spread across a desk'],
      ['insight-c', 1313534, 'gray-city-building-1313534', 480, 480, 'Reflective glass facade of a commercial building'],
      ['lot-cedar', 8134817, 'frontage-of-a-residential-house-with-garden-8134817', 800, 600, 'Detached house with a timber facade and planted frontage'],
      ['lot-harbor', 18087748, 'exterior-of-a-modern-office-building-in-city-18087748', 800, 600, 'Glazed facade of a city office building'],
      ['lot-greenfield', 37129015, 'modern-wooden-house-with-lush-garden-in-ajodhya-37129015', 800, 600, 'Modern family house behind a planted garden', 'centre'],
      ['lot-meridian', 16370914, 'modern-office-building-16370914', 800, 600, 'Mid-rise corner building with ground-floor frontage'],
      ['lot-kaede', 34879483, 'sunny-rural-landscape-with-open-field-34879483', 800, 600, 'Open development land under a clear sky'],
      ['lot-linden', 11631278, 'building-with-balconies-11631278', 800, 600, 'Apartment block with projecting balconies'],
      ['lot-eastport', 36006588, 'modern-industrial-warehouse-exterior-view-36006588', 800, 600, 'Modern logistics warehouse with loading doors'],
      ['lot-aster', 16375856, 'facade-of-townhouses-on-one-of-the-streets-of-london-england-16375856', 800, 600, 'Row of brick terrace houses'],
      ['lot-saito', 29732038, 'neoclassical-architecture-with-corinthian-columns-29732038', 800, 600, 'Neoclassical former branch building with columns', 'centre'],
      ['lot-riverside', 2909671, 'exterior-of-a-residential-block-in-city-2909671', 800, 600, 'Residential block facade with repeating windows'],
      ['lot-orchard', 32367382, 'modern-empty-storefront-with-large-windows-32367382', 800, 600, 'Vacant retail unit with full-height glazing'],
      ['lot-hillcrest', 37214905, 'lush-green-field-with-rustic-brick-structure-37214905', 800, 600, 'Level green plot with services at the boundary'],
    ],
  },
};

const exists = (p) => access(p).then(() => true, () => false);

const only = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const force = process.argv.includes('--force');
const keys = only.length ? only : Object.keys(SETS);

for (const key of keys) {
  const set = SETS[key];
  if (!set) { console.error(`unknown sample "${key}" — expected one of ${Object.keys(SETS).join(', ')}`); process.exitCode = 1; continue; }
  const dir = `public/samples/${key}/img`;
  await mkdir(dir, { recursive: true });

  for (const [name, id, , w, h, alt, crop] of set.photos) {
    const out = `${dir}/${name}.webp`;
    if (!force && (await exists(out))) { console.log(`skip  ${out} (exists)`); continue; }
    // Ask the CDN for at least the final width so we never upscale.
    const res = await fetch(cdn(id, Math.max(w, 1200)));
    if (!res.ok) { console.error(`FAIL  ${name}: pexels ${id} returned ${res.status}`); process.exitCode = 1; continue; }
    let img = sharp(Buffer.from(await res.arrayBuffer())).resize(w, h, { fit: 'cover', position: crop || 'attention' });
    if (set.tone) img = img.modulate(set.tone);
    const info = await img.webp({ quality: 78 }).toFile(out);
    console.log(`write ${out} ${info.width}x${info.height} ${(info.size / 1024).toFixed(0)}KB  "${alt}"`);
  }

  const rows = set.photos.map(([name, id, slug, w, h, alt]) =>
    `| \`img/${name}.webp\` | ${w}×${h} | ${alt} | [pexels.com/photo/…-${id}](${page(slug)}) |`).join('\n');
  await writeFile(`public/samples/${key}/CREDITS.md`, `# Photography credits — ${key} concept demo

Every photograph below comes from **Pexels** under the [Pexels License](https://www.pexels.com/license/):
free for commercial and non-commercial use, modification allowed, **attribution not required**.
This file exists so the provenance of each file stays checkable, not because the licence demands it.
The photographer is named on each source page.

Re-fetch or re-crop them with:

\`\`\`
node scripts/fetch-sample-photos.mjs ${key} --force
\`\`\`

Two constraints the licence puts on us, applied when these were chosen:

- no identifiable face is presented as one of the demo's fictional people — the barber portraits
  in the Kurohane concept are drawn typographic plates, not stock photographs of real people;
- no real brand, logo or shopfront name appears in any frame.

| File | Size | Subject | Source |
| --- | --- | --- | --- |
${rows}
`, 'utf8');
  console.log(`write public/samples/${key}/CREDITS.md`);
}
