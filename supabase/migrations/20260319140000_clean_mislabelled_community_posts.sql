-- Remove community posts whose stored source doesn't match their URL.
-- These were inserted by the old fallback logic that assigned "reddit"
-- to any post that wasn't from github.com.

DELETE FROM public.community_posts
WHERE
  (source = 'reddit' AND url NOT ILIKE '%reddit.com%')
  OR
  (source = 'github' AND url NOT ILIKE '%github.com%');
