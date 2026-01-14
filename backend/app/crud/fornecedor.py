from sqlalchemy.orm import Session
from typing import Optional
from app.models.fornecedor import Fornecedor
from app.schemas.fornecedor import FornecedorCreate, FornecedorUpdate


def get_fornecedor(db: Session, fornecedor_id: int) -> Optional[Fornecedor]:
    """Busca fornecedor por ID"""
    return db.query(Fornecedor).filter(Fornecedor.id == fornecedor_id).first()


def get_fornecedor_by_user_id(db: Session, user_id: int) -> Optional[Fornecedor]:
    """Busca fornecedor por user_id"""
    return db.query(Fornecedor).filter(Fornecedor.user_id == user_id).first()


def get_fornecedores(db: Session, skip: int = 0, limit: int = 100):
    """Lista fornecedores"""
    return db.query(Fornecedor).offset(skip).limit(limit).all()


def create_fornecedor(db: Session, fornecedor: FornecedorCreate, user_id: int) -> Fornecedor:
    """Cria novo fornecedor"""
    db_fornecedor = Fornecedor(**fornecedor.dict(), user_id=user_id)
    db.add(db_fornecedor)
    db.commit()
    db.refresh(db_fornecedor)
    return db_fornecedor


def update_fornecedor(db: Session, fornecedor_id: int, fornecedor_update: FornecedorUpdate) -> Optional[Fornecedor]:
    """Atualiza fornecedor"""
    db_fornecedor = get_fornecedor(db, fornecedor_id)
    if not db_fornecedor:
        return None
    update_data = fornecedor_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_fornecedor, key, value)
    db.commit()
    db.refresh(db_fornecedor)
    return db_fornecedor

