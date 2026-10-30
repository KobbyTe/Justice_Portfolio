# Project rules
- Use a dedicated TUS upload helper for vlog videos, keeping ordinary uploads for other media; chunking and retries improve reliability without bypassing Supabase file limits.
- Keep admin section definitions in one navigation component shared by the mobile section picker and desktop tabs; this prevents navigation labels from drifting.