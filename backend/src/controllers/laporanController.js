const crypto = require("crypto");
const prisma = require("../config/db");

const KATEGORI = [
  "BULLYING",
  "KEKERASAN_VERBAL",
  "KEKERASAN_FISIK",
  "PELECEHAN_LAINNYA",
];
const STATUS = ["PENDING", "DITINJAU", "PROSES", "SELESAI"];

const fail = (res, status, text) =>
  res.status(status).json({ error: text, message: text });

const parseBool = (value, fallback) =>
  value === undefined ? fallback : value === true || value === "true" || value === "1";

// Kode tiket acak
const generateKodeTiket = () =>
  "LPR-" + crypto.randomBytes(4).toString("hex").toUpperCase();

// Sembunyikan identitas pelapor jika laporan bersifat anonim
const maskPelapor = (laporan) => ({
  ...laporan,
  pelapor: laporan.isAnonim ? null : laporan.pelapor,
});

// 1. Siswa membuat laporan baru (wajib login, pelapor diambil dari token)
exports.createLaporan = async (req, res) => {
  try {
    const { kategori, lokasiKejadian, waktuKejadian, deskripsi, isAnonim } =
      req.body;

    if (!kategori || !lokasiKejadian || !waktuKejadian || !deskripsi) {
      return fail(
        res,
        400,
        "Kategori, lokasi, waktu kejadian, dan deskripsi wajib diisi."
      );
    }
    if (!KATEGORI.includes(kategori)) {
      return fail(res, 400, "Kategori kasus tidak valid.");
    }

    const waktu = new Date(waktuKejadian);
    if (Number.isNaN(waktu.getTime())) {
      return fail(res, 400, "Format waktu kejadian tidak valid.");
    }
    if (waktu.getTime() > Date.now()) {
      return fail(res, 400, "Waktu kejadian tidak boleh di masa depan.");
    }

    const data = {
      pelaporId: req.user.id,
      kategori,
      lokasiKejadian: String(lokasiKejadian).trim(),
      waktuKejadian: waktu,
      deskripsi: String(deskripsi).trim(),
      isAnonim: parseBool(isAnonim, true), 
      status: "PENDING",
      ...(req.file
        ? {
            bukti: {
              create: {
                filePath: `uploads/bukti/${req.file.filename}`,
                tipeFile: req.file.mimetype,
              },
            },
          }
        : {}),
      // Catat status awal di riwayat
      riwayat: {
        create: {
          pengubahId: req.user.id,
          statusSebelumnya: null,
          statusBaru: "PENDING",
          catatan: "Laporan dibuat.",
        },
      },
    };

    for (let i = 0; i < 5; i++) {
      try {
        const laporan = await prisma.laporan.create({
          data: { ...data, kodeTiket: generateKodeTiket() },
          select: {
            id: true,
            kodeTiket: true,
            kategori: true,
            status: true,
            isAnonim: true,
            createdAt: true,
          },
        });

        return res.status(201).json({
          message: "Laporan berhasil dikirim!",
          laporan,
        });
      } catch (err) {
        if (err.code === "P2002") continue; // kodeTiket sudah dipakai
        throw err;
      }
    }

    return fail(res, 500, "Gagal membuat kode tiket. Coba lagi.");
  } catch (error) {
    console.error("Create Laporan Error:", error);
    return fail(res, 500, "Gagal membuat laporan.");
  }
};

// 2. Guru BK / Admin mengambil semua daftar laporan
exports.getAllLaporan = async (req, res) => {
  try {
    const { status } = req.query;
    if (status && !STATUS.includes(status)) {
      return fail(res, 400, "Status laporan tidak valid.");
    }

    const daftarLaporan = await prisma.laporan.findMany({
      where: status ? { status } : undefined,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        kodeTiket: true,
        kategori: true,
        lokasiKejadian: true,
        waktuKejadian: true,
        status: true,
        isAnonim: true,
        createdAt: true,
        pelapor: { select: { nama: true, nisn: true, kelas: true } },
      },
    });

    const data = daftarLaporan.map(maskPelapor);

    return res.json({ total: data.length, data });
  } catch (error) {
    console.error("Get All Laporan Error:", error);
    return fail(res, 500, "Gagal mengambil data laporan.");
  }
};

// 3. Pelacakan publik berdasarkan Kode Tiket (tanpa login, tanpa data pelapor)
exports.getLaporanByTiket = async (req, res) => {
  try {
    const kodeTiket = String(req.params.kodeTiket || "")
      .trim()
      .toUpperCase();

    const laporan = await prisma.laporan.findUnique({
      where: { kodeTiket },
      select: {
        kodeTiket: true,
        kategori: true,
        lokasiKejadian: true,
        waktuKejadian: true,
        deskripsi: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        riwayat: {
          orderBy: { createdAt: "asc" },
          select: { statusBaru: true, createdAt: true },
        },
      },
    });

    if (!laporan) {
      return fail(res, 404, "Laporan tidak ditemukan.");
    }

    return res.json({ data: laporan });
  } catch (error) {
    console.error("Get Laporan By Tiket Error:", error);
    return fail(res, 500, "Gagal mengambil detail laporan.");
  }
};

// 4. Detail lengkap untuk Guru BK / Admin
exports.getDetailLaporan = async (req, res) => {
  try {
    const kodeTiket = String(req.params.kodeTiket || "")
      .trim()
      .toUpperCase();

    const laporan = await prisma.laporan.findUnique({
      where: { kodeTiket },
      include: {
        pelapor: { select: { nama: true, nisn: true, kelas: true, email: true } },
        bukti: true,
        riwayat: {
          orderBy: { createdAt: "asc" },
          include: { pengubah: { select: { nama: true, role: true } } },
        },
        sesi: { orderBy: { createdAt: "desc" } },
      },
    });

    if (!laporan) {
      return fail(res, 404, "Laporan tidak ditemukan.");
    }

    return res.json({ data: maskPelapor(laporan) });
  } catch (error) {
    console.error("Get Detail Laporan Error:", error);
    return fail(res, 500, "Gagal mengambil detail laporan.");
  }
};

// 5. Riwayat laporan milik siswa yang sedang login
exports.getLaporanSaya = async (req, res) => {
  try {
    const data = await prisma.laporan.findMany({
      where: { pelaporId: req.user.id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        kodeTiket: true,
        kategori: true,
        lokasiKejadian: true,
        waktuKejadian: true,
        status: true,
        isAnonim: true,
        createdAt: true,
        deskripsi: true,      
        bukti: true,          
      },
    });

    return res.json({ total: data.length, data });
  } catch (error) {
    console.error("Get Laporan Saya Error:", error);
    return fail(res, 500, "Gagal mengambil riwayat laporan.");
  }
};
// 6. Guru BK memperbarui status laporan (dicatat di riwayat)
exports.updateStatusLaporan = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, catatan } = req.body; // PENDING, DITINJAU, PROSES, SELESAI

    if (!STATUS.includes(status)) {
      return fail(res, 400, "Status laporan tidak valid.");
    }

    const existing = await prisma.laporan.findUnique({
      where: { id },
      select: { status: true },
    });
    if (!existing) {
      return fail(res, 404, "Laporan tidak ditemukan.");
    }

    const updatedLaporan = await prisma.laporan.update({
      where: { id },
      data: {
        status,
        riwayat: {
          create: {
            pengubahId: req.user.id,
            statusSebelumnya: existing.status,
            statusBaru: status,
            catatan: catatan ? String(catatan).trim() : null,
          },
        },
      },
      select: { id: true, kodeTiket: true, status: true, updatedAt: true },
    });

    return res.json({
      message: "Status laporan berhasil diperbarui!",
      laporan: updatedLaporan,
    });
  } catch (error) {
    console.error("Update Status Error:", error);
    return fail(res, 500, "Gagal memperbarui status laporan.");
  }
};