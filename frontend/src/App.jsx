import React from "react";
import { Routes, Route, Link } from "react-router-dom";

import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import VerifyCodePage from "./pages/VerifyCodePage";
import NewPasswordPage from "./pages/NewPasswordPage";
import SuccessPage from "./pages/SuccessPage";
import FailedPage from "./pages/FailedPage";
import FormLaporanPage from "./pages/FormLaporanPage";
import RiwayatLaporan from "./pages/RiwayatLaporan";
import ChatPsikolog from "./pages/ChatPsikolog";
import ProfilePage from "./pages/ProfilePage";

const ComingSoon = ({ name }) => (
  <div className="min-h-screen grid place-items-center text-slate-600 text-center px-6">
    <div className="space-y-3">
      <p>Halaman {name} belum dibuat.</p>
      <Link to="/" className="text-sm font-semibold text-tertiary hover:underline">
        Kembali ke beranda
      </Link>
    </div>
  </div>
);

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/success" element={<SuccessPage />} />
      <Route path="/failed" element={<FailedPage />} />
      <Route path="/lupa-password" element={<ForgotPasswordPage />} />
      <Route path="/verifikasi-kode" element={<VerifyCodePage />} />
      <Route path="/buat-sandi-baru" element={<NewPasswordPage />} />

      {/* Fitur Laporan & Konsultasi */}
      <Route path="/form-laporan" element={<FormLaporanPage />} />
      <Route path="/riwayat-laporan" element={<RiwayatLaporan />} />
      <Route path="/chat-psikolog" element={<ChatPsikolog />} />

      {/* Profil */}
      <Route path="/profile" element={<ProfilePage />} />

      {/* Fallback untuk route yang belum didefinisikan */}
      <Route path="*" element={<ComingSoon name="yang kamu cari" />} />
    </Routes>
  );
}