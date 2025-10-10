import { Request, Response, NextFunction } from 'express';

export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  // The user object is attached by firebaseAuthMiddleware
  const user = req.user;

  if (user && user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Forbidden: Requires admin privileges' });
  }
};
