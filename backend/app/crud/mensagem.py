from sqlalchemy.orm import Session
from typing import List
from app.models.mensagem import Mensagem
from app.schemas.mensagem import MensagemCreate


def create_mensagem(db: Session, mensagem: MensagemCreate, remetente_id: int) -> Mensagem:
    """Cria nova mensagem"""
    db_mensagem = Mensagem(
        remetente_id=remetente_id,
        **mensagem.dict()
    )
    db.add(db_mensagem)
    db.commit()
    db.refresh(db_mensagem)
    return db_mensagem


def get_mensagens_by_reserva(db: Session, reserva_id: int) -> List[Mensagem]:
    """Lista mensagens de uma reserva"""
    return db.query(Mensagem).filter(
        Mensagem.reserva_id == reserva_id
    ).order_by(Mensagem.data_criacao.asc()).all()


def marcar_como_lida(db: Session, mensagem_id: int) -> Mensagem:
    """Marca mensagem como lida"""
    mensagem = db.query(Mensagem).filter(Mensagem.id == mensagem_id).first()
    if mensagem:
        mensagem.lida = True
        db.commit()
        db.refresh(mensagem)
    return mensagem
