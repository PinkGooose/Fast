from typing import List, Optional

from fastapi import APIRouter, status, Depends, Query, HTTPException
from sqlalchemy import and_
from sqlalchemy.orm import Session

from app.api.v1.dependencies import get_current_user
from app.core.deps import get_db
from app.models.user import User
from app.models.task import Task as TaskModel, TaskStatus, TaskCategory
from app.schemas.task import Task, TaskCreate, TaskUpdate

router = APIRouter()

@router.post("/", response_model=Task, status_code=status.HTTP_201_CREATED)
def create_task(
        task_in: TaskCreate,
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user)
):
    task = TaskModel(
        **task_in.model_dump(),
        user_id=current_user.id
    )
    db.add(task)
    db.commit()
    db.refresh(task)
    return task

@router.get("/", response_model=List[Task])
def read_tasks(
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user),
        skip: int = Query(0, ge=0),
        limit: int = Query(100, ge=1, le=100),
        status: Optional[TaskStatus] = None,
        category: Optional[TaskCategory] = None,
):
    query = db.query(TaskModel).filter(TaskModel.user_id == current_user.id)

    if status:
        query = query.filter(TaskModel.status == status)
    if category:
        query = query.filter(TaskModel.category == category)

    tasks = query.offset(skip).limit(limit).all()
    return tasks

@router.get("/{task_id}", response_model=Task)
def read_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    task = db.query(TaskModel).filter(
        and_(TaskModel.id == task_id, TaskModel.user_id == current_user.id)
    ).first()
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
    return task

@router.put("/{task_id}", response_model=Task)
def update_task(
        task_id: int,
        task_update: TaskUpdate,
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user),
):
    task = db.query(TaskModel).filter(
        and_(TaskModel.id == task_id, TaskModel.user_id == current_user.id)
    ).first()

    update_data = task_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(task, field, value)

    db.commit()
    db.refresh(task)
    return task

@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(
        task_id: int,
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user),
):
    task = db.query(TaskModel).filter(
        and_(TaskModel.id == task_id, TaskModel.user_id == current_user.id)
    ).first()
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")

    db.delete(task)
    db.commit()
    return None

