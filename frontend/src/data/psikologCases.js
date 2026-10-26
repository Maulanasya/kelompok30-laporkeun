// Data contoh untuk halaman psikolog (ganti dengan data dari API nanti).
// Status sesi di UI dipetakan ke enum Prisma: menunggu/berjalan -> AKTIF, selesai -> SELESAI.

export const SESI_STATUS = {
  menunggu: {
    label: "Menunggu diterima",
    cls: "bg-amber-50 text-amber-700 ring-amber-200",
  },
  berjalan: {
    label: "Sedang berjalan",
    cls: "bg-cyan-50 text-cyan-700 ring-cyan-200",
  },
  selesai: {
    label: "Selesai",
    cls: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  },
};

export const CASES = [
  {
    id: "S-2041",
    kode: "LPK-20261018-007",
    kategori: "Kekerasan Fisik",
    lokasi: "Belakang kantin",
    waktuKejadian: "17 Okt 2026, 12.30",
    kronologi:
      "Saya didorong sampai terjatuh oleh tiga kakak kelas saat istirahat. Mereka juga mengambil uang jajan saya dan mengancam kalau saya cerita ke guru. Ini sudah terjadi tiga kali dalam dua minggu terakhir.",
    jumlahBukti: 2,
    dialihkanOleh: "Bu Rina Marlina",
    dialihkanPada: "18 Okt 2026, 09.15",
    alasanPengalihan:
      "Siswa tampak sangat cemas, sulit tidur, dan takut datang ke sekolah. Perlu pendampingan psikologis lanjutan.",
    pelapor: "Celine A.",
    kelas: "XI IPA 2",
    anonim: false,
    status: "menunggu",
    belumDibaca: 0,
    riwayat: [
      { waktu: "17 Okt 2026, 19.02", teks: "Laporan dikirim siswa" },
      { waktu: "18 Okt 2026, 07.40", teks: "Ditinjau oleh Bu Rina Marlina" },
      { waktu: "18 Okt 2026, 09.15", teks: "Dialihkan ke psikolog" },
    ],
  },
  {
    id: "S-2038",
    kode: "LPK-20261016-003",
    kategori: "Bullying",
    lokasi: "Ruang kelas XI IPS 1",
    waktuKejadian: "15 Okt 2026, 10.10",
    kronologi:
      "Beberapa teman sekelas terus mengejek penampilan saya dan membuat grup khusus untuk menertawakan saya. Saya jadi tidak mau masuk kelas.",
    jumlahBukti: 1,
    dialihkanOleh: "Pak Dedi Suherman",
    dialihkanPada: "16 Okt 2026, 13.40",
    alasanPengalihan:
      "Dampak emosional tinggi, siswa menarik diri dan mulai menghindari kegiatan sekolah.",
    pelapor: "",
    kelas: "",
    anonim: true,
    status: "berjalan",
    belumDibaca: 3,
    riwayat: [
      { waktu: "15 Okt 2026, 20.11", teks: "Laporan dikirim siswa" },
      { waktu: "16 Okt 2026, 08.30", teks: "Ditinjau oleh Pak Dedi Suherman" },
      { waktu: "16 Okt 2026, 13.40", teks: "Dialihkan ke psikolog" },
      { waktu: "16 Okt 2026, 14.05", teks: "Pendampingan diterima psikolog" },
    ],
  },
  {
    id: "S-2035",
    kode: "LPK-20261014-011",
    kategori: "Pelecehan/Lainnya",
    lokasi: "Lorong lantai 2",
    waktuKejadian: "13 Okt 2026, 15.45",
    kronologi:
      "Seorang siswa sering mengikuti dan melontarkan komentar tidak pantas ketika saya melewati lorong sepulang sekolah.",
    jumlahBukti: 0,
    dialihkanOleh: "Bu Rina Marlina",
    dialihkanPada: "14 Okt 2026, 10.05",
    alasanPengalihan: "Siswa merasa tidak aman dan menunjukkan gejala kecemasan.",
    pelapor: "Raka P.",
    kelas: "X MIPA 4",
    anonim: false,
    status: "berjalan",
    belumDibaca: 0,
    riwayat: [
      { waktu: "13 Okt 2026, 18.20", teks: "Laporan dikirim siswa" },
      { waktu: "14 Okt 2026, 10.05", teks: "Dialihkan ke psikolog" },
      { waktu: "14 Okt 2026, 11.00", teks: "Pendampingan diterima psikolog" },
    ],
  },
  {
    id: "S-2029",
    kode: "LPK-20261009-002",
    kategori: "Kekerasan Verbal",
    lokasi: "Grup WhatsApp kelas",
    waktuKejadian: "8 Okt 2026, 21.00",
    kronologi:
      "Saya dihina dan dipermalukan di grup kelas secara berulang oleh beberapa teman.",
    jumlahBukti: 3,
    dialihkanOleh: "Pak Dedi Suherman",
    dialihkanPada: "9 Okt 2026, 15.20",
    alasanPengalihan: "Siswa mengalami tekanan emosional dan menurun prestasinya.",
    pelapor: "Nailah M.",
    kelas: "XII IPS 3",
    anonim: false,
    status: "selesai",
    belumDibaca: 0,
    riwayat: [
      { waktu: "9 Okt 2026, 08.00", teks: "Laporan dikirim siswa" },
      { waktu: "9 Okt 2026, 15.20", teks: "Dialihkan ke psikolog" },
      { waktu: "16 Okt 2026, 10.30", teks: "Pendampingan selesai" },
    ],
  },
  {
    id: "S-2024",
    kode: "LPK-20261005-009",
    kategori: "Bullying",
    lokasi: "Lapangan basket",
    waktuKejadian: "4 Okt 2026, 14.00",
    kronologi:
      "Saya sering dikucilkan dan diganggu saat pelajaran olahraga oleh sekelompok siswa.",
    jumlahBukti: 1,
    dialihkanOleh: "Bu Rina Marlina",
    dialihkanPada: "5 Okt 2026, 08.50",
    alasanPengalihan: "Siswa menunjukkan kecemasan sosial yang cukup berat.",
    pelapor: "",
    kelas: "",
    anonim: true,
    status: "selesai",
    belumDibaca: 0,
    riwayat: [
      { waktu: "4 Okt 2026, 19.30", teks: "Laporan dikirim siswa" },
      { waktu: "5 Okt 2026, 08.50", teks: "Dialihkan ke psikolog" },
      { waktu: "12 Okt 2026, 13.15", teks: "Pendampingan selesai" },
    ],
  },
];

// Pesan contoh per sesi. dari: "siswa" | "psikolog"
export const PESAN = {
  "S-2038": [
    { dari: "psikolog", teks: "Halo, terima kasih sudah mau bercerita. Di sini kamu aman, kita jalan pelan-pelan ya.", waktu: "16.10" },
    { dari: "siswa", teks: "Iya, Bu. Saya masih takut masuk kelas.", waktu: "16.22" },
    { dari: "siswa", teks: "Kemarin saya sampai pura-pura sakit supaya bisa pulang.", waktu: "16.23" },
    { dari: "siswa", teks: "Apa itu salah?", waktu: "16.24" },
  ],
  "S-2035": [
    { dari: "psikolog", teks: "Hai Raka, bagaimana perasaanmu hari ini?", waktu: "11.10" },
    { dari: "siswa", teks: "Sedikit lebih tenang, Bu. Terima kasih.", waktu: "11.25" },
  ],
  "S-2029": [
    { dari: "psikolog", teks: "Terima kasih sudah menyelesaikan sesi kita. Kabari lagi kalau kamu butuh.", waktu: "10.30" },
  ],
  "S-2024": [],
  "S-2041": [],
};