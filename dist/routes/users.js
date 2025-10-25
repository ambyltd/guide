"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userController_1 = require("../controllers/userController");
const requireAdmin_1 = require("../middleware/requireAdmin");
const router = express_1.default.Router();
// Routes protégées utilisateur
// La protection est maintenant globale via firebaseAuthMiddleware
router.get('/profile', userController_1.getUserProfile);
router.put('/profile', userController_1.updateUserProfile);
// Routes protégées admin
router.get('/', requireAdmin_1.requireAdmin, userController_1.getAllUsers);
router.get('/:id', requireAdmin_1.requireAdmin, userController_1.getUserById);
router.post('/', requireAdmin_1.requireAdmin, userController_1.createUser);
router.put('/:id', requireAdmin_1.requireAdmin, userController_1.updateUser);
router.delete('/:id', requireAdmin_1.requireAdmin, userController_1.deleteUser);
router.patch('/:id/deactivate', requireAdmin_1.requireAdmin, userController_1.deactivateUser);
router.patch('/:id/activate', requireAdmin_1.requireAdmin, userController_1.activateUser);
router.patch('/:id/role', requireAdmin_1.requireAdmin, userController_1.changeUserRole);
exports.default = router;
