import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  AnimatePresence,
  motion,
  MotionConfig,
  useInView,
  useReducedMotion,
} from "motion/react";
import { ArrowLeft, ArrowRight, Clock } from "lucide-react";

const AUTOPLAY_MS = 5000;
const COLOR_PRIMARY = "#023346";
const COLOR_TERTIARY = "#3191A0";
const EASE = [0.22, 1, 0.36, 1];

const formatDate = (iso) =>
  iso
    ? new Date(iso).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "";

const readingTime = (text = "") =>
  Math.max(1, Math.round(text.trim().split(/\s+/).filter(Boolean).length / 200));

// Jumlah kartu per halaman mengikuti lebar layar
const getPerView = () => {
  if (typeof window === "undefined") return 3;
  if (window.matchMedia("(min-width: 1024px)").matches) return 3;
  if (window.matchMedia("(min-width: 768px)").matches) return 2;
  return 1;
};

function usePerView() {
  const [perView, setPerView] = useState(getPerView);
  useEffect(() => {
    const onResize = () => setPerView(getPerView());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return perView;
}

// Satu halaman bergeser masuk/keluar sesuai arah, kartunya muncul bergantian
const pageVariants = {
  enter: (dir) => ({ opacity: 0, x: dir * 60 }),
  center: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.4, ease: EASE, staggerChildren: 0.1 },
  },
  exit: (dir) => ({
    opacity: 0,
    x: dir * -60,
    transition: { duration: 0.22 },
  }),
};

const cardVariants = {
  enter: { opacity: 0, y: 32, scale: 0.96 },
  center: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: EASE } },
  exit: { opacity: 0, y: -12, transition: { duration: 0.2 } },
};

export default function ArtikelCarousel({ articles }) {
  const perView = usePerView();
  const reduce = useReducedMotion();
  const wrapRef = useRef(null);
  const inView = useInView(wrapRef, { once: true, margin: "-80px" });

  const total = articles.length;
  const pages = Math.max(1, Math.ceil(total / perView));

  const [state, setState] = useState({ page: 0, dir: 1 });

  const page = Math.min(state.page, pages - 1);

  const go = useCallback(
    (delta) =>
      setState((s) => {
        const current = Math.min(s.page, pages - 1);
        return { page: (current + delta + pages) % pages, dir: delta > 0 ? 1 : -1 };
      }),
    [pages]
  );

  const goTo = (i) =>
    setState((s) => ({ page: i, dir: i >= Math.min(s.page, pages - 1) ? 1 : -1 }));

  // Ganti halaman otomatis
  useEffect(() => {
    if (!inView || pages <= 1 || reduce) return;
    const t = setTimeout(() => go(1), AUTOPLAY_MS);
    return () => clearTimeout(t);
  }, [inView, page, pages, reduce, go]);

  const start = total > perView ? Math.min(page * perView, total - perView) : 0;
  const items = articles.slice(start, start + perView);

  return (
    <MotionConfig reducedMotion="user">
      <div
        ref={wrapRef}
        role="region"
        aria-roledescription="carousel"
        aria-label="Bacaan yang membantumu tenang"
        className="space-y-6"
      >
        <div className="min-h-72">
          {inView && (
            <AnimatePresence mode="wait" custom={state.dir} initial={true}>
              <motion.div
                key={`${page}-${perView}`}
                custom={state.dir}
                variants={pageVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="grid gap-6"
                style={{ gridTemplateColumns: `repeat(${perView}, minmax(0, 1fr))` }}
              >
                {items.map((a) => (
                  <motion.div
                    key={a.id}
                    variants={cardVariants}
                    whileHover={reduce ? undefined : { y: -6 }}
                    className="h-full"
                  >
                    <Link
                      to={`/artikel/${a.id}`}
                      className="group flex h-full flex-col gap-3 rounded-3xl border border-slate-200 bg-white p-6 text-left transition hover:shadow-xl hover:shadow-cyan-900/10 focus-visible:outline-2 focus-visible:outline-tertiary"
                    >
                      <span className="h-1 w-10 rounded-full bg-tertiary transition-all duration-300 group-hover:w-20" />
                      <div className="flex items-center justify-between gap-2">
                        <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                          Edukasi
                        </span>
                        {a.isi && (
                          <span className="inline-flex items-center gap-1 text-[11px] text-slate-400">
                            <Clock size={12} /> {readingTime(a.isi)} menit baca
                          </span>
                        )}
                      </div>
                      <h3
                        className="font-bold leading-snug transition group-hover:text-tertiary"
                        style={{ color: COLOR_PRIMARY }}
                      >
                        {a.judul}
                      </h3>
                      <p className="line-clamp-4 flex-1 text-sm leading-relaxed text-slate-600">
                        {a.ringkasan}
                      </p>
                      <div className="flex items-center justify-between pt-2 text-xs text-slate-500">
                        {formatDate(a.tanggalPublikasi)}
                        <span
                          className="inline-flex items-center gap-1 font-semibold"
                          style={{ color: COLOR_TERTIARY }}
                        >
                          Baca
                          <ArrowRight
                            size={15}
                            className="transition group-hover:translate-x-1"
                          />
                        </span>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>
          )}
        </div>

        {pages > 1 && inView && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3, ease: EASE }}
            className="flex flex-wrap items-center justify-between gap-4"
          >
            {/* Titik halaman: jumlahnya mengikuti jumlah artikel */}
            <div className="flex items-center gap-2" role="tablist" aria-label="Halaman bacaan">
              {Array.from({ length: pages }).map((_, i) => (
                <button
                  key={i}
                  type="button"
                  role="tab"
                  aria-selected={i === page}
                  aria-label={`Halaman ${i + 1}`}
                  onClick={() => goTo(i)}
                  className="cursor-pointer py-2"
                >
                  <motion.span
                    animate={{
                      width: i === page ? 28 : 8,
                      backgroundColor: i === page ? COLOR_TERTIARY : "#CBD5E1",
                    }}
                    transition={{ duration: 0.3, ease: EASE }}
                    className="block h-2 rounded-full"
                  />
                </button>
              ))}
            </div>

            <p className="text-xs text-slate-500">
              Artikel {start + 1}–{start + items.length} dari {total}
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => go(-1)}
                aria-label="Sebelumnya"
                className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-slate-200 bg-white text-primary transition hover:-translate-x-0.5 hover:border-tertiary"
              >
                <ArrowLeft size={16} />
              </button>
              <button
                type="button"
                onClick={() => go(1)}
                aria-label="Berikutnya"
                className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-primary text-white transition hover:translate-x-0.5 hover:bg-secondary"
              >
                <ArrowRight size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </MotionConfig>
  );
}