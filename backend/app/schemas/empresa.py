from pydantic import BaseModel
from typing import Optional


class EmpresaCreate(BaseModel):
    nome: str
    setor: Optional[str] = None
    n_funcionarios: Optional[int] = None
    localizacao: Optional[str] = None
    orcamento_medio: Optional[float] = None
    preferencia_atividades: Optional[str] = None


class EmpresaUpdate(BaseModel):
    nome: Optional[str] = None
    setor: Optional[str] = None
    n_funcionarios: Optional[int] = None
    localizacao: Optional[str] = None
    orcamento_medio: Optional[float] = None
    preferencia_atividades: Optional[str] = None


class EmpresaResponse(BaseModel):
    id: int
    nome: str
    setor: Optional[str]
    n_funcionarios: Optional[int]
    localizacao: Optional[str]
    orcamento_medio: Optional[float]
    preferencia_atividades: Optional[str]

    class Config:
        from_attributes = True

