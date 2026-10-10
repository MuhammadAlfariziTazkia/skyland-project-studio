# Dokumentasi Skyland

Dokumentasi ini disusun dari kode working tree pada **4 Oktober 2026**,
termasuk perubahan lokal yang belum di-commit. Bahasa penjelasan: Indonesia;
nama simbol, field API, dan ID katalog mengikuti kode.

## Catch up dalam satu sesi

Skyland Project Studio menjual jasa pembangunan website. Repository ini
membantu calon klien mengenal studio dan mendapatkan scope, preview, serta
penawaran sebelum menghubungi pemilik. Website yang dipesan tidak dibangun
otomatis oleh aplikasi ini. Produk utamanya adalah funnel pemasaran/konsultasi.

Baca [AGENTS.md](../AGENTS.md), [produk](PRODUCT.md), [arsitektur](ARCHITECTURE.md),
lalu [status proyek](PROJECT_STATUS.md). Setelah itu cukup baca dokumen modul
yang akan diubah. Tidak perlu memasukkan seluruh dokumentasi ke setiap prompt.

| Dokumen | Pertanyaan yang dijawab |
| --- | --- |
| [PRODUCT.md](PRODUCT.md) | Untuk siapa, masalah apa, janji bisnis, journey, scope produk |
| [ARCHITECTURE.md](ARCHITECTURE.md) | Stack, batas browser/server, struktur kode, state, SEO, demo |
| [DOMAIN_PRICING.md](DOMAIN_PRICING.md) | Arti Plan/Page/Feature/Quote, formula dan invariant harga |
| [API_AI.md](API_AI.md) | Kontrak empat API, schema, AI generation/revision, error dan guard |
| [DEVELOPMENT.md](DEVELOPMENT.md) | Setup, commands, recipe perubahan, standar UI, verifikasi |
| [OPERATIONS.md](OPERATIONS.md) | Environment, deploy Vercel, order/email, troubleshooting |
| [DECISIONS.md](DECISIONS.md) | Keputusan yang terwujud di kode dan konsekuensinya |
| [PROJECT_STATUS.md](PROJECT_STATUS.md) | Snapshot terverifikasi, gap nyata, hal yang belum diketahui |
| [HANDOFF_TEMPLATE.md](HANDOFF_TEMPLATE.md) | Format menjaga konteks antar chat/provider |

## Riset harga (Oktober 2026)

Lima dokumen berurutan. Riset awal 8 Okt 2026; **revisi kalibrasi 10 Okt 2026**
memperbaiki kesalahan ekonomi pada dokumen 1 yang menjalar ke 3 dan 4.
Baca berurutan; jangan memakai angka dokumen 1 versi lama.

| Dokumen | Isi |
| --- | --- |
| [PRICING_RESEARCH_01_MARKET.md](PRICING_RESEARCH_01_MARKET.md) | Scope v1 vs maksimal per sample, pembanding pasar, kurs, lantai biaya, fee tiga pasar |
| [PRICING_RESEARCH_02_SIMULATION.md](PRICING_RESEARCH_02_SIMULATION.md) | Simulasi mesin commit `243a9d4` apa adanya, ledger, probe, batas verifikasi |
| [PRICING_RESEARCH_03_EVALUATION.md](PRICING_RESEARCH_03_EVALUATION.md) | Sembilan akar penyebab, selisih diukur pada scope setara, uji lantai biaya |
| [PRICING_RESEARCH_04_STRATEGY.md](PRICING_RESEARCH_04_STRATEGY.md) | Rancangan scope/estimator, rate card, status policy, urutan implementasi |
| [PRICING_RESEARCH_05_COMMERCIAL.md](PRICING_RESEARCH_05_COMMERCIAL.md) | Bauran pasar, termin pembayaran, kebijakan diskon, pekerjaan yang ditolak |

## Memulai agent lain

Codex dapat menemukan instruksi root melalui `AGENTS.md`. `CLAUDE.md` memakai
import `@AGENTS.md` agar panduan Claude Code tidak menjadi salinan yang mudah
berbeda. Agent yang tidak otomatis membaca salah satu file tersebut cukup
diberi prompt ini:

```text
Kerjakan tugas ini di repository Skyland: <tugas konkret>.
Mulai dengan membaca AGENTS.md dan docs/README.md, lalu PRODUCT.md,
ARCHITECTURE.md, PROJECT_STATUS.md, dan dokumen modul yang relevan.
Periksa git status dan pertahankan perubahan lokal yang sudah ada.
Gunakan kode/test sebagai bukti perilaku saat ini; bedakan fakta, dugaan,
dan usulan. Lanjutkan handoff terakhir jika tersedia. Setelah perubahan,
jalankan pemeriksaan relevan dan perbarui dokumentasi yang terdampak.
```

Auto-discovery bergantung pada alat/provider; dokumentasi ini tidak mengandalkan
memori chat atau fitur memori proprietary. Semua link menggunakan path relatif
repository agar tetap dapat dibaca setelah clone di mesin lain.

## Aturan menjaga dokumentasi

- Update dokumen modul bersamaan dengan perubahan perilaku atau kontrak.
- Harga dan daftar item lengkap tetap di `data/pricing.json`; tabel di dokumen
  adalah snapshot untuk orientasi, bukan sumber angka runtime.
- `PROJECT_STATUS.md` harus bertanggal; jangan menganggap hasil test lama berlaku
  untuk checkout baru. Daftar gap bukan scope pekerjaan otomatis.
- Simpan keputusan penting di `DECISIONS.md`, termasuk alasan dan tradeoff.
- Untuk pekerjaan panjang, isi template handoff ke `docs/handoffs/<tanggal>-<topik>.md`
  dengan status riil, file terkait, hasil cek, dan next step. Folder dibuat saat
  handoff pertama diperlukan; jangan menyalin rahasia atau data pribadi.
- Jangan menyimpan seluruh transkrip chat. Simpan informasi yang dibutuhkan
  agent berikutnya untuk melanjutkan tanpa menebak.

## Sumber kebenaran

| Area | Otoritas implementasi |
| --- | --- |
| Scope/janji layanan saat ini | Copy EN/ID, `LegalPage.astro`, `payment_terms` |
| Harga, visibility halaman, timeline | `src/lib/pricing.ts` + data + test |
| Request dan hasil parsing | `src/lib/schemas.ts` |
| Kontrak ke model AI | JSON Schema dan prompt di `src/lib/openai.ts` |
| Alur dan state browser | `Consultant.tsx` dan komponen step |
| Delivery penawaran | API order + `src/lib/mail.ts` |
| Routing bilingual | `src/i18n/routes.ts` + file `src/pages/` |
| Build/deployment | `package.json`, lockfile, `astro.config.mjs` |

Sebagian prose legacy di JSON/README tidak sama dengan perilaku runtime.
Perbedaannya dicatat di [status proyek](PROJECT_STATUS.md); jangan mengubah
implementasi hanya karena mengikuti contoh lama di `output_schema` JSON.
