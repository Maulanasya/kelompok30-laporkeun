import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, ChevronDown } from "lucide-react";
import { KATEGORI_KASUS } from "../../data/formLaporan";

// Opsi placeholder (value kosong) hanya dipakai sebagai teks awal, bukan pilihan
const OPTIONS = KATEGORI_KASUS.filter((opt) => opt.value !== "");
const PLACEHOLDER =
  KATEGORI_KASUS.find((opt) => opt.value === "")?.label ?? "Pilih jenis laporan";

export default function KategoriSelect({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const wrapperRef = useRef(null);

  const selected = OPTIONS.find((opt) => opt.value === value);

  // Tutup saat klik di luar
  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const openList = () => {
    setActiveIndex(
      Math.max(
        0,
        OPTIONS.findIndex((opt) => opt.value === value)
      )
    );
    setOpen(true);
  };

  const choose = (opt) => {
    onChange(opt.value);
    setOpen(false);
  };

  // Navigasi keyboard: panah, Enter, Esc
  const handleKeyDown = (e) => {
    if (!open) {
      if (["ArrowDown", "ArrowUp", "Enter", " "].includes(e.key)) {
        e.preventDefault();
        openList();
      }
      return;
    }

    if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % OPTIONS.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => (i - 1 + OPTIONS.length) % OPTIONS.length);
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (OPTIONS[activeIndex]) choose(OPTIONS[activeIndex]);
    } else if (e.key === "Tab") {
      setOpen(false);
    }
  };

  return (
    <div ref={wrapperRef} className="relative">
      <button
        id="kategori"
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls="kategori-listbox"
        onClick={() => (open ? setOpen(false) : openList())}
        onKeyDown={handleKeyDown}
        className={`flex h-10 w-full cursor-pointer items-center justify-between rounded-lg border bg-white px-3 text-left text-xs outline-none transition ${
          open
            ? "border-tertiary ring-4 ring-cyan-100"
            : "border-slate-200 hover:border-slate-300 focus:border-tertiary"
        } ${selected ? "text-slate-700" : "text-slate-500"}`}
      >
        <span className="truncate">{selected ? selected.label : PLACEHOLDER}</span>
        <ChevronDown
          size={14}
          className={`shrink-0 text-slate-400 transition-transform duration-200 ${
            open ? "rotate-180 text-tertiary" : ""
          }`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            id="kategori-listbox"
            role="listbox"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute left-0 right-0 top-full z-30 mt-1.5 max-h-60 overflow-y-auto rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg shadow-cyan-900/10"
          >
            {OPTIONS.map((opt, index) => {
              const isSelected = opt.value === value;
              const isActive = index === activeIndex;

              return (
                <li
                  key={opt.value}
                  role="option"
                  aria-selected={isSelected}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => choose(opt)}
                  className={`flex cursor-pointer items-center justify-between gap-2 rounded-lg px-3 py-2 text-xs transition-colors ${
                    isSelected
                      ? "bg-tertiary-light font-semibold text-primary"
                      : isActive
                        ? "bg-[#F4F9F9] text-slate-800"
                        : "text-slate-600"
                  }`}
                >
                  <span>{opt.label}</span>
                  {isSelected && (
                    <Check size={14} className="shrink-0 text-tertiary" />
                  )}
                </li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}