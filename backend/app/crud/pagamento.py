from sqlalchemy.orm import Session
from typing import Optional
from app.models.pagamento import Pagamento, EstadoPagamento
from app.schemas.pagamento import PagamentoCreate
from datetime import datetime


def create_pagamento(db: Session, pagamento: PagamentoCreate, valor: float) -> Pagamento:
    """Cria novo pagamento"""
    db_pagamento = Pagamento(
        reserva_id=pagamento.reserva_id,
        valor=valor,
        metodo=pagamento.metodo,
        estado=EstadoPagamento.PENDENTE,
        email_fatura=pagamento.email_fatura,
        descricao=pagamento.descricao
    )
    db.add(db_pagamento)
    db.commit()
    db.refresh(db_pagamento)
    return db_pagamento


def get_pagamento_by_reserva(db: Session, reserva_id: int) -> Optional[Pagamento]:
    """Busca pagamento por reserva"""
    return db.query(Pagamento).filter(Pagamento.reserva_id == reserva_id).first()


def get_pagamento(db: Session, pagamento_id: int) -> Optional[Pagamento]:
    """Busca pagamento por ID"""
    return db.query(Pagamento).filter(Pagamento.id == pagamento_id).first()


def update_pagamento_status(
    db: Session,
    pagamento_id: int,
    estado: EstadoPagamento,
    gateway_payment_id: Optional[str] = None,
    gateway_transaction_id: Optional[str] = None,
    gateway_response: Optional[str] = None
) -> Optional[Pagamento]:
    """Atualiza status do pagamento"""
    pagamento = db.query(Pagamento).filter(Pagamento.id == pagamento_id).first()
    if not pagamento:
        return None
    
    pagamento.estado = estado
    if gateway_payment_id:
        pagamento.gateway_payment_id = gateway_payment_id
    if gateway_transaction_id:
        pagamento.gateway_transaction_id = gateway_transaction_id
    if gateway_response:
        import json
        pagamento.gateway_response = json.dumps(gateway_response)
    
    if estado == EstadoPagamento.CONCLUIDO:
        pagamento.data_conclusao = datetime.utcnow()
    
    db.commit()
    db.refresh(pagamento)
    return pagamento
