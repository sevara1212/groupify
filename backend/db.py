from supabase import create_client
from dotenv import load_dotenv
import os

load_dotenv()

SUPABASE_URL = os.environ.get("VITE_SUPABASE_URL")
SUPABASE_KEY = os.environ.get("VITE_SUPABASE_ANON_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise RuntimeError(
        "Missing env vars: VITE_SUPABASE_URL and/or VITE_SUPABASE_ANON_KEY. "
        "Set them in your .env file or environment."
    )

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
