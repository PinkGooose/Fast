from pydantic import BaseModel, EmailStr

class UserBase(BaseModel):
    username: str
    email: EmailStr

class UserCreate(UserBase):
    password: str

class UserRead(BaseModel):
    id: int
    is_active: bool
    is_superuser: bool

    class Config:
        orm_model = True