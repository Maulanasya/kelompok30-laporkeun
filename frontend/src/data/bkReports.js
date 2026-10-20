// Data mock Guru BK. Digunakan sementara sebelum integrasi dengan backend API.
// Status laporan disesuaikan dengan usulan alur penanganan sekolah.

export const STATUS = {
  menunggu: { label: "Menunggu Ditinjau", cls: "bg-amber-50 text-amber-700 border-amber-200" },
  ditinjau: { label: "Sedang Ditinjau", cls: "bg-cyan-50 text-cyan-700 border-cyan-200" },
  ditindaklanjuti: { label: "Ditindaklanjuti", cls: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  dialihkan: { label: "Dialihkan ke Psikolog", cls: "bg-violet-50 text-violet-700 border-violet-200" },
  selesai: { label: "Selesai", cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
};

// Kategori jenis laporan kasus
export const CATEGORIES = [
  "Bullying/perundungan",
  "Kekerasan verbal",
  "Kekerasan fisik",
  "Pelecehan/lainnya",
];

// Daftar psikolog rujukan untuk pengalihan kasus
export const PSIKOLOG = [
  { id: "psi-1", nama: "Sari Wulandari, M.Psi.", fokus: "Trauma dan kecemasan remaja" },
  { id: "psi-2", nama: "Andika Pramudya, M.Psi.", fokus: "Kekerasan fisik dan pemulihan" },
  { id: "psi-3", nama: "Nadia Rahmawati, M.Psi.", fokus: "Cyberbullying dan harga diri" },
];

// Helper untuk membuat entri riwayat otomatis dari sistem
const sistem = (waktu) => ({
  status: "menunggu",
  catatan: "Laporan dikirim siswa.",
  oleh: "Sistem",
  waktu,
});

// Daftar laporan masuk yang diterima Guru BK
export const REPORTS = [
  {
    kode: "LPK-2610-0142",
    kategori: "Kekerasan fisik",
    lokasi: "Lapangan belakang",
    waktu: "16 Okt 2026, 14.20",
    anonim: false,
    pelapor: "Rani Aulia",
    kelas: "X IPA 2",
    status: "menunggu",
    kronologi:
      "Sepulang sekolah saya didorong sampai jatuh oleh tiga siswa kelas XI. Ini sudah terjadi dua kali minggu ini. Saya takut lewat lapangan sendirian.",
    bukti: ["foto-memar.jpg"],
    riwayat: [sistem("16 Okt, 19.05")],
  },
  {
    kode: "LPK-2610-0139",
    kategori: "Bullying/perundungan",
    lokasi: "Grup WhatsApp kelas",
    waktu: "15 Okt 2026, 21.40",
    anonim: true,
    status: "menunggu",
    kronologi:
      "Beberapa teman menyebarkan tangkapan layar chat pribadi saya ke grup kelas dan menjadikannya bahan ejekan. Saya jadi tidak mau masuk sekolah.",
    bukti: ["screenshot-grup-1.png", "screenshot-grup-2.png"],
    riwayat: [sistem("15 Okt, 21.58")],
  },
  {
    kode: "LPK-2610-0131",
    kategori: "Kekerasan verbal",
    lokasi: "Kantin",
    waktu: "13 Okt 2026, 10.15",
    anonim: true,
    status: "ditinjau",
    kronologi:
      "Saya terus-terusan dipanggil dengan julukan yang menghina bentuk tubuh saya di depan banyak orang saat istirahat.",
    bukti: [],
    riwayat: [
      { status: "ditinjau", catatan: "Laporan dibuka dan mulai ditinjau.", oleh: "Guru BK", waktu: "14 Okt, 08.10" },
      sistem("13 Okt, 12.30"),
    ],
  },
  {
    kode: "LPK-2610-0127",
    kategori: "Pelecehan/lainnya",
    lokasi: "Koridor lantai 2",
    waktu: "12 Okt 2026, 15.45",
    anonim: false,
    pelapor: "Dimas Pratama",
    kelas: "XI IPS 1",
    status: "dialihkan",
    kronologi:
      "Saya dihadang dan diperlakukan tidak pantas oleh sekelompok senior. Sejak itu saya sulit tidur dan sering panik saat melewati koridor.",
    bukti: ["foto-lokasi.jpg"],
    riwayat: [
      {
        status: "dialihkan",
        catatan: "Dialihkan ke Sari Wulandari, M.Psi. Siswa menunjukkan gejala panik dan gangguan tidur.",
        oleh: "Guru BK",
        waktu: "14 Okt, 10.20",
      },
      { status: "ditinjau", catatan: "Laporan dibuka dan mulai ditinjau.", oleh: "Guru BK", waktu: "13 Okt, 09.00" },
      sistem("12 Okt, 17.10"),
    ],
  },
  {
    kode: "LPK-2610-0118",
    kategori: "Bullying/perundungan",
    lokasi: "Ruang kelas XI IPA 3",
    waktu: "9 Okt 2026, 11.00",
    anonim: true,
    status: "ditindaklanjuti",
    kronologi:
      "Barang-barang saya sering disembunyikan dan saya dikucilkan saat kerja kelompok.",
    bukti: [],
    riwayat: [
      { status: "ditindaklanjuti", catatan: "Pemanggilan pihak terkait dijadwalkan Kamis.", oleh: "Guru BK", waktu: "12 Okt, 13.30" },
      { status: "ditinjau", catatan: "Laporan dibuka dan mulai ditinjau.", oleh: "Guru BK", waktu: "10 Okt, 08.00" },
      sistem("9 Okt, 15.20"),
    ],
  },
  {
    kode: "LPK-2610-0104",
    kategori: "Kekerasan verbal",
    lokasi: "Area parkir",
    waktu: "2 Okt 2026, 16.00",
    anonim: false,
    pelapor: "Putri Maharani",
    kelas: "X IPS 3",
    status: "selesai",
    kronologi: "Saya dibentak dan diancam oleh kakak kelas karena masalah antrean parkir.",
    bukti: [],
    riwayat: [
      { status: "selesai", catatan: "Mediasi selesai, kedua pihak menyepakati perjanjian tertulis.", oleh: "Guru BK", waktu: "8 Okt, 14.00" },
      { status: "ditinjau", catatan: "Laporan dibuka dan mulai ditinjau.", oleh: "Guru BK", waktu: "3 Okt, 08.15" },
      sistem("2 Okt, 17.00"),
    ],
  },
];

// Daftar percakapan aktif di ruang konsultasi BK 
export const bkConversations = [
  { id: 1, name: "Rani Aulia (X IPA 2)", ticket: "LPK-2610-0142", lastMessage: "Saya takut lewat lapangan, Bu.", time: "09.12", unread: 2 },
  { id: 2, name: "Siswa anonim", ticket: "LPK-2610-0131", lastMessage: "Terima kasih sudah mau mendengarkan.", time: "Kemarin", unread: 0 },
  { id: 3, name: "Siswa anonim", ticket: "LPK-2610-0118", lastMessage: "Baik, saya akan datang hari Kamis.", time: "Senin", unread: 0 },
];

// Detail riwayat pesan pada tiap percakapan (from: "user" = Guru BK, "siswa" = Pelapor)
export const bkMessages = {
  1: [
    { id: 1, from: "siswa", text: "Selamat pagi, Bu. Saya yang kemarin melapor soal kejadian di lapangan." },
    { id: 2, from: "user", text: "Selamat pagi, Rani. Terima kasih sudah berani melapor. Apa kamu sekarang dalam keadaan aman?" },
    { id: 3, from: "siswa", text: "Saya takut lewat lapangan, Bu." },
  ],
  2: [
    { id: 1, from: "user", text: "Laporanmu sedang kami tinjau. Kamu boleh cerita lebih lanjut kalau nyaman." },
    { id: 2, from: "siswa", text: "Terima kasih sudah mau mendengarkan." },
  ],
  3: [
    { id: 1, from: "user", text: "Kami menjadwalkan pertemuan hari Kamis. Apakah kamu bisa hadir?" },
    { id: 2, from: "siswa", text: "Baik, saya akan datang hari Kamis." },
  ],
};