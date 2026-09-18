import crypto from 'crypto';
import { NextFunction, Request, Response } from 'express';
import prisma from './prisma';
import { config } from './config';

export interface AuthenticatedRequest extends Request {
  user?: { id: string; email: string; role: string; fullName: string; studioName: string | null; avatarUrl: string | null };
}

const hash = (value: string) => crypto.createHash('sha256').update(value).digest('hex');

const passwordHash = (password: string, salt = crypto.randomBytes(16).toString('hex')) =>
  `${salt}:${crypto.scryptSync(password, salt, 64).toString('hex')}`;

const passwordMatches = (password: string, stored: string) => {
  const [salt, expected] = stored.split(':');
  const actual = crypto.scryptSync(password, salt, 64).toString('hex');
  return expected.length === actual.length && crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(actual));
};

const parseCookies = (request: Request) =>
  Object.fromEntries(
    (request.headers.cookie || '')
      .split(';')
      .filter(Boolean)
      .map((part) => {
        const [key, ...value] = part.trim().split('=');
        return [key, decodeURIComponent(value.join('='))];
      })
  );

function parseUserAgent(ua: string | undefined): string {
  if (!ua) return 'Unknown Device';
  if (ua.includes('Chrome')) return 'Chrome Browser';
  if (ua.includes('Firefox')) return 'Firefox Browser';
  if (ua.includes('Safari')) return 'Safari Browser';
  if (ua.includes('Edge')) return 'Edge Browser';
  return 'Unknown Browser';
}

export async function createSession(response: Response, userId: string, request: Request): Promise<void> {
  const token = crypto.randomBytes(32).toString('base64url');
  const expires = new Date(Date.now() + config.sessionTtlDays * 86_400_000);

  await prisma.session.create({
    data: {
      userId,
      tokenHash: hash(token),
      expiresAt: expires,
      ip: request.ip || null,
      userAgent: request.get('user-agent') || null,
      deviceName: parseUserAgent(request.get('user-agent')),
    },
  });

  response.cookie(config.sessionCookieName, token, {
    httpOnly: true,
    secure: config.isProduction,
    sameSite: 'lax',
    expires,
    path: '/',
  });
}

export async function requireAuth(request: AuthenticatedRequest, response: Response, next: NextFunction): Promise<void> {
  const token = parseCookies(request)[config.sessionCookieName];
  if (!token) {
    response.status(401).json({ error: 'Authentication required.' });
    return;
  }

  const session = await prisma.session.findUnique({
    where: { tokenHash: hash(token) },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          role: true,
          fullName: true,
          studioName: true,
          avatarUrl: true,
          deletedAt: true,
        },
      },
    },
  });

  if (!session || session.expiresAt < new Date() || session.user.deletedAt) {
    response.status(401).json({ error: 'Session expired.' });
    return;
  }

  request.user = {
    id: session.user.id,
    email: session.user.email,
    role: session.user.role,
    fullName: session.user.fullName,
    studioName: session.user.studioName,
    avatarUrl: session.user.avatarUrl,
  };

  // Update last seen (fire and forget)
  prisma.session.update({
    where: { id: session.id },
    data: { lastSeenAt: new Date() },
  }).catch(() => {});

  next();
}

export async function optionalAuth(request: AuthenticatedRequest, response: Response, next: NextFunction): Promise<void> {
  const token = parseCookies(request)[config.sessionCookieName];
  if (!token) {
    next();
    return;
  }

  const session = await prisma.session.findUnique({
    where: { tokenHash: hash(token) },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          role: true,
          fullName: true,
          studioName: true,
          avatarUrl: true,
          deletedAt: true,
        },
      },
    },
  });

  if (session && session.expiresAt >= new Date() && !session.user.deletedAt) {
    request.user = {
      id: session.user.id,
      email: session.user.email,
      role: session.user.role,
      fullName: session.user.fullName,
      studioName: session.user.studioName,
      avatarUrl: session.user.avatarUrl,
    };
  }

  next();
}

export async function clearSession(request: Request, response: Response): Promise<void> {
  const token = parseCookies(request)[config.sessionCookieName];
  if (token) {
    await prisma.session.deleteMany({ where: { tokenHash: hash(token) } });
  }
  response.clearCookie(config.sessionCookieName, { path: '/' });
}

export async function clearAllUserSessions(userId: string, exceptTokenHash?: string): Promise<void> {
  await prisma.session.deleteMany({
    where: {
      userId,
      ...(exceptTokenHash ? { NOT: { tokenHash: exceptTokenHash } } : {}),
    },
  });
}

export async function getUserSessions(userId: string) {
  return prisma.session.findMany({
    where: { userId, expiresAt: { gt: new Date() } },
    select: {
      id: true,
      deviceName: true,
      ip: true,
      lastSeenAt: true,
      createdAt: true,
    },
    orderBy: { lastSeenAt: 'desc' },
  });
}

export async function revokeSession(userId: string, sessionId: string): Promise<boolean> {
  const result = await prisma.session.deleteMany({
    where: { id: sessionId, userId },
  });
  return result.count > 0;
}

// Password reset token helpers
export async function createPasswordResetToken(userId: string): Promise<string> {
  const token = crypto.randomBytes(32).toString('base64url');
  const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await prisma.passwordResetToken.upsert({
    where: { userId },
    update: { tokenHash: hash(token), expiresAt: expires },
    create: { userId, tokenHash: hash(token), expiresAt: expires },
  });

  return token;
}

export async function verifyPasswordResetToken(token: string): Promise<string | null> {
  const record = await prisma.passwordResetToken.findUnique({
    where: { tokenHash: hash(token) },
  });

  if (!record || record.expiresAt < new Date()) {
    return null;
  }

  return record.userId;
}

export async function consumePasswordResetToken(token: string): Promise<void> {
  await prisma.passwordResetToken.deleteMany({ where: { tokenHash: hash(token) } });
}

// Email verification token helpers
export async function createEmailVerifyToken(userId: string): Promise<string> {
  const token = crypto.randomBytes(32).toString('base64url');
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  await prisma.emailVerifyToken.upsert({
    where: { userId },
    update: { tokenHash: hash(token), expiresAt: expires },
    create: { userId, tokenHash: hash(token), expiresAt: expires },
  });

  return token;
}

export async function verifyEmailToken(token: string): Promise<string | null> {
  const record = await prisma.emailVerifyToken.findUnique({
    where: { tokenHash: hash(token) },
  });

  if (!record || record.expiresAt < new Date()) {
    return null;
  }

  // Mark email as verified
  await prisma.user.update({
    where: { id: record.userId },
    data: { emailVerifiedAt: new Date() },
  });

  // Delete the token
  await prisma.emailVerifyToken.delete({ where: { id: record.id } });

  return record.userId;
}

export { passwordHash, passwordMatches, hash };
