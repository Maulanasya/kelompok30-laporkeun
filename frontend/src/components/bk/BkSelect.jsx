import { useEffect, useId, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, ChevronDown } from "lucide-react";

export default function BkSelect({
  value,
  onChange,
  options,
  groups,
  placeholder = "Pilih",
  icon: Icon,
  ariaLabel,
  invalid = false,
  autoFocus = false,
  className = "",
}) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const rootRef = useRef(null);
  const listId = useId();

  // Memetakan nomor indeks global ke setiap opsi untuk navigasi keyboard lintas grup
  const sections = useMemo(() => {
    let index = 0;
    const rawGroups = groups ?? [{ label: null, options: options ?? [] }];

    return rawGroups.map((group) => ({
      label: group.label,
      options: group.options.map((option) => ({ ...option, i: index++ })),
    }));
  }, [groups, options]);

  const flat = useMemo(() => sections.flatMap((group) => group.options), [sections]);
  const selected = flat.find((option) => option.value === value);

  const openList = () => {
    setActive(Math.max(0, selected ? selected.i : 0));
    setOpen(true);
  };

  const choose = (option) => {
    onChange(option.value);
    setOpen(false);
  };

  // Tutup dropdown saat pengguna mengklik di luar area komponen
  useEffect(() => {
    if (!open) return;

    const handleOutsideClick = (e) => {
      if (!rootRef.current?.contains(e.target)) setOpen(false);
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [open]);

  // Menjaga agar opsi yang sedang aktif tetap terlihat saat navigasi keyboard
  useEffect(() => {
    if (open && active >= 0) {
      document
        .getElementById(`${listId}-${active}`)
        ?.scrollIntoView({ block: "nearest" });
    }
  }, [open, active, listId]);

  const handleKeyDown = (e) => {
    if (!open) {
      if (["ArrowDown", "ArrowUp", "Enter", " "].includes(e.key)) {
        e.preventDefault();
        openList();
      }
      return;
    }

    switch (e.key) {
      case "Escape":
        e.preventDefault();
        e.stopPropagation();
        setOpen(false);
        break;
      case "ArrowDown":
        e.preventDefault();
        setActive((prev) => Math.min(prev + 1, flat.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setActive((prev) => Math.max(prev - 1, 0));
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
        if (flat[active]) choose(flat[active]);
        break;
      case "Tab":
        setOpen(false);
        break;
      default:
        break;
    }
  };

  const triggerState = open
    ? "border-tertiary ring-4 ring-cyan-100"
    : invalid
    ? "border-red-400"
    : "border-slate-200 hover:border-tertiary/50";

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      {Icon && (
        <Icon
          size={18}
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
        />
      )}

      <button
        type="button"
        autoFocus={autoFocus}
        role="combobox"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-activedescendant={open && active >= 0 ? `${listId}-${active}` : undefined}
        onClick={() => (open ? setOpen(false) : openList())}
        onKeyDown={handleKeyDown}
        className={`flex w-full cursor-pointer items-center rounded-full border bg-white py-2.5 pr-11 text-left text-sm outline-none transition focus-visible:border-tertiary focus-visible:ring-4 focus-visible:ring-cyan-100 touch-manipulation ${
          Icon ? "pl-12" : "pl-5"
        } ${triggerState}`}
      >
        <span className={`truncate ${selected ? "text-slate-700" : "text-slate-400"}`}>
          {selected ? selected.label : placeholder}
        </span>
      </button>

      <motion.span
        aria-hidden="true"
        animate={{ rotate: open ? 180 : 0 }}
        transition={{ duration: 0.2 }}
        className="pointer-events-none absolute right-4 top-1/2 -mt-2 text-slate-400"
      >
        <ChevronDown size={16} />
      </motion.span>

      <AnimatePresence>
        {open && (
          <motion.ul
            id={listId}
            role="listbox"
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            style={{ transformOrigin: "top" }}
            className="absolute left-0 right-0 top-full z-30 mt-2 max-h-64 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl shadow-cyan-900/10"
          >
            {sections.map((group, groupIndex) => (
              <li key={group.label ?? groupIndex} role="presentation">
                {group.label && (
                  <p className="px-3 pb-1 pt-2 text-[11px] font-semibold text-slate-400">
                    {group.label}
                  </p>
                )}
                <ul role="presentation">
                  {group.options.map((option) => {
                    const isSelected = option.value === value;
                    return (
                      <li
                        key={option.value}
                        id={`${listId}-${option.i}`}
                        role="option"
                        aria-selected={isSelected}
                        onMouseEnter={() => setActive(option.i)}
                        onClick={() => choose(option)}
                        className={`flex cursor-pointer items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${
                          active === option.i ? "bg-[#F4F9F9]" : ""
                        } ${isSelected ? "font-semibold text-primary" : "text-slate-600"}`}
                      >
                        <span className="min-w-0">
                          <span className="block truncate">{option.label}</span>
                          {option.hint && (
                            <span className="block truncate text-xs font-normal text-slate-400">
                              {option.hint}
                            </span>
                          )}
                        </span>
                        {isSelected && <Check size={15} className="shrink-0 text-tertiary" />}
                      </li>
                    );
                  })}
                </ul>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}