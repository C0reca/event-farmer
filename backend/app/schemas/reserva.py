from pydantic import BaseModel, EmailStr
from datetime import date
from typing import Optional


class ReservaCreate(BaseModel):
    atividade_id: int
    data: date
    n_pessoas: int


class ReservaGuestCreate(BaseModel):
    """Schema para criar reserva sem autenticação (guest)"""
    atividade_id: int
    data: date
    n_pessoas: int
    # Dados da empresa/contato
    nome_empresa: str
    email: EmailStr
    telefone: Optional[str] = None
    nome_contacto: Optional[str] = None
    localizacao: Optional[str] = None


class ReservaResponse(BaseModel):
    id: int
    empresa_id: int
    atividade_id: int
    data: date
    n_pessoas: int
    preco_total: float
    estado: str
    atividade: Optional[dict] = None

    class Config:
        from_attributes = True


class ReservaCancel(BaseModel):
    reserva_id: int

