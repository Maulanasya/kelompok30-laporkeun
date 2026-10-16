import React, { useEffect, useId, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, ChevronDown } from "lucide-react";

const COLOR_PRIMARY = "#0F4C5C";
const COLOR_TERTIARY = "#1597A8";
const ANIMATION_EASE = [0.22, 1, 0.36, 1];

/**
 * Dropdown kustom.
 * groups: [{ label: "Kelas X", options: ["X-1", "X-2"] }, ...]
 * onChange dipanggil dengan bentuk { target: { name, value } }
 * sehingga bisa langsung memakai handleChange yang sama dengan <input>.
 */
export default function Select({
  id,
  name,
  value,
  onChange,
  groups,
  placeholder = "Pilih",
  icon: Icon,
  invalid = false,
  describedBy,
}) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const rootRef = useRef(null);
  const listId = useId();

  // Beri setiap opsi nomor urut global untuk navigasi keyboard
  const indexed = useMemo(() => {
    let i = 0;
    return groups.map((g) => ({
      label: g.label,
      items: g.options.map((o) => ({ value: o, index: i++ })),
    }));
  }, [groups]);
  const flat = useMemo(() => indexed.flatMap((g) => g.items.map((x) => x.value)), [indexed]);

  // Tutup saat klik di luar
  useEffect(() => {
    const handler = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Jaga opsi aktif tetap terlihat saat scroll
  useEffect(() => {
    if (open && active >= 0) {
      document.getElementById(`${listId}-opt-${active}`)?.scrollIntoView({ block: "nearest" });
    }
  }, [active, open, listId]);

  const openList = () => {
    setActive(Math.max(flat.indexOf(value), 0));
    setOpen(true);
  };

  const choose = (v) => {
    onChange({ target: { name, value: v } });
    setOpen(false);
  };

  const onKeyDown = (e) => {
    if (!open) {
      if (["ArrowDown", "ArrowUp", "Enter", " "].includes(e.key)) {
        e.preventDefault();
        openList();
      }
      return;
    }
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setActive((i) => Math.min(i + 1, flat.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setActive((i) => Math.max(i - 1, 0));
        break;
      case "Home":
        e.preventDefault();
        setActive(0);
        break;
      case "End":
        e.preventDefault();
        setActive(flat.length - 1);
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        if (active >= 0) choose(flat[active]);
        break;
      case "Escape":
        e.preventDefault();
        setOpen(false);
        break;
      case "Tab":
        setOpen(false);
        break;
      default:
    }
  };

  return (
    <div ref={rootRef} className="relative">
      {Icon && (
        <Icon
          size={18}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
        />
      )}

      <button
        id={id}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-activedescendant={open && active >= 0 ? `${listId}-opt-${active}` : undefined}
        aria-invalid={invalid}
        aria-describedby={describedBy}
        onClick={() => (open ? setOpen(false) : openList())}
        onKeyDown={onKeyDown}
        className={`w-full rounded-full bg-white border pl-12 pr-12 py-3.5 text-sm text-left outline-none transition cursor-pointer focus:border-[#1597A8] focus:ring-4 focus:ring-cyan-100 ${
          invalid ? "border-red-400" : open ? "border-[#1597A8] ring-4 ring-cyan-100" : "border-slate-200"
        } ${value ? "text-slate-800" : "text-slate-400"}`}
      >
        {value || placeholder}
      </button>

      <ChevronDown
        size={18}
        className={`absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none transition-transform duration-200 ${
          open ? "rotate-180" : ""
        }`}
      />

      <AnimatePresence>
        {open && (
          <motion.ul
            id={listId}
            role="listbox"
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.18, ease: ANIMATION_EASE }}
            onMouseDown={(e) => e.preventDefault()} // jaga fokus tetap di tombol
            className="absolute z-20 mt-2 w-full max-h-64 overflow-y-auto rounded-2xl bg-white border border-slate-200 shadow-xl shadow-cyan-900/10 p-2"
          >
            {indexed.map((group) => (
              <React.Fragment key={group.label}>
                <li
                  role="presentation"
                  className="px-3 pt-2 pb-1 text-xs font-semibold text-slate-400"
                >
                  {group.label}
                </li>
                {group.items.map(({ value: v, index }) => {
                  const selected = v === value;
                  return (
                    <li
                      key={v}
                      id={`${listId}-opt-${index}`}
                      role="option"
                      aria-selected={selected}
                      onMouseEnter={() => setActive(index)}
                      onClick={() => choose(v)}
                      className={`flex items-center justify-between rounded-xl px-3 py-2.5 text-sm cursor-pointer transition-colors ${
                        active === index ? "bg-[#F4F9F9]" : ""
                      } ${selected ? "font-semibold" : "text-slate-700"}`}
                      style={selected ? { color: COLOR_PRIMARY } : undefined}
                    >
                      {v}
                      {selected && <Check size={16} style={{ color: COLOR_TERTIARY }} />}
                    </li>
                  );
                })}
              </React.Fragment>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}