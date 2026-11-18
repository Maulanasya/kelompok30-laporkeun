const prisma = require("../config/db");
const mailer = require("./mailer");

const ROLE_LABEL = { SISWA: "Seorang siswa", GURU_BK: "Guru BK", PSIKOLOG: "Psikolog", ADMIN: "Admin" };
const USER_SEL = { id: true, nama: true, email: true, role: true, isActive: true };

const getRecipients = async (laporan, senderRole) => {
  if (senderRole !== "SISWA") {
    const pelapor = await prisma.user.findUnique({
      where: { id: laporan.pelaporId },
      select: USER_SEL,
    });
    return pelapor ? [pelapor] : [];
  }

  const sesi = await prisma.sesiKonsultasi.findMany({
    where: { laporanId: laporan.id, status: "AKTIF" },
    select: { guruBk: { select: USER_SEL }, psikolog: { select: USER_SEL } },
  });

  let guruBk = sesi.find((s) => s.guruBk)?.guruBk;
  if (!guruBk) {
    guruBk = await prisma.user.findFirst({
      where: { role: "GURU_BK", isActive: true },
      orderBy: { createdAt: "asc" },
      select: USER_SEL,
    });
  }
  const psikolog = sesi.find((s) => s.psikolog)?.psikolog;

  return [guruBk, psikolog].filter(Boolean);
};


exports.notifyNewMessage = async ({ chat, laporan, senderRole, activeUserIds }) => {
  console.log("[NOTIFY] dipanggil | laporan.id =", laporan?.id, "| sender =", senderRole);
  try {
    const recipients = await getRecipients(laporan, senderRole);
    console.log("[NOTIFY] penerima:", recipients.map((r) => `${r.role}:${r.email}`));

    for (const r of recipients) {
      if (!r.isActive || !r.email) {
        console.log(`[NOTIFY] skip ${r.role}: nonaktif/tanpa email`);
        continue;
      }
      if (r.id === chat.senderId) continue;
      if (activeUserIds.has(r.id)) {
        console.log(`[NOTIFY] skip ${r.email}: sedang membuka chat`);
        continue;
      }

      const unreadLain = await prisma.chat.count({
        where: {
          laporanId: laporan.id,
          sudahBaca: false,
          id: { not: chat.id },
          senderId: r.role === "SISWA" ? { not: r.id } : laporan.pelaporId,
        },
      });
      if (unreadLain > 0) {
        console.log(`[NOTIFY] skip ${r.email}: ${unreadLain} pesan belum dibaca`);
        continue;
      }

      console.log(`[NOTIFY] kirim ke ${r.email}`);
      await mailer.sendNewMessage({
        to: r.email,
        nama: r.nama,
        kodeTiket: laporan.kodeTiket,
        dari: ROLE_LABEL[senderRole] || "Pendamping",
      });
    }
  } catch (err) {
    console.error("[NOTIFY] notifyNewMessage gagal:", err.message);
  }
};