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

// Daftar origin yang diizinkan
const allowedOrigins = [
  "http://localhost:5173", // Frontend lokal Anda
  "https://kelompok30-laporkeun-backend.vercel.app", // Backend Vercel Anda
  // Tambahkan URL frontend Vercel Anda di sini jika frontend-nya sudah dideploy, contoh:
  // "https://kelompok30-laporkeun.vercel.app"
];

app.use(cors({
  origin: function (origin, callback) {
    // Izinkan request tanpa origin (seperti Postman atau mobile app)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      return callback(new Error('Ditolak oleh kebijakan CORS'), false);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// PENTING: Menangani preflight request (OPTIONS) agar tidak diblokir Vercel
app.options('*', cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Menyediakan akses statis untuk folder uploads 
// (Catatan: File yang di-upload ke sini tidak akan permanen di Vercel)
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