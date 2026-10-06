import os
from supabase import create_client, Client, ClientOptions
from dotenv import load_dotenv
load_dotenv()
SUPABASE_URL=os.environ["SUPABASE_URL"]
SUPABASE_SERVICE_KEY=os.environ["SUPABASE_SERVICE_KEY"]
SUPABASE_ANON_KEY=os.getenv("SUPABASE_ANON_KEY","")
supabase: Client=create_client(SUPABASE_URL,SUPABASE_SERVICE_KEY)

def user_client(access_token: str) -> Client:
    """Client that acts as the signed-in user, so RLS and auth.uid() based RPCs apply."""
    if not SUPABASE_ANON_KEY: raise RuntimeError("SUPABASE_ANON_KEY is not set")
    return create_client(SUPABASE_URL,SUPABASE_ANON_KEY,options=ClientOptions(headers={"Authorization":f"Bearer {access_token}"}))
