from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from app.api.v1.endpoints import users, auth, tasks

app = FastAPI()

app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/")
async def serve_index():
    return FileResponse("static/index.html")

@app.get("/login")
async def serve_login():
    return FileResponse("static/login.html")

@app.get("/profile")
async def serve_profile():
    return FileResponse("static/profile.html")

@app.get("/register")
async def serve_register():
    return FileResponse("static/register.html")

@app.get("/tasks")
async def serve_tasks():
    return FileResponse("static/tasks.html")

@app.get("/create-task")
async def serve_create_task():
    return FileResponse("static/create_task.html")

@app.get("/edit-task")
async def serve_edit_task():
    return FileResponse("static/edit_task.html")

app.include_router(users.router, prefix="/api/v1/users", tags=["users"])
app.include_router(auth.router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(tasks.router, prefix="/api/v1/tasks")

@app.get("/")
async def root():
    return {"message": "Сервер работает"}