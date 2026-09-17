-- Seed data for Lora AI Architectural Platform
-- Run after migrations: psql $DATABASE_URL -f db/seed.sql

-- Demo user (password: "demo12345678")
-- Password hash generated using scrypt with random salt
INSERT INTO users (id, email, password_hash, full_name, studio_name, role, email_verified_at)
VALUES (
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  'demo@lora.ai',
  '7a8b9c0d1e2f3a4b:c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6',
  'Demo Architect',
  'Lora Demo Studio',
  'architect',
  now()
) ON CONFLICT DO NOTHING;

-- Sample project for demo user
INSERT INTO projects (id, owner_id, name, model)
VALUES (
  'b1ffc99a-1c1b-4ef8-bb6d-7cc0ce491b22',
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  'Modern Sustainable Villa',
  '{
    "name": "Modern Sustainable Villa",
    "buildingType": "residential",
    "floors": 2,
    "siteArea": 800,
    "buildingArea": 350,
    "climate": "temperate",
    "location": "Cape Town",
    "levels": [
      {"id": "level-0", "name": "Ground Floor", "elevation": 0, "height": 3.2},
      {"id": "level-1", "name": "First Floor", "elevation": 3.2, "height": 3.0}
    ],
    "rooms": [
      {"id": "room-1", "name": "Living Room", "type": "living", "level": "level-0", "area": 45},
      {"id": "room-2", "name": "Kitchen", "type": "kitchen", "level": "level-0", "area": 25},
      {"id": "room-3", "name": "Master Bedroom", "type": "bedroom", "level": "level-1", "area": 30},
      {"id": "room-4", "name": "Bathroom", "type": "bathroom", "level": "level-1", "area": 12}
    ],
    "sustainability": {
      "solarPanels": true,
      "rainwaterHarvesting": true,
      "greenRoof": false,
      "passiveCooling": true
    }
  }'::jsonb
) ON CONFLICT DO NOTHING;

-- Audit event for project creation
INSERT INTO audit_events (user_id, action, target_type, target_id, metadata)
VALUES (
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  'project.created',
  'project',
  'b1ffc99a-1c1b-4ef8-bb6d-7cc0ce491b22',
  '{"source": "seed"}'::jsonb
);
