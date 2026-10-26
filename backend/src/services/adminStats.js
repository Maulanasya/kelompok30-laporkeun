const prisma = require("../config/db");

const KATEGORI_LABEL = {
  BULLYING: "Bullying",
  KEKERASAN_VERBAL: "Kekerasan verbal",
  KEKERASAN_FISIK: "Kekerasan fisik",
  PELECEHAN_LAINNYA: "Pelecehan lainnya",
};

// Mengambil ringkasan statistik untuk dashboard admin
const getAdminStats = async () => {
  const [statusRows, kategoriRows, akunAktif, artikelTerbit] = await Promise.all([
    prisma.laporan.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.laporan.groupBy({ by: ["kategori"], _count: { _all: true } }),
    prisma.user.count({ where: { isActive: true } }),
    prisma.kontenEdukasi.count({ where: { isPublished: true } }),
  ]);

  const perStatus = { PENDING: 0, DITINJAU: 0, PROSES: 0, SELESAI: 0 };
  statusRows.forEach((r) => (perStatus[r.status] = r._count._all));

  const perKategori = Object.keys(KATEGORI_LABEL).map((key) => ({
    label: KATEGORI_LABEL[key],
    jumlah: kategoriRows.find((r) => r.kategori === key)?._count._all ?? 0,
  }));

  return { perStatus, perKategori, akunAktif, artikelTerbit };
};

// Mengirim update statistik secara real-time ke room "admins" menggunakan debounce
let timer = null;
const emitAdminStats = (io) => {
  if (!io) return;
  clearTimeout(timer);
  timer = setTimeout(async () => {
    try {
      io.to("admins").emit("admin:stats", await getAdminStats());
    } catch (e) {
      console.error("emitAdminStats gagal:", e);
    }
  }, 400);
};

module.exports = { getAdminStats, emitAdminStats };