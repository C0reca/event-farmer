from pydantic import BaseModel
from datetime import date
from typing import Optional


class RFQCreate(BaseModel):
    """Schema para criar RFQ"""
    n_pessoas: int
    data_preferida: date
    data_alternativa: Optional[date] = None
    localizacao: str
    raio_km: int = 50
    orcamento_max: float
    objetivo: Optional[str] = None  # bonding, onboarding, celebração, formação, etc.
    preferencias: Optional[str] = None
    categoria_preferida: Optional[str] = None
    clima_preferido: Optional[str] = None
    duracao_max_minutos: Optional[int] = None


class RFQResponse(BaseModel):
    """Schema de resposta RFQ"""
    id: int
    empresa_id: int
    n_pessoas: int
    data_preferida: date
    data_alternativa: Optional[date]
    localizacao: str
    raio_km: int
    orcamento_max: float
    objetivo: Optional[str]
    preferencias: Optional[str]
    categoria_preferida: Optional[str]
    clima_preferido: Optional[str]
    duracao_max_minutos: Optional[int]
    estado: str
    data_criacao: str
    num_propostas: int = 0  # Número de propostas recebidas
    
    class Config:
        from_attributes = True
