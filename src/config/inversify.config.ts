import { Container } from 'inversify';
import { TYPES } from './types';

// Repositories
import { UserRepository } from '../infrastructure/repositories/UserRepository';
import { EventRepository } from '../infrastructure/repositories/EventRepository';
import { TradeRepository } from '../infrastructure/repositories/TradeRepository';

// Services
import { IEventService } from '../application/services/interfaces/IEventService';
import { EventService } from '../application/services/EventService';
import { ITradeService } from '../application/services/interfaces/ITradeService';
import { TradeService } from '../application/services/TradeService';
import { IAuthService } from '../application/services/interfaces/IAuthService';
import { AuthService } from '../application/services/AuthService';
import { IExternalApiService } from '../application/services/interfaces/IExternalApiService';
import { ExternalApiService } from '../application/services/ExternalApiService';
import { IWebSocketService } from '../infrastructure/services/interfaces/IWebSocketService';
import { WebSocketService } from '../infrastructure/services/WebSocketService';
import { LoggerService } from '../common/logger/LoggerService';
import { IUserRepository } from '@/repositories/IUserRepository';
import { IEventRepository } from '@/repositories/IEventRepository';
import { ITradeRepository } from '@/repositories/ITradeRepository';

const container = new Container();

// Repositories
container.bind<IUserRepository>(TYPES.UserRepository).to(UserRepository);
container.bind<IEventRepository>(TYPES.EventRepository).to(EventRepository);
container.bind<ITradeRepository>(TYPES.TradeRepository).to(TradeRepository);

// Services
container.bind<IEventService>(TYPES.EventService).to(EventService);
container.bind<ITradeService>(TYPES.TradeService).to(TradeService);
container.bind<IAuthService>(TYPES.AuthService).to(AuthService);
container.bind<IExternalApiService>(TYPES.ExternalApiService).to(ExternalApiService);

// WebSocketService should be bound as a singleton
container.bind<IWebSocketService>(TYPES.WebSocketService).to(WebSocketService).inSingletonScope();

container.bind<LoggerService>(TYPES.Logger).to(LoggerService);

export { container }; 