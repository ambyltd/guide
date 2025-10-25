"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authController_1 = require("../controllers/authController");
const router = express_1.default.Router();
// Routes publiques
router.post('/register', authController_1.register);
router.post('/login', authController_1.login);
router.post('/logout', authController_1.logout);
router.post('/forgot-password', authController_1.forgotPassword);
// Routes protégées
// La protection est maintenant globale via firebaseAuthMiddleware
router.post('/refresh-token', authController_1.refreshToken);
router.get('/verify-token', authController_1.verifyToken);
router.post('/change-password', authController_1.changePassword);
exports.default = router;
