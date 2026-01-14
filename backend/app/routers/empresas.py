from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.crud import empresa as crud_empresa
from app.schemas.empresa import EmpresaCreate, EmpresaUpdate, EmpresaResponse

router = APIRouter(prefix="/empresas", tags=["empresas"])


@router.get("/", response_model=List[EmpresaResponse])
def list_empresas(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Lista todas as empresas"""
    empresas = crud_empresa.get_empresas(db, skip=skip, limit=limit)
    return empresas


@router.get("/me", response_model=EmpresaResponse)
def get_my_empresa(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Obtém empresa do utilizador autenticado"""
    if current_user.tipo.value != "empresa":
        raise HTTPException(status_code=403, detail="Only empresas can access this endpoint")
    
    empresa = crud_empresa.get_empresa_by_user_id(db, current_user.id)
    if not empresa:
        raise HTTPException(status_code=404, detail="Empresa profile not found")
    return empresa


@router.get("/{empresa_id}", response_model=EmpresaResponse)
def get_empresa(empresa_id: int, db: Session = Depends(get_db)):
    """Obtém empresa por ID"""
    empresa = crud_empresa.get_empresa(db, empresa_id)
    if not empresa:
        raise HTTPException(status_code=404, detail="Empresa not found")
    return empresa


@router.post("/", response_model=EmpresaResponse)
def create_empresa(empresa: EmpresaCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Cria nova empresa"""
    if current_user.tipo.value != "empresa":
        raise HTTPException(status_code=403, detail="Only empresas can create empresa profile")
    
    # Verificar se já tem empresa criada
    existing = crud_empresa.get_empresa_by_user_id(db, current_user.id)
    if existing:
        raise HTTPException(status_code=400, detail="Empresa profile already exists")
    
    return crud_empresa.create_empresa(db, empresa, current_user.id)


@router.put("/{empresa_id}", response_model=EmpresaResponse)
def update_empresa(empresa_id: int, empresa_update: EmpresaUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Atualiza empresa"""
    empresa = crud_empresa.get_empresa(db, empresa_id)
    if not empresa:
        raise HTTPException(status_code=404, detail="Empresa not found")
    
    if empresa.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    return crud_empresa.update_empresa(db, empresa_id, empresa_update)


@router.delete("/{empresa_id}")
def delete_empresa(empresa_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Elimina empresa"""
    empresa = crud_empresa.get_empresa(db, empresa_id)
    if not empresa:
        raise HTTPException(status_code=404, detail="Empresa not found")
    
    if empresa.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    crud_empresa.delete_empresa(db, empresa_id)
    return {"message": "Empresa deleted successfully"}

