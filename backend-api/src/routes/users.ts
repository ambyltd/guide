import express from 'express';
import {
  getAllUsers,
  getUserById,
  getUserProfile,
  createUser,
  updateUser,
  updateUserProfile,
  deleteUser,
  deactivateUser,
  activateUser,
  changeUserRole
} from '../controllers/userController';
import { requireAdmin } from '../middleware/requireAdmin';

const router = express.Router();

// Routes protégées utilisateur
// La protection est maintenant globale via firebaseAuthMiddleware
router.get('/profile', getUserProfile);
router.put('/profile', updateUserProfile);

// Routes protégées admin
router.get('/', requireAdmin, getAllUsers);
router.get('/:id', requireAdmin, getUserById);
router.post('/', requireAdmin, createUser);
router.put('/:id', requireAdmin, updateUser);
router.delete('/:id', requireAdmin, deleteUser);
router.patch('/:id/deactivate', requireAdmin, deactivateUser);
router.patch('/:id/activate', requireAdmin, activateUser);
router.patch('/:id/role', requireAdmin, changeUserRole);

export default router;
