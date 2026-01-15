from sqlalchemy.orm import Session
from typing import List, Optional
from app.models.documento import Documento
from app.schemas.documento import DocumentoCreate


def create_documento(db: Session, documento: DocumentoCreate, uploaded_by_id: int) -> Documento:
    """Cria novo documento"""
    db_documento = Documento(
        uploaded_by_id=uploaded_by_id,
        **documento.dict()
    )
    db.add(db_documento)
    db.commit()
    db.refresh(db_documento)
    return db_documento


def get_documentos_by_reserva(db: Session, reserva_id: int) -> List[Documento]:
    """Lista documentos de uma reserva"""
    return db.query(Documento).filter(
        Documento.reserva_id == reserva_id
    ).order_by(Documento.data_upload.desc()).all()


def delete_documento(db: Session, documento_id: int) -> bool:
    """Elimina documento"""
    documento = db.query(Documento).filter(Documento.id == documento_id).first()
    if not documento:
        return False
    db.delete(documento)
    db.commit()
    return True
