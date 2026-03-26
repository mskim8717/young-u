from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.routers import children, textbooks, lesson_plans, daily_notices, reviews, quizzes

app = FastAPI(title="Young-U API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(children.router, prefix="/api/children", tags=["children"])
app.include_router(textbooks.router, prefix="/api/textbooks", tags=["textbooks"])
app.include_router(lesson_plans.router, prefix="/api/lesson-plans", tags=["lesson-plans"])
app.include_router(daily_notices.router, prefix="/api/daily-notices", tags=["daily-notices"])
app.include_router(reviews.router, prefix="/api/reviews", tags=["reviews"])
app.include_router(quizzes.router, prefix="/api/quizzes", tags=["quizzes"])


@app.get("/api/health")
async def health():
    return {"status": "ok"}
