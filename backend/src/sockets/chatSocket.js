const { getUserFromToken } = require("../middlewares/authMiddleware");
const {
  canAccessChat,
  sendChatMessage,
  presentChat,
  canSeeMessage,
} = require("../controllers/chatController");

const normTiket = (value) => String(value || "").trim().toUpperCase();
const roomOf = (kodeTiket) => `tiket:${normTiket(kodeTiket)}`;
const reply = (ack, payload) => typeof ack === "function" && ack(payload);

module.exports = (io) => {
  // Middleware autentikasi Socket.IO saat koneksi pertama kali
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) {
        console.warn("[socket] ditolak: klien tidak mengirim token (auth.token kosong)");
        return next(new Error("UNAUTHORIZED"));
      }

      const user = await getUserFromToken(token);
      if (!user) {
        console.warn("[socket] ditolak: token tidak valid, kedaluwarsa, atau akun tidak aktif");
        return next(new Error("UNAUTHORIZED"));
      }

      socket.data.user = user;
      next();
    } catch (error) {
      console.error("[socket] ditolak: error saat memeriksa token:", error.message);
      next(new Error("UNAUTHORIZED"));
    }
  });

  io.on("connection", (socket) => {
    const user = socket.data.user;

    // Bergabung ke room pribadi dan room berdasarkan peran (role)
    socket.join(`user:${user.id}`);
    socket.join(`role:${user.role}`);

    // Bergabung ke ruang percakapan spesifik berdasarkan kode tiket
    socket.on("join_room", async (kodeTiket, ack) => {
      try {
        if (!(await canAccessChat(user, kodeTiket))) {
          return reply(ack, { ok: false, error: "Kamu tidak punya akses ke percakapan ini." });
        }
        socket.join(roomOf(kodeTiket));
        reply(ack, { ok: true });
      } catch (error) {
        console.error("join_room error:", error);
        reply(ack, { ok: false, error: "Gagal membuka percakapan." });
      }
    });

    // Keluar dari ruang percakapan
    socket.on("leave_room", (kodeTiket) => socket.leave(roomOf(kodeTiket)));

    // Mengirim pesan chat real-time
    socket.on("send_message", async (data, ack) => {
      try {
        const kodeTiket = normTiket(data?.kodeTiket);
        const room = roomOf(kodeTiket);

        if (!socket.rooms.has(room)) {
          return reply(ack, { ok: false, error: "Buka percakapan terlebih dahulu." });
        }

        const result = await sendChatMessage({ kodeTiket, userId: user.id, pesan: data?.pesan });
        if (!result.ok) return reply(ack, { ok: false, error: result.error });

        const { chat, laporan } = result;

        // Mengirim pesan secara selektif ke tiap penerima sesuai hak akses peran
        const sockets = await io.in(room).fetchSockets();
        sockets.forEach((s) => {
          const viewer = s.data.user;
          if (!canSeeMessage(viewer.role, chat.sender.role)) return;
          s.emit("receive_message", {
            kodeTiket,
            message: presentChat(chat, laporan, viewer),
          });
        });

        // Mengirim notifikasi pembaruan daftar chat (chat_updated) ke pihak terkait
        const targets = new Set([`user:${laporan.pelaporId}`]);
        laporan.sesi.forEach((s) => {
          if (s.psikologId && canSeeMessage("PSIKOLOG", chat.sender.role)) {
            targets.add(`user:${s.psikologId}`);
          }
        });
        if (canSeeMessage("GURU_BK", chat.sender.role)) targets.add("role:GURU_BK");
        io.to([...targets]).emit("chat_updated", { kodeTiket });

        reply(ack, { ok: true });
      } catch (error) {
        console.error("send_message error:", error);
        reply(ack, { ok: false, error: "Gagal mengirim pesan." });
      }
    });
  });
};