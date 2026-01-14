from pydantic import BaseModel
from datetime import date
from typing import Optional, List


class ItinerarioCreate(BaseModel):
    data: date
    atividades_ids: List[int]
    restaurante_sugerido: Optional[str] = None


class ItinerarioResponse(BaseModel):
    id: int
    empresa_id: int
    data: date
    atividades: Optional[str]  # JSON string
    restaurante_sugerido: Optional[str]

    class Config:
        from_attributes = True

