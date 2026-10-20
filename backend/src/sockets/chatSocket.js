const { saveChatMessage } = require("../controllers/chatController");

module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log("Client terhubung ke Socket.IO:", socket.id);

    // Siswa / Guru BK / Psikolog bergabung ke room ruang konsultasi berdasarkan kodeTiket
    socket.on("join_room", (kodeTiket) => {
      socket.join(kodeTiket);
      console.log(`User ${socket.id} bergabung ke room: ${kodeTiket}`);
    });

    // Menerima & broadcast pesan real-time + simpan ke PostgreSQL
    socket.on("send_message", async (data) => {
      const { kodeTiket, senderId, pesan } = data;

      if (!kodeTiket || !pesan) {
        return;
      }

      // Simpan ke PostgreSQL via Prisma
      const savedChat = await saveChatMessage({ kodeTiket, senderId, pesan });

      if (savedChat) {
        // Broadcast pesan ke seluruh client di room yang sama
        io.to(kodeTiket).emit("receive_message", savedChat);
      }
    });

    socket.on("disconnect", () => {
      console.log("Client terputus:", socket.id);
    });
  });
};