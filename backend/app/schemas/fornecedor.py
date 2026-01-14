from pydantic import BaseModel
from typing import Optional


class FornecedorCreate(BaseModel):
    nome: str
    localizacao: Optional[str] = None
    descricao: Optional[str] = None
    contacto: Optional[str] = None


class FornecedorUpdate(BaseModel):
    nome: Optional[str] = None
    localizacao: Optional[str] = None
    descricao: Optional[str] = None
    contacto: Optional[str] = None


class FornecedorResponse(BaseModel):
    id: int
    nome: str
    localizacao: Optional[str]
    descricao: Optional[str]
    contacto: Optional[str]

    class Config:
        from_attributes = True

