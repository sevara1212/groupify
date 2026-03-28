import os
import traceback

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from routers import projects, rubric_extraction, quiz_generation, allocation, risks

app = FastAPI(title="Groupify API")

# Allow localhost for dev + any *.vercel.app domain for production
_extra_origins = os.environ.get("ALLOWED_ORIGINS", "").split(",")
_origins = [o.strip() for o in _extra_origins if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"] + _origins,
    allow_origin_regex=r"https://.*\.vercel\.app",
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


@app.get("/health")
def health():
    return {"status": "ok"}
