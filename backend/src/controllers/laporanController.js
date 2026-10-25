const crypto = require("crypto");
const prisma = require("../config/db");
const { emitAdminStats } = require("../services/adminStats");

const KATEGORI = [
  "BULLYING",
  "KEKERASAN_VERBAL",
  "KEKERASAN_FISIK",
  "PELECEHAN_LAINNYA",
];
const STATUS = ["PENDING", "DITINJAU", "PROSES", "SELESAI"];

const MIN_DESKRIPSI = 10;
const MAX_DESKRIPSI = 5000;
const MAX_LOKASI = 200;
const MAX_CATATAN = 500;

// Psikolog hanya boleh menyelesaikan pendampingan; perubahan status lain dilakukan guru BK
const PSIKOLOG_ALLOWED_STATUS = ["SELESAI"];

// Helper untuk mengirim respon gagal
const fail = (res, status, text) =>
  res.status(status).json({ error: text, message: text });

// Custom error untuk penanganan HTTP di dalam transaksi
class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

// Konversi nilai menjadi boolean
const parseBool = (value, fallback) =>
  value === undefined ? fallback : value === true || value === "true" || value === "1";

// Menghasilkan kode tiket unik
const generateKodeTiket = () =>
  "LPR-" + crypto.randomBytes(4).toString("hex").toUpperCase();

// Normalisasi kode tiket (uppercase & trim)
const normTiket = (value) => String(value || "").trim().toUpperCase();

const isPsikolog = (req) => req.user?.role === "PSIKOLOG";
const isAssignedTo = (sesiList, userId) =>
  (sesiList || []).some((s) => s.psikologId === userId);

// Mengambil Guru BK aktif pertama sebagai fallback
const getDefaultGuruBk = () =>
  prisma.user.findFirst({
    where: { role: "GURU_BK", isActive: true },
    orderBy: { createdAt: "asc" },
    select: { id: true, nama: true, email: true },
  });

// Validasi field laporan
const validateFields = ({ lokasiKejadian, waktuKejadian, deskripsi }) => {
  if (lokasiKejadian !== undefined) {
    const lokasi = String(lokasiKejadian).trim();
    if (!lokasi) return "Lokasi kejadian wajib diisi.";
    if (lokasi.length > MAX_LOKASI) return `Lokasi maksimal ${MAX_LOKASI} karakter.`;
  }
  if (waktuKejadian !== undefined) {
    const waktu = new Date(waktuKejadian);
    if (Number.isNaN(waktu.getTime())) return "Format waktu kejadian tidak valid.";
    if (waktu.getTime() > Date.now()) return "Waktu kejadian tidak boleh di masa depan.";
  }
  if (deskripsi !== undefined) {
    const teks = String(deskripsi).trim();
    if (teks.length < MIN_DESKRIPSI)
      return `Deskripsi minimal ${MIN_DESKRIPSI} karakter.`;
    if (teks.length > MAX_DESKRIPSI)
      return `Deskripsi maksimal ${MAX_DESKRIPSI} karakter.`;
  }
  return null;
};

// Format sesi untuk staf (tanpa siswaId / laporanId)
const sesiForStaff = (s, fallbackGuruBk) => ({
  id: s.id,
  status: s.status,
  jenis: s.jenis,
  guruBkId: s.guruBkId,
  psikologId: s.psikologId,
  createdAt: s.createdAt,
  guruBk: s.guruBk || fallbackGuruBk || null,
  psikolog: s.psikolog || null,
});

// Format sesi untuk siswa (hanya nama pendamping)
const sesiForSiswa = (s, defaultGuruBk) => ({
  status: s.status,
  jenis: s.jenis,
  guruBk: { nama: (s.guruBk || defaultGuruBk)?.nama ?? null },
  psikolog: s.psikolog ? { nama: s.psikolog.nama } : null,
});

// Format data laporan untuk staf (dengan masking jika anonim)
const presentForStaff = (laporan, viewer, fallbackGuruBk) => {
  const { pelaporId, pelapor, riwayat, sesi, ...rest } = laporan;

  let pelaporOut = null;
  if (!laporan.isAnonim && pelapor) {
    pelaporOut =
      viewer.role === "PSIKOLOG"
        ? { nama: pelapor.nama, kelas: pelapor.kelas }
        : pelapor;
  }

  return {
    ...rest,
    pelapor: pelaporOut,
    ...(riwayat
      ? {
          riwayat: riwayat.map(({ pengubahId, pengubah, ...r }) => ({
            ...r,
            pengubah:
              laporan.isAnonim && pengubah?.role === "SISWA"
                ? { nama: "Pelapor (anonim)", role: "SISWA" }
                : pengubah,
          })),
        }
      : {}),
    sesi: (sesi || []).map((s) => sesiForStaff(s, fallbackGuruBk)),
  };
};

const SESI_INCLUDE = {
  guruBk: { select: { id: true, nama: true, email: true } },
  psikolog: { select: { id: true, nama: true, email: true } },
};

// 1. Siswa membuat laporan baru
exports.createLaporan = async (req, res) => {
  try {
    const { kategori, lokasiKejadian, waktuKejadian, deskripsi, isAnonim } = req.body;

    if (!kategori || !lokasiKejadian || !waktuKejadian || !deskripsi) {
      return fail(res, 400, "Kategori, lokasi, waktu kejadian, dan deskripsi wajib diisi.");
    }
    if (!KATEGORI.includes(kategori)) {
      return fail(res, 400, "Kategori kasus tidak valid.");
    }
    const invalid = validateFields({ lokasiKejadian, waktuKejadian, deskripsi });
    if (invalid) return fail(res, 400, invalid);

    const data = {
      pelaporId: req.user.id,
      kategori,
      lokasiKejadian: String(lokasiKejadian).trim(),
      waktuKejadian: new Date(waktuKejadian),
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
      riwayat: {
        create: {
          pengubahId: req.user.id,
          statusSebelumnya: null,
          statusBaru: "PENDING",
          catatan: "Laporan dibuat.",
        },
      },
      sesi: {
        create: { siswaId: req.user.id, jenis: "BK", status: "AKTIF" },
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
        return res.status(201).json({ message: "Laporan berhasil dikirim!", laporan });
      } catch (err) {
        if (err.code === "P2002") continue; // Coba lagi jika kode tiket kembar
        throw err;
      }
    }

    return fail(res, 500, "Gagal membuat kode tiket. Coba lagi.");
  } catch (error) {
    console.error("Create Laporan Error:", error);
    return fail(res, 500, "Gagal membuat laporan.");
  }
};

// 2. Guru BK / psikolog melihat daftar laporan
exports.getAllLaporan = async (req, res) => {
  try {
    const { status } = req.query;
    if (status && !STATUS.includes(status)) {
      return fail(res, 400, "Status laporan tidak valid.");
    }

    const daftarLaporan = await prisma.laporan.findMany({
      where: {
        isArchived: false,
        ...(status ? { status } : {}),
        ...(isPsikolog(req) ? { sesi: { some: { psikologId: req.user.id } } } : {}),
      },
      orderBy: { createdAt: "desc" },
      include: {
        pelapor: { select: { nama: true, nisn: true, kelas: true } },
        sesi: {
          where: { status: "AKTIF" },
          take: 1,
          include: SESI_INCLUDE,
        },
      },
    });

    const needsFallback = daftarLaporan.some((l) => l.sesi.some((s) => !s.guruBk));
    const fallbackGuruBk = needsFallback ? await getDefaultGuruBk() : null;

    const data = daftarLaporan.map((l) => presentForStaff(l, req.user, fallbackGuruBk));
    return res.json({ total: data.length, data });
  } catch (error) {
    console.error("Get All Laporan Error:", error);
    return fail(res, 500, "Gagal mengambil data laporan.");
  }
};

// 3. Pelacakan publik berdasarkan kode tiket (tanpa login)
exports.getLaporanByTiket = async (req, res) => {
  try {
    const kodeTiket = normTiket(req.params.kodeTiket);

    const laporan = await prisma.laporan.findUnique({
      where: { kodeTiket },
      select: {
        kodeTiket: true,
        kategori: true,
        waktuKejadian: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        isArchived: true,
        riwayat: {
          orderBy: { createdAt: "asc" },
          select: { statusBaru: true, createdAt: true },
        },
      },
    });

    if (!laporan || laporan.isArchived) {
      return fail(res, 404, "Laporan tidak ditemukan.");
    }

    const { isArchived, ...data } = laporan;
    return res.json({ data });
  } catch (error) {
    console.error("Get Laporan By Tiket Error:", error);
    return fail(res, 500, "Gagal mengambil detail laporan.");
  }
};

// 4. Detail lengkap laporan untuk staf (Guru BK / Psikolog)
exports.getDetailLaporan = async (req, res) => {
  try {
    const kodeTiket = normTiket(req.params.kodeTiket);

    const laporan = await prisma.laporan.findUnique({
      where: { kodeTiket },
      include: {
        pelapor: { select: { nama: true, nisn: true, kelas: true, email: true } },
        bukti: true,
        riwayat: {
          orderBy: { createdAt: "asc" },
          include: { pengubah: { select: { nama: true, role: true } } },
        },
        sesi: { orderBy: { createdAt: "desc" }, include: SESI_INCLUDE },
      },
    });

    if (!laporan) return fail(res, 404, "Laporan tidak ditemukan.");

    if (isPsikolog(req) && !isAssignedTo(laporan.sesi, req.user.id)) {
      return fail(res, 403, "Laporan ini tidak ditugaskan kepadamu.");
    }

    let fallbackGuruBk = null;

    if (req.user.role === "GURU_BK") {
      const belumPunyaBk = laporan.sesi.some((s) => !s.guruBkId && s.status === "AKTIF");
      if (belumPunyaBk) {
        await prisma.sesiKonsultasi.updateMany({
          where: { laporanId: laporan.id, status: "AKTIF", guruBkId: null },
          data: { guruBkId: req.user.id },
        });
      }
      fallbackGuruBk = { id: req.user.id, nama: req.user.nama, email: req.user.email };
    } else if (laporan.sesi.some((s) => !s.guruBk)) {
      fallbackGuruBk = await getDefaultGuruBk();
    }

    return res.json({ data: presentForStaff(laporan, req.user, fallbackGuruBk) });
  } catch (error) {
    console.error("Get Detail Laporan Error:", error);
    return fail(res, 500, "Gagal mengambil detail laporan.");
  }
};

// 5. Mengambil daftar riwayat laporan milik siswa yang sedang login
exports.getLaporanSaya = async (req, res) => {
  try {
    const daftarLaporan = await prisma.laporan.findMany({
      where: { pelaporId: req.user.id },
      orderBy: { createdAt: "desc" },
      include: {
        bukti: { select: { id: true, filePath: true, tipeFile: true, uploadedAt: true } },
        sesi: { orderBy: { createdAt: "desc" }, include: SESI_INCLUDE },
        riwayat: {
          orderBy: { createdAt: "desc" },
          select: { pengubah: { select: { nama: true, role: true } } },
        },
      },
    });

    const defaultGuruBk = await getDefaultGuruBk();

    const data = daftarLaporan.map(({ riwayat, ...lap }) => {
      const sesiPsikolog = lap.sesi.find((s) => s.psikolog);
      const sesiBk = lap.sesi.find((s) => s.guruBk);
      const bkDariRiwayat = riwayat.find((r) => r.pengubah?.role === "GURU_BK")?.pengubah;

      const pendamping = sesiPsikolog
        ? { nama: sesiPsikolog.psikolog.nama, role: "PSIKOLOG" }
        : {
            nama: (sesiBk?.guruBk || bkDariRiwayat || defaultGuruBk)?.nama ?? null,
            role: "GURU_BK",
          };

      return {
        ...lap,
        pendamping,
        sesi: lap.sesi.map((s) => sesiForSiswa(s, defaultGuruBk)),
      };
    });

    return res.json({ total: data.length, data });
  } catch (error) {
    console.error("Get Laporan Saya Error:", error);
    return fail(res, 500, "Gagal mengambil riwayat laporan.");
  }
};

// 6. Memperbarui status laporan (oleh Guru BK atau Psikolog)
exports.updateStatusLaporan = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const catatan = req.body.catatan ? String(req.body.catatan).trim() : null;

    if (!STATUS.includes(status)) {
      return fail(res, 400, "Status laporan tidak valid.");
    }
    if (catatan && catatan.length > MAX_CATATAN) {
      return fail(res, 400, `Catatan maksimal ${MAX_CATATAN} karakter.`);
    }
    if (isPsikolog(req) && !PSIKOLOG_ALLOWED_STATUS.includes(status)) {
      return fail(res, 403, "Psikolog hanya dapat menandai laporan sebagai selesai.");
    }

    const existing = await prisma.laporan.findUnique({
      where: { id },
      select: { status: true, sesi: { select: { psikologId: true } } },
    });
    if (!existing) return fail(res, 404, "Laporan tidak ditemukan.");

    if (isPsikolog(req) && !isAssignedTo(existing.sesi, req.user.id)) {
      return fail(res, 403, "Laporan ini tidak ditugaskan kepadamu.");
    }
    if (existing.status === "SELESAI") {
      return fail(res, 400, "Laporan sudah selesai dan tidak bisa diubah lagi.");
    }
    if (existing.status === status) {
      return fail(res, 400, "Laporan sudah berstatus tersebut.");
    }

    const [updatedLaporan] = await prisma.$transaction([
      prisma.laporan.update({
        where: { id },
        data: {
          status,
          riwayat: {
            create: {
              pengubahId: req.user.id,
              statusSebelumnya: existing.status,
              statusBaru: status,
              catatan,
            },
          },
        },
        select: { id: true, kodeTiket: true, status: true, updatedAt: true },
      }),
      ...(req.user.role === "GURU_BK"
        ? [
            prisma.sesiKonsultasi.updateMany({
              where: { laporanId: id, status: "AKTIF", guruBkId: null },
              data: { guruBkId: req.user.id },
            }),
          ]
        : []),
      ...(status === "SELESAI"
        ? [
            prisma.sesiKonsultasi.updateMany({
              where: { laporanId: id, status: "AKTIF" },
              data: { status: "SELESAI" },
            }),
          ]
        : []),
    ]);

    return res.json({
      message: "Status laporan berhasil diperbarui!",
      laporan: updatedLaporan,
    });
  } catch (error) {
    console.error("Update Status Error:", error);
    return fail(res, 500, "Gagal memperbarui status laporan.");
  }
};

// 7. Siswa mengubah laporannya sendiri (hanya saat status masih PENDING)
exports.updateLaporanSiswa = async (req, res) => {
  try {
    const { id } = req.params;
    const { kategori, lokasiKejadian, waktuKejadian, deskripsi } = req.body;

    const laporan = await prisma.laporan.findUnique({ where: { id } });
    if (!laporan) return fail(res, 404, "Laporan tidak ditemukan.");

    if (laporan.pelaporId !== req.user.id) {
      return fail(res, 403, "Kamu tidak berhak mengubah laporan ini.");
    }
    if (laporan.isArchived || laporan.status !== "PENDING") {
      return fail(res, 400, "Laporan hanya bisa diubah saat status masih menunggu ditinjau.");
    }
    if (kategori !== undefined && !KATEGORI.includes(kategori)) {
      return fail(res, 400, "Kategori kasus tidak valid.");
    }

    const invalid = validateFields({ lokasiKejadian, waktuKejadian, deskripsi });
    if (invalid) return fail(res, 400, invalid);

    const updated = await prisma.laporan.update({
      where: { id },
      data: {
        ...(kategori !== undefined && { kategori }),
        ...(lokasiKejadian !== undefined && { lokasiKejadian: String(lokasiKejadian).trim() }),
        ...(waktuKejadian !== undefined && { waktuKejadian: new Date(waktuKejadian) }),
        ...(deskripsi !== undefined && { deskripsi: String(deskripsi).trim() }),
      },
      select: {
        id: true,
        kodeTiket: true,
        kategori: true,
        lokasiKejadian: true,
        waktuKejadian: true,
        deskripsi: true,
        status: true,
        updatedAt: true,
      },
    });

    return res.json({ message: "Laporan berhasil diperbarui!", laporan: updated });
  } catch (error) {
    console.error("Update Laporan Siswa Error:", error);
    return fail(res, 500, "Gagal memperbarui laporan.");
  }
};

// 8. Mengarsipkan laporan yang sudah selesai (oleh Guru BK)
exports.archiveLaporan = async (req, res) => {
  try {
    const { id } = req.params;

    const laporan = await prisma.laporan.findUnique({ where: { id } });
    if (!laporan) return fail(res, 404, "Laporan tidak ditemukan.");

    if (laporan.status !== "SELESAI") {
      return fail(res, 400, "Hanya laporan berstatus SELESAI yang bisa diarsipkan.");
    }
    if (laporan.isArchived) {
      return fail(res, 400, "Laporan sudah diarsipkan.");
    }

    await prisma.laporan.update({ where: { id }, data: { isArchived: true } });

    return res.json({ message: "Laporan berhasil diarsipkan." });
  } catch (error) {
    console.error("Archive Laporan Error:", error);
    return fail(res, 500, "Gagal mengarsipkan laporan.");
  }
};

// 9. Mengambil daftar psikolog yang aktif
exports.getDaftarPsikolog = async (req, res) => {
  try {
    const data = await prisma.user.findMany({
      where: { role: "PSIKOLOG", isActive: true },
      orderBy: { nama: "asc" },
      select: { id: true, nama: true },
    });

    return res.json({ total: data.length, data });
  } catch (error) {
    console.error("Get Daftar Psikolog Error:", error);
    return fail(res, 500, "Gagal mengambil daftar psikolog.");
  }
};

// 10. Guru BK mengalihkan laporan ke psikolog (dalam transaksi database)
exports.alihkanKePsikolog = async (req, res) => {
  try {
    const { id } = req.params;
    const psikologId = String(req.body.psikologId || "").trim();
    const catatan = req.body.catatan ? String(req.body.catatan).trim() : null;

    if (!psikologId) return fail(res, 400, "Psikolog wajib dipilih.");
    if (catatan && catatan.length > MAX_CATATAN) {
      return fail(res, 400, `Catatan maksimal ${MAX_CATATAN} karakter.`);
    }

    await prisma.$transaction(async (tx) => {
      const psikolog = await tx.user.findFirst({
        where: { id: psikologId, role: "PSIKOLOG", isActive: true },
        select: { id: true },
      });
      if (!psikolog) throw new HttpError(400, "Psikolog yang dipilih tidak ditemukan.");

      const laporan = await tx.laporan.findUnique({
        where: { id },
        include: {
          sesi: { where: { status: "AKTIF" }, orderBy: { createdAt: "desc" }, take: 1 },
        },
      });
      if (!laporan) throw new HttpError(404, "Laporan tidak ditemukan.");
      if (laporan.isArchived) throw new HttpError(400, "Laporan sudah diarsipkan.");
      if (laporan.status === "SELESAI") {
        throw new HttpError(400, "Laporan sudah selesai, tidak bisa dialihkan.");
      }

      const sesi = laporan.sesi[0];
      if (sesi?.psikologId) {
        throw new HttpError(409, "Laporan ini sudah dialihkan ke psikolog.");
      }

      if (sesi) {
        await tx.sesiKonsultasi.update({
          where: { id: sesi.id },
          data: { psikologId: psikolog.id, guruBkId: req.user.id, jenis: "PSIKOLOG" },
        });
      } else {
        await tx.sesiKonsultasi.create({
          data: {
            laporanId: laporan.id,
            siswaId: laporan.pelaporId,
            guruBkId: req.user.id,
            psikologId: psikolog.id,
            jenis: "PSIKOLOG",
            status: "AKTIF",
          },
        });
      }

      await tx.laporan.update({
        where: { id },
        data: {
          status: "PROSES",
          riwayat: {
            create: {
              pengubahId: req.user.id,
              statusSebelumnya: laporan.status,
              statusBaru: "PROSES",
              catatan: catatan || "Dialihkan ke psikolog.",
            },
          },
        },
      });
    });

    return res.json({ message: "Laporan berhasil dialihkan ke psikolog." });
  } catch (error) {
    if (error instanceof HttpError) return fail(res, error.status, error.message);
    console.error("Alihkan ke Psikolog Error:", error);
    return fail(res, 500, "Gagal mengalihkan laporan.");
  }
};