-- ============================================================
-- CAREER NAVIGATOR v2 MIGRATION
-- Run this in: Supabase Dashboard > SQL Editor
--
-- What this does:
--   1. Creates sessions table (replaces auth — no login required)
--   2. Creates feedback table
--   3. Migrates assessments to use session_id instead of user_id
--   4. Adds ai_recommendations column to assessments
--   5. Updates RLS to allow service_role access without auth
--
-- Safe to run on a fresh project (IF NOT EXISTS throughout).
-- If you already have data in assessments, back up first.
-- ============================================================


-- ─────────────────────────────────────────────────────────────
-- 1. Sessions (replaces auth.users — no password required)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.sessions (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        TEXT NOT NULL,
    email       TEXT,               -- optional; used to email results
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Index for email lookups (follow-up scheduling)
CREATE INDEX IF NOT EXISTS idx_sessions_email
    ON public.sessions (email)
    WHERE email IS NOT NULL;


-- ─────────────────────────────────────────────────────────────
-- 2. Assessments — add session_id, make user_id optional
--    (Drop the NOT NULL + FK constraint on user_id so existing
--     rows are preserved and new rows don't need a Supabase user)
-- ─────────────────────────────────────────────────────────────

-- Add session_id column
ALTER TABLE public.assessments
    ADD COLUMN IF NOT EXISTS session_id UUID REFERENCES public.sessions(id) ON DELETE SET NULL;

-- Add ai_recommendations column
ALTER TABLE public.assessments
    ADD COLUMN IF NOT EXISTS ai_recommendations JSONB;

-- Make user_id nullable (was NOT NULL in original schema)
ALTER TABLE public.assessments
    ALTER COLUMN user_id DROP NOT NULL;

-- Drop the old FK constraint to auth.users (prevents inserts without a logged-in user)
-- Find and drop by name if it exists
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE table_name = 'assessments'
          AND constraint_name = 'assessments_user_id_fkey'
          AND constraint_type = 'FOREIGN KEY'
    ) THEN
        ALTER TABLE public.assessments DROP CONSTRAINT assessments_user_id_fkey;
    END IF;
END $$;

-- Also make pre_confidence optional (v2 flow sets a default of 5, no slider)
ALTER TABLE public.assessments
    ALTER COLUMN pre_confidence SET DEFAULT 5;

-- Index for session_id lookups
CREATE INDEX IF NOT EXISTS idx_assessments_session_id
    ON public.assessments (session_id);

-- GIN index for ai_recommendations JSONB queries
CREATE INDEX IF NOT EXISTS idx_assessments_ai_recs
    ON public.assessments USING GIN (ai_recommendations);


-- ─────────────────────────────────────────────────────────────
-- 3. Feedback
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.feedback (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id   UUID REFERENCES public.assessments(id) ON DELETE CASCADE,
    session_id      UUID REFERENCES public.sessions(id) ON DELETE SET NULL,
    rating          INTEGER CHECK (rating BETWEEN 1 AND 5),
    accuracy        TEXT CHECK (accuracy IN ('yes', 'somewhat', 'no')),
    response        TEXT,
    email_requested BOOLEAN DEFAULT FALSE,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_feedback_assessment_id
    ON public.feedback (assessment_id);


-- ─────────────────────────────────────────────────────────────
-- 4. RLS — disable on new tables (backend uses service_role key
--    which bypasses RLS anyway; no client-side direct access)
-- ─────────────────────────────────────────────────────────────

-- sessions and feedback are insert-only from the backend
-- No RLS needed since service_role bypasses it and we have no
-- client-side Supabase JS calls to these tables

-- Drop old auth-based RLS policies on assessments (no longer valid)
DROP POLICY IF EXISTS "Users can view own assessments"   ON public.assessments;
DROP POLICY IF EXISTS "Users can insert own assessments" ON public.assessments;
DROP POLICY IF EXISTS "Users can update own assessments" ON public.assessments;

-- Allow service_role full access (already the case — this is for clarity)
-- Public access is blocked; all writes go through FastAPI with service_role key
