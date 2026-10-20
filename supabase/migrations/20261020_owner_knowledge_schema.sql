-- =========================================================================
-- NOVA GLASS — TAHAP 5: OWNER KNOWLEDGE BASE & AI MEMORY SCHEMA
-- =========================================================================
-- Author: Senior Full-Stack & Supabase Security Architect
-- Target: PostgreSQL 15+ (Supabase Database)
-- Notes: Idempotent migration for Owner Knowledge Base with strict RLS
-- =========================================================================

CREATE TABLE IF NOT EXISTS public.owner_knowledge (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  key TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL,
  label TEXT NOT NULL,
  target_entity TEXT NOT NULL DEFAULT 'owner',
  value TEXT DEFAULT '',
  keywords TEXT[] DEFAULT '{}',
  access_level TEXT NOT NULL CHECK (access_level IN ('public', 'restricted')) DEFAULT 'public',
  verification_status TEXT NOT NULL CHECK (verification_status IN ('verified', 'pending', 'unverified')) DEFAULT 'verified',
  is_public BOOLEAN NOT NULL DEFAULT TRUE,
  is_verified BOOLEAN NOT NULL DEFAULT TRUE,
  known BOOLEAN NOT NULL DEFAULT TRUE,
  notes TEXT,
  restricted_message TEXT,
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast category and public filtering
CREATE INDEX IF NOT EXISTS idx_owner_knowledge_category ON public.owner_knowledge(category, display_order);
CREATE INDEX IF NOT EXISTS idx_owner_knowledge_public ON public.owner_knowledge(is_public, access_level, verification_status);
CREATE INDEX IF NOT EXISTS idx_owner_knowledge_key ON public.owner_knowledge(key);
CREATE INDEX IF NOT EXISTS idx_owner_knowledge_target ON public.owner_knowledge(target_entity);

-- Trigger for auto updated_at
DROP TRIGGER IF EXISTS trg_owner_knowledge_updated_at ON public.owner_knowledge;
CREATE TRIGGER trg_owner_knowledge_updated_at 
  BEFORE UPDATE ON public.owner_knowledge 
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- =========================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =========================================================================
ALTER TABLE public.owner_knowledge ENABLE ROW LEVEL SECURITY;

-- 1. Visitors / Public can ONLY view verified, public facts
DROP POLICY IF EXISTS "Public verified facts are viewable by everyone" ON public.owner_knowledge;
CREATE POLICY "Public verified facts are viewable by everyone"
  ON public.owner_knowledge FOR SELECT
  USING (
    (is_public = true AND access_level = 'public' AND verification_status = 'verified')
    OR auth.role() = 'authenticated'
  );

-- 2. Authenticated Admin (Owner) has full CRUD control
DROP POLICY IF EXISTS "Admin can manage all knowledge facts" ON public.owner_knowledge;
CREATE POLICY "Admin can manage all knowledge facts"
  ON public.owner_knowledge FOR ALL
  USING (auth.role() = 'authenticated');
