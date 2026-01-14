from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.crud import avaliacao as crud_avaliacao, empresa as crud_empresa
from app.schemas.avaliacao import AvaliacaoCreate, AvaliacaoResponse

router = APIRouter(prefix="/avaliacoes", tags=["avaliacoes"])


@router.post("/", response_model=AvaliacaoResponse)
def create_avaliacao(avaliacao: AvaliacaoCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Cria nova avaliação"""
    if current_user.tipo.value != "empresa":
        raise HTTPException(status_code=403, detail="Only empresas can create avaliacoes")
    
    empresa = crud_empresa.get_empresa_by_user_id(db, current_user.id)
    if not empresa:
        raise HTTPException(status_code=404, detail="Empresa profile not found")
    
    # Validar rating
    if avaliacao.rating < 1 or avaliacao.rating > 5:
        raise HTTPException(status_code=400, detail="Rating must be between 1 and 5")
    
    return crud_avaliacao.create_avaliacao(db, avaliacao, empresa.id)


@router.get("/atividade/{atividade_id}", response_model=List[AvaliacaoResponse])
def get_avaliacoes_atividade(atividade_id: int, db: Session = Depends(get_db)):
    """Lista avaliações de uma atividade"""
    return crud_avaliacao.get_avaliacoes_by_atividade(db, atividade_id)


@router.get("/fornecedor/{fornecedor_id}", response_model=List[AvaliacaoResponse])
def get_avaliacoes_fornecedor(fornecedor_id: int, db: Session = Depends(get_db)):
    """Lista avaliações de um fornecedor"""
    return crud_avaliacao.get_avaliacoes_by_fornecedor(db, fornecedor_id)


@router.get("/minhas", response_model=List[AvaliacaoResponse])
def get_my_avaliacoes(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Lista avaliações feitas pela empresa logada"""
    if current_user.tipo.value != "empresa":
        raise HTTPException(status_code=403, detail="Only empresas can access this endpoint")
    
    empresa = crud_empresa.get_empresa_by_user_id(db, current_user.id)
    if not empresa:
        raise HTTPException(status_code=404, detail="Empresa profile not found")
    
    return crud_avaliacao.get_avaliacoes_by_empresa(db, empresa.id)

