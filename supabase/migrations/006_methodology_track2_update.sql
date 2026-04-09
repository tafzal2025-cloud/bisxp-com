-- Migration 006: Broaden AI Data Engineering track description
-- Date: 2026-04-08 | Session 6

UPDATE bisxp_settings
SET value = 'The AI-driven data and analytics ecosystem has expanded far beyond pipelines. This track covers the full spectrum — semantic search and vector databases, RAG architectures, embedding models, real-time streaming for AI features, data quality for model training, feature stores, and the infrastructure that makes AI products work at scale in production. Whether you are building intelligent search, recommendation systems, or AI-powered analytics — this track gives you the foundation.'
WHERE key = 'methodology_track2_body';
