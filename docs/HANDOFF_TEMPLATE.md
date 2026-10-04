# Template handoff lintas sesi/agent

Salin isi blok berikut ke `docs/handoffs/YYYY-MM-DD-topik.md` saat pekerjaan
perlu dilanjutkan. Simpan hanya konteks yang diperlukan, tanpa secret/data klien.
Tanggal/waktu memakai konteks pengguna (Asia/Tokyo untuk audit awal), bukan
otomatis timezone log host. Tidak perlu membuat handoff untuk setiap edit kecil.

```markdown
# Handoff: <topik>

Tanggal: <tanggal dan timezone>
Status: <selesai / berjalan / menunggu informasi / terblokir>
Branch dan commit dasar: <branch>, <hash>

## Tujuan pemilik

<Permintaan konkret, acceptance criteria, batas scope, keputusan yang sudah
disepakati. Tulis sehingga pembaca tidak memerlukan transkrip chat.>

## Kondisi working tree

<Perubahan yang sudah ada sebelum sesi vs perubahan sesi ini. File yang jangan
ditimpa. Commit yang dibuat jika ada. Jangan menganggap dirty berarti aman dibuang.>

## Yang selesai

- <Perubahan dan perilaku hasilnya; link relatif file.>
- <Dokumentasi yang diperbarui.>

## Bukti dan keputusan

<Fakta dari kode/test, asumsi yang masih terbuka, keputusan produk/teknis dan
alasan. Tautkan DECISIONS bila perubahan arsitektur sudah diadopsi.>

## Verifikasi

| Command/kasus | Hasil | Batas |
| --- | --- | --- |
| <command> | <lulus/gagal, jumlah bila relevan> | <fixture/production/local> |

<Untuk gagal: gejala, file/lokasi, error relevan yang sudah disanitasi,
langkah reproduksi, apakah sudah ada sebelum perubahan.>

## Pekerjaan tersisa

1. <Next action spesifik, file awal, outcome yang harus diperiksa.>
2. <Acceptance criteria yang belum terpenuhi.>

## Penghambat atau pertanyaan terbuka

<Informasi yang belum ada dan dampaknya. Bila tidak ada, tulis tidak ada.
Jangan meminta ulang keputusan yang sudah diberikan pemilik.>

## Cara melanjutkan

<Commands untuk reproduksi/resume, lokasi server/test fixtures, artifacts,
atau setup non-rahasia. Jika server sementara sudah berhenti, tulis demikian.>

## Risiko dan pekerjaan di luar scope

<Hanya risiko nyata yang relevan. Usulan berikutnya tidak berarti otomatis
diotorisasi. Jangan mengklaim deployment/email nyata telah diuji bila belum.>
```

Prompt singkat untuk sesi berikutnya:

```text
Baca AGENTS.md, docs/README.md, dan docs/handoffs/<file-terakhir>.md.
Periksa git status dan keadaan file sekarang sebelum melanjutkan next steps.
Pertahankan tujuan/keputusan pemilik di handoff; verifikasi ulang asumsi yang
bergantung kode/environment terbaru. Kerjakan <next task konkret>.
```
