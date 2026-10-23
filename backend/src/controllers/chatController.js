const prisma = require("../config/db");

// Simpan pesan (dipanggil dari Socket.IO)
exports.saveChatMessage = async ({ kodeTiket, senderId, pesan }) => {
  try {
    const laporan = await prisma.laporan.findUnique({ where: { kodeTiket } });
    if (!laporan) return null;

    const chatBaru = await prisma.chat.create({
      data: {
        laporanId: laporan.id,
        senderId: senderId || null,
        pesan,
      },
      include: {
        sender: { select: { id: true, nama: true, role: true } },
      },
    });

    return chatBaru;
  } catch (error) {
    console.error("Error saving chat message:", error);
    return null;
  }
};

// Ambil riwayat chat (dipanggil dari REST API)
exports.getChatHistoryByTiket = async (req, res) => {
  try {
    const { kodeTiket } = req.params;
    const userRole = req.user?.role; // Ambil role user dari token

    const laporan = await prisma.laporan.findUnique({
      where: { kodeTiket },
      include: {
        chats: {
          orderBy: { createdAt: "asc" },
          include: {
            sender: { select: { id: true, nama: true, role: true } },
          },
        },
      },
    });

    if (!laporan) return res.status(404).json({ error: "Laporan tidak ditemukan." });

    let filteredChats = laporan.chats;

    // FILTER CHAT BERDASARKAN ROLE
    if (userRole === "GURU_BK" || userRole === "ADMIN") {
      // Guru BK cuma bisa lihat chat dari SISWA dan GURU_BK
      filteredChats = laporan.chats.filter((c) => c.sender?.role !== "PSIKOLOG");
    } else if (userRole === "PSIKOLOG") {
      // Psikolog cuma bisa lihat chat dari SISWA dan PSIKOLOG
      filteredChats = laporan.chats.filter((c) => c.sender?.role !== "GURU_BK");
    }
    // Siswa bisa lihat semua chat

    return res.json({
      kodeTiket: laporan.kodeTiket,
      chats: filteredChats,
    });
  } catch (error) {
    console.error("Get Chat History Error:", error);
    return res.status(500).json({ error: "Gagal mengambil riwayat pesan." });
  }
};
// Ambil daftar chat untuk Guru BK
exports.getBkChatList = async (req, res) => {
  try {
    const laporan = await prisma.laporan.findMany({
      where: {
        isArchived: false,
        chats: { some: {} }, // Hanya laporan yang punya chat
      },
      include: {
        pelapor: { select: { nama: true, kelas: true } },
        chats: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    const data = laporan.map((l) => ({
      id: l.id,
      ticket: l.kodeTiket,
      name: l.isAnonim ? "Siswa Anonim" : `${l.pelapor?.nama} (${l.pelapor?.kelas || "-"})`,
      lastMessage: l.chats[0]?.pesan || "Belum ada pesan",
      time: new Date(l.chats[0]?.createdAt || l.updatedAt).toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      unread: 0,
    }));

    return res.json({ data });
  } catch (error) {
    console.error("Get BK Chat List Error:", error);
    return res.status(500).json({ error: "Gagal mengambil daftar chat." });
  }
};