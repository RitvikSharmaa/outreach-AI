from supabase import create_client, Client
from config import get_settings
from typing import Optional

settings = get_settings()

supabase: Optional[Client] = None

# Only initialize if valid credentials are provided
if (settings.supabase_url and 
    settings.supabase_service_key and 
    not settings.supabase_service_key.startswith('sb_secret_') and
    not settings.supabase_service_key.startswith('sb_publishable_')):
    try:
        supabase = create_client(
            settings.supabase_url,
            settings.supabase_service_key
        )
    except Exception as e:
        print(f"Warning: Could not initialize Supabase client: {e}")
        supabase = None
else:
    print("Warning: Supabase credentials not configured. Database features will be disabled.")

def get_supabase() -> Optional[Client]:
    return supabase
