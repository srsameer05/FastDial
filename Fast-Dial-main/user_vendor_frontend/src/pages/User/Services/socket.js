// socket.js
import { io } from "socket.io-client";

// Replace with your actual backend URL
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL; // or your deployed server

export const connectSocket = (token) => {
    return io(SOCKET_URL, {
        auth: {
            token: token
        },
        transports: ['websocket'], // optional but often useful
        path: "/socket.io", // optional since it's default, but explicit is fine
    });
};