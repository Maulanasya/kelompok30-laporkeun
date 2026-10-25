import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "../services/api";
import { socket, connectSocket, disconnectSocket } from "../services/socket";

export const FROM_ME = "user";
export const FROM_OTHER = "other";

const getCurrentUserId = () => {
  try {
    const token =
      localStorage.getItem("token") ||
      sessionStorage.getItem("token");

    if (!token) return null;

    const base64Url = token.split(".")[1];
    if (!base64Url) return null;

    const base64 = base64Url
      .replace(/-/g, "+")
      .replace(/_/g, "/");

    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map(
          (c) =>
            "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2)
        )
        .join("")
    );

    return JSON.parse(jsonPayload)?.id || null;
  } catch {
    return null;
  }
};

const toBubble = (message, currentUserId) => {
  const isMine =
    message.sender?.id && currentUserId
      ? message.sender.id === currentUserId
      : Boolean(message.mine);

  return {
    id: message.id,
    from: isMine ? FROM_ME : FROM_OTHER,
    isMe: isMine,
    text: message.pesan,
    createdAt: message.createdAt,
    senderName: message.sender?.nama,
    sudahBaca: message.sudahBaca,
    time: message.createdAt
      ? new Date(message.createdAt).toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
          timeZone: "Asia/Jakarta",
        })
      : "",
  };
};

const byTime = (a, b) =>
  new Date(a.createdAt) - new Date(b.createdAt);

const mergeMessages = (previous, incoming) => {
  const map = new Map();

  [...previous, ...incoming].forEach((message) => {
    if (message?.id) {
      map.set(message.id, message);
    }
  });

  return [...map.values()].sort(byTime);
};

export default function useChat(kodeTiket, { onListChange } = {}) {
  const [messages, setMessages] = useState([]);
  const [readOnly, setReadOnly] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [connected, setConnected] = useState(false);

  const ticketRef = useRef(kodeTiket);
  const listChangeRef = useRef(onListChange);

  ticketRef.current = kodeTiket;
  listChangeRef.current = onListChange;

  const joinRoom = useCallback((ticket) => {
    if (!ticket || !socket.connected) return;

    socket.emit("join_room", ticket, (response) => {
      if (ticket !== ticketRef.current) return;

      if (!response?.ok) {
        setError(
          response?.error || "Gagal membuka percakapan."
        );
      }
    });
  }, []);

  useEffect(() => {
    const onConnect = () => {
      setConnected(true);

      if (ticketRef.current) {
        joinRoom(ticketRef.current);
      }
    };

    const onDisconnect = () => {
      setConnected(false);
    };

    const onConnectError = (err) => {
      setConnected(false);

      setError(
        err?.message === "UNAUTHORIZED"
          ? "Sesi berakhir. Silakan login ulang."
          : "Tidak dapat terhubung ke server chat."
      );
    };

    const onReceive = (payload) => {
      const ticket = payload?.kodeTiket;
      const message = payload?.message;

      if (!message?.id || ticket !== ticketRef.current) return;

      const currentUserId = getCurrentUserId();
      const bubbleMessage = toBubble(message, currentUserId);

      setMessages((previous) =>
        mergeMessages(previous, [bubbleMessage])
      );

      if (!bubbleMessage.isMe) {
        api
          .markChatRead(ticket)
          .then(() => listChangeRef.current?.())
          .catch((err) => {
            console.error("Gagal menandai chat dibaca:", err);
          });
      }

      listChangeRef.current?.();
    };

    const onUpdated = () => {
      listChangeRef.current?.();
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("connect_error", onConnectError);
    socket.on("receive_message", onReceive);
    socket.on("chat_updated", onUpdated);

    setConnected(socket.connected);
    connectSocket();

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("connect_error", onConnectError);
      socket.off("receive_message", onReceive);
      socket.off("chat_updated", onUpdated);

      disconnectSocket();
    };
  }, [joinRoom]);

  useEffect(() => {
    let active = true;

    setMessages([]);
    setError("");
    setReadOnly(false);

    if (!kodeTiket) {
      setLoading(false);
      return undefined;
    }

    setLoading(true);

    const currentUserId = getCurrentUserId();

    const loadHistory = async () => {
      try {
        const data = await api.getChatHistory(kodeTiket);

        if (!active) return;

        if (data?.error) {
          setError(data.error);
          return;
        }

        if (!Array.isArray(data?.chats)) {
          throw new Error("Format riwayat percakapan tidak valid.");
        }

        setReadOnly(Boolean(data.readOnly));

        const history = data.chats.map((message) =>
          toBubble(message, currentUserId)
        );

        setMessages((previous) =>
          mergeMessages(previous, history)
        );

        api
          .markChatRead(kodeTiket)
          .then(() => {
            if (active) {
              listChangeRef.current?.();
            }
          })
          .catch((err) => {
            console.error("Gagal menandai chat dibaca:", err);
          });
      } catch (err) {
        if (!active) return;

        console.error("Gagal memuat riwayat chat:", err);

        setError(
          err?.message || "Gagal memuat percakapan."
        );
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadHistory();

    if (socket.connected) {
      joinRoom(kodeTiket);
    }

    return () => {
      active = false;
      socket.emit("leave_room", kodeTiket);
    };
  }, [kodeTiket, joinRoom]);

  const send = useCallback(
    (text) => {
      if (!kodeTiket) return;

      const pesan = String(text ?? "").trim();

      if (!pesan) return;

      if (!socket.connected) {
        setError("Tidak terhubung ke server chat. Coba lagi.");
        return;
      }

      setError("");

      socket
        .timeout(8000)
        .emit(
          "send_message",
          { kodeTiket, pesan },
          (err, response) => {
            if (err) {
              setError(
                "Pesan belum terkirim. Periksa koneksi lalu coba lagi."
              );
              return;
            }

            if (!response?.ok) {
              setError(
                response?.error || "Gagal mengirim pesan."
              );
              return;
            }

            listChangeRef.current?.();
          }
        );
    },
    [kodeTiket]
  );

  return {
    messages,
    readOnly,
    loading,
    error,
    connected,
    send,
  };
}