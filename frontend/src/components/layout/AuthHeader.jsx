import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import logo from "../../assets/logo.png";

// --- Design Tokens ---
const COLOR_PRIMARY = "#0F4C5C";
const COLOR_TERTIARY = "#1597A8";

// Header minimal untuk halaman auth (login, register, lupa password, dst.)
export default function AuthHeader() {
  return (
    <header className="absolute top-0 inset-x-0 z-10">
      <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="" className="h-9 w-auto" />
          <span
            className="font-bold text-lg"
            style={{ color: COLOR_PRIMARY }}
          >
            LaporKeun<span style={{ color: COLOR_TERTIARY }}>!</span>
          </span>
        </Link>

        {/* Back Button Link */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-semibold transition hover:underline"
          style={{ color: COLOR_PRIMARY }}
        >
          <ArrowLeft size={16} /> Kembali ke beranda
        </Link>
      </div>
    </header>
  );
}