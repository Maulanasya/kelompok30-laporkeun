import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";

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
import NotFoundPage from "./pages/NotFoundPage";
import RequireRole from "./components/RequireRole";
import BkDashboard from "./pages/bk/BkDashboard";
import BkDetailLaporan from "./pages/bk/BkDetailLaporan";
import BkKonsultasi from "./pages/bk/BkKonsultasi";

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/success" element={<SuccessPage />} />
        <Route path="/failed" element={<FailedPage />} />
        <Route path="/lupa-password" element={<ForgotPasswordPage />} />
        <Route path="/verifikasi-kode" element={<VerifyCodePage />} />
        <Route path="/buat-sandi-baru" element={<NewPasswordPage />} />

        {/* Fitur Laporan & Konsultasi (siswa) */}
        <Route path="/form-laporan" element={<FormLaporanPage />} />
        <Route path="/riwayat-laporan" element={<RiwayatLaporan />} />
        <Route path="/chat-psikolog" element={<ChatPsikolog />} />

        {/* Profil */}
        <Route path="/profile" element={<ProfilePage />} />

        {/* Area Guru BK: hanya peran guru_bk */}
        <Route path="/bk" element={<Navigate to="/bk/laporan" replace />} />
        <Route element={<RequireRole allow={["guru_bk"]} />}>
          <Route path="/bk/laporan" element={<BkDashboard />} />
          <Route path="/bk/laporan/:kode" element={<BkDetailLaporan />} />
          <Route path="/bk/konsultasi" element={<BkKonsultasi />} />
        </Route>

        {/* Area psikolog: halaman belum dibuat (tujuan login peran psikolog) */}
        <Route path="/psikolog/*" element={<NotFoundPage variant="soon" />} />

        {/* Fallback 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AuthProvider>
  );
}