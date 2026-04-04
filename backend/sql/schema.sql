-- ============================================================
-- CAREER NAVIGATOR — SUPABASE SCHEMA
-- Run this in: Supabase Dashboard > SQL Editor
-- Run schema.sql BEFORE seed_data.sql
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─────────────────────────────────────────────────────────────
-- Users (profile mirror of auth.users)
-- Auto-populated by the on_auth_user_created trigger below.
-- Do NOT insert manually.
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.users (
    id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email       TEXT NOT NULL UNIQUE,
    full_name   TEXT,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────
-- Assessments
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.assessments (
    id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id           UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    pre_confidence    INTEGER NOT NULL CHECK (pre_confidence BETWEEN 1 AND 10),
    answers           JSONB,          -- {"q1": 3, "q2": 5, ...}
    scores            JSONB,          -- {"PM": 72, "SWE": 55, "ML": 43, "Data": 61}
    recommended_role  TEXT CHECK (recommended_role IN ('PM', 'SWE', 'ML', 'Data')),
    status            TEXT NOT NULL DEFAULT 'in_progress'
                          CHECK (status IN ('in_progress', 'completed')),
    created_at        TIMESTAMPTZ DEFAULT NOW(),
    completed_at      TIMESTAMPTZ
);

-- ─────────────────────────────────────────────────────────────
-- User Outcomes (post-assessment confidence tracking)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.user_outcomes (
    id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id           UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    assessment_id     UUID NOT NULL REFERENCES public.assessments(id) ON DELETE CASCADE,
    post_confidence   INTEGER NOT NULL CHECK (post_confidence BETWEEN 1 AND 10),
    confidence_delta  INTEGER NOT NULL,   -- post − pre; key success metric
    created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────
-- Role Resources (seeded manually — see seed_data.sql)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.role_resources (
    id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    role           TEXT NOT NULL CHECK (role IN ('PM', 'SWE', 'ML', 'Data')),
    title          TEXT NOT NULL,
    url            TEXT NOT NULL,
    description    TEXT,
    resource_type  TEXT NOT NULL CHECK (resource_type IN ('course', 'article', 'video', 'book')),
    difficulty     TEXT NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'advanced'))
);

-- ─────────────────────────────────────────────────────────────
-- Assessment Analytics (append-only event log — stubbed for MVP)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.assessment_analytics (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    assessment_id   UUID REFERENCES public.assessments(id),
    event_type      TEXT NOT NULL,  -- 'started' | 'completed'
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────
-- Row Level Security
-- ─────────────────────────────────────────────────────────────
ALTER TABLE public.assessments     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_outcomes   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users           ENABLE ROW LEVEL SECURITY;

-- Assessments RLS
CREATE POLICY "Users can view own assessments"
    ON public.assessments FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own assessments"
    ON public.assessments FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own assessments"
    ON public.assessments FOR UPDATE
    USING (auth.uid() = user_id);

-- Outcomes RLS
CREATE POLICY "Users can view own outcomes"
    ON public.user_outcomes FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own outcomes"
    ON public.user_outcomes FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users RLS
CREATE POLICY "Users can view own profile"
    ON public.users FOR SELECT
    USING (auth.uid() = id);

-- role_resources: readable by all authenticated users, no RLS needed
-- (The backend uses service_role key which bypasses RLS for all writes)

-- ─────────────────────────────────────────────────────────────
-- Trigger: Auto-create user profile on auth signup
-- This fires AFTER a new row is inserted into auth.users.
-- The backend's /api/auth/signup does NOT need to insert into public.users.
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, full_name)
    VALUES (
        NEW.id,
        NEW.email,
        NEW.raw_user_meta_data->>'full_name'
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if it already exists (safe to re-run)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();
