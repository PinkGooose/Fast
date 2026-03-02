from pydantic import BaseModel, EmailStr, field_validator


class UserBase(BaseModel):
    username: str
    email: EmailStr

class UserCreate(UserBase):
    username: str
    email: EmailStr
    password: str
    full_name: str | None = None

    @field_validator('password')
    @classmethod
    def validate_password(cls, v):
        if len(v.encode('utf8')) > 72:
            raise ValueError('Password too long.')
        return v

class UserRead(BaseModel):
    id: int
    username: str
    email: EmailStr
    is_active: bool
    is_superuser: bool
    full_name: str | None = None

    class Config:
        orm_model = True