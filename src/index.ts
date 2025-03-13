import mongoose from 'mongoose';
import { app } from './app';
import { LoggerService } from './common/logger/LoggerService';
import { container } from './config/inversify.config';
import { TYPES } from './config/types';
import { IWebSocketService } from './infrastructure/services/interfaces/IWebSocketService';

const port = process.env.PORT || 3000;

// Start HTTP server
const httpServer = app.listen(port, () => {
  mongoose
    .connect(
      process.env.MONGODB_URI || 'mongodb://localhost:27017/opinion-trading'
    )
    .then(() => {
    })
    .catch(() => {
      process.exit(1);
    });

  try {
    const webSocketService = container.get<IWebSocketService>(
      TYPES.WebSocketService
    );

    if (webSocketService) {
      webSocketService.initialize(httpServer);
    }
  } catch {} // Intentionally empty
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  const logger = container.get<LoggerService>(TYPES.Logger);
  logger.error('Uncaught exception', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason) => {
  const logger = container.get<LoggerService>(TYPES.Logger);
  logger.error('Unhandled rejection', reason);
});
