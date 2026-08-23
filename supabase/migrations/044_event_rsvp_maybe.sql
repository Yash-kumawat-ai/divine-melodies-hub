-- Allow Maybe RSVP on satsang events (Going / Interested / Maybe).
ALTER TABLE public.event_rsvps
  DROP CONSTRAINT IF EXISTS event_rsvps_rsvp_status_check;

ALTER TABLE public.event_rsvps
  ADD CONSTRAINT event_rsvps_rsvp_status_check
  CHECK (rsvp_status IN ('interested', 'going', 'maybe'));
