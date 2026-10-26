const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
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
const initChatSocket = require("./sockets/chatSocket");

const app = express();
const server = http.createServer(app);

// Konfigurasi middleware dasar 
app.use(cors({ origin: process.env.CLIENT_URL || "*" }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Menyediakan akses statis untuk folder uploads
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Definisi endpoint routing API
app.use("/api/ai", aiRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/laporan", laporanRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/artikel", artikelRoutes); 
app.use("/api/admin/artikel", adminArtikelRoutes); 
app.use("/api/admin", adminRoutes);

// Konfigurasi server Socket.IO
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

app.use(cors({ 
  origin: CLIENT_URL,
  credentials: true 
}));

const io = new Server(server, {
  cors: {
    origin: CLIENT_URL,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Menyimpan instance io ke Express agar dapat diakses dari controller
app.set("io", io);

// Menginisialisasi event handler socket untuk chat
initChatSocket(io);

// Mengatur room otomatis berdasarkan peran (role) dan ID saat koneksi socket terjalin
io.on("connection", (socket) => {
  const user = socket.user || socket.data?.user;
  if (user?.role === "ADMIN") socket.join("admins");
  if (user?.id) socket.join(`user:${user.id}`);
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server backend LaporKeun! berjalan di http://localhost:${PORT}`);
});