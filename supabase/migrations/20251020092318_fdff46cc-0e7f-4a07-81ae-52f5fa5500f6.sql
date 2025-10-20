-- Add generated_code column to projects table to store AI-generated code
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS generated_code TEXT;