from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import timedelta
from app.database import get_db
from app.core.security import create_access_token
from app.core.config import settings
from app.core.dependencies import get_current_user, get_current_user_required
from app.models.user import User
from app.crud import user as crud_user, empresa as crud_empresa, fornecedor as crud_fornecedor
from app.schemas.user import UserCreate, UserLogin, UserResponse, Token
from app.schemas.empresa import EmpresaCreate
from app.schemas.fornecedor import FornecedorCreate

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=UserResponse)
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    """Registo de novo utilizador"""
    # Verificar se email já existe
    if crud_user.get_user_by_email(db, user_data.email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Criar utilizador
    user = crud_user.create_user(db, user_data)
    
    return user


@router.post("/login", response_model=Token)
def login(user_credentials: UserLogin, db: Session = Depends(get_db)):
    """Login e obtenção de token JWT"""
    user = crud_user.authenticate_user(db, user_credentials.email, user_credentials.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/me", response_model=UserResponse)
def get_current_user_info(current_user: User = Depends(get_current_user_required)):
    """Obtém informação do utilizador autenticado"""
    return current_user

