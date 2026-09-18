-- Adds nullable "as written" date columns alongside the existing strict
-- `date` columns on contact_employment and contact_education. AI-assisted
-- Quick Capture can produce imprecise dates ("2024", "Summer 2024") that
-- cannot losslessly become a `date` value without inventing a day/month
-- that was never stated. Rather than silently dropping that detail, callers
-- that can't parse an exact date should write the original text here
-- instead, and leave the `date` column null.
--
-- Purely additive: nullable columns, no backfill, no policy changes needed
-- since RLS policies on these tables are row-level (not column-level) and
-- already cover every column on the row.

alter table public.contact_employment
  add column start_date_text text,
  add column end_date_text text;

alter table public.contact_education
  add column start_date_text text,
  add column end_date_text text;
