from pydantic import BaseModel
from typing import Optional


class MensagemCreate(BaseModel):
    reserva_id: int
    destinatario_id: int
    conteudo: str


class MensagemResponse(BaseModel):
    id: int
    reserva_id: int
    remetente_id: int
    destinatario_id: int
    conteudo: str
    lida: bool
    data_criacao: str
    remetente_nome: Optional[str] = None
    
    class Config:
        from_attributes = True
