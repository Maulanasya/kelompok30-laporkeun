const prisma = require("../config/db");

// Service untuk menyimpan pesan dari Socket.IO ke PostgreSQL
exports.saveChatMessage = async ({ kodeTiket, senderId, pesan }) => {
  try {
    // 1. Cari laporan berdasarkan kodeTiket
    const laporan = await prisma.laporan.findUnique({
      where: { kodeTiket },
    });

    if (!laporan) {
      console.error(`Laporan dengan kodeTiket ${kodeTiket} tidak ditemukan.`);
      return null;
    }

    // 2. Simpan pesan ke tabel Chat
    const chatBaru = await prisma.chat.create({
      data: {
        laporanId: laporan.id,
        senderId: senderId || null, // null jika pengirim anonim/siswa tanpa login
        pesan,
      },
      include: {
        sender: {
          select: {
            id: true,
            nama: true,
            role: true,
          },
        },
      },
    });

    return chatBaru;
  } catch (error) {
    console.error("Error saving chat message:", error);
    return null;
  }
};

// REST API Handler: Mengambil riwayat percakapan berdasarkan kodeTiket
exports.getChatHistoryByTiket = async (req, res) => {
  try {
    const { kodeTiket } = req.params;

    const laporan = await prisma.laporan.findUnique({
      where: { kodeTiket },
      include: {
        chats: {
          orderBy: { createdAt: "asc" },
          include: {
            sender: {
              select: {
                id: true,
                nama: true,
                role: true,
              },
            },
          },
        },
      },
    });

    if (!laporan) {
      return res.status(404).json({ error: "Laporan tidak ditemukan." });
    }

    return res.json({
      kodeTiket: laporan.kodeTiket,
      chats: laporan.chats,
    });
  } catch (error) {
    console.error("Get Chat History Error:", error);
    return res.status(500).json({ error: "Gagal mengambil riwayat pesan." });
  }
};