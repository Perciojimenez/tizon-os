import { io } from 'socket.io-client';

const SOCKET_URL =
  process.env.EXPO_PUBLIC_API_URL || 'https://tizon-os-production.up.railway.app';

export const socket = io(`${SOCKET_URL}/sala`, {
  transports: ['websocket'],
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
});
