-- Add dedicated per-minute upload limiter for secure image gateway
CREATE OR REPLACE FUNCTION public.check_upload_rate(user_uuid UUID, p_limit INTEGER DEFAULT 6)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_window TIMESTAMP WITH TIME ZONE := date_trunc('minute', now());
  current_count INTEGER;
BEGIN
  IF user_uuid IS NULL OR user_uuid <> auth.uid() THEN
    RETURN FALSE;
  END IF;

  INSERT INTO submission_rate_limits (user_id, action, window_start, request_count)
  VALUES (user_uuid, 'upload_lyric_image', current_window, 1)
  ON CONFLICT (user_id, action, window_start)
  DO UPDATE
    SET request_count = submission_rate_limits.request_count + 1,
        updated_at = now();

  SELECT request_count
  INTO current_count
  FROM submission_rate_limits
  WHERE user_id = user_uuid
    AND action = 'upload_lyric_image'
    AND window_start = current_window;

  RETURN COALESCE(current_count, 0) <= p_limit;
END;
$$;

REVOKE ALL ON FUNCTION public.check_upload_rate(UUID, INTEGER) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.check_upload_rate(UUID, INTEGER) TO authenticated;
