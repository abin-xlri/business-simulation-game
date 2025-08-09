import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const requireAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get user from request (set by authenticateToken middleware)
    const tokenUser = (req as any).user as { userId: string; role: string } | undefined;

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
  } catch (error) {
    console.error('Admin auth error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};