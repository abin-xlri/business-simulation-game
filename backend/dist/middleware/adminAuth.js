"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAdmin = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const requireAdmin = async (req, res, next) => {
    try {
        // Get user from request (set by authenticateToken middleware)
        const user = req.user;
        if (!user) {
            return res.status(401).json({ error: 'Authentication required' });
        }
        // Check if user is admin
        if (user.role !== 'ADMIN') {
            return res.status(403).json({ error: 'Admin privileges required' });
        }
        next();
    }
    catch (error) {
        console.error('Admin auth error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.requireAdmin = requireAdmin;
//# sourceMappingURL=adminAuth.js.map