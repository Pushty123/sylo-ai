from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from db import supabase
bearer=HTTPBearer(auto_error=True)
def current_user(creds: HTTPAuthorizationCredentials=Depends(bearer)):
    try:
        user=supabase.auth.get_user(creds.credentials).user
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,detail="Invalid or expired token") from exc
    if not user: raise HTTPException(401,"Invalid token")
    res=supabase.table("profiles").select("*").eq("id",user.id).maybe_single().execute()
    profile=res.data if res else None
    return {"token":creds.credentials,"auth":user,"profile":profile or {"id":user.id,"role":"student","full_name":user.email}}
