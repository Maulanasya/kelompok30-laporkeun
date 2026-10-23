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
import ChatSiswa from "./pages/ChatSiswa"; // <-- Ganti import dari ChatPsikolog ke ChatSiswa
import ProfilePage from "./pages/ProfilePage";
import NotFoundPage from "./pages/NotFoundPage";
import RequireRole from "./components/RequireRole";

import BkDashboard from "./pages/bk/BkDashboard";
import BkDetailLaporan from "./pages/bk/BkDetailLaporan";
import BkKonsultasi from "./pages/bk/BkKonsultasi";

import PsikologDashboard from "./pages/psikolog/PsikologDashboard";
import PsikologDetailSesi from "./pages/psikolog/PsikologDetailSesi";
import PsikologKonsultasi from "./pages/psikolog/PsikologKonsultasi";

import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminAkun from "./pages/admin/AdminAkun";
import AdminArtikel from "./pages/admin/AdminArtikel";
import AdminRiwayat from "./pages/admin/AdminRiwayat";

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
        {/* Route chat diganti jadi /chat */}
        <Route path="/chat" element={<ChatSiswa />} /> 

        {/* Profil */}
        <Route path="/profile" element={<ProfilePage />} />

        {/* Area Guru BK: hanya peran guru_bk */}
        <Route path="/bk" element={<Navigate to="/bk/laporan" replace />} />
        <Route element={<RequireRole allow={["GURU_BK", "guru_bk"]} />}>
          <Route path="/bk/laporan" element={<BkDashboard />} />
          <Route path="/bk/laporan/:kode" element={<BkDetailLaporan />} />
          <Route path="/bk/konsultasi" element={<BkKonsultasi />} />
        </Route>

        {/* Area Psikolog: hanya peran psikolog */}
        <Route element={<RequireRole allow={["PSIKOLOG", "psikolog"]} />}>
          <Route path="/psikolog" element={<PsikologDashboard />} />
          <Route path="/psikolog/sesi/:id" element={<PsikologDetailSesi />} />
          <Route path="/psikolog/konsultasi" element={<PsikologKonsultasi />} />
        </Route>

        {/* Area Admin: hanya peran admin */}
        <Route element={<RequireRole allow={["ADMIN", "admin"]} />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/akun" element={<AdminAkun />} />
          <Route path="/admin/artikel" element={<AdminArtikel />} />
          <Route path="/admin/riwayat" element={<AdminRiwayat />} />
        </Route>

        {/* Fallback 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AuthProvider>
  );
}