from supabase import create_client
from dotenv import load_dotenv
import os

load_dotenv()

supabase = create_client(
    os.environ.get("VITE_SUPABASE_URL"),
    os.environ.get("VITE_SUPABASE_ANON_KEY"),
)
