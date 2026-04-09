-- Migration 005: Platform redesign — new settings keys
-- Date: 2026-04-08 | Session 5

INSERT INTO bisxp_settings (key, value, label, section, sort_order)
VALUES
  ('section_personas_visible', 'true', 'Show personas section', 'visibility', 7),
  ('section_methodology_visible', 'true', 'Show methodology section', 'visibility', 8),
  ('section_platform_visible', 'true', 'Show platform section', 'visibility', 9),
  ('personas_section_heading', 'Three paths. One platform.', 'Personas section heading', 'personas', 1),
  ('methodology_section_heading', 'BISXP Methodology', 'Methodology section heading', 'methodology', 1),
  ('methodology_intro', 'A structured approach to building AI-native products — from architecture decisions on day one through to GTM and scaling. Delivered by certified training partners.', 'Methodology intro', 'methodology', 2),
  ('methodology_track1_title', 'Marketplace Building', 'Track 1 title', 'methodology', 3),
  ('methodology_track1_body', 'Learn to architect, build, and launch a two-sided marketplace. Capstone: a live marketplace deployed to production.', 'Track 1 body', 'methodology', 4),
  ('methodology_track2_title', 'AI Data Engineering', 'Track 2 title', 'methodology', 5),
  ('methodology_track2_body', 'Learn to build the data pipelines and AI workflows that power modern marketplace intelligence. Based on patterns from AWS AppFlow, Glue Streaming, and Zero ETL integrations across enterprise systems. Capstone: a production AI data pipeline.', 'Track 2 body', 'methodology', 6),
  ('platform_section_heading', 'Everything a marketplace needs. Built once.', 'Platform section heading', 'platform', 1),
  ('platform_intro', 'The BISXP platform is a full-stack foundation for marketplace businesses. Every component is production-tested across live deployments — not theoretical architecture.', 'Platform intro', 'platform', 2)
ON CONFLICT (key) DO NOTHING;
