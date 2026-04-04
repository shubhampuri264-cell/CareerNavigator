-- ============================================================
-- MIGRATION: Add ai_recommendations column to assessments
-- Run this in Supabase SQL Editor AFTER schema.sql
-- Safe to run multiple times (IF NOT EXISTS / idempotent)
-- ============================================================

-- Add the ai_recommendations JSONB column
-- Stores the Gemini-generated top-3 role rankings:
-- [
--   {"rank": 1, "role": "SWE", "title": "Software Engineer", "fit_score": 88, "reason": "..."},
--   {"rank": 2, "role": "ML",  "title": "ML Engineer",       "fit_score": 71, "reason": "..."},
--   {"rank": 3, "role": "Data","title": "Data Scientist",     "fit_score": 58, "reason": "..."}
-- ]
ALTER TABLE public.assessments
  ADD COLUMN IF NOT EXISTS ai_recommendations JSONB;

-- Optional: index for querying by recommended role within the JSON array
-- (useful if you later want analytics on AI vs algorithm agreement)
CREATE INDEX IF NOT EXISTS idx_assessments_ai_recs
  ON public.assessments USING GIN (ai_recommendations);
