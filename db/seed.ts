import 'dotenv/config';
import crypto from 'crypto';
import { Pool } from 'pg';

// Use DIRECT_URL for seed (session mode)
const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
if (!connectionString) {
  console.error('DIRECT_URL or DATABASE_URL is required');
  process.exit(1);
}

const db = new Pool({ connectionString });

const passwordHash = (password: string, salt = crypto.randomBytes(16).toString('hex')) =>
  `${salt}:${crypto.scryptSync(password, salt, 64).toString('hex')}`;

async function seed() {
  console.log('Running database seed...');

  // Create demo user with password "demo12345678"
  const demoPasswordHash = passwordHash('demo12345678');

  await db.query(`
    INSERT INTO users (id, email, password_hash, full_name, studio_name, role, email_verified_at)
    VALUES (
      'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      'demo@lora.ai',
      $1,
      'Demo Architect',
      'Lora Demo Studio',
      'architect',
      now()
    ) ON CONFLICT (id) DO UPDATE SET password_hash = $1
  `, [demoPasswordHash]);
  console.log('✓ Created demo user (demo@lora.ai / demo12345678)');

  // Create sample project
  await db.query(`
    INSERT INTO projects (id, owner_id, name, model)
    VALUES (
      'b1ffc99a-1c1b-4ef8-bb6d-7cc0ce491b22',
      'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      'Modern Sustainable Villa',
      $1::jsonb
    ) ON CONFLICT (id) DO NOTHING
  `, [JSON.stringify({
    name: 'Modern Sustainable Villa',
    buildingType: 'residential',
    floors: 2,
    siteArea: 800,
    buildingArea: 350,
    climate: 'temperate',
    location: 'Cape Town',
    levels: [
      { id: 'level-0', name: 'Ground Floor', elevation: 0, height: 3.2 },
      { id: 'level-1', name: 'First Floor', elevation: 3.2, height: 3.0 }
    ],
    rooms: [
      { id: 'room-1', name: 'Living Room', type: 'living', level: 'level-0', area: 45 },
      { id: 'room-2', name: 'Kitchen', type: 'kitchen', level: 'level-0', area: 25 },
      { id: 'room-3', name: 'Master Bedroom', type: 'bedroom', level: 'level-1', area: 30 },
      { id: 'room-4', name: 'Bathroom', type: 'bathroom', level: 'level-1', area: 12 }
    ],
    sustainability: {
      solarPanels: true,
      rainwaterHarvesting: true,
      greenRoof: false,
      passiveCooling: true
    }
  })]);
  console.log('✓ Created sample project');

  // Audit event
  await db.query(`
    INSERT INTO audit_events (user_id, action, target_type, target_id, metadata)
    VALUES (
      'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      'project.created',
      'project',
      'b1ffc99a-1c1b-4ef8-bb6d-7cc0ce491b22',
      '{"source": "seed"}'::jsonb
    ) ON CONFLICT DO NOTHING
  `);
  console.log('✓ Created audit event');

  await db.end();
  console.log('\nSeed completed successfully!');
  console.log('\nDemo credentials:');
  console.log('  Email: demo@lora.ai');
  console.log('  Password: demo12345678');
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
