// Data mock Guru BK. Digunakan sementara sebelum integrasi dengan backend API.
// Status laporan disesuaikan dengan usulan alur penanganan sekolah.

export const STATUS = {
  PENDING: { label: "Menunggu Ditinjau", cls: "bg-amber-50 text-amber-700 border-amber-200" },
  DITINJAU: { label: "Sedang Ditinjau", cls: "bg-cyan-50 text-cyan-700 border-cyan-200" },
  PROSES: { label: "Diproses", cls: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  SELESAI: { label: "Selesai", cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
};

// Kategori jenis laporan kasus
export const CATEGORIES = [
  "BULLYING",
  "KEKERASAN_VERBAL",
  "KEKERASAN_FISIK",
  "PELECEHAN_LAINNYA",
];

export const CATEGORY_LABEL = {
  BULLYING: "Bullying/Perundungan",
  KEKERASAN_VERBAL: "Kekerasan Verbal",
  KEKERASAN_FISIK: "Kekerasan Fisik",
  PELECEHAN_LAINNYA: "Pelecehan/Lainnya",
};
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