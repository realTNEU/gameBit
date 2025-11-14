import { io } from "socket.io-client";
import useAuthStore from "../store/authStore";

let socket = null;

export const initSocket = () => {
  if (socket?.connected) return socket;

  const token = document.cookie.split("token=")[1]?.split(";")[0];
  if (!token) return null;

  socket = io(import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:5000", {
    auth: { token },
    withCredentials: true
  });

  socket.on("connect", () => {
    console.log("Socket connected");
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected");
  });

  return socket;
};

export const getSocket = () => {
  if (!socket || !socket.connected) {
    return initSocket();
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

