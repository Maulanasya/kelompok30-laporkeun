import React from "react";
import LandingPage from "./LandingPage";

const found = import.meta.glob(
  "./components/**/{Login,Register,ForgotPassword,VerifyCode,NewPassword,FormLaporan}.jsx",
  { eager: true }
);
const pick = (name) =>
  Object.entries(found).find(([p]) => p.endsWith(`/${name}.jsx`))?.[1]?.default;

const routes = {
  "/login": "Login",
  "/register": "Register",
  "/lupa-password": "ForgotPassword",
  "/verifikasi-kode": "VerifyCode",
  "/buat-sandi-baru": "NewPassword",
  "/form-laporan": "FormLaporan",
};

export default function App() {
  const name = routes[window.location.pathname];
  if (!name) return <LandingPage />;
  const Page = pick(name);
  return Page ? <Page /> : (
    <div className="min-h-screen grid place-items-center text-slate-600">
      Halaman {name} belum ditemukan di src/components.
    </div>
  );
}