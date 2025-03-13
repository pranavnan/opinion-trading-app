export const TYPES = {
  // Repositories
  UserRepository: Symbol.for('UserRepository'),
  EventRepository: Symbol.for('EventRepository'),
  TradeRepository: Symbol.for('TradeRepository'),
  
  // Services
  EventService: Symbol.for('EventService'),
  TradeService: Symbol.for('TradeService'),
  AuthService: Symbol.for('AuthService'),
  ExternalApiService: Symbol.for('ExternalApiService'),
  
  // Others
  Logger: Symbol.for('Logger'),
  WebSocketService: Symbol.for('WebSocketService')
}; 