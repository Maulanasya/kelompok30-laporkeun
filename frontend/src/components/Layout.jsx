import { Outlet } from "react-router-dom";
import Navbar from "./layout/Navbar";
import Footer from "./layout/Footer";

export default function Layout() {
  return (
    <div className="min-h-screen bg-neutral-light font-sans">
      <Navbar />
      <Outlet />
      <Footer />
    </div>
  );
}