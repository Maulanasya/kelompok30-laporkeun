const prisma = require("../config/db");

const MAX_PESAN = 1000;

// Helper untuk mengirim respon gagal
const fail = (res, status, text) =>
  res.status(status).json({ error: text, message: text });

// Normalisasi kode tiket (uppercase & trim)
const normTiket = (value) => String(value || "").trim().toUpperCase();

const SENDER_SELECT = { id: true, nama: true, role: true };

// Mencari data laporan beserta sesi terkait untuk kebutuhan chat
const findLaporanForChat = (kodeTiket) =>
  prisma.laporan.findUnique({
    where: { kodeTiket },
    select: {
      id: true,
      kodeTiket: true,
      pelaporId: true,
      isAnonim: true,
      status: true,
      isArchived: true,
      sesi: {
        select: { psikologId: true, guruBkId: true, status: true, createdAt: true, jenis: true },
      },
    },
  });

// Memeriksa hak akses user terhadap laporan/chat
const canAccess = (user, laporan) => {
  if (!user || !laporan) return false;
  switch (user.role) {
    case "SISWA":
      return laporan.pelaporId === user.id;
    case "GURU_BK":
    case "ADMIN":
      return true;
    case "PSIKOLOG":
      return laporan.sesi.some((s) => s.psikologId === user.id);
    default:
      return false;
  }
};

// Mengecek apakah laporan sudah selesai atau diarsipkan
const isClosed = (laporan) => laporan.status === "SELESAI" || laporan.isArchived;

// Filter pengirim berdasarkan peran (role) user yang sedang aktif
const senderRoleFilter = (role) => {
  if (role === "GURU_BK" || role === "ADMIN") {
    return { sender: { role: { not: "PSIKOLOG" } } };
  }
  if (role === "PSIKOLOG") {
    return { sender: { role: { not: "GURU_BK" } } };
  }
  return {};
};

// Memeriksa apakah suatu peran dapat melihat pesan dari peran pengirim tertentu
const canSeeMessage = (viewerRole, senderRole) => {
  if (viewerRole === "GURU_BK" || viewerRole === "ADMIN") {
    return senderRole !== "PSIKOLOG";
  }
  if (viewerRole === "PSIKOLOG") {
    return senderRole !== "GURU_BK";
  }
  return true;
};

// Memformat objek chat sebelum dikirim ke client (termasuk masking identitas jika anonim)
const presentChat = (chat, laporan, viewer) => {
  const masked =
    chat.sender.role === "SISWA" && laporan.isAnonim && viewer.role !== "SISWA";

  return {
    id: chat.id,
    pesan: chat.pesan,
    createdAt: chat.createdAt,
    sudahBaca: chat.sudahBaca,
    mine: chat.senderId === viewer.id,
    sender: {
      id: masked ? null : chat.sender.id,
      role: chat.sender.role,
      nama: masked ? "Siswa anonim" : chat.sender.nama,
    },
  };
};

exports.canSeeMessage = canSeeMessage;
exports.presentChat = presentChat;

// Mengecek apakah user memiliki akses ke chat berdasarkan tiket
exports.canAccessChat = async (user, kodeTiket) => {
  const laporan = await findLaporanForChat(normTiket(kodeTiket));
  return Boolean(laporan) && canAccess(user, laporan);
};

// Mengirim pesan chat baru
exports.sendChatMessage = async ({ kodeTiket, userId, pesan }) => {
  try {
    const text = String(pesan ?? "").trim();
    if (!text) {
      return { ok: false, status: 400, error: "Pesan tidak boleh kosong." };
    }
    if (text.length > MAX_PESAN) {
      return {
        ok: false,
        status: 400,
        error: `Pesan terlalu panjang (maksimal ${MAX_PESAN} karakter).`,
      };
    }

    const user = await prisma.user.findUnique({
      where: { id: String(userId || "") },
      select: { id: true, role: true, isActive: true },
    });
    if (!user || !user.isActive) {
      return { ok: false, status: 401, error: "Sesi tidak valid." };
    }

    const laporan = await findLaporanForChat(normTiket(kodeTiket));
    if (!laporan) {
      return { ok: false, status: 404, error: "Laporan tidak ditemukan." };
    }
    if (!canAccess(user, laporan)) {
      return {
        ok: false,
        status: 403,
        error: "Kamu tidak punya akses ke percakapan ini.",
      };
    }
    if (isClosed(laporan)) {
      return {
        ok: false,
        status: 400,
        error: "Percakapan sudah ditutup karena laporan telah selesai.",
      };
    }

    const chat = await prisma.chat.create({
      data: { laporanId: laporan.id, senderId: user.id, pesan: text },
      include: { sender: { select: SENDER_SELECT } },
    });

    return { ok: true, chat, laporan, user };
  } catch (error) {
    console.error("Error saving chat message:", error);
    return { ok: false, status: 500, error: "Gagal mengirim pesan." };
  }
};

// Wrapper untuk menyimpan pesan chat
exports.saveChatMessage = async ({ kodeTiket, senderId, pesan }) => {
  const result = await exports.sendChatMessage({
    kodeTiket,
    userId: senderId,
    pesan,
  });
  return result.ok ? result.chat : null;
};

// Mengambil riwayat pesan berdasarkan kode tiket
exports.getChatHistoryByTiket = async (req, res) => {
  try {
    const kodeTiket = normTiket(req.params.kodeTiket);
    const lawan = req.query.lawan ? String(req.query.lawan).toUpperCase() : null;

    const laporan = await findLaporanForChat(kodeTiket);
    if (!laporan) return fail(res, 404, "Laporan tidak ditemukan.");

    if (!canAccess(req.user, laporan)) {
      return fail(res, 403, "Kamu tidak punya akses ke percakapan ini.");
    }

    let timeFilter = {};

    if (req.user.role === "PSIKOLOG" || (req.user.role === "SISWA" && lawan === "PSIKOLOG")) {
      const sesiPsikolog = laporan.sesi.find(
        (s) => s.psikologId || s.jenis === "PSIKOLOG"
      );

      if (sesiPsikolog) {
        timeFilter = { createdAt: { gte: sesiPsikolog.createdAt } };
      }
    }

    let roleFilter = senderRoleFilter(req.user.role);
    if (req.user.role === "SISWA" && lawan === "PSIKOLOG") {
      roleFilter = { sender: { role: { not: "GURU_BK" } } };
    }

    const chats = await prisma.chat.findMany({
      where: {
        laporanId: laporan.id,
        ...roleFilter,
        ...timeFilter,
      },
      orderBy: { createdAt: "asc" },
      include: { sender: { select: SENDER_SELECT } },
    });

    return res.json({
      kodeTiket: laporan.kodeTiket,
      status: laporan.status,
      readOnly: isClosed(laporan),
      chats: chats.map((c) => presentChat(c, laporan, req.user)),
    });
  } catch (error) {
    console.error("Get Chat History Error:", error);
    return fail(res, 500, "Gagal mengambil riwayat pesan.");
  }
};

// Mengambil daftar chat/percakapan yang aktif bagi user yang sedang login
exports.getChatList = async (req, res) => {
  try {
    const { id: userId, role } = req.user;
    const lawan = req.query.lawan ? String(req.query.lawan).toUpperCase() : null;
    const chatWhere = senderRoleFilter(role);

    const defaultGuruBk = await prisma.user.findFirst({
      where: { role: "GURU_BK", isActive: true },
      select: { nama: true },
    });

    let where;
    if (role === "SISWA") {
      where = {
        pelaporId: userId,
        isArchived: false,
        OR: [{ chats: { some: chatWhere } }, { sesi: { some: {} } }],
      };
    } else if (role === "PSIKOLOG") {
      where = {
        isArchived: false,
        sesi: { some: { psikologId: userId } },
      };
    } else {
      where = { isArchived: false, chats: { some: chatWhere } };
    }

    const laporan = await prisma.laporan.findMany({
      where,
      select: {
        id: true,
        kodeTiket: true,
        isAnonim: true,
        status: true,
        pelapor: { select: { nama: true, kelas: true } },
        sesi: {
          orderBy: { createdAt: "desc" },
          select: {
            jenis: true,
            guruBk: { select: { nama: true } },
            psikolog: { select: { nama: true } },
            psikologId: true,
          },
        },
        chats: {
          where: chatWhere,
          orderBy: { createdAt: "desc" },
          take: 1,
          select: { pesan: true, createdAt: true },
        },
        _count: {
          select: {
            chats: {
              where: {
                ...chatWhere,
                sudahBaca: false,
                senderId: { not: userId },
              },
            },
          },
        },
      },
    });

    const data = laporan
      .map((l) => {
        const last = l.chats[0];

        const sesiBk = l.sesi.find((s) => s.jenis === "BK" || s.guruBk);
        const sesiPsikolog = l.sesi.find((s) => s.jenis === "PSIKOLOG" || s.psikolog || s.psikologId);

        let name = "Pendamping";

        if (role === "SISWA") {
          if (lawan === "BK") {
            name = sesiBk?.guruBk?.nama || defaultGuruBk?.nama || "Guru BK";
          } else if (lawan === "PSIKOLOG") {
            name = sesiPsikolog?.psikolog?.nama || "Psikolog Pendamping";
          } else {
            name =
              sesiPsikolog?.psikolog?.nama ||
              sesiBk?.guruBk?.nama ||
              defaultGuruBk?.nama ||
              "Guru BK";
          }
        } else {
          name = l.isAnonim
            ? "Siswa anonim"
            : `${l.pelapor?.nama || "Siswa"}${
                l.pelapor?.kelas ? ` (${l.pelapor.kelas})` : ""
              }`;
        }

        return {
          id: l.id,
          ticket: l.kodeTiket,
          name,
          lastMessage: last?.pesan || "Belum ada pesan",
          lastAt: last?.createdAt || null,
          time: last
            ? new Date(last.createdAt).toLocaleTimeString("id-ID", {
                hour: "2-digit",
                minute: "2-digit",
                timeZone: "Asia/Jakarta",
              })
            : "",
          unread: l._count.chats,
          status: l.status,
          hasPsikolog: Boolean(sesiPsikolog),
        };
      })
      .sort((a, b) => new Date(b.lastAt || 0) - new Date(a.lastAt || 0));

    return res.json({ total: data.length, data });
  } catch (error) {
    console.error("Get Chat List Error:", error);
    return fail(res, 500, "Gagal mengambil daftar chat.");
  }
};

// Menandai pesan dalam chat sebagai sudah dibaca
exports.markChatRead = async (req, res) => {
  try {
    const kodeTiket = normTiket(req.params.kodeTiket);

    const laporan = await findLaporanForChat(kodeTiket);
    if (!laporan) return fail(res, 404, "Laporan tidak ditemukan.");

    if (!canAccess(req.user, laporan)) {
      return fail(res, 403, "Kamu tidak punya akses ke percakapan ini.");
    }

    const result = await prisma.chat.updateMany({
      where: {
        laporanId: laporan.id,
        sudahBaca: false,
        senderId: { not: req.user.id },
        ...senderRoleFilter(req.user.role),
      },
      data: { sudahBaca: true },
    });

    return res.json({ updated: result.count });
  } catch (error) {
    console.error("Mark Chat Read Error:", error);
    return fail(res, 500, "Gagal menandai pesan sebagai dibaca.");
  }
};