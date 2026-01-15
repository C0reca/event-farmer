from pydantic import BaseModel
from typing import Optional, List


class AtividadeCreate(BaseModel):
    nome: str
    tipo: str
    categoria: Optional[str] = None
    preco_por_pessoa: float
    capacidade_max: int
    localizacao: Optional[str] = None
    descricao: Optional[str] = None
    imagens: Optional[str] = None
    clima: Optional[str] = None  # indoor, outdoor, ambos
    duracao_minutos: Optional[int] = None


class AtividadeUpdate(BaseModel):
    nome: Optional[str] = None
    tipo: Optional[str] = None
    preco_por_pessoa: Optional[float] = None
    capacidade_max: Optional[int] = None
    localizacao: Optional[str] = None
    descricao: Optional[str] = None
    imagens: Optional[str] = None


class AtividadeResponse(BaseModel):
    id: int
    nome: str
    tipo: str
    categoria: Optional[str]
    preco_por_pessoa: float
    capacidade_max: int
    localizacao: Optional[str]
    descricao: Optional[str]
    imagens: Optional[str]
    fornecedor_id: int
    clima: Optional[str]
    duracao_minutos: Optional[int]
    estado: Optional[str]
    aprovada: Optional[bool]
    rating_medio: Optional[float]
    total_avaliacoes: Optional[int]

    class Config:
        from_attributes = True


class RecomendacaoParams(BaseModel):
    n_pessoas: int
    orcamento: Optional[float] = None
    localizacao: Optional[str] = None
    tipo_empresa: Optional[str] = None
    categoria: Optional[str] = None  # aventura, relax, etc.
    clima: Optional[str] = None  # indoor, outdoor, ambos
    duracao_max: Optional[int] = None  # Duração máxima em minutos
    objetivo: Optional[str] = None  # bonding, onboarding, celebração, formação, etc.
    preferencias: Optional[str] = None  # Preferências e restrições em texto livre

