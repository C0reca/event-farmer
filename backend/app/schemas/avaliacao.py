from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class AvaliacaoCreate(BaseModel):
    atividade_id: Optional[int] = None
    fornecedor_id: Optional[int] = None
    rating: int  # 1-5
    comentario: Optional[str] = None


class AvaliacaoResponse(BaseModel):
    id: int
    empresa_id: int
    atividade_id: Optional[int]
    fornecedor_id: Optional[int]
    rating: int
    comentario: Optional[str]
    data_criacao: datetime

    class Config:
        from_attributes = True

