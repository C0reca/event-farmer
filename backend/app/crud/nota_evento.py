from sqlalchemy.orm import Session
from typing import List, Optional
from app.models.nota_evento import NotaEvento
from app.schemas.nota_evento import NotaEventoCreate, NotaEventoUpdate


def create_nota(db: Session, nota: NotaEventoCreate, criado_por_id: int) -> NotaEvento:
    """Cria nova nota"""
    db_nota = NotaEvento(
        criado_por_id=criado_por_id,
        **nota.dict()
    )
    db.add(db_nota)
    db.commit()
    db.refresh(db_nota)
    return db_nota


def get_notas_by_reserva(db: Session, reserva_id: int) -> List[NotaEvento]:
    """Lista notas de uma reserva"""
    return db.query(NotaEvento).filter(
        NotaEvento.reserva_id == reserva_id
    ).order_by(NotaEvento.data_criacao.desc()).all()


def update_nota(db: Session, nota_id: int, nota_update: NotaEventoUpdate) -> Optional[NotaEvento]:
    """Atualiza nota"""
    nota = db.query(NotaEvento).filter(NotaEvento.id == nota_id).first()
    if not nota:
        return None
    
    update_data = nota_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(nota, key, value)
    
    db.commit()
    db.refresh(nota)
    return nota


def delete_nota(db: Session, nota_id: int) -> bool:
    """Elimina nota"""
    nota = db.query(NotaEvento).filter(NotaEvento.id == nota_id).first()
    if not nota:
        return False
    db.delete(nota)
    db.commit()
    return True
