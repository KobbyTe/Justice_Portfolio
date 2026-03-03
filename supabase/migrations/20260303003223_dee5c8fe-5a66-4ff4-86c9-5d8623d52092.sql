
-- Drop the restrictive policies
DROP POLICY IF EXISTS "Admins can manage slots" ON public.appointment_slots;
DROP POLICY IF EXISTS "Anyone can read available slots" ON public.appointment_slots;

-- Recreate as PERMISSIVE policies (default) so any ONE passing is sufficient
CREATE POLICY "Anyone can read available slots"
ON public.appointment_slots
FOR SELECT
USING (true);

CREATE POLICY "Admins can manage slots"
ON public.appointment_slots
FOR ALL
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));
