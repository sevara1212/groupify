from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import projects, rubric_extraction, quiz_generation, allocation, risks

app = FastAPI(title="Groupify API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "https://*.vercel.app"],
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(projects.router, prefix="/api")
app.include_router(rubric_extraction.router, prefix="/api")
app.include_router(quiz_generation.router, prefix="/api")
app.include_router(allocation.router, prefix="/api")
app.include_router(risks.router, prefix="/api")


@app.get("/health")
def health():
    return {"status": "ok"}
