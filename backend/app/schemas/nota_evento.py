from pydantic import BaseModel
from typing import Optional


class NotaEventoCreate(BaseModel):
    reserva_id: int
    titulo: Optional[str] = None
    conteudo: str


class NotaEventoUpdate(BaseModel):
    titulo: Optional[str] = None
    conteudo: Optional[str] = None


class NotaEventoResponse(BaseModel):
    id: int
    reserva_id: int
    titulo: Optional[str]
    conteudo: str
    criado_por_id: int
    data_criacao: str
    data_atualizacao: str
    criado_por_nome: Optional[str] = None
    
    class Config:
        from_attributes = True
