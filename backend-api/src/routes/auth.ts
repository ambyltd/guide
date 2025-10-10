import express from 'express';
import {
  register,
  login,
  logout,
  refreshToken,
  verifyToken,
  changePassword,
  forgotPassword
} from '../controllers/authController';

const router = express.Router();

// Routes publiques
router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.post('/forgot-password', forgotPassword);

// Routes protégées
// La protection est maintenant globale via firebaseAuthMiddleware
router.post('/refresh-token', refreshToken);
router.get('/verify-token', verifyToken);
router.post('/change-password', changePassword);

export default router;
