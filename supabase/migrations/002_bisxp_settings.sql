-- Migration 002: bisxp_settings
-- Key/value store for all editable homepage content
-- Date: 2026-04-07 | Session 3
-- Run in Supabase SQL Editor (Dashboard → SQL Editor → New query)

CREATE TABLE IF NOT EXISTS bisxp_settings (
  key text PRIMARY KEY,
  value text NOT NULL,
  label text NOT NULL,
  section text NOT NULL,
  sort_order integer DEFAULT 0,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE bisxp_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read bisxp_settings"
  ON bisxp_settings FOR SELECT USING (true);

CREATE POLICY "Admin write bisxp_settings"
  ON bisxp_settings FOR ALL
  USING (auth.role() = 'authenticated');

-- Seed default values
INSERT INTO bisxp_settings (key, value, label, section, sort_order) VALUES

-- Hero
('hero_headline', 'We don''t just advise.', 'Hero headline', 'hero', 1),
('hero_headline_em', 'We build.', 'Hero headline emphasis', 'hero', 2),
('hero_subheadline', 'Four AI-native marketplaces in development. One proven platform pattern. Built on the same methodology we teach.', 'Hero subheadline', 'hero', 3),

-- Stats
('stat_1_number', '4', 'Stat 1 number', 'stats', 1),
('stat_1_label', 'Marketplaces in development', 'Stat 1 label', 'stats', 2),
('stat_1_sub', 'Launching in 2026', 'Stat 1 sublabel', 'stats', 3),
('stat_2_number', '25 yrs', 'Stat 2 number', 'stats', 4),
('stat_2_label', 'Combined experience', 'Stat 2 label', 'stats', 5),
('stat_2_sub', 'Microsoft · AWS · Enterprise AI', 'Stat 2 sublabel', 'stats', 6),
('stat_3_number', '3', 'Stat 3 number', 'stats', 7),
('stat_3_label', 'Countries served', 'Stat 3 label', 'stats', 8),
('stat_3_sub', 'India · USA · Canada', 'Stat 3 sublabel', 'stats', 9),
('stat_4_number', '100%', 'Stat 4 number', 'stats', 10),
('stat_4_label', 'Hands-on delivery', 'Stat 4 label', 'stats', 11),
('stat_4_sub', 'We stay until it works', 'Stat 4 sublabel', 'stats', 12),

-- Services
('service_1_title', 'Marketplace Build', 'Service 1 title', 'services', 1),
('service_1_desc', 'We build your two-sided marketplace from the ground up — listings, owner portals, enquiry system, payments, social feed, and admin dashboard. Deployed and live, not handed off half-finished.', 'Service 1 description', 'services', 2),
('service_2_title', 'AI Integration', 'Service 2 title', 'services', 3),
('service_2_desc', 'We embed Claude AI into your product — intelligent search, automated matching, AI-generated listing descriptions, and workflow automation. The same AI layer powering our own marketplaces.', 'Service 2 description', 'services', 4),
('service_3_title', 'SaaS Product', 'Service 3 title', 'services', 5),
('service_3_desc', 'Custom SaaS products built on the full BISXP stack — auth, subscriptions, multi-tenant portals, admin dashboards, and API integrations. Production-grade architecture from day one.', 'Service 3 description', 'services', 6),
('service_4_title', 'Ongoing Partnership', 'Service 4 title', 'services', 7),
('service_4_desc', 'An embedded technical partner for businesses that need continuous delivery — new features, infrastructure scaling, AI integration, and strategic guidance as your product grows.', 'Service 4 description', 'services', 8),

-- Process
('process_1_title', 'Discovery', 'Process 1 title', 'process', 1),
('process_1_desc', 'We learn your business, community, and goals. No templates. No assumptions.', 'Process 1 description', 'process', 2),
('process_2_title', 'Blueprint', 'Process 2 title', 'process', 3),
('process_2_desc', 'A scoped, costed plan. What we build, in what order, and why.', 'Process 2 description', 'process', 4),
('process_3_title', 'Execution', 'Process 3 title', 'process', 5),
('process_3_desc', 'We build alongside you. Weekly demos. Real code. Deployed features.', 'Process 3 description', 'process', 6),
('process_4_title', 'Handover', 'Process 4 title', 'process', 7),
('process_4_desc', 'You own everything. Trained team, documented systems, zero dependency on us.', 'Process 4 description', 'process', 8),

-- Contact
('contact_heading', 'Start a Project', 'Contact section heading', 'contact', 1),
('contact_subheading', 'Tell us what you''re building. We''ll respond within 24 hours with honest thoughts on how we''d approach it — no pitch, no pressure.', 'Contact subheading', 'contact', 2);
