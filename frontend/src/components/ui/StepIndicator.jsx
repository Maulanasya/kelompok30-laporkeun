import React from "react";

const COLOR_TERTIARY = "#1597A8";

// Indikator langkah untuk alur lupa password (1: email, 2: kode, 3: sandi baru)
export default function StepIndicator({ current = 1, total = 3 }) {
  return (
    <div
      className="flex items-center justify-center gap-2"
      role="progressbar"
      aria-valuemin={1}
      aria-valuemax={total}
      aria-valuenow={current}
      aria-label={`Langkah ${current} dari ${total}`}
    >
      {Array.from({ length: total }, (_, i) => (
        <span
          key={i}
          className="h-2 w-12 rounded-full transition-colors"
          style={{ background: i + 1 <= current ? COLOR_TERTIARY : "#CBD5E1" }}
        />
      ))}
    </div>
  );
}