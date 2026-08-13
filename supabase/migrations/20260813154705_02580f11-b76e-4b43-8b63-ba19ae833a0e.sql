-- Auth failed-attempt tracking (email stored only as a one-way hash)
CREATE TABLE public.auth_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier_hash text NOT NULL,
  attempted_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.auth_attempts TO service_role;
ALTER TABLE public.auth_attempts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "no direct access to auth_attempts"
  ON public.auth_attempts FOR ALL TO authenticated USING (false) WITH CHECK (false);
CREATE INDEX idx_auth_attempts_lookup ON public.auth_attempts (identifier_hash, attempted_at DESC);

-- Generic rate limiting buckets
CREATE TABLE public.rate_limit_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bucket text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.rate_limit_events TO service_role;
ALTER TABLE public.rate_limit_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "no direct access to rate_limit_events"
  ON public.rate_limit_events FOR ALL TO authenticated USING (false) WITH CHECK (false);
CREATE INDEX idx_rate_limit_events_lookup ON public.rate_limit_events (bucket, created_at DESC);

-- Returns seconds remaining on lockout (0 when not locked)
CREATE OR REPLACE FUNCTION public.auth_lockout_seconds(_identifier text)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  h text;
  fifth timestamptz;
BEGIN
  IF _identifier IS NULL OR length(_identifier) = 0 THEN
    RETURN 0;
  END IF;
  h := md5(lower(trim(_identifier)));

  DELETE FROM public.auth_attempts WHERE attempted_at < now() - interval '1 day';

  SELECT attempted_at INTO fifth
  FROM public.auth_attempts
  WHERE identifier_hash = h
    AND attempted_at > now() - interval '15 minutes'
  ORDER BY attempted_at DESC
  OFFSET 4 LIMIT 1;

  IF fifth IS NULL THEN
    RETURN 0;
  END IF;

  RETURN GREATEST(0, CEIL(EXTRACT(EPOCH FROM (fifth + interval '15 minutes' - now())))::int);
END;
$$;

CREATE OR REPLACE FUNCTION public.auth_record_failure(_identifier text)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF _identifier IS NULL OR length(_identifier) = 0 THEN
    RETURN 0;
  END IF;
  INSERT INTO public.auth_attempts (identifier_hash) VALUES (md5(lower(trim(_identifier))));
  RETURN public.auth_lockout_seconds(_identifier);
END;
$$;

CREATE OR REPLACE FUNCTION public.auth_clear_failures(_identifier text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF _identifier IS NULL OR length(_identifier) = 0 THEN
    RETURN;
  END IF;
  DELETE FROM public.auth_attempts WHERE identifier_hash = md5(lower(trim(_identifier)));
END;
$$;

-- Generic sliding-window rate limit; returns true when the request is allowed
CREATE OR REPLACE FUNCTION public.check_rate_limit(_bucket text, _max_requests integer, _window_seconds integer)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  used integer;
BEGIN
  IF _bucket IS NULL OR length(_bucket) = 0 OR length(_bucket) > 200 THEN
    RETURN false;
  END IF;

  DELETE FROM public.rate_limit_events WHERE created_at < now() - interval '1 day';

  SELECT count(*) INTO used
  FROM public.rate_limit_events
  WHERE bucket = _bucket
    AND created_at > now() - make_interval(secs => GREATEST(_window_seconds, 1));

  IF used >= GREATEST(_max_requests, 1) THEN
    RETURN false;
  END IF;

  INSERT INTO public.rate_limit_events (bucket) VALUES (_bucket);
  RETURN true;
END;
$$;

REVOKE ALL ON FUNCTION public.check_rate_limit(text, integer, integer) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.auth_record_failure(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.auth_clear_failures(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.auth_lockout_seconds(text) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.auth_lockout_seconds(text) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.auth_record_failure(text) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.auth_clear_failures(text) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.check_rate_limit(text, integer, integer) TO service_role;