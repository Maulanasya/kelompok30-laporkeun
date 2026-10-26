// Data contoh untuk halaman admin (ganti dengan data dari API nanti).
// Admin TIDAK melihat isi laporan maupun identitas pelapor: hanya kode tiket, kategori, dan status.

export const ROLE_META = {
  GURU_BK: { label: "Guru BK", cls: "bg-cyan-50 text-cyan-700 ring-cyan-200" },
  PSIKOLOG: { label: "Psikolog", cls: "bg-violet-50 text-violet-700 ring-violet-200" },
  SISWA: { label: "Siswa", cls: "bg-slate-100 text-slate-600 ring-slate-200" },
};

export const LAPORAN_STATUS = {
  PENDING: "Menunggu ditinjau",
  DITINJAU: "Ditinjau",
  PROSES: "Diproses",
  SELESAI: "Selesai",
};

export const USERS = [
  { id: "u1", nama: "Bu Rina Marlina", email: "rina.marlina@sekolah.sch.id", role: "GURU_BK", isActive: true, createdAt: "2 Sep 2026" },
  { id: "u2", nama: "Pak Dedi Suherman", email: "dedi.suherman@sekolah.sch.id", role: "GURU_BK", isActive: true, createdAt: "2 Sep 2026" },
  { id: "u3", nama: "Dr. Alya Rahmawati, M.Psi.", email: "alya.rahmawati@sekolah.sch.id", role: "PSIKOLOG", isActive: true, createdAt: "5 Sep 2026" },
  { id: "u4", nama: "Hendra Gunawan, M.Psi.", email: "hendra.g@sekolah.sch.id", role: "PSIKOLOG", isActive: false, createdAt: "5 Sep 2026" },
  { id: "u5", nama: "Celine Anindya", email: "tzh@gmail.com", role: "SISWA", isActive: true, createdAt: "12 Okt 2026" },
  { id: "u6", nama: "Raka Pratama", email: "raka.p@gmail.com", role: "SISWA", isActive: true, createdAt: "13 Okt 2026" },
];

export const ARTIKEL = [
  {
    id: "a1",
    judul: "Mengenali Tanda-Tanda Perundungan di Sekolah",
    ringkasan: "Perundungan tidak selalu terlihat. Kenali perubahan perilaku yang perlu diwaspadai.",
    isi: "Perundungan dapat berbentuk fisik, verbal, maupun sosial. Perubahan perilaku seperti menarik diri, sulit tidur, dan enggan ke sekolah dapat menjadi tanda.",
    tanggalPublikasi: "1 Okt 2026",
    isPublished: true,
    penulis: "Admin",
  },
  {
    id: "a2",
    judul: "Apa yang Harus Dilakukan Saat Kamu Jadi Korban Bullying",
    ringkasan: "Langkah sederhana untuk mencari bantuan dengan aman.",
    isi: "Kamu tidak sendirian. Ceritakan pada orang yang kamu percaya, simpan bukti, dan gunakan LaporKeun! untuk melapor secara aman.",
    tanggalPublikasi: "8 Okt 2026",
    isPublished: true,
    penulis: "Admin",
  },
  {
    id: "a3",
    judul: "Peran Teman Sebaya dalam Menghentikan Perundungan",
    ringkasan: "Saksi mata punya kekuatan besar untuk menghentikan bullying.",
    isi: "Draf artikel tentang peran saksi (bystander) dalam menghentikan perundungan.",
    tanggalPublikasi: "",
    isPublished: false,
    penulis: "Admin",
  },
];

export const STATS = {
  perStatus: { PENDING: 9, DITINJAU: 14, PROSES: 17, SELESAI: 31 },
  perKategori: [
    { label: "Bullying", jumlah: 28 },
    { label: "Kekerasan Verbal", jumlah: 21 },
    { label: "Kekerasan Fisik", jumlah: 12 },
    { label: "Pelecehan/Lainnya", jumlah: 10 },
  ],
};

export const LOG = [
  { id: "l1", kode: "LPK-20261018-007", kategori: "Kekerasan Fisik", dari: "DITINJAU", ke: "PROSES", pengubah: "Bu Rina Marlina", peran: "Guru BK", catatan: "Dialihkan ke psikolog (trauma tinggi)", waktu: "18 Okt 2026, 09.15" },
  { id: "l2", kode: "LPK-20261018-007", kategori: "Kekerasan Fisik", dari: "PENDING", ke: "DITINJAU", pengubah: "Bu Rina Marlina", peran: "Guru BK", catatan: "Laporan mulai ditinjau", waktu: "18 Okt 2026, 07.40" },
  { id: "l3", kode: "LPK-20261016-003", kategori: "Bullying", dari: "DITINJAU", ke: "PROSES", pengubah: "Pak Dedi Suherman", peran: "Guru BK", catatan: "Dialihkan ke psikolog", waktu: "16 Okt 2026, 13.40" },
  { id: "l4", kode: "LPK-20261009-002", kategori: "Kekerasan Verbal", dari: "PROSES", ke: "SELESAI", pengubah: "Dr. Alya Rahmawati, M.Psi.", peran: "Psikolog", catatan: "Pendampingan selesai", waktu: "16 Okt 2026, 10.30" },
  { id: "l5", kode: "LPK-20261005-009", kategori: "Bullying", dari: "PROSES", ke: "SELESAI", pengubah: "Dr. Alya Rahmawati, M.Psi.", peran: "Psikolog", catatan: "Pendampingan selesai", waktu: "12 Okt 2026, 13.15" },
];