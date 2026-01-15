from pydantic import BaseModel
from typing import Optional


class DocumentoCreate(BaseModel):
    reserva_id: int
    nome: str
    url: str
    tipo: Optional[str] = None
    descricao: Optional[str] = None


class DocumentoResponse(BaseModel):
    id: int
    reserva_id: int
    nome: str
    url: str
    tipo: Optional[str]
    descricao: Optional[str]
    uploaded_by_id: int
    data_upload: str
    uploaded_by_nome: Optional[str] = None
    
    class Config:
        from_attributes = True
