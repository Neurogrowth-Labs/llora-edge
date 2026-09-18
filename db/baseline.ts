import 'dotenv/config';
import { Pool } from 'pg';

// Use DIRECT_URL for migrations (session mode, required for DDL)
const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
if (!connectionString) throw new Error('DIRECT_URL or DATABASE_URL is required');
const db = new Pool({ connectionString });

async function baseline(): Promise<void> {
  // Create migrations table if not exists
  await db.query('CREATE TABLE IF NOT EXISTS schema_migrations (name text PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now())');

  // Mark 001_initial.sql as applied (it was run manually before)
  await db.query(`
    INSERT INTO schema_migrations (name) VALUES ('001_initial.sql')
    ON CONFLICT (name) DO NOTHING
  `);

  console.log('Baseline complete: 001_initial.sql marked as applied');
  await db.end();
}

baseline().catch((error) => { console.error(error); process.exitCode = 1; });
