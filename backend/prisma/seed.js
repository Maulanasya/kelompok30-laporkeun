// Jalankan dari folder backend:
//   node prisma/seed.js
try {
  require("dotenv/config");
} catch {}
const bcrypt = require("bcryptjs");
const prisma = require("../src/config/db");

const PASSWORD = "password123"; // password semua akun

const akun = [
  { nama: "Admin LaporKeun", email: "admin@laporkeun.test", nisn: null, role: "ADMIN" },
  { nama: "Bu Rina (Guru BK)", email: "bk@laporkeun.test", nisn: null, role: "GURU_BK" },
  { nama: "Dr. Dimas (Psikolog)", email: "psikolog@laporkeun.test", nisn: null, role: "PSIKOLOG" },
  { nama: "Andi Pratama", email: "siswa1@laporkeun.test", nisn: "2024000001", role: "SISWA" },
  { nama: "Citra Lestari", email: "siswa2@laporkeun.test", nisn: "2024000002", role: "SISWA" },
];

async function main() {
  const hashed = await bcrypt.hash(PASSWORD, 10);

  for (const u of akun) {
    // upsert: dibuat jika belum ada, diperbarui jika email sudah ada,
    // jadi aman dijalankan berkali-kali (password ikut di-reset).
    await prisma.user.upsert({
      where: { email: u.email },
      update: {
        nama: u.nama,
        nisn: u.nisn,
        role: u.role,
        password: hashed,
        isActive: true,
      },
      create: { ...u, password: hashed },
    });
  }

  console.table(
    akun.map((u) => ({
      role: u.role,
      login: u.nisn || u.email,
      password: PASSWORD,
    }))
  );
}

main()
  .catch((err) => {
    console.error("Seed gagal:", err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());