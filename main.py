from fastapi import FastAPI
from app.models import user
from app.core.database import engine

user.Base.metadata.create_all(bind=engine)

app = FastAPI()

@app.get("/")
async def root():
    return {"message": "Сервер работает"}