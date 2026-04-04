from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from database import supabase_admin

# tokenUrl is informational only — we do not use the /token OAuth2 flow.
# The real login is at /api/auth/login which returns a Supabase JWT.
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


async def get_current_user(token: str = Depends(oauth2_scheme)) -> dict:
    """
    Verifies the Supabase-issued JWT by calling Supabase Admin auth.get_user().
    More reliable than manual JWT decoding — no JWT secret format concerns.
    Returns {"user_id": str, "email": str} on success.
    Raises 401 on any failure.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        response = supabase_admin.auth.get_user(token)
        if response.user is None:
            raise credentials_exception
        return {
            "user_id": response.user.id,
            "email": response.user.email or "",
        }
    except Exception:
        raise credentials_exception
