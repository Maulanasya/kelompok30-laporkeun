import { useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ReportCard from "../components/ReportCard";
import StatusTimeline from "../components/StatusTimeline";
import EvidenceItem from "../components/EvidenceItem";
import Input from "../components/Input";
import Card from "../components/Card";
import Badge from "../components/Badge";
import { reports, evidence } from "../data/reports";

const initialForm = {
  tanggal: "3 Maret 2026",
  kategori: "Bullying Verbal",
  lokasi: "Di Sekolah saat jam istirahat",
  deskripsi:
    "Saat jam istirahat, Aan tiba-tiba mendatangi saya dan melontarkan ejekan serta kata-kata kasar di depan siswa lain. Saya merasa sangat malu dan terintimidasi.",
};

export default function RiwayatLaporan() {
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState(initialForm);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setForm((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Data yang disimpan:", form);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setForm(initialForm);
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-neutral-light font-sans">
      <Navbar />

      <main className="relative overflow-hidden">
        <div className="absolute bottom-0 left-0 -z-0 hidden h-[380px] w-[60px] rounded-r-full bg-tertiary sm:block" />
        <div className="absolute right-0 top-0 -z-0 hidden h-[240px] w-[340px] rounded-bl-[180px] bg-tertiary sm:block" />
        <div className="relative z-10 mx-auto max-w-7xl px-6 py-8">


          <section className="grid grid-cols-1 gap-3 lg:grid-cols-[235px_minmax(0,1fr)_260px]">
            {/* KIRI */}
            <Card className="p-4">
              <h2 className="mb-4 text-xl font-semibold text-primary">
                Riwayat Laporan
              </h2>

              <input
                type="text"
                placeholder="Cari Riwayat Laporan"
                className="mb-3 h-9 w-full rounded-md border border-neutral-dark/40 px-3 text-xs outline-none placeholder:text-neutral-dark focus:border-tertiary"
              />

              <div className="space-y-2">
                {reports.map((report, index) => (
                  <ReportCard
                    key={report.id}
                    {...report}
                    active={index === 0}
                  />
                ))}
              </div>
            </Card>

            {/* TENGAH */}
            <div className="space-y-3">
              <Card>
                <h2 className="mb-2 text-xl font-semibold text-primary">
                  Detail Laporan
                </h2>

                <div className="rounded-md border border-neutral-dark/30 px-3 py-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-primary">
                      #TICK-2026-X9A
                    </h3>
                    <Badge status="Ditinjau" />
                  </div>
                  <p className="mt-1 text-[9px] text-neutral-dark">
                    3 Maret 2026
                  </p>
                </div>
              </Card>

              <Card>
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-primary">
                    Informasi Laporan
                  </h2>

                  {!isEditing && (
                    <button
                      type="button"
                      onClick={() => setIsEditing(true)}
                      className="rounded border border-tertiary px-3 py-1 text-[10px] text-tertiary hover:bg-tertiary-light"
                    >
                      Ubah
                    </button>
                  )}
                </div>

                <form className="space-y-3" onSubmit={handleSubmit}>
                  <Input
                    id="tanggal"
                    label="Tanggal Laporan"
                    value={form.tanggal}
                    onChange={handleChange}
                    readOnly={!isEditing}
                    type="date"
                  />
                  <Input
                    id="kategori"
                    label="Kategori"
                    value={form.kategori}
                    onChange={handleChange}
                    readOnly={!isEditing}
                  />
                  <Input
                    id="lokasi"
                    label="Lokasi & Waktu Kejadian"
                    value={form.lokasi}
                    onChange={handleChange}
                    readOnly={!isEditing}
                  />

                  <div>
                    <label
                      htmlFor="deskripsi"
                      className="mb-1 block text-xs font-medium text-neutral-darker"
                    >
                      Deskripsi Kronologi
                    </label>
                    <textarea
                      id="deskripsi"
                      rows={4}
                      value={form.deskripsi}
                      onChange={handleChange}
                      readOnly={!isEditing}
                      className="w-full resize-none rounded-md border border-neutral-dark/40 px-3 py-2 text-xs leading-relaxed text-neutral-darker focus:border-tertiary"
                    />
                  </div>

                  <div>
                    <h3 className="mb-2 text-xs font-semibold text-primary">
                      Bukti
                    </h3>
                    <div className="space-y-2">
                      {evidence.map((item) => (
                        <EvidenceItem key={item.id} {...item} />
                      ))}
                    </div>
                  </div>

                  {isEditing && (
                    <div className="flex gap-2 pt-2">
                      <button
                        type="submit"
                        className="rounded-md bg-primary px-4 py-2 text-xs font-medium text-white hover:bg-primary-hover"
                      >
                        Simpan
                      </button>
                      <button
                        type="button"
                        onClick={handleCancel}
                        className="rounded-md border border-neutral-dark/40 px-4 py-2 text-xs font-medium text-neutral-darker hover:bg-neutral-light"
                      >
                        Batal
                      </button>
                    </div>
                  )}
                </form>
              </Card>
            </div>

            {/* KANAN */}
            <Card>
              <h2 className="mb-4 text-xl font-semibold text-primary">
                Status Laporan
              </h2>

              <StatusTimeline />

              <div className="mt-5 rounded-lg bg-tertiary-light p-3">
                <p className="mb-2 text-[9px] font-semibold text-primary">
                  PSIKOLOG / KONSELOR BERTUGAS
                </p>

                <div className="flex items-center gap-2">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-tertiary text-xs font-semibold text-white">
                    DP
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-primary">
                      Dr. Pattranite, M.Psi.
                    </p>
                    <p className="text-[9px] text-neutral-dark">
                      Konselor Spesialis Remaja
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  className="mt-3 w-full rounded-md bg-primary py-2 text-xs font-medium text-white transition hover:bg-primary-hover"
                >
                  Mulai Konseling
                </button>
              </div>
            </Card>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}