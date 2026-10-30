const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const aiRoutes = require("./routes/aiRoutes");
const authRoutes = require("./routes/authRoutes");
const laporanRoutes = require("./routes/laporanRoutes");
const chatRoutes = require("./routes/chatRoutes");
const profileRoutes = require("./routes/profileRoutes");
const adminRoutes = require("./routes/adminRoutes");
const artikelRoutes = require("./routes/artikelRoutes");
const adminArtikelRoutes = require("./routes/adminArtikelRoutes");

const app = express();

// Daftar origin yang diizinkan (tanpa garis miring di akhir)
const allowedOrigins = [
  "http://localhost:5173",
  "https://kelompok30-laporkeun.vercel.app",
  process.env.CLIENT_URL,
]
  .filter(Boolean)
  .map((o) => o.replace(/\/$/, ""));

app.use(
  cors({
    origin: (origin, callback) => {
      // Izinkan request tanpa origin (Postman, mobile app, server-to-server)
      if (!origin) return callback(null, true);
      // Origin yang tidak terdaftar cukup tidak diberi header CORS
      return callback(null, allowedOrigins.includes(origin));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
// Preflight (OPTIONS) sudah ditangani otomatis oleh middleware cors di atas

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Catatan: file yang di-upload ke folder ini tidak permanen di Vercel
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Health check
app.get("/", (req, res) => res.json({ status: "ok", service: "LaporKeun API" }));

// Definisi endpoint routing API
app.use("/api/ai", aiRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/laporan", laporanRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/artikel", artikelRoutes);
app.use("/api/admin/artikel", adminArtikelRoutes);
app.use("/api/admin", adminRoutes);

// Jalankan server + Socket.io hanya jika BUKAN di Vercel (lokal / Railway / Render / VPS)
if (!process.env.VERCEL) {
  const http = require("http");
  const { Server } = require("socket.io");
  // Sesuaikan dengan cara chatSocket.js mengekspor fungsinya:
  // module.exports = initChatSocket  -> const initChatSocket = require(...)
  // exports.initChatSocket = ...     -> const { initChatSocket } = require(...)
  const initChatSocket = require("./sockets/chatSocket");

  const server = http.createServer(app);

  const io = new Server(server, {
    cors: {
      origin: allowedOrigins,
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  // Agar io bisa diakses dari controller: req.app.get("io")
  app.set("io", io);

  initChatSocket(io);

  io.on("connection", (socket) => {
    const user = socket.user || socket.data?.user;
    if (user?.role === "ADMIN") socket.join("admins");
    if (user?.id) socket.join(`user:${user.id}`);
  });

  const PORT = process.env.PORT || 5001;
  server.listen(PORT, () => {
    console.log(`Server backend LaporKeun! berjalan di http://localhost:${PORT}`);
  });
}

// Wajib diexport untuk Vercel
module.exports = app;
// const io = new Server(server, {
//   cors: {
//     origin: CLIENT_URL,
//     methods: ["GET", "POST"],
//     credentials: true,
//   },
// });

// // Menyimpan instance io ke Express agar dapat diakses dari controller
// app.set("io", io);

// // Menginisialisasi event handler socket untuk chat
// initChatSocket(io);

// // Mengatur room otomatis berdasarkan peran (role) dan ID saat koneksi socket terjalin
// io.on("connection", (socket) => {
//   const user = socket.user || socket.data?.user;
//   if (user?.role === "ADMIN") socket.join("admins");
//   if (user?.id) socket.join(`user:${user.id}`);
// });

// const PORT = process.env.PORT || 5000;
// server.listen(PORT, () => {
//   console.log(`Server backend LaporKeun! berjalan di http://localhost:${PORT}`);
// });