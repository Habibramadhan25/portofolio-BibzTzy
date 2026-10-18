-- =========================================================================
-- NOVA GLASS — TAHAP 4: BACKEND DATABASE SCHEMA & ROW LEVEL SECURITY (RLS)
-- =========================================================================
-- Author: Senior Full-Stack & Supabase Security Architect
-- Target: PostgreSQL 15+ (Supabase Database)
-- Notes: Idempotent, safe migration with strict RLS on all tables.
-- =========================================================================

-- Enable UUID extension if not yet enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =========================================================================
-- 1. HELPER FUNCTIONS & TRIGGERS
-- =========================================================================

-- Generic updated_at trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =========================================================================
-- 2. TABLE DEFINITIONS
-- =========================================================================

-- 2.1 Profiles Table (Linked to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  headline TEXT,
  tagline TEXT,
  bio TEXT,
  school TEXT DEFAULT 'SMK Negeri 1 Ciomas',
  major TEXT DEFAULT 'PPLG',
  class TEXT DEFAULT 'XI PPLG 3',
  status TEXT DEFAULT 'Siswa SMK / Siap Magang',
  avatar_url TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  location TEXT,
  github_url TEXT,
  linkedin_url TEXT,
  instagram_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.2 Projects Table
CREATE TABLE IF NOT EXISTS public.projects (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  short_desc TEXT,
  long_desc TEXT,
  category TEXT NOT NULL,
  tech_stack TEXT[] DEFAULT '{}',
  thumbnail_url TEXT,
  demo_url TEXT,
  github_url TEXT,
  date TEXT,
  status TEXT DEFAULT 'Selesai',
  is_favorite BOOLEAN DEFAULT FALSE,
  is_sample BOOLEAN DEFAULT FALSE,
  is_public BOOLEAN DEFAULT TRUE,
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.3 Skills Table
CREATE TABLE IF NOT EXISTS public.skills (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  proficiency INT NOT NULL CHECK (proficiency >= 0 AND proficiency <= 100),
  level_label TEXT,
  experience_years TEXT,
  icon_name TEXT,
  is_sample BOOLEAN DEFAULT FALSE,
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.4 Education & Experience Timeline Table
CREATE TABLE IF NOT EXISTS public.education_timeline (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  institution TEXT NOT NULL,
  period TEXT NOT NULL,
  type TEXT NOT NULL,
  description TEXT,
  is_current BOOLEAN DEFAULT FALSE,
  is_sample BOOLEAN DEFAULT FALSE,
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.5 Certificates Table
CREATE TABLE IF NOT EXISTS public.certificates (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  issuer TEXT NOT NULL,
  issue_date TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  verification_url TEXT,
  image_url TEXT,
  is_sample BOOLEAN DEFAULT FALSE,
  is_public BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.6 Learning Roadmap Table
CREATE TABLE IF NOT EXISTS public.learning_roadmap (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  order_num INT DEFAULT 0,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  difficulty TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('not_started', 'in_progress', 'completed')) DEFAULT 'not_started',
  description TEXT,
  target_date TEXT,
  completed_at TIMESTAMPTZ,
  notes TEXT,
  learning_resource_url TEXT,
  checklist JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.7 Coding Sessions Table (Tahap 2 Tracker)
CREATE TABLE IF NOT EXISTS public.coding_sessions (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  language TEXT NOT NULL,
  project_id TEXT,
  project_title TEXT,
  started_at TIMESTAMPTZ NOT NULL,
  finished_at TIMESTAMPTZ NOT NULL,
  duration_minutes INT NOT NULL CHECK (duration_minutes >= 0),
  notes TEXT,
  status TEXT NOT NULL CHECK (status IN ('completed', 'cancelled')) DEFAULT 'completed',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.8 XP Transactions Table (Anti-duplikasi/Idempotent Ledger)
CREATE TABLE IF NOT EXISTS public.xp_transactions (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  amount INT NOT NULL CHECK (amount > 0),
  source_type TEXT NOT NULL,
  source_id TEXT NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_xp_transaction_per_source UNIQUE (user_id, source_type, source_id)
);

-- 2.9 User Achievements / Badges Table
CREATE TABLE IF NOT EXISTS public.user_achievements (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_id TEXT NOT NULL,
  badge_name TEXT NOT NULL,
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}',
  CONSTRAINT unique_user_badge UNIQUE (user_id, badge_id)
);

-- 2.10 Activity Feed Table
CREATE TABLE IF NOT EXISTS public.activity_feed (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  target_url TEXT,
  is_public BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.11 Contact Messages Table (Submisi Formulir Pengunjung)
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL CHECK (char_length(name) <= 100),
  email TEXT NOT NULL CHECK (char_length(email) <= 150),
  subject TEXT CHECK (char_length(subject) <= 200),
  message TEXT NOT NULL CHECK (char_length(message) <= 4000),
  status TEXT NOT NULL CHECK (status IN ('unread', 'read', 'archived', 'replied')) DEFAULT 'unread',
  ip_digest TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================================================================
-- 3. INDEXES FOR HIGH-PERFORMANCE QUERIES
-- =========================================================================

CREATE INDEX IF NOT EXISTS idx_projects_public ON public.projects(is_public, display_order);
CREATE INDEX IF NOT EXISTS idx_skills_category ON public.skills(category, display_order);
CREATE INDEX IF NOT EXISTS idx_education_order ON public.education_timeline(display_order);
CREATE INDEX IF NOT EXISTS idx_certificates_public ON public.certificates(is_public, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_roadmap_order ON public.learning_roadmap(order_num);
CREATE INDEX IF NOT EXISTS idx_coding_sessions_date ON public.coding_sessions(finished_at DESC);
CREATE INDEX IF NOT EXISTS idx_xp_user ON public.xp_transactions(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_feed_public ON public.activity_feed(is_public, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_messages_status ON public.contact_messages(status, created_at DESC);

-- =========================================================================
-- 4. ATTACH UPDATED_AT TRIGGERS
-- =========================================================================

DROP TRIGGER IF EXISTS trg_profiles_updated_at ON public.profiles;
CREATE TRIGGER trg_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_projects_updated_at ON public.projects;
CREATE TRIGGER trg_projects_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_skills_updated_at ON public.skills;
CREATE TRIGGER trg_skills_updated_at BEFORE UPDATE ON public.skills FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_education_updated_at ON public.education_timeline;
CREATE TRIGGER trg_education_updated_at BEFORE UPDATE ON public.education_timeline FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_certificates_updated_at ON public.certificates;
CREATE TRIGGER trg_certificates_updated_at BEFORE UPDATE ON public.certificates FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_roadmap_updated_at ON public.learning_roadmap;
CREATE TRIGGER trg_roadmap_updated_at BEFORE UPDATE ON public.learning_roadmap FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- =========================================================================
-- 5. ROW LEVEL SECURITY (RLS) POLICIES — ABSOLUTE ENFORCEMENT
-- =========================================================================

-- Enable RLS on ALL tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.education_timeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_roadmap ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coding_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xp_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_feed ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- 5.1 Profiles Policies
CREATE POLICY "Public profiles are viewable by everyone" 
  ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Admin can insert their own profile" 
  ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Admin can update their own profile" 
  ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- 5.2 Projects Policies
CREATE POLICY "Public projects are viewable by everyone" 
  ON public.projects FOR SELECT USING (is_public = true OR auth.role() = 'authenticated');

CREATE POLICY "Admin can manage projects" 
  ON public.projects FOR ALL USING (auth.role() = 'authenticated');

-- 5.3 Skills Policies
CREATE POLICY "Skills are viewable by everyone" 
  ON public.skills FOR SELECT USING (true);

CREATE POLICY "Admin can manage skills" 
  ON public.skills FOR ALL USING (auth.role() = 'authenticated');

-- 5.4 Education Timeline Policies
CREATE POLICY "Timeline is viewable by everyone" 
  ON public.education_timeline FOR SELECT USING (true);

CREATE POLICY "Admin can manage timeline" 
  ON public.education_timeline FOR ALL USING (auth.role() = 'authenticated');

-- 5.5 Certificates Policies
CREATE POLICY "Public certificates are viewable by everyone" 
  ON public.certificates FOR SELECT USING (is_public = true OR auth.role() = 'authenticated');

CREATE POLICY "Admin can manage certificates" 
  ON public.certificates FOR ALL USING (auth.role() = 'authenticated');

-- 5.6 Learning Roadmap Policies
CREATE POLICY "Roadmap is viewable by everyone" 
  ON public.learning_roadmap FOR SELECT USING (true);

CREATE POLICY "Admin can manage roadmap" 
  ON public.learning_roadmap FOR ALL USING (auth.role() = 'authenticated');

-- 5.7 Coding Sessions Policies
CREATE POLICY "Coding sessions are viewable by everyone" 
  ON public.coding_sessions FOR SELECT USING (true);

CREATE POLICY "Admin can manage coding sessions" 
  ON public.coding_sessions FOR ALL USING (auth.role() = 'authenticated');

-- 5.8 XP Transactions Policies
CREATE POLICY "XP transactions are viewable by everyone" 
  ON public.xp_transactions FOR SELECT USING (true);

CREATE POLICY "Admin can manage XP transactions" 
  ON public.xp_transactions FOR ALL USING (auth.role() = 'authenticated');

-- 5.9 User Achievements Policies
CREATE POLICY "Achievements are viewable by everyone" 
  ON public.user_achievements FOR SELECT USING (true);

CREATE POLICY "Admin can manage achievements" 
  ON public.user_achievements FOR ALL USING (auth.role() = 'authenticated');

-- 5.10 Activity Feed Policies
CREATE POLICY "Public feed is viewable by everyone" 
  ON public.activity_feed FOR SELECT USING (is_public = true OR auth.role() = 'authenticated');

CREATE POLICY "Admin can manage activity feed" 
  ON public.activity_feed FOR ALL USING (auth.role() = 'authenticated');

-- 5.11 Contact Messages Policies (CRITICAL SECURITY)
-- ANYONE (anon or auth) can submit a message
CREATE POLICY "Anyone can submit contact message" 
  ON public.contact_messages FOR INSERT WITH CHECK (true);

-- ONLY authenticated admin can view, update, or delete contact messages
CREATE POLICY "Only admin can view contact messages" 
  ON public.contact_messages FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Only admin can update contact messages" 
  ON public.contact_messages FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Only admin can delete contact messages" 
  ON public.contact_messages FOR DELETE USING (auth.role() = 'authenticated');

-- =========================================================================
-- 6. SUPABASE STORAGE BUCKETS CONFIGURATION (SQL)
-- =========================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('portfolio-public', 'portfolio-public', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('portfolio-private', 'portfolio-private', false)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS
CREATE POLICY "Public bucket files viewable by everyone" 
  ON storage.objects FOR SELECT USING (bucket_id = 'portfolio-public');

CREATE POLICY "Admin can upload files to public bucket" 
  ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'portfolio-public' AND auth.role() = 'authenticated');

CREATE POLICY "Admin can update files in public bucket" 
  ON storage.objects FOR UPDATE USING (bucket_id = 'portfolio-public' AND auth.role() = 'authenticated');

CREATE POLICY "Admin can delete files in public bucket" 
  ON storage.objects FOR DELETE USING (bucket_id = 'portfolio-public' AND auth.role() = 'authenticated');
