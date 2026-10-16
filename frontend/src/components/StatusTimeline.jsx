const statuses = [
  {
    title: "Telah Diterima",
    date: "14 Maret 2026, 09:42 WIB",
    description:
      "Laporan berhasil masuk ke sistem enkripsi dan kode tiket dibuat secara otomatis.",
    active: true,
  },
  {
    title: "Sedang Ditangani",
    date: "14 Maret 2026, 11:15 WIB",
    description:
      "Proses verifikasi bukti dan persiapan pendampingan tertutup sedang berlangsung.",
    note: "Perkiraan respon 1-2 hari kerja",
    active: true,
  },
  {
    title: "Tindak Lanjut & Mediasi",
    description:
      "Jadwal konseling tatap muka privat atau tindakan perlindungan pelapor di lingkungan sekolah.",
    active: false,
  },
  {
    title: "Selesai & Evaluasi Aman",
    description:
      "Kasus diselesaikan tuntas dengan jaminan bebas intimidasi dan pengawasan berkala.",
    active: false,
  },
];

export default function StatusTimeline() {
  return (
    <div className="space-y-3">
      {statuses.map((status, index) => (
        <div
          key={index}
          className={`relative pl-6 ${status.active ? "" : "opacity-40"}`}
        >
          <div
            className={`absolute left-0 top-1 h-3 w-3 rounded-full border-2 border-white shadow ${
              status.active ? "bg-tertiary" : "bg-neutral-dark"
            }`}
          />

          {index !== statuses.length - 1 && (
            <div className="absolute left-[1.25px] top-4 h-full w-px bg-neutral-dark/40" />
          )}

          <h3 className="text-[10px] font-semibold text-primary">
            {status.title}
          </h3>

          {status.date && (
            <p className="mt-0.5 text-[8px] text-neutral-dark">{status.date}</p>
          )}

          <p className="mt-1 text-[8px] leading-relaxed text-neutral-dark">
            {status.description}
          </p>

          {status.note && (
            <p className="mt-1 text-[8px] text-tertiary-dark">
              ◷ {status.note}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}