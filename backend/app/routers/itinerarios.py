from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import json
from app.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.crud import itinerario as crud_itinerario, empresa as crud_empresa
from app.schemas.itinerario import ItinerarioCreate, ItinerarioResponse

router = APIRouter(prefix="/itinerarios", tags=["itinerarios"])


@router.post("/gerar", response_model=ItinerarioResponse)
def gerar_itinerario(itinerario: ItinerarioCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Gera novo itinerário"""
    if current_user.tipo.value != "empresa":
        raise HTTPException(status_code=403, detail="Only empresas can generate itinerarios")
    
    empresa = crud_empresa.get_empresa_by_user_id(db, current_user.id)
    if not empresa:
        raise HTTPException(status_code=404, detail="Empresa profile not found")
    
    db_itinerario = crud_itinerario.create_itinerario(db, itinerario, empresa.id)
    
    return db_itinerario


@router.get("/{empresa_id}", response_model=List[ItinerarioResponse])
def list_itinerarios_empresa(empresa_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Lista itinerários de uma empresa"""
    empresa = crud_empresa.get_empresa(db, empresa_id)
    if not empresa:
        raise HTTPException(status_code=404, detail="Empresa not found")
    
    if empresa.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    return crud_itinerario.get_itinerarios_by_empresa(db, empresa_id)

