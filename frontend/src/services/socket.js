import { io } from "socket.io-client";
import { getToken } from "../utils/auth";

// Alamat server backend (TANPA "/api"). Socket.IO memperlakukan path sebagai namespace.
const SOCKET_URL =
  import.meta.env.VITE_SERVER_URL || import.meta.env.VITE_SOCKET_URL || "http://localhost:5001";

export const socket = io(SOCKET_URL, {
  autoConnect: false,
  withCredentials: true,
});

// Sambungkan dengan token login (server menolak koneksi tanpa token yang valid)
export const connectSocket = () => {
  const token = getToken();
  if (!token) return socket;
  socket.auth = { token };
  if (!socket.connected) socket.connect();
  return socket;
};

export const disconnectSocket = () => {
  if (socket.connected || socket.active) socket.disconnect();
};