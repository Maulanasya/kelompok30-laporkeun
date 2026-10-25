const jwt = require("jsonwebtoken");
const prisma = require("../config/db");

const JWT_SECRET = process.env.JWT_SECRET || "rahasia_kode_jwt_laporkeun_123";

// Helper untuk mengirim respon penolakan akses (Unauthorized / Forbidden)
const deny = (res, status, text) =>
  res.status(status).json({ error: text, message: text });

// Memverifikasi token JWT dan mengambil data terbaru user dari database
const getUserFromToken = async (token) => {
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, nama: true, email: true, nisn: true, role: true, isActive: true },
    });
    return user && user.isActive ? user : null;
  } catch {
    return null;
  }
};
exports.getUserFromToken = getUserFromToken;

// Middleware untuk memverifikasi token pada request REST API
exports.verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return deny(res, 401, "Akses ditolak. Silakan login terlebih dahulu.");
  }

  const user = await getUserFromToken(authHeader.split(" ")[1]);
  if (!user) {
    return deny(res, 401, "Sesi tidak valid atau sudah berakhir. Silakan login lagi.");
  }

  req.user = user;
  next();
};

// Middleware untuk membatasi akses berdasarkan peran (role) user
exports.requireRole =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user?.role)) {
      return deny(res, 403, "Akses ditolak.");
    }
    next();
  };