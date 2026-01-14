from sqlalchemy.orm import Session
from sqlalchemy import and_
from typing import List, Optional
from app.models.atividade import Atividade
from app.schemas.atividade import AtividadeCreate, AtividadeUpdate


def get_atividade(db: Session, atividade_id: int) -> Optional[Atividade]:
    """Busca atividade por ID"""
    return db.query(Atividade).filter(Atividade.id == atividade_id).first()


def get_atividades(db: Session, skip: int = 0, limit: int = 100):
    """Lista atividades"""
    return db.query(Atividade).offset(skip).limit(limit).all()


def get_atividades_by_fornecedor(db: Session, fornecedor_id: int):
    """Lista atividades de um fornecedor"""
    return db.query(Atividade).filter(Atividade.fornecedor_id == fornecedor_id).all()


def create_atividade(db: Session, atividade: AtividadeCreate, fornecedor_id: int) -> Atividade:
    """Cria nova atividade"""
    db_atividade = Atividade(**atividade.dict(), fornecedor_id=fornecedor_id)
    db.add(db_atividade)
    db.commit()
    db.refresh(db_atividade)
    return db_atividade


def update_atividade(db: Session, atividade_id: int, atividade_update: AtividadeUpdate) -> Optional[Atividade]:
    """Atualiza atividade"""
    db_atividade = get_atividade(db, atividade_id)
    if not db_atividade:
        return None
    update_data = atividade_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_atividade, key, value)
    db.commit()
    db.refresh(db_atividade)
    return db_atividade


def delete_atividade(db: Session, atividade_id: int) -> bool:
    """Elimina atividade"""
    db_atividade = get_atividade(db, atividade_id)
    if not db_atividade:
        return False
    db.delete(db_atividade)
    db.commit()
    return True


def get_atividades_recomendadas(
    db: Session,
    n_pessoas: int,
    orcamento: Optional[float] = None,
    localizacao: Optional[str] = None,
    tipo_empresa: Optional[str] = None,
    categoria: Optional[str] = None,
    clima: Optional[str] = None,
    duracao_max: Optional[int] = None
) -> List[Atividade]:
    """Busca atividades recomendadas baseado em critérios"""
    # Apenas atividades aprovadas
    query = db.query(Atividade).filter(
        Atividade.capacidade_max >= n_pessoas,
        Atividade.aprovada == True
    )
    
    if orcamento:
        query = query.filter(Atividade.preco_por_pessoa <= orcamento)
    
    if localizacao:
        query = query.filter(Atividade.localizacao.ilike(f"%{localizacao}%"))
    
    if categoria:
        query = query.filter(Atividade.categoria.ilike(f"%{categoria}%"))
    
    if clima:
        query = query.filter(Atividade.clima.ilike(f"%{clima}%"))
    
    if duracao_max:
        query = query.filter(Atividade.duracao_minutos <= duracao_max)
    
    # Ordenar por rating médio (maior primeiro), depois por preço
    atividades = query.order_by(
        Atividade.rating_medio.desc(),
        Atividade.preco_por_pessoa
    ).limit(20).all()
    
    return atividades

