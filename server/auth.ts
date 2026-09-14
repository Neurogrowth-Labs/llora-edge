import crypto from 'crypto';
import { NextFunction, Request, Response } from 'express';
import { db } from './db';
import { config } from './config';

export interface AuthenticatedRequest extends Request { user?: { id: string; email: string; role: string } }
const hash = (value: string) => crypto.createHash('sha256').update(value).digest('hex');
const passwordHash = (password: string, salt = crypto.randomBytes(16).toString('hex')) => `${salt}:${crypto.scryptSync(password, salt, 64).toString('hex')}`;
const passwordMatches = (password: string, stored: string) => {
  const [salt, expected] = stored.split(':');
  const actual = crypto.scryptSync(password, salt, 64).toString('hex');
  return expected.length === actual.length && crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(actual));
};
const parseCookies = (request: Request) => Object.fromEntries((request.headers.cookie || '').split(';').filter(Boolean).map((part) => {
  const [key, ...value] = part.trim().split('='); return [key, decodeURIComponent(value.join('='))];
}));

export async function createSession(response: Response, userId: string, request: Request): Promise<void> {
  const token = crypto.randomBytes(32).toString('base64url');
  const expires = new Date(Date.now() + config.sessionTtlDays * 86_400_000);
  await db.query('INSERT INTO sessions (user_id, token_hash, expires_at, ip, user_agent) VALUES ($1,$2,$3,$4,$5)', [userId, hash(token), expires, request.ip, request.get('user-agent') || null]);
  response.cookie(config.sessionCookieName, token, { httpOnly: true, secure: config.isProduction, sameSite: 'lax', expires, path: '/' });
}

export async function requireAuth(request: AuthenticatedRequest, response: Response, next: NextFunction): Promise<void> {
  const token = parseCookies(request)[config.sessionCookieName];
  if (!token) { response.status(401).json({ error: 'Authentication required.' }); return; }
  const result = await db.query<{ id: string; email: string; role: string }>('SELECT u.id, u.email, u.role FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.token_hash=$1 AND s.expires_at > now() AND u.deleted_at IS NULL', [hash(token)]);
  if (!result.rows[0]) { response.status(401).json({ error: 'Session expired.' }); return; }
  request.user = result.rows[0];
  void db.query('UPDATE sessions SET last_seen_at=now() WHERE token_hash=$1', [hash(token)]);
  next();
}

export { passwordHash, passwordMatches, hash };
