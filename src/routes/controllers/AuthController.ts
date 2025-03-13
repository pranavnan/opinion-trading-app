import { Request, Response } from 'express';
import { inject } from 'inversify';
import { controller, httpPost, request, response } from 'inversify-express-utils';
import { TYPES } from '../../config/types';
import { IAuthService } from '../../application/services/interfaces/IAuthService';
import { authMiddleware } from '../middlewares/authMiddleware';
import { LoggerService } from '../../common/logger/LoggerService';
@controller('/api/auth')
export class AuthController {
  constructor(
    @inject(TYPES.AuthService) private authService: IAuthService,
    @inject(TYPES.Logger) private logger: LoggerService
  ) {}

  @httpPost('/register')
  public async register(@request() req: Request, @response() res: Response) {
    try {
      const { username, email, password } = req.body;

      if (!username || !email || !password) {
        return res.status(400).json({ message: 'Please provide username, email, and password' });
      }

      const result = await this.authService.register(username, email, password);
      return res.status(201).json(result);
    } catch (error) {
      this.logger.error('Error registering user', error);
      if (error instanceof Error) {
        return res.status(400).json({ message: error.message });
      }
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  @httpPost('/login')
  public async login(@request() req: Request, @response() res: Response) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: 'Please provide email and password' });
      }

      const result = await this.authService.login(email, password);
      return res.status(200).json(result);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).json({ message: error.message });
      }
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  @httpPost('/change-password', authMiddleware)
  public async changePassword(@request() req: Request, @response() res: Response) {
    try {
      const { oldPassword, newPassword } = req.body;
      const userId = req.user._id;

      if (!oldPassword || !newPassword) {
        return res.status(400).json({ message: 'Please provide old and new passwords' });
      }

      const success = await this.authService.changePassword(userId, oldPassword, newPassword);

      if (success) {
        return res.status(200).json({ message: 'Password changed successfully' });
      } else {
        return res.status(400).json({ message: 'Failed to change password' });
      }
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).json({ message: error.message });
      }
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
} 