from sqlalchemy.orm import Session
from typing import List, Optional
from app.models.rfq import RFQ, EstadoRFQ
from app.schemas.rfq import RFQCreate


def create_rfq(db: Session, rfq: RFQCreate, empresa_id: int) -> RFQ:
    """Cria novo RFQ"""
    db_rfq = RFQ(
        empresa_id=empresa_id,
        **rfq.dict()
    )
    db.add(db_rfq)
    db.commit()
    db.refresh(db_rfq)
    return db_rfq


def get_rfq(db: Session, rfq_id: int) -> Optional[RFQ]:
    """Busca RFQ por ID"""
    return db.query(RFQ).filter(RFQ.id == rfq_id).first()


def get_rfqs_by_empresa(db: Session, empresa_id: int) -> List[RFQ]:
    """Lista RFQs de uma empresa"""
    return db.query(RFQ).filter(RFQ.empresa_id == empresa_id).order_by(RFQ.data_criacao.desc()).all()


def get_rfqs_abertos(db: Session, skip: int = 0, limit: int = 100) -> List[RFQ]:
    """Lista RFQs abertos (para fornecedores verem)"""
    return db.query(RFQ).filter(
        RFQ.estado == EstadoRFQ.ABERTO
    ).order_by(RFQ.data_criacao.desc()).offset(skip).limit(limit).all()


def get_rfqs_por_fornecedor(db: Session, fornecedor_id: int) -> List[RFQ]:
    """Lista RFQs que um fornecedor pode ver (baseado em localização e categorias)"""
    # Por agora, retorna todos os RFQs abertos
    # Futuramente pode filtrar por localização, categoria, etc.
    return get_rfqs_abertos(db)


def update_rfq_estado(db: Session, rfq_id: int, novo_estado: EstadoRFQ) -> Optional[RFQ]:
    """Atualiza estado do RFQ"""
    rfq = get_rfq(db, rfq_id)
    if not rfq:
        return None
    rfq.estado = novo_estado
    db.commit()
    db.refresh(rfq)
    return rfq


def cancelar_rfq(db: Session, rfq_id: int) -> Optional[RFQ]:
    """Cancela um RFQ"""
    return update_rfq_estado(db, rfq_id, EstadoRFQ.CANCELADO)
