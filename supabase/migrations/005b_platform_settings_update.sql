-- Migration 005b: Update existing settings with platform positioning copy
-- Date: 2026-04-08 | Session 5

UPDATE bisxp_settings SET value = 'The Platform for' WHERE key = 'hero_headline';
UPDATE bisxp_settings SET value = 'AI-Native Marketplaces.' WHERE key = 'hero_headline_em';
UPDATE bisxp_settings SET value = 'Build marketplace businesses on production-tested architecture. From solo founders to enterprise teams — launch faster on the stack that powers three live platforms across three countries.' WHERE key = 'hero_subheadline';
UPDATE bisxp_settings SET value = 'Everything a marketplace needs. Built once.' WHERE key = 'services_section_heading';
UPDATE bisxp_settings SET value = 'The BISXP platform is a full-stack foundation for marketplace businesses. Every component is production-tested across live deployments — not theoretical architecture.' WHERE key = 'services_platform_line';
UPDATE bisxp_settings SET value = 'Three ways to work with BISXP.' WHERE key = 'contact_heading';
UPDATE bisxp_settings SET value = 'Start a project, become a build partner, or become a training partner. Tell us which path fits you.' WHERE key = 'contact_subheading';
UPDATE bisxp_settings SET value = 'Built by someone who has done it at scale.' WHERE key = 'team_section_heading';
UPDATE bisxp_settings SET value = 'The system behind the platform.' WHERE key = 'process_section_heading';
