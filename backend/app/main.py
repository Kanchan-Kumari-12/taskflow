from fastapi import FastAPI
from fastapi import Depends
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.routers import auth

app = FastAPI(title="TaskFlow")
app.include_router(auth.router)


@app.get("/health")
def health():
    return {"status": "ok"}

@app.get("/db-check")
def db_check(db: Session = Depends(get_db)):
    return {"db": db.execute(text("SELECT 1")).scalar()}