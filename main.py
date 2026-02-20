from fastapi import FastAPI

from app.api.v1.endpoints import users
from app.models import user
from app.core.database import engine, Base

Base.metadata.create_all(bind=engine)

app = FastAPI()

app.include_router(users.router, prefix="/api/v1/users", tags=["users"])

@app.get("/")
async def root():
    return {"message": "Сервер работает"}