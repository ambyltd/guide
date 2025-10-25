"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAdmin = void 0;
const requireAdmin = (req, res, next) => {
    // The user object is attached by firebaseAuthMiddleware
    const user = req.user;
    if (user && user.role === 'admin') {
        next();
    }
    else {
        res.status(403).json({ message: 'Forbidden: Requires admin privileges' });
    }
};
exports.requireAdmin = requireAdmin;
