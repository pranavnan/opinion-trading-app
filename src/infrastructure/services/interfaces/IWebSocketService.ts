import { Server } from 'http';

export interface IWebSocketService {
  initialize(server: Server): void;
  isInitialized(): boolean;
  broadcastToAll(event: string, data: any): void;
  broadcastToRoom(room: string, event: string, data: any): void;
} 