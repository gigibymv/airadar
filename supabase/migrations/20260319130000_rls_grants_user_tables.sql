-- Explicit grants for user-specific tables.
-- anon role has NO access to profiles or bookmarks.
-- authenticated role can access only their own rows (enforced by RLS policies).

-- Profiles: authenticated users can read/update their own row only.
GRANT SELECT, UPDATE ON TABLE public.profiles TO authenticated;
REVOKE ALL ON TABLE public.profiles FROM anon;

-- Bookmarks: authenticated users can read/insert/delete their own rows only.
GRANT SELECT, INSERT, DELETE ON TABLE public.bookmarks TO authenticated;
REVOKE ALL ON TABLE public.bookmarks FROM anon;

-- Service role retains full access for admin operations.
GRANT ALL ON TABLE public.profiles TO service_role;
GRANT ALL ON TABLE public.bookmarks TO service_role;

-- Confirm RLS is enabled (idempotent — safe to re-run).
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;
