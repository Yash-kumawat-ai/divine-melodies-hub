-- Migration 033: Fix display_name referencing bugs in community notification triggers
-- Safe to rerun (idempotent). Copy this SQL into Supabase SQL Editor and click RUN.

BEGIN;

CREATE OR REPLACE FUNCTION public.notify_post_comment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_post_author UUID;
  v_commenter_name TEXT;
BEGIN
  -- Get post author
  SELECT author_id
  INTO v_post_author
  FROM public.community_posts
  WHERE id = NEW.post_id;

  -- Exit if post is missing
  IF v_post_author IS NULL THEN
    RETURN NEW;
  END IF;

  -- Skip self comments
  IF v_post_author = NEW.author_id THEN
    RETURN NEW;
  END IF;

  -- Get commenter name (from user_profiles name or email if name is null)
  SELECT COALESCE(
    name,
    SPLIT_PART(email, '@', 1),
    'Someone'
  )
  INTO v_commenter_name
  FROM public.user_profiles
  WHERE id = NEW.author_id;

  IF v_commenter_name IS NULL THEN
    v_commenter_name := 'Someone';
  END IF;

  -- Insert comment notification
  INSERT INTO public.moderation_notifications (
    user_id,
    bhajan_id,
    post_id,
    comment_id,
    actor_id,
    event_type,
    subject,
    body
  )
  VALUES (
    v_post_author,
    NULL,
    NEW.post_id,
    NEW.id,
    NEW.author_id,
    'comment_received',
    'New Comment',
    v_commenter_name ||
    ' commented: "' ||
    LEFT(COALESCE(NEW.content, ''), 60) ||
    CASE
      WHEN LENGTH(COALESCE(NEW.content, '')) > 60
      THEN '...'
      ELSE ''
    END ||
    '"'
  );

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.notify_post_like()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_post_author UUID;
  v_liker_name TEXT;
  v_post_title TEXT;
BEGIN
  -- Get post info
  SELECT
    author_id,
    COALESCE(title, 'your post')
  INTO
    v_post_author,
    v_post_title
  FROM public.community_posts
  WHERE id = NEW.post_id;

  -- Exit if post is missing
  IF v_post_author IS NULL THEN
    RETURN NEW;
  END IF;

  -- Skip self likes
  IF v_post_author = NEW.user_id THEN
    RETURN NEW;
  END IF;

  -- Get liker name (from user_profiles name or email if name is null)
  SELECT COALESCE(
    name,
    SPLIT_PART(email, '@', 1),
    'Someone'
  )
  INTO v_liker_name
  FROM public.user_profiles
  WHERE id = NEW.user_id;

  IF v_liker_name IS NULL THEN
    v_liker_name := 'Someone';
  END IF;

  -- Insert like notification
  INSERT INTO public.moderation_notifications (
    user_id,
    bhajan_id,
    post_id,
    actor_id,
    event_type,
    subject,
    body
  )
  VALUES (
    v_post_author,
    NULL,
    NEW.post_id,
    NEW.user_id,
    'like_received',
    'New Like',
    v_liker_name ||
    ' liked your post "' ||
    LEFT(v_post_title, 45) ||
    CASE
      WHEN LENGTH(v_post_title) > 45
      THEN '...'
      ELSE ''
    END ||
    '"'
  );

  RETURN NEW;
END;
$$;

COMMIT;
