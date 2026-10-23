// frontend/src/components/StatusTimeline.jsx

const STEPS = [
  {
    key: "PENDING",
    title: "Laporan Diterima",
    description: "Laporan berhasil masuk ke sistem dan kode tiket dibuat.",
  },
  {
    key: "DITINJAU",
    title: "Sedang Ditinjau",
    description: "Guru BK sedang memverifikasi bukti dan kronologi laporan.",
  },
  {
    key: "PROSES",
    title: "Tindak Lanjut & Mediasi",
    description: "Proses pendampingan dan mediasi sedang berjalan.",
  },
  {
    key: "SELESAI",
    title: "Selesai & Evaluasi Aman",
    description: "Kasus diselesaikan dengan jaminan bebas intimidasi.",
  },
];

const STATUS_ORDER = ["PENDING", "DITINJAU", "PROSES", "SELESAI"];

export default function StatusTimeline({ status = "PENDING" }) {
  const currentIndex = STATUS_ORDER.indexOf(status);

  return (
    <div className="space-y-3">
      {STEPS.map((step, index) => {
        const isActive = index <= currentIndex;
        const isCurrent = index === currentIndex;

        return (
          <div
            key={step.key}
            className={`relative pl-6 ${isActive ? "" : "opacity-40"}`}
          >
            <div
              className={`absolute left-0 top-1 h-3 w-3 rounded-full border-2 border-white shadow ${
                isActive ? "bg-tertiary" : "bg-neutral-dark"
              }`}
            />

            {index !== STEPS.length - 1 && (
              <div className="absolute left-[5px] top-4 h-full w-px bg-neutral-dark/40" />
            )}

            <h3 className={`text-[10px] font-semibold ${isCurrent ? "text-primary" : "text-primary/80"}`}>
              {step.title}
            </h3>

            <p className="mt-1 text-[8px] leading-relaxed text-neutral-dark">
              {step.description}
            </p>
          </div>
        );
      })}
    </div>
  );
}