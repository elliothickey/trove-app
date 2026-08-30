-- Tightens the two existing named interaction write policies so a user
-- cannot create or update an interaction that points at (`contact_id`) a
-- contact they do not own. This is the database-level backstop for the same
-- check now performed in application code: lib/data.ts's createInteraction
-- looks up the target contact via the already-RLS-scoped getContact() before
-- inserting, and rejects with "Contact not found" if it isn't the caller's.
--
-- This alters the two existing policies by name (confirmed live) rather
-- than dropping/recreating them or adding new ones alongside -- adding an
-- additional permissive policy would OR-combine with the existing looser
-- one and change nothing. ALTER POLICY only touches WITH CHECK here; USING
-- is left as-is on both.

alter policy "insert own interactions" on public.interactions
  with check (
    user_id = auth.uid()
    and exists (
      select 1
      from public.contacts c
      where c.id = interactions.contact_id
        and c.user_id = auth.uid()
    )
  );

alter policy "update own interactions" on public.interactions
  with check (
    user_id = auth.uid()
    and exists (
      select 1
      from public.contacts c
      where c.id = interactions.contact_id
        and c.user_id = auth.uid()
    )
  );
