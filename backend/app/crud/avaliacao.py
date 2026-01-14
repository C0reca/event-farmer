from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Optional, List
from app.models.avaliacao import Avaliacao
from app.models.atividade import Atividade
from app.schemas.avaliacao import AvaliacaoCreate


def create_avaliacao(db: Session, avaliacao: AvaliacaoCreate, empresa_id: int) -> Avaliacao:
    """Cria nova avaliação"""
    db_avaliacao = Avaliacao(
        empresa_id=empresa_id,
        atividade_id=avaliacao.atividade_id,
        fornecedor_id=avaliacao.fornecedor_id,
        rating=avaliacao.rating,
        comentario=avaliacao.comentario
    )
    db.add(db_avaliacao)
    db.commit()
    db.refresh(db_avaliacao)
    
    # Atualizar rating médio da atividade se for avaliação de atividade
    if avaliacao.atividade_id:
        atividade = db.query(Atividade).filter(Atividade.id == avaliacao.atividade_id).first()
        if atividade:
            # Calcular novo rating médio
            result = db.query(
                func.avg(Avaliacao.rating).label('avg_rating'),
                func.count(Avaliacao.id).label('total')
            ).filter(Avaliacao.atividade_id == avaliacao.atividade_id).first()
            
            if result and result.avg_rating:
                atividade.rating_medio = round(result.avg_rating, 2)
                atividade.total_avaliacoes = result.total
                db.commit()
    
    return db_avaliacao


def get_avaliacoes_by_atividade(db: Session, atividade_id: int) -> List[Avaliacao]:
    """Lista avaliações de uma atividade"""
    return db.query(Avaliacao).filter(Avaliacao.atividade_id == atividade_id).all()


def get_avaliacoes_by_fornecedor(db: Session, fornecedor_id: int) -> List[Avaliacao]:
    """Lista avaliações de um fornecedor"""
    return db.query(Avaliacao).filter(Avaliacao.fornecedor_id == fornecedor_id).all()


def get_avaliacoes_by_empresa(db: Session, empresa_id: int) -> List[Avaliacao]:
    """Lista avaliações feitas por uma empresa"""
    return db.query(Avaliacao).filter(Avaliacao.empresa_id == empresa_id).all()

