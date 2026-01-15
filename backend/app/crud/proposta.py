from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta
from app.models.proposta import Proposta, EstadoProposta
from app.models.rfq import RFQ, EstadoRFQ
from app.schemas.proposta import PropostaCreate, PropostaUpdate


def create_proposta(db: Session, proposta: PropostaCreate, fornecedor_id: int) -> Proposta:
    """Cria nova proposta"""
    # Verificar se RFQ existe e está aberto
    rfq = db.query(RFQ).filter(RFQ.id == proposta.rfq_id).first()
    if not rfq or rfq.estado != EstadoRFQ.ABERTO:
        raise ValueError("RFQ não encontrado ou não está aberto")
    
    # Data de expiração padrão: 7 dias
    data_expiracao = datetime.utcnow() + timedelta(days=7)
    
    db_proposta = Proposta(
        fornecedor_id=fornecedor_id,
        **proposta.dict(),
        data_expiracao=data_expiracao
    )
    db.add(db_proposta)
    
    # Atualizar estado do RFQ para "em_negociacao" se ainda estiver "aberto"
    if rfq.estado == EstadoRFQ.ABERTO:
        rfq.estado = EstadoRFQ.EM_NEGOCIACAO
    
    db.commit()
    db.refresh(db_proposta)
    return db_proposta


def get_proposta(db: Session, proposta_id: int) -> Optional[Proposta]:
    """Busca proposta por ID"""
    return db.query(Proposta).filter(Proposta.id == proposta_id).first()


def get_propostas_by_rfq(db: Session, rfq_id: int) -> List[Proposta]:
    """Lista propostas de um RFQ"""
    return db.query(Proposta).filter(
        Proposta.rfq_id == rfq_id
    ).order_by(Proposta.data_criacao.desc()).all()


def get_propostas_by_fornecedor(db: Session, fornecedor_id: int) -> List[Proposta]:
    """Lista propostas de um fornecedor"""
    return db.query(Proposta).filter(
        Proposta.fornecedor_id == fornecedor_id
    ).order_by(Proposta.data_criacao.desc()).all()


def update_proposta(db: Session, proposta_id: int, proposta_update: PropostaUpdate) -> Optional[Proposta]:
    """Atualiza proposta"""
    proposta = get_proposta(db, proposta_id)
    if not proposta:
        return None
    
    update_data = proposta_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(proposta, key, value)
    
    db.commit()
    db.refresh(proposta)
    return proposta


def aceitar_proposta(db: Session, proposta_id: int) -> Optional[Proposta]:
    """Aceita uma proposta (empresa)"""
    proposta = get_proposta(db, proposta_id)
    if not proposta:
        return None
    
    proposta.estado = EstadoProposta.ACEITE
    
    # Fechar RFQ
    rfq = proposta.rfq
    rfq.estado = EstadoRFQ.FECHADO
    
    # Recusar outras propostas do mesmo RFQ
    outras_propostas = db.query(Proposta).filter(
        Proposta.rfq_id == rfq.id,
        Proposta.id != proposta_id,
        Proposta.estado == EstadoProposta.PENDENTE
    ).all()
    for outra in outras_propostas:
        outra.estado = EstadoProposta.RECUSADA
    
    db.commit()
    db.refresh(proposta)
    return proposta


def recusar_proposta(db: Session, proposta_id: int) -> Optional[Proposta]:
    """Recusa uma proposta (empresa)"""
    proposta = get_proposta(db, proposta_id)
    if not proposta:
        return None
    
    proposta.estado = EstadoProposta.RECUSADA
    db.commit()
    db.refresh(proposta)
    return proposta
