from supabase import create_client, Client
from config import get_settings

settings = get_settings()

# Anon key — used for Supabase Auth operations (sign up, sign in)
# Respects RLS policies
supabase_client: Client = create_client(
    settings.supabase_url,
    settings.supabase_anon_key,
)

# Service role key — bypasses RLS, used for all data operations in routers
# NEVER expose this key to the frontend
supabase_admin: Client = create_client(
    settings.supabase_url,
    settings.supabase_service_role_key,
)
