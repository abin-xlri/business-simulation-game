import { Server } from 'socket.io';

let ioInstance: Server | null = null;

export function setIO(server: Server) {
  ioInstance = server;
}

export function getIO(): Server {
  if (!ioInstance) {
    throw new Error('Socket.io server has not been initialized');
  }
  return ioInstance;
}


