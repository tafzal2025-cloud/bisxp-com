-- Migration 003: bisxp_cms_tables
-- Four CMS tables for dynamic homepage sections
-- Date: 2026-04-07 | Session 4
-- Run in Supabase SQL Editor (Dashboard → SQL Editor → New query)

-- ─── CASE STUDIES ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS bisxp_case_studies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  eyebrow text NOT NULL,
  problem_quote text NOT NULL,
  what_we_built text NOT NULL,
  ai_layer text NOT NULL,
  scale_architecture text NOT NULL,
  status_badge text NOT NULL DEFAULT 'In Development · Launching 2026',
  sort_order integer DEFAULT 0,
  is_visible boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ─── RESEARCH CARDS ───────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS bisxp_research_cards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tag text NOT NULL,
  tag_style text NOT NULL DEFAULT 'active',
  title text NOT NULL,
  subtitle text NOT NULL,
  body text NOT NULL,
  note text NOT NULL,
  sort_order integer DEFAULT 0,
  is_visible boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ─── TEAM MEMBERS ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS bisxp_team_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  title text NOT NULL,
  bio text NOT NULL,
  credential_label text NOT NULL DEFAULT '',
  credential_value text NOT NULL DEFAULT '',
  initials text NOT NULL DEFAULT '',
  photo_url text NOT NULL DEFAULT '',
  sort_order integer DEFAULT 0,
  is_visible boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ─── SERVICES ─────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS bisxp_services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  icon text NOT NULL DEFAULT '◈',
  title text NOT NULL,
  description text NOT NULL,
  sort_order integer DEFAULT 0,
  is_visible boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ─── ROW LEVEL SECURITY ───────────────────────────────────────────────────────

ALTER TABLE bisxp_case_studies ENABLE ROW LEVEL SECURITY;
ALTER TABLE bisxp_research_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE bisxp_team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE bisxp_services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read case_studies" ON bisxp_case_studies FOR SELECT USING (true);
CREATE POLICY "Admin all case_studies" ON bisxp_case_studies FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Public read research_cards" ON bisxp_research_cards FOR SELECT USING (true);
CREATE POLICY "Admin all research_cards" ON bisxp_research_cards FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Public read team_members" ON bisxp_team_members FOR SELECT USING (true);
CREATE POLICY "Admin all team_members" ON bisxp_team_members FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Public read services" ON bisxp_services FOR SELECT USING (true);
CREATE POLICY "Admin all services" ON bisxp_services FOR ALL USING (auth.role() = 'authenticated');

-- ─── SEED: CASE STUDIES ───────────────────────────────────────────────────────

INSERT INTO bisxp_case_studies
  (title, eyebrow, problem_quote, what_we_built, ai_layer, scale_architecture, status_badge, sort_order, is_visible)
VALUES
  ('TABRO.IN', 'India · Venue & Events',
   'India''s $50B events market runs on WhatsApp and phone calls. No discovery platform. No vendor ecosystem. No owner tooling.',
   'End-to-end celebration OS — venue listings, vendor marketplace, owner portals, social feed, enquiry CRM, influencer system, tiered subscriptions, celebration planner with auspicious calendar.',
   'Claude AI for venue matching, listing description generation, photo scoring, social feed captions, and AI lookbook generation.',
   'Vercel + Supabase at launch → AWS at 10K users.',
   'In Development · Launching 2026', 1, true),

  ('TheUnitedSports', 'USA + Canada · Sports',
   '$500B global sports participation industry running on WhatsApp groups and cash payments. No discovery. No booking. No CRM.',
   'Sport-agnostic marketplace — academies, coaches, grounds, gear vendors, leagues. Five entity types, each with full owner portal, booking system, enquiry CRM, and tiered subscriptions.',
   'Claude AI for coach matching, facility recommendations, and search personalisation across five entity types.',
   'Vercel + Supabase at launch → ECS Fargate + Aurora PostgreSQL + ElastiCache Redis at scale.',
   'In Development · Launching 2026', 2, true),

  ('CareGrid', 'United States · Healthcare',
   'US insurance directories are 50%+ inaccurate. Patients drive to appointments only to discover they''re out of network.',
   'Verified provider directory with insurance network filtering at its core. 200+ real providers from the NPI Registry, insurance plan filtering, owner portals, enquiry system, admin NPI import pipeline.',
   'Provider matching, insurance plan inference, and NPI data intelligence — turning raw registry data into actionable provider profiles.',
   'Vercel + Supabase at launch → AWS HIPAA-compliant stack at scale.',
   'In Development · Launching 2026', 3, true),

  ('MediGrid', 'India · Medical Tourism',
   'No trusted digital platform for international patients to discover Indian hospitals by procedure, accreditation, and cost.',
   'Medical tourism marketplace — Hyderabad pilot. Hospitals, procedures, international patient coordinators, cost comparison, and a trust layer for patients 5,000 miles away.',
   'Procedure matching, hospital recommendation, and patient journey personalisation for Gulf, Africa, and UK patient markets.',
   'BISXP platform pattern · India-region Supabase instance · AWS at scale.',
   'In Development · Launching 2026', 4, true);

-- ─── SEED: RESEARCH CARDS ─────────────────────────────────────────────────────

INSERT INTO bisxp_research_cards
  (tag, tag_style, title, subtitle, body, note, sort_order, is_visible)
VALUES
  ('Active Research', 'active', 'ZeroMesh', 'Agentic Zero Trust Protocol',
   'As AI agents proliferate across enterprise infrastructure, the trust fabric connecting them becomes the new attack surface. ZeroMesh proposes a zero-trust security layer for autonomous multi-agent systems — real-time trust recalibration, behavioral anomaly detection, and rule-based policy enforcement for agent-to-agent communication.',
   'IEEE paper submitted · August 2025', 1, true),

  ('In Development', 'development', 'BISXP Security', 'Zero-Trust Fabric for the Open Web',
   'A modular security platform for teams deploying LLM agents, autonomous pipelines, and distributed AI systems. Five integrated modules: Guard (runtime agent protection), Mind (behavioral baselining and drift detection), Policy (adaptive agent governance), Graph (trust relationship visualization), and Console (unified SecOps observability).',
   'Research division · BISXP India', 2, true);

-- ─── SEED: TEAM MEMBERS ───────────────────────────────────────────────────────

INSERT INTO bisxp_team_members
  (name, title, bio, credential_label, credential_value, initials, sort_order, is_visible)
VALUES
  ('Tharif Afzal', 'Founder & CEO',
   E'Tharif Afzal built the data infrastructure that enterprise AI runs on. Now he\'s building the AI-native platforms that put it to work.\n\nHis path to BISXP runs through 25 years at the centre of two hyperscalers. At Microsoft, he grew from debugging .NET internals to leading cloud modernisation programs that became reference architectures for Azure enterprise adoption — 16 years of progressive leadership across developer support, engineering management, and large-scale migrations that shaped how enterprises moved to the cloud.\n\nAt AWS, he led engineering for Amazon AppFlow and AWS Glue Streaming — the services enterprises depend on to move, transform, and stream data at scale. Under his leadership, the team launched Zero ETL integrations for the top eight SaaS platforms including Salesforce, SAP, and ServiceNow, and built DynamoDB ingestion into modern data lakes with Apache Iceberg on native S3 and S3 Tables. That work produced US Patent 11435871 for workflow execution architecture — a direct outcome of designing systems that had to be reliable under real production load.\n\nThat vantage point — building highly scalable distributed systems and watching what breaks and why — is what BISXP is built on. The conviction is straightforward: the same architectural discipline that makes hyperscale systems reliable can be applied to build AI-native products faster, and with more precision, than traditional development allows.\n\nAt BISXP, Tharif leads strategy, product architecture, and every client engagement. The builder who stays until it works.',
   'US Patent 11435871 · Workflow Execution Architecture', '', 'TA', 1, true),

  ('Amtul Baseer Ifra', 'Director, Agentic AI Security & Research',
   E'Amtul Baseer Ifra leads BISXP\'s agentic AI security research — the work that answers a question most AI teams haven\'t thought to ask yet: when your AI agents start talking to each other at scale, who is checking that they can be trusted?\n\nHer path to that question began with federated learning — a technique that lets distributed systems collaborate on a shared intelligence model without centralising sensitive data. She applied it to one of the harder problems in distributed security: detecting DDoS attacks across networked environments while keeping every node\'s data private. The system worked. The research was published and peer-reviewed.\n\nZeroMesh is the next expression of that instinct. A zero-trust security layer for autonomous multi-agent systems, built on the Agentic Zero Trust Protocol (AZTP). Real-time trust recalibration, behavioral anomaly detection, and rule-based policy enforcement between agents, designed to integrate with existing frameworks like LangChain, AutoGen, and CrewAI without requiring teams to restructure what they\'ve already built.\n\nAt BISXP, she partners directly with the CEO on the agentic AI security product roadmap — from the ZeroMesh research layer through to BISXP Security, a modular platform for enterprise teams navigating the shift to autonomous AI operations. She leads BISXP India, where that future is being built from the ground up.',
   'IEEE Paper Submitted · August 2025 · ZeroMesh: Agentic Zero Trust Protocol', '', 'AI', 2, true);

-- ─── SEED: SERVICES ───────────────────────────────────────────────────────────

INSERT INTO bisxp_services
  (icon, title, description, sort_order, is_visible)
VALUES
  ('◈', 'Marketplace Build',
   'We build your two-sided marketplace from the ground up — listings, owner portals, enquiry system, payments, social feed, and admin dashboard. Deployed and live, not handed off half-finished.',
   1, true),
  ('⬡', 'AI Integration',
   'We embed Claude AI into your product — intelligent search, automated matching, AI-generated listing descriptions, and workflow automation. The same AI layer powering our own marketplaces.',
   2, true),
  ('◎', 'SaaS Product',
   'Custom SaaS products built on the full BISXP stack — auth, subscriptions, multi-tenant portals, admin dashboards, and API integrations. Production-grade architecture from day one.',
   3, true),
  ('△', 'Ongoing Partnership',
   'An embedded technical partner for businesses that need continuous delivery — new features, infrastructure scaling, AI integration, and strategic guidance as your product grows.',
   4, true);

-- ─── ADDITIONAL SETTINGS ──────────────────────────────────────────────────────

INSERT INTO bisxp_settings (key, value, label, section, sort_order) VALUES
  ('section_acronym_visible', 'true', 'Show acronym section', 'visibility', 1),
  ('section_case_studies_visible', 'true', 'Show case studies section', 'visibility', 2),
  ('section_research_visible', 'true', 'Show research section', 'visibility', 3),
  ('section_services_visible', 'true', 'Show services section', 'visibility', 4),
  ('section_process_visible', 'true', 'Show process section', 'visibility', 5),
  ('section_team_visible', 'true', 'Show team section', 'visibility', 6),
  ('acronym_section_heading', 'What BISXP Stands For', 'Acronym section heading', 'acronym', 1),
  ('research_section_heading', 'Research & Security', 'Research section heading', 'research', 1),
  ('research_section_subheading', 'While we build marketplaces, we are simultaneously working on the next frontier — securing the infrastructure that autonomous AI agents will run on. This is serious research, not a roadmap slide.', 'Research section subheading', 'research', 2),
  ('research_cta_heading', 'Interested in early access or research collaboration?', 'Research CTA heading', 'research', 3),
  ('research_cta_body', 'We are working with a small number of early partners in enterprise AI security. If you are building autonomous agent systems and need a trust and security layer, we want to hear from you.', 'Research CTA body', 'research', 4),
  ('team_section_heading', 'The people behind the work', 'Team section heading', 'team', 1),
  ('services_section_heading', 'What We Build', 'Services section heading', 'services', 9),
  ('services_platform_line', 'Every product we build runs on the same proven platform pattern — architected for Vercel and Supabase at launch, and AWS at scale. The stack evolves with your growth. The pattern doesn''t change.', 'Services platform line', 'services', 10),
  ('process_section_heading', 'Our Process', 'Process section heading', 'process', 9)
ON CONFLICT (key) DO NOTHING;
