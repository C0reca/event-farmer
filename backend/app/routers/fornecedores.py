from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.crud import fornecedor as crud_fornecedor
from app.schemas.fornecedor import FornecedorCreate, FornecedorUpdate, FornecedorResponse

router = APIRouter(prefix="/fornecedores", tags=["fornecedores"])


@router.get("/", response_model=List[FornecedorResponse])
def list_fornecedores(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Lista todos os fornecedores"""
    fornecedores = crud_fornecedor.get_fornecedores(db, skip=skip, limit=limit)
    return fornecedores


@router.get("/me", response_model=FornecedorResponse)
def get_my_fornecedor(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Obtém fornecedor do utilizador autenticado"""
    if current_user.tipo.value != "fornecedor":
        raise HTTPException(status_code=403, detail="Only fornecedores can access this endpoint")
    
    fornecedor = crud_fornecedor.get_fornecedor_by_user_id(db, current_user.id)
    if not fornecedor:
        raise HTTPException(status_code=404, detail="Fornecedor profile not found")
    return fornecedor


@router.get("/{fornecedor_id}", response_model=FornecedorResponse)
def get_fornecedor(fornecedor_id: int, db: Session = Depends(get_db)):
    """Obtém fornecedor por ID"""
    fornecedor = crud_fornecedor.get_fornecedor(db, fornecedor_id)
    if not fornecedor:
        raise HTTPException(status_code=404, detail="Fornecedor not found")
    return fornecedor


@router.post("/", response_model=FornecedorResponse)
def create_fornecedor(fornecedor: FornecedorCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Cria novo fornecedor"""
    if current_user.tipo.value != "fornecedor":
        raise HTTPException(status_code=403, detail="Only fornecedores can create fornecedor profile")
    
    # Verificar se já tem fornecedor criado
    existing = crud_fornecedor.get_fornecedor_by_user_id(db, current_user.id)
    if existing:
        raise HTTPException(status_code=400, detail="Fornecedor profile already exists")
    
    return crud_fornecedor.create_fornecedor(db, fornecedor, current_user.id)


@router.put("/{fornecedor_id}", response_model=FornecedorResponse)
def update_fornecedor(fornecedor_id: int, fornecedor_update: FornecedorUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Atualiza fornecedor"""
    fornecedor = crud_fornecedor.get_fornecedor(db, fornecedor_id)
    if not fornecedor:
        raise HTTPException(status_code=404, detail="Fornecedor not found")
    
    if fornecedor.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    return crud_fornecedor.update_fornecedor(db, fornecedor_id, fornecedor_update)
