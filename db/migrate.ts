import { readdir, readFile } from 'fs/promises';
import path from 'path';
import { db } from '../server/db';

async function migrate(): Promise<void> {
  await db.query('CREATE TABLE IF NOT EXISTS schema_migrations (name text PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now())');
  const directory = path.join(process.cwd(), 'db', 'migrations');
  const migrations = (await readdir(directory)).filter((name) => name.endsWith('.sql')).sort();
  for (const name of migrations) {
    const existing = await db.query('SELECT 1 FROM schema_migrations WHERE name=$1', [name]);
    if (existing.rowCount) continue;
    const client = await db.connect();
    try {
      await client.query('BEGIN');
      await client.query(await readFile(path.join(directory, name), 'utf8'));
      await client.query('INSERT INTO schema_migrations (name) VALUES ($1)', [name]);
      await client.query('COMMIT');
      process.stdout.write(`Applied ${name}\n`);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally { client.release(); }
  }
  await db.end();
}

migrate().catch((error) => { console.error(error); process.exitCode = 1; });
