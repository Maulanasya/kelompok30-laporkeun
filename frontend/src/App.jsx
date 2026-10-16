import React from "react";
import { Routes, Route, Link } from "react-router-dom";

import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";

const ComingSoon = ({ name }) => (
  <div className="min-h-screen grid place-items-center text-slate-600 text-center px-6">
    <div className="space-y-3">
      <p>Halaman {name} belum dibuat.</p>
      <Link to="/" className="text-sm font-semibold text-[#1597A8] hover:underline">
        Kembali ke beranda
      </Link>
    </div>
  </div>
);

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<ComingSoon name="Register" />} />
      <Route path="/lupa-password" element={<ComingSoon name="Lupa Password" />} />
      <Route path="/verifikasi-kode" element={<ComingSoon name="Verifikasi Kode" />} />
      <Route path="/buat-sandi-baru" element={<ComingSoon name="Buat Sandi Baru" />} />
      <Route path="/form-laporan" element={<ComingSoon name="Form Laporan" />} />
      <Route path="*" element={<ComingSoon name="yang kamu cari" />} />
    </Routes>
  );
}