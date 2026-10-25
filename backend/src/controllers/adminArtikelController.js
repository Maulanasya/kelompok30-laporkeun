const prisma = require("../config/db");

const LABEL = { judul: "Judul", ringkasan: "Ringkasan", isi: "Isi artikel" };
const LIMITS = { judul: [3, 200], ringkasan: [10, 400], isi: [20, 20000] };

const SELECT = {
  id: true,
  judul: true,
  ringkasan: true,
  isi: true,
  isPublished: true,
  tanggalPublikasi: true,
  createdAt: true,
  updatedAt: true,
  penulis: { select: { nama: true } },
};

// Helper untuk mengirim respon gagal umum
const fail = (res, status, text) =>
  res.status(status).json({ error: text, message: text });

// Helper untuk mengirim respon gagal validasi per field
const failFields = (res, errors) => {
  const field = Object.keys(errors)[0];
  return res
    .status(400)
    .json({ error: errors[field], message: errors[field], field, errors });
};

// Helper untuk konversi string/boolean menjadi boolean murni
const parseBool = (value, fallback) =>
  value === undefined ? fallback : value === true || value === "true" || value === "1";

// Validasi input form artikel (mendukung partial untuk update)
const validate = (body, partial = false) => {
  const data = {};
  const errors = {};

  for (const key of ["judul", "ringkasan", "isi"]) {
    if (body[key] === undefined) {
      if (!partial) errors[key] = `${LABEL[key]} wajib diisi.`;
      continue;
    }
    const value = String(body[key]).trim();
    const [min, max] = LIMITS[key];
    if (value.length < min) errors[key] = `${LABEL[key]} minimal ${min} karakter.`;
    else if (value.length > max) errors[key] = `${LABEL[key]} maksimal ${max} karakter.`;
    else data[key] = value;
  }

  return { data, errors };
};

// Mengatur status publikasi dan tanggal terbit pertama kali
const publishFields = (isPublished, existingDate) => ({
  isPublished,
  ...(isPublished && !existingDate ? { tanggalPublikasi: new Date() } : {}),
});

// Mengambil daftar seluruh artikel (Admin)
exports.list = async (req, res) => {
  try {
    const data = await prisma.kontenEdukasi.findMany({
      orderBy: { createdAt: "desc" },
      select: SELECT,
    });
    res.json({ total: data.length, data });
  } catch (e) {
    console.error("Admin list artikel gagal:", e);
    fail(res, 500, "Gagal memuat artikel.");
  }
};

// Membuat artikel baru
exports.create = async (req, res) => {
  try {
    const { data, errors } = validate(req.body);
    if (Object.keys(errors).length) return failFields(res, errors);

    const isPublished = parseBool(req.body.isPublished, false);

    const article = await prisma.kontenEdukasi.create({
      data: {
        ...data,
        ...publishFields(isPublished, null),
        penulisId: req.user.id,
      },
      select: SELECT,
    });

    res.status(201).json({ message: "Artikel berhasil dibuat.", data: article });
  } catch (e) {
    console.error("Admin create artikel gagal:", e);
    fail(res, 500, "Gagal membuat artikel.");
  }
};

// Memperbarui data artikel
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await prisma.kontenEdukasi.findUnique({
      where: { id },
      select: { tanggalPublikasi: true },
    });
    if (!existing) return fail(res, 404, "Artikel tidak ditemukan.");

    const { data, errors } = validate(req.body, true);
    if (Object.keys(errors).length) return failFields(res, errors);

    const publish =
      req.body.isPublished !== undefined
        ? publishFields(parseBool(req.body.isPublished, false), existing.tanggalPublikasi)
        : {};

    const article = await prisma.kontenEdukasi.update({
      where: { id },
      data: { ...data, ...publish },
      select: SELECT,
    });

    res.json({ message: "Artikel berhasil diperbarui.", data: article });
  } catch (e) {
    console.error("Admin update artikel gagal:", e);
    fail(res, 500, "Gagal memperbarui artikel.");
  }
};

// Mengubah status publikasi artikel saja (terbit / draf)
exports.setPublished = async (req, res) => {
  try {
    const { id } = req.params;
    if (typeof req.body.isPublished !== "boolean") {
      return fail(res, 400, "Nilai isPublished harus true atau false.");
    }

    const existing = await prisma.kontenEdukasi.findUnique({
      where: { id },
      select: { tanggalPublikasi: true },
    });
    if (!existing) return fail(res, 404, "Artikel tidak ditemukan.");

    const article = await prisma.kontenEdukasi.update({
      where: { id },
      data: publishFields(req.body.isPublished, existing.tanggalPublikasi),
      select: SELECT,
    });

    res.json({
      message: article.isPublished ? "Artikel diterbitkan." : "Artikel ditarik dari beranda.",
      data: article,
    });
  } catch (e) {
    console.error("Admin publish artikel gagal:", e);
    fail(res, 500, "Gagal mengubah status artikel.");
  }
};

// Menghapus artikel
exports.remove = async (req, res) => {
  try {
    await prisma.kontenEdukasi.delete({ where: { id: req.params.id } });
    res.json({ message: "Artikel dihapus." });
  } catch (e) {
    if (e.code === "P2025") return fail(res, 404, "Artikel tidak ditemukan.");
    console.error("Admin hapus artikel gagal:", e);
    fail(res, 500, "Gagal menghapus artikel.");
  }
};