import { useCallback, useEffect, useState } from "react";
import { api } from "../services/api";
import { socket, connectSocket } from "../services/socket";

const FALLBACK_POLL_MS = 30000;

export default function useAdminStats() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [connected, setConnected] = useState(socket.connected);

  // Mengambil data statistik dari REST API
  const load = useCallback(async () => {
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
    load();

    // Event handler untuk pembaruan statistik via WebSocket
    const onStats = (data) => {
      setStats(data);
      setError("");
    };
    const onConnect = () => {
      setConnected(true);
      load();
    };
    const onDisconnect = () => setConnected(false);

    socket.on("admin:stats", onStats);
    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    // Menghubungkan socket dan melampirkan token autentikasi
    connectSocket();

    // Polling berkala sebagai mekanisme fallback
    const poll = setInterval(load, FALLBACK_POLL_MS);

    return () => {
      socket.off("admin:stats", onStats);
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      clearInterval(poll);
    };
  }, [load]);

  return { stats, loading, error, connected };
}