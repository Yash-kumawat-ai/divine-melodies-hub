-- Migration: Remove database pull-shorts trigger and trigger function
-- Business logic and Edge Function calls are now managed directly by the application layer.

DROP TRIGGER IF EXISTS tr_pull_shorts_on_change ON whitelisted_channels;
DROP FUNCTION IF EXISTS trigger_pull_shorts_on_change();
