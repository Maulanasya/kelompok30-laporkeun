import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Card from "../components/Card";
import FormLaporan from "../components/form-laporan/FormLaporan";
import InfoSidebar from "../components/form-laporan/InfoSidebar";

export default function FormLaporanPage() {
  return (
    <div className="min-h-screen bg-neutral-light font-sans pt-20">
      <Navbar />

      <main className="relative overflow-hidden">
        {/* Dekorasi kiri */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-40 -left-32 h-130 w-130 rounded-full bg-[#1597A8]/15 blur-3xl"
        />
        {/* Dekorasi kanan bawah */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-40 right-0 h-115 w-115 rounded-full bg-[#E9C46A]/20 blur-3xl"
        />

        <div className="relative z-10 mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
          {/* Hero Title */}
          <div className="mb-5 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
            <h1 className="text-lg font-bold text-primary sm:text-xl">
              Formulir Pengaduan & Pelaporan
            </h1>
            <p className="mt-1 text-[11px] text-slate-500">
              Sampaikan laporanmu dengan jujur. Identitas dan kerahasiaanmu
              dijamin aman.
            </p>
          </div>

          {/* Layout 2 kolom */}
          <section className="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1fr)_320px]">
            {/* KIRI: Form */}
            <Card className="p-5 sm:p-6">
              <FormLaporan />
            </Card>

            {/* KANAN: Sidebar Info */}
            
            <InfoSidebar />
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}