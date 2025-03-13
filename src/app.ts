import 'reflect-metadata';
import dotenv from 'dotenv';
import express, { Request, Response, NextFunction } from 'express';
import { InversifyExpressServer } from 'inversify-express-utils';
import { container } from './config/inversify.config';
// Import controllers (required to register routes)
import './routes/controllers/EventController';
import './routes/controllers/TradeController';
import './routes/controllers/AuthController';

// Load environment variables
dotenv.config();

// Setup server
const server = new InversifyExpressServer(container);

server.setConfig((app) => {
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // CORS middleware
  app.use((req: Request, res: Response, next: NextFunction) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header(
      'Access-Control-Allow-Headers',
      'Origin, X-Requested-With, Content-Type, Accept, Authorization'
    );
    if (req.method === 'OPTIONS') {
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
      res.status(200).json({});
      return;
    }
    next();
  });

  // Add route to serve the socket test page
  app.get('/socket-test', (req, res) => {
    res.sendFile('socket-test.html', { root: process.cwd() });
  });
});

// Create application
const app = server.build();

export { app };
