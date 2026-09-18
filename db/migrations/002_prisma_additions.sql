-- Migration: Add new columns and tables for Prisma schema
-- This migration adds fields that exist in Prisma schema but not in initial migration

-- Add missing columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url text;

-- Add missing column to sessions table
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS device_name text;

-- Add missing columns to projects table
ALTER TABLE projects ADD COLUMN IF NOT EXISTS description text;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS folder_id uuid;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS is_public boolean NOT NULL DEFAULT false;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS is_archived boolean NOT NULL DEFAULT false;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS is_favorite boolean NOT NULL DEFAULT false;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS cover_image_url text;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS tags text[] NOT NULL DEFAULT '{}';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS visibility text NOT NULL DEFAULT 'private';

-- Create folders table
CREATE TABLE IF NOT EXISTS folders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name text NOT NULL,
  parent_id uuid REFERENCES folders(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Add foreign key for projects.folder_id after folders table exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'projects_folder_id_fkey'
  ) THEN
    ALTER TABLE projects ADD CONSTRAINT projects_folder_id_fkey
      FOREIGN KEY (folder_id) REFERENCES folders(id);
  END IF;
END $$;

-- Create password_reset_tokens table
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  token_hash text NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Create email_verify_tokens table
CREATE TABLE IF NOT EXISTS email_verify_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  token_hash text NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Create project_versions table
CREATE TABLE IF NOT EXISTS project_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id),
  version integer NOT NULL,
  description text,
  model_data jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Create project_shares table
CREATE TABLE IF NOT EXISTS project_shares (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  permission text NOT NULL DEFAULT 'viewer',
  share_token text UNIQUE,
  password_hash text,
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Create comments table
CREATE TABLE IF NOT EXISTS comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id),
  parent_id uuid REFERENCES comments(id),
  content text NOT NULL,
  position jsonb,
  is_resolved boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create project_files table
CREATE TABLE IF NOT EXISTS project_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  uploaded_by uuid NOT NULL REFERENCES users(id),
  name text NOT NULL,
  storage_path text NOT NULL,
  size_bytes bigint NOT NULL,
  mime_type text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type text NOT NULL,
  title text NOT NULL,
  body text,
  link text,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS notifications_user_created_idx ON notifications(user_id, created_at DESC);

-- Create indexes for new tables
CREATE INDEX IF NOT EXISTS project_versions_project_idx ON project_versions(project_id);
CREATE INDEX IF NOT EXISTS project_shares_project_idx ON project_shares(project_id);
CREATE INDEX IF NOT EXISTS comments_project_idx ON comments(project_id);
CREATE INDEX IF NOT EXISTS project_files_project_idx ON project_files(project_id);
