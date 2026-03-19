-- Fix bookmarks access for authenticated app users and harden uniqueness scope.

GRANT USAGE ON SCHEMA public TO authenticated, service_role;
GRANT SELECT, INSERT, DELETE, UPDATE ON TABLE public.bookmarks TO authenticated;
GRANT ALL ON TABLE public.bookmarks TO service_role;

-- Existing uniqueness (user_id, item_id) can collide across categories.
-- Move to (user_id, item_id, category) to align with app behavior.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'bookmarks_user_id_item_id_key'
      AND conrelid = 'public.bookmarks'::regclass
  ) THEN
    ALTER TABLE public.bookmarks
      DROP CONSTRAINT bookmarks_user_id_item_id_key;
  END IF;
END
$$;

ALTER TABLE public.bookmarks
  ADD CONSTRAINT bookmarks_user_id_item_id_category_key
  UNIQUE (user_id, item_id, category);
