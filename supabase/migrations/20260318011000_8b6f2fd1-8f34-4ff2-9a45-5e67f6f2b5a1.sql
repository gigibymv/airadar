-- Backfill use case taxonomy for existing rows with obvious company signals.
-- Keep this conservative to avoid misclassifying individual workflows.

UPDATE public.use_cases
SET type = 'company'
WHERE type = 'person'
  AND (
    title ~* '\m(enterprise|company|organization|org|team|department)\M'
    OR summary ~* '\m(enterprise|company|organization|org|team|department)\M'
    OR title ~* '\m(our company|our team|sales team|support team|customer support)\M'
    OR summary ~* '\m(our company|our team|sales team|support team|customer support)\M'
    OR summary ~* '\m(deployed across|rolled out across|across [0-9]+ employees)\M'
  );
