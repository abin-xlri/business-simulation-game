"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAdmin = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const requireAdmin = async (req, res, next) => {
    try {
        // Get user from request (set by authenticateToken middleware)
        const tokenUser = req.user;
        if (!tokenUser) {
            return res.status(401).json({ error: 'Authentication required' });
        }
        // Always verify role against database to avoid stale token role
        const dbUser = await prisma.user.findUnique({ where: { id: tokenUser.userId }, select: { role: true } });
        if (!dbUser) {
            return res.status(401).json({ error: 'User not found' });
        }
        if (dbUser.role !== 'ADMIN') {
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