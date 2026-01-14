from sqlalchemy.orm import Session
from typing import Optional
from app.models.empresa import Empresa
from app.schemas.empresa import EmpresaCreate, EmpresaUpdate


def get_empresa(db: Session, empresa_id: int) -> Optional[Empresa]:
    """Busca empresa por ID"""
    return db.query(Empresa).filter(Empresa.id == empresa_id).first()


def get_empresa_by_user_id(db: Session, user_id: int) -> Optional[Empresa]:
    """Busca empresa por user_id"""
    return db.query(Empresa).filter(Empresa.user_id == user_id).first()


def get_empresas(db: Session, skip: int = 0, limit: int = 100):
    """Lista empresas"""
    return db.query(Empresa).offset(skip).limit(limit).all()


def create_empresa(db: Session, empresa: EmpresaCreate, user_id: int) -> Empresa:
    """Cria nova empresa"""
    db_empresa = Empresa(**empresa.dict(), user_id=user_id)
    db.add(db_empresa)
    db.commit()
    db.refresh(db_empresa)
    return db_empresa


def update_empresa(db: Session, empresa_id: int, empresa_update: EmpresaUpdate) -> Optional[Empresa]:
    """Atualiza empresa"""
    db_empresa = get_empresa(db, empresa_id)
    if not db_empresa:
        return None
    update_data = empresa_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_empresa, key, value)
    db.commit()
    db.refresh(db_empresa)
    return db_empresa


def delete_empresa(db: Session, empresa_id: int) -> bool:
    """Elimina empresa"""
    db_empresa = get_empresa(db, empresa_id)
    if not db_empresa:
        return False
    db.delete(db_empresa)
    db.commit()
    return True

