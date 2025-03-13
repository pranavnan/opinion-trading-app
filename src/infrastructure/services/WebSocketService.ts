// src/infrastructure/services/WebSocketService.ts
import { Server as SocketServer } from 'socket.io';
import { Server as HttpServer } from 'http';
import { injectable } from 'inversify';
import { IWebSocketService } from './interfaces/IWebSocketService';

@injectable()
export class WebSocketService implements IWebSocketService {
  private io: SocketServer | null = null;
  private initialized: boolean = false;
  
  // Static instance to ensure singleton behavior
  private static instance: WebSocketService | null = null;

  constructor() {
    // Ensure singleton instance
    if (WebSocketService.instance) {
      return WebSocketService.instance;
    }
    
    WebSocketService.instance = this;
  }

  initialize(server: HttpServer): void {
    if (this.initialized) {
      return;
    }

    try {
      
      // Ensure proper configuration for Socket.io
      this.io = new SocketServer(server, {
        cors: {
          origin: '*', 
          methods: ['GET', 'POST']
        },
        // Add explicit transports config
        transports: ['websocket', 'polling']
      });

      this.initialized = true;

      this.io.on('connection', (socket) => {

        // Handle events
        socket.on('join_room', (room) => {
          socket.join(room);
        });

        socket.on('leave_room', (room) => {
          socket.leave(room);
        });

        // Add error handling
        socket.on('error', () => {
        });

        socket.on('disconnect', () => {
        });
      });

      // Add error handling for the io instance
      this.io.engine.on('connection_error', () => {
      });
    } catch {
      this.initialized = false;
      this.io = null;
    }
  }

  isInitialized(): boolean {
    return this.initialized && this.io !== null;
  }

  broadcastToAll(event: string, data: any): void {
    if (!this.initialized || !this.io) {
      return;
    }
    
    try {
      this.io.emit(event, data);
    } catch {
    }
  }

  broadcastToRoom(room: string, event: string, data: any): void {
    if (!this.initialized || !this.io) {
      return;
    }
    
    try {
      this.io.to(room).emit(event, data);
    } catch {
    }
  }
}