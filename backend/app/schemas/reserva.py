from pydantic import BaseModel
from datetime import date
from typing import Optional


class ReservaCreate(BaseModel):
    atividade_id: int
    data: date
    n_pessoas: int


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

