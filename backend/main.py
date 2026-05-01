import os
import traceback

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from routers import projects, rubric_extraction, quiz_generation, allocation, risks, auth

app = FastAPI(title="Groupify API")

# Allow localhost for dev + any *.vercel.app domain for production
_extra_origins = os.environ.get("ALLOWED_ORIGINS", "").split(",")
_origins = [o.strip() for o in _extra_origins if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173", "http://127.0.0.1:3000"]
    + _origins,
    # Frontends on Vercel, Render static, Netlify, GitHub Pages, etc.
    allow_origin_regex=r"https://.*\.(vercel\.app|onrender\.com|netlify\.app|github\.io)",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Catch-all exception handler so 500 errors still get CORS headers
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    traceback.print_exc()
    return JSONResponse(
        status_code=500,
        content={"detail": str(exc)},
    )


app.include_router(projects.router, prefix="/api")
app.include_router(rubric_extraction.router, prefix="/api")
app.include_router(quiz_generation.router, prefix="/api")
app.include_router(allocation.router, prefix="/api")
app.include_router(risks.router, prefix="/api")
app.include_router(auth.router, prefix="/api")

@app.get("/health")
def health():
    return {"status": "ok"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        ssl_certfile="certs/server.crt",
        ssl_keyfile="certs/server.key",
    )