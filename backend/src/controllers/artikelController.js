const prisma = require("../config/db");

const MAX_LIMIT = 24;

// Mengambil daftar artikel yang sudah terbit untuk publik (diurutkan dari yang terbaru)
exports.listPublished = async (req, res) => {
  try {
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 12, 1), MAX_LIMIT);

    const articles = await prisma.kontenEdukasi.findMany({
      where: { isPublished: true },
      orderBy: [
        { tanggalPublikasi: { sort: "desc", nulls: "last" } },
        { createdAt: "desc" },
      ],
      take: limit,
      select: {
        id: true,
        judul: true,
        ringkasan: true,
        tanggalPublikasi: true,
        createdAt: true,
      },
    });

    res.json({ articles });
  } catch (e) {
    console.error("GET /artikel gagal:", e);
    res.status(500).json({ error: "Gagal memuat artikel." });
  }
};

// Mengambil detail lengkap satu artikel yang sudah terbit berdasarkan ID (artikel draf tidak dapat diakses)
exports.getPublishedById = async (req, res) => {
  try {
    const article = await prisma.kontenEdukasi.findFirst({
      where: { id: String(req.params.id), isPublished: true },
      select: {
        id: true,
        judul: true,
        ringkasan: true,
        isi: true,
        tanggalPublikasi: true,
        createdAt: true,
      },
    });
    if (!article) return res.status(404).json({ error: "Artikel tidak ditemukan." });
    res.json({ data: article });
  } catch (e) {
    console.error("GET /artikel/:id gagal:", e);
    res.status(500).json({ error: "Gagal memuat artikel." });
  }
};