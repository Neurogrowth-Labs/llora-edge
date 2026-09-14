import 'dotenv/config';

export const config = {
  databaseUrl: process.env.DATABASE_URL || '',
  sessionCookieName: process.env.SESSION_COOKIE_NAME || 'lora_session',
  isProduction: process.env.NODE_ENV === 'production',
  sessionTtlDays: Number(process.env.SESSION_TTL_DAYS || 14),
};

export function assertProductionConfiguration(): void {
  if (!config.isProduction) return;
  if (!config.databaseUrl) throw new Error('DATABASE_URL is required in production.');
}
