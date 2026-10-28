import { useCallback, useEffect, useState } from "react";
import { api } from "../services/api";

export default function useAdminStats() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.getAdminStats();
      if (res.error) {
        setError(res.error);
        return;
      }
      setStats(res.data);
      setError("");
    } catch {
      setError("Gagal memuat statistik.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Hanya panggil sekali saat halaman dibuka
    load();
  }, [load]);

  // Kembalikan fungsi 'load' agar bisa dipanggil manual dari tombol di UI
  return { stats, loading, error, connected: true, refresh: load };
}