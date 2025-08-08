import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { generateToken } from '../utils/jwt';
import { hashPassword, comparePassword, validatePassword } from '../utils/password';
import { body, validationResult } from 'express-validator';

const prisma = new PrismaClient();

function isAdminEmail(targetEmail: string): boolean {
  const list = (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map(e => e.trim().toLowerCase())
    .filter(Boolean);
  return list.includes((targetEmail || '').trim().toLowerCase());
}

function isAdminDomain(targetEmail: string): boolean {
  const domains = (process.env.ADMIN_EMAIL_DOMAINS || '')
    .split(',')
    .map(d => d.trim().toLowerCase().replace(/^@/, ''))
    .filter(Boolean);
  const email = (targetEmail || '').trim().toLowerCase();
  return domains.some(domain => email.endsWith(`@${domain}`));
}

async function shouldPromoteToAdmin(targetEmail: string): Promise<boolean> {
  // Explicit allow via ADMIN_EMAILS
  if (isAdminEmail(targetEmail)) return true;

  // Allow via domain allowlist
  if (isAdminDomain(targetEmail)) return true;

  // Bootstrap: if no admins exist yet, promote the first authenticated user
  try {
    const adminCount = await prisma.user.count({ where: { role: 'ADMIN' } });
    if (adminCount === 0) return true;
  } catch {
    // If count fails for some reason, do not promote silently
  }
  return false;
}

export const register = async (req: Request, res: Response) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, name, password } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    // Validate password
    if (!validatePassword(password)) {
      return res.status(400).json({ 
        error: 'Password must be at least 8 characters long and contain at least one letter and one number' 
      });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    let user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role: 'STUDENT' // Default role
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true
      }
    });

    // Auto-promote to admin (ADMIN_EMAILS, ADMIN_EMAIL_DOMAINS, or bootstrap if no admins exist)
    if ((await shouldPromoteToAdmin(email)) && user.role !== 'ADMIN') {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { role: 'ADMIN' },
        select: { id: true, email: true, name: true, role: true, createdAt: true }
      });
    }

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role
    });

    res.status(201).json({
      message: 'User registered successfully',
      user,
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Find user
    let user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Verify password
    const isValidPassword = await comparePassword(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Auto-promote to admin (ADMIN_EMAILS, ADMIN_EMAIL_DOMAINS, or bootstrap if no admins exist)
    if ((await shouldPromoteToAdmin(email)) && user.role !== 'ADMIN') {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { role: 'ADMIN' }
      });
    }

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role
    });

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createSession = async (req: Request, res: Response) => {
  try {
    const { name, maxParticipants } = req.body;
    const user = (req as any).user;

    // Generate unique session code
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();

    // Create session
    const session = await prisma.session.create({
      data: {
        name,
        code,
        maxParticipants: maxParticipants || 10,
        status: 'WAITING'
      }
    });

    res.status(201).json({
      message: 'Session created successfully',
      session
    });
  } catch (error) {
    console.error('Create session error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const joinSession = async (req: Request, res: Response) => {
  try {
    const { code } = req.body;
    const user = (req as any).user;

    // Find session by code
    const session = await prisma.session.findUnique({
      where: { code },
      include: {
        userSessions: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      }
    });

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    if (session.status !== 'WAITING') {
      return res.status(400).json({ error: 'Session is not accepting new participants' });
    }

    if (session.userSessions.length >= session.maxParticipants) {
      return res.status(400).json({ error: 'Session is full' });
    }

    // Check if user is already in the session
    const existingUserSession = session.userSessions.find(
      (us: any) => us.user.id === user.userId
    );

    if (existingUserSession) {
      return res.status(400).json({ error: 'User is already in this session' });
    }

    // Add user to session
    await prisma.userSession.create({
      data: {
        userId: user.userId,
        sessionId: session.id
      }
    });

    res.json({
      message: 'Successfully joined session',
      session: {
        id: session.id,
        name: session.name,
        code: session.code,
        status: session.status,
        currentRound: session.currentRound,
        maxParticipants: session.maxParticipants,
        participants: session.userSessions.length + 1
      }
    });
  } catch (error) {
    console.error('Join session error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getCurrentSession = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;

    // Find user's current session
    const userSession = await prisma.userSession.findFirst({
      where: { userId: user.userId },
      include: {
        session: {
          include: {
            userSessions: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true
                  }
                }
              }
            }
          }
        }
      },
      orderBy: { joinedAt: 'desc' }
    });

    if (!userSession) {
      return res.status(404).json({ error: 'No active session found' });
    }

    res.json({
      session: {
        id: userSession.session.id,
        name: userSession.session.name,
        code: userSession.session.code,
        status: userSession.session.status,
        currentRound: userSession.session.currentRound,
        maxParticipants: userSession.session.maxParticipants,
        task: (userSession.session as any).task,
        taskStartedAt: (userSession.session as any).taskStartedAt,
        endsAt: (userSession.session as any).endsAt,
        participants: userSession.session.userSessions.map((us: any) => ({
          id: us.user.id,
          name: us.user.name,
          email: us.user.email,
          joinedAt: us.joinedAt
        }))
      }
    });
  } catch (error) {
    console.error('Get current session error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Validation middleware
export const validateRegister = [
  body('email').isEmail().normalizeEmail(),
  body('name').trim().isLength({ min: 2, max: 50 }),
  body('password').isLength({ min: 8 })
];

export const validateLogin = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
];

export const validateCreateSession = [
  body('name').trim().isLength({ min: 2, max: 100 }),
  body('maxParticipants').optional().isInt({ min: 1, max: 50 })
];

export const validateJoinSession = [
  body('code').trim().isLength({ min: 6, max: 6 })
];