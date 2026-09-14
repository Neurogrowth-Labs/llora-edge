import { Pool } from 'pg';
import { config } from './config';

if (!config.databaseUrl) throw new Error('DATABASE_URL is required to start the SQL backend.');

export const db = new Pool({
  connectionString: config.databaseUrl,
  max: Number(process.env.DATABASE_POOL_MAX || 10),
  idleTimeoutMillis: 30_000,
  ssl: config.isProduction ? { rejectUnauthorized: process.env.DATABASE_SSL_REJECT_UNAUTHORIZED !== 'false' } : false,
});
