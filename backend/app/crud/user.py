from sqlalchemy.orm import Session
from typing import Optional
from app.models.user import User, TipoUsuario
from app.core.security import get_password_hash, verify_password
from app.schemas.user import UserCreate


def get_user_by_email(db: Session, email: str) -> Optional[User]:
    """Busca utilizador por email"""
    return db.query(User).filter(User.email == email).first()


def get_user_by_id(db: Session, user_id: int) -> Optional[User]:
    """Busca utilizador por ID"""
    return db.query(User).filter(User.id == user_id).first()


def create_user(db: Session, user: UserCreate) -> User:
    """Cria novo utilizador"""
    hashed_password = get_password_hash(user.password)
    db_user = User(
        nome=user.nome,
        email=user.email,
        password=hashed_password,
        tipo=TipoUsuario(user.tipo)
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def authenticate_user(db: Session, email: str, password: str) -> Optional[User]:
    """Autentica utilizador"""
    user = get_user_by_email(db, email)
    if not user:
        return None
    if not verify_password(password, user.password):
        return None
    return user

