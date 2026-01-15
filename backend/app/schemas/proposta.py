from pydantic import BaseModel
from datetime import date, datetime
from typing import Optional


class PropostaCreate(BaseModel):
    """Schema para criar proposta"""
    rfq_id: int
    atividade_id: Optional[int] = None  # Opcional, pode criar proposta sem atividade específica
    preco_total: float
    preco_por_pessoa: float
    descricao: str  # O que está incluído
    extras: Optional[str] = None
    condicoes: Optional[str] = None
    data_proposta: date
    duracao_minutos: Optional[int] = None


class PropostaUpdate(BaseModel):
    """Schema para atualizar proposta"""
    preco_total: Optional[float] = None
    preco_por_pessoa: Optional[float] = None
    descricao: Optional[str] = None
    extras: Optional[str] = None
    condicoes: Optional[str] = None
    data_proposta: Optional[date] = None
    duracao_minutos: Optional[int] = None


class PropostaResponse(BaseModel):
    """Schema de resposta proposta"""
    id: int
    rfq_id: int
    fornecedor_id: int
    atividade_id: Optional[int]
    preco_total: float
    preco_por_pessoa: float
    descricao: Optional[str]
    extras: Optional[str]
    condicoes: Optional[str]
    data_proposta: date
    duracao_minutos: Optional[int]
    estado: str
    data_criacao: str
    # Informações relacionadas
    fornecedor_nome: Optional[str] = None
    fornecedor_rating: Optional[float] = None
    atividade_nome: Optional[str] = None
    reserva_id: Optional[int] = None  # ID da reserva criada quando proposta é aceite
    
    class Config:
        from_attributes = True
