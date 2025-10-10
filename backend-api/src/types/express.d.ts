import { AuthenticatedUser } from '../middleware/authMiddleware';

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
      analytics?: {
        sessionId?: string;
        userId?: string;
        trackingEnabled?: boolean;
        location?: {
          latitude: number;
          longitude: number;
          accuracy?: number;
          timestamp: Date;
        };
      };
    }
  }
}
