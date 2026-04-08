-- Migration 004: Form success messages
-- Date: 2026-04-08 | Session 4 patch
-- Run in Supabase SQL Editor

INSERT INTO bisxp_settings
  (key, value, label, section, sort_order)
VALUES
  ('contact_success_heading', 'Thank you.',
   'Contact form success heading', 'contact', 3),
  ('contact_success_body', 'We''ll be in touch within 24 hours. In the meantime, explore our work at TABRO.IN and TheUnitedSports.com.',
   'Contact form success message', 'contact', 4),
  ('method_success_heading', 'Application received.',
   'Method form success heading', 'method', 1),
  ('method_success_body', 'We''ll review your application and respond within 48 hours.',
   'Method form success message', 'method', 2)
ON CONFLICT (key) DO NOTHING;
