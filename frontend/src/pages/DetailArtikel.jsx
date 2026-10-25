import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion, MotionConfig, useScroll, useSpring } from "motion/react";
import { ArrowLeft, ArrowRight, Calendar, Clock, Tag } from "lucide-react";

import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import { api } from "../services/api";

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

// Elemen header artikel muncul bergantian
const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};
const rise = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
};

export default function DetailArtikel() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [article, setArticle] = useState(null);
  const [others, setOthers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Progress baca di tepi atas layar
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    restDelta: 0.001,
  });

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    setArticle(null);
    window.scrollTo({ top: 0 });

    api
      .getArtikelById(id)
      .then((res) => {
        if (!active) return;
        if (res.error || !res.data) {
          setError(res.error || "Artikel tidak ditemukan.");
          return;
        }
        setArticle(res.data);
      })
      .catch(() => {
        if (active) setError("Artikel belum bisa dimuat. Periksa koneksimu lalu coba lagi.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [id]);

  // Bacaan lainnya (selain artikel yang sedang dibuka)
  useEffect(() => {
    let active = true;
    api
      .getArtikelList(6)
      .then((res) => {
        if (!active) return;
        setOthers((res.articles ?? []).filter((a) => a.id !== id).slice(0, 3));
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [id]);

  // Kembali ke halaman sebelumnya; kalau dibuka langsung lewat link, ke beranda
  const handleBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate("/");
  };

  const paragraphs = article?.isi
    ? article.isi.split("\n").map((p) => p.trim()).filter(Boolean)
    : [];

  return (
    <MotionConfig reducedMotion="user">
      <div
        className="flex min-h-screen flex-col bg-[#F4F9F9] text-slate-800 selection:bg-cyan-100"
        style={{ fontFamily: "'Plus Jakarta Sans', 'Poppins', sans-serif" }}
      >
        <motion.div
          aria-hidden="true"
          style={{ scaleX: progress }}
          className="fixed left-0 top-0 z-70 h-1 w-full origin-left bg-tertiary"
        />

        <Navbar />

        <main className="relative flex-1 overflow-hidden pt-28 pb-16 md:pt-32 md:pb-24">
          {/* Dekorasi latar yang melayang pelan */}
          <motion.div
            aria-hidden="true"
            animate={{ y: [0, -24, 0], x: [0, 12, 0] }}
            transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
            className="pointer-events-none absolute -left-32 -top-40 h-130 w-130 rounded-full bg-tertiary/10 blur-3xl"
          />
          <motion.div
            aria-hidden="true"
            animate={{ y: [0, 20, 0], x: [0, -16, 0] }}
            transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
            className="pointer-events-none absolute -bottom-40 right-0 h-115 w-115 rounded-full bg-[#E9C46A]/15 blur-3xl"
          />

          <div className="relative mx-auto max-w-4xl px-6">
            <motion.button
              type="button"
              onClick={handleBack}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              whileHover={{ x: -4 }}
              transition={{ duration: 0.4, ease: EASE }}
              className="mb-8 inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-primary transition hover:text-tertiary"
            >
              <ArrowLeft size={18} /> Kembali
            </motion.button>

            {loading ? (
              <div aria-busy="true" className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 md:p-10">
                <div className="h-6 w-28 animate-pulse rounded-full bg-slate-100" />
                <div className="h-10 w-3/4 animate-pulse rounded-xl bg-slate-100" />
                <div className="h-20 animate-pulse rounded-2xl bg-slate-100" />
                <div className="h-4 w-full animate-pulse rounded bg-slate-100" />
                <div className="h-4 w-5/6 animate-pulse rounded bg-slate-100" />
                <div className="h-4 w-2/3 animate-pulse rounded bg-slate-100" />
              </div>
            ) : error || !article ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: EASE }}
                className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-lg shadow-cyan-900/5"
              >
                <p className="text-sm text-red-500">{error || "Artikel tidak ditemukan."}</p>
                <Link to="/" className="mt-4 inline-block text-sm font-semibold text-tertiary hover:underline">
                  Kembali ke Beranda
                </Link>
              </motion.div>
            ) : (
              <motion.article
                key={article.id}
                variants={stagger}
                initial="hidden"
                animate="show"
                className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-cyan-900/5 md:p-10"
              >
                <motion.div variants={rise} className="mb-4 flex flex-wrap items-center gap-3">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3.5 py-1 text-xs font-semibold text-amber-700">
                    <Tag size={12} /> Edukasi
                  </span>
                  {article.tanggalPublikasi && (
                    <span className="inline-flex items-center gap-1.5 text-xs text-slate-400">
                      <Calendar size={13} /> {formatDate(article.tanggalPublikasi)}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1.5 text-xs text-slate-400">
                    <Clock size={13} /> {readingTime(article.isi)} menit baca
                  </span>
                </motion.div>

                <motion.h1
                  variants={rise}
                  className="text-2xl font-bold leading-snug text-primary md:text-3xl lg:text-4xl"
                >
                  {article.judul}
                </motion.h1>

                {article.ringkasan && (
                  <motion.p
                    variants={rise}
                    className="mt-6 rounded-2xl border-l-4 border-tertiary bg-[#F4F9F9] p-4 text-sm font-medium italic leading-relaxed text-slate-700"
                  >
                    {article.ringkasan}
                  </motion.p>
                )}

                {/* Paragraf muncul saat di-scroll */}
                <div className="mt-8 space-y-5 text-sm leading-relaxed text-slate-700 md:text-base md:leading-loose">
                  {paragraphs.map((p, i) => (
                    <motion.p
                      key={i}
                      initial={{ opacity: 0, y: 18 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-40px" }}
                      transition={{ duration: 0.55, ease: EASE }}
                    >
                      {p}
                    </motion.p>
                  ))}
                </div>
              </motion.article>
            )}

            {/* Bacaan lainnya */}
            {!loading && article && others.length > 0 && (
              <section className="mt-14">
                <motion.h2
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, ease: EASE }}
                  className="mb-5 text-xl font-bold text-primary"
                >
                  Bacaan lainnya
                </motion.h2>
                <div className="grid gap-5 md:grid-cols-3">
                  {others.map((a, i) => (
                    <motion.div
                      key={a.id}
                      initial={{ opacity: 0, y: 28 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-40px" }}
                      transition={{ duration: 0.5, delay: i * 0.1, ease: EASE }}
                      whileHover={{ y: -6 }}
                    >
                      <Link
                        to={`/artikel/${a.id}`}
                        className="group flex h-full flex-col gap-2 rounded-3xl border border-slate-200 bg-white p-5 transition hover:shadow-xl hover:shadow-cyan-900/10"
                      >
                        <h3 className="font-bold leading-snug text-primary transition group-hover:text-tertiary">
                          {a.judul}
                        </h3>
                        <p className="line-clamp-3 flex-1 text-xs leading-relaxed text-slate-600">
                          {a.ringkasan}
                        </p>
                        <span className="inline-flex items-center gap-1 pt-1 text-xs font-semibold text-tertiary">
                          Baca <ArrowRight size={14} className="transition group-hover:translate-x-1" />
                        </span>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </main>

        <Footer />
      </div>
    </MotionConfig>
  );
}