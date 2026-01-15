from sqlalchemy.orm import Session
from datetime import date
from typing import Optional
from app.models.reserva import Reserva, EstadoReserva
from app.models.atividade import Atividade
from app.schemas.reserva import ReservaCreate


def get_reserva(db: Session, reserva_id: int) -> Optional[Reserva]:
    """Busca reserva por ID"""
    return db.query(Reserva).filter(Reserva.id == reserva_id).first()


def get_reservas_by_empresa(db: Session, empresa_id: int):
    """Lista reservas de uma empresa"""
    return db.query(Reserva).filter(Reserva.empresa_id == empresa_id).all()


def create_reserva(
    db: Session,
    reserva: ReservaCreate,
    empresa_id: int,
    preco_total: Optional[float] = None,
    proposta_id: Optional[int] = None
) -> Optional[Reserva]:
    """Cria nova reserva"""
    # Se atividade_id não for fornecido, pode ser uma reserva sem atividade específica (de proposta personalizada)
    if reserva.atividade_id:
        atividade = db.query(Atividade).filter(Atividade.id == reserva.atividade_id).first()
        if not atividade:
            return None
        
        # Verificar capacidade
        if atividade.capacidade_max < reserva.n_pessoas:
            return None
        
        # Calcular preço se não fornecido
        if preco_total is None:
            preco_total = atividade.preco_por_pessoa * reserva.n_pessoas
    else:
        # Reserva sem atividade específica (proposta personalizada)
        if preco_total is None:
            return None  # Preço deve ser fornecido
        atividade = None
    
    db_reserva = Reserva(
        empresa_id=empresa_id,
        atividade_id=reserva.atividade_id,
        proposta_id=proposta_id,
        data=reserva.data,
        n_pessoas=reserva.n_pessoas,
        preco_total=preco_total,
        estado=EstadoReserva.PENDENTE
    )
    db.add(db_reserva)
    db.commit()
    db.refresh(db_reserva)
    return db_reserva


def cancelar_reserva(db: Session, reserva_id: int) -> Optional[Reserva]:
    """Cancela uma reserva"""
    db_reserva = get_reserva(db, reserva_id)
    if not db_reserva:
        return None
    db_reserva.estado = EstadoReserva.CANCELADA
    db.commit()
    db.refresh(db_reserva)
    return db_reserva

