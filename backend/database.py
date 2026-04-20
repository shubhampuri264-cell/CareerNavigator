from functools import lru_cache
from supabase import create_client, Client
from config import get_settings


@lru_cache()
def get_supabase_client() -> Client:
    settings = get_settings()
    return create_client(settings.supabase_url, settings.supabase_anon_key)


@lru_cache()
def get_supabase_admin() -> Client:
    settings = get_settings()
    return create_client(settings.supabase_url, settings.supabase_service_role_key)


# Module-level aliases — resolved lazily on first import access
class _LazyClient:
    def __init__(self, getter):
        self._getter = getter

    def __getattr__(self, name):
        return getattr(self._getter(), name)


supabase_client = _LazyClient(get_supabase_client)
supabase_admin = _LazyClient(get_supabase_admin)
