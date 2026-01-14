from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.models.atividade import Atividade, EstadoAtividade
from app.crud import atividade as crud_atividade, fornecedor as crud_fornecedor
from app.schemas.atividade import AtividadeCreate, AtividadeUpdate, AtividadeResponse, RecomendacaoParams

router = APIRouter(prefix="/atividades", tags=["atividades"])


@router.get("/", response_model=List[AtividadeResponse])
def list_atividades(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Lista todas as atividades"""
    atividades = crud_atividade.get_atividades(db, skip=skip, limit=limit)
    return atividades


@router.get("/{atividade_id}", response_model=AtividadeResponse)
def get_atividade(atividade_id: int, db: Session = Depends(get_db)):
    """Obtém atividade por ID"""
    atividade = crud_atividade.get_atividade(db, atividade_id)
    if not atividade:
        raise HTTPException(status_code=404, detail="Atividade not found")
    return atividade


@router.post("/", response_model=AtividadeResponse)
def create_atividade(atividade: AtividadeCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Cria nova atividade"""
    if current_user.tipo.value != "fornecedor":
        raise HTTPException(status_code=403, detail="Only fornecedores can create atividades")
    
    fornecedor = crud_fornecedor.get_fornecedor_by_user_id(db, current_user.id)
    if not fornecedor:
        raise HTTPException(status_code=404, detail="Fornecedor profile not found")
    
    return crud_atividade.create_atividade(db, atividade, fornecedor.id)


@router.put("/{atividade_id}", response_model=AtividadeResponse)
def update_atividade(atividade_id: int, atividade_update: AtividadeUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Atualiza atividade"""
    atividade = crud_atividade.get_atividade(db, atividade_id)
    if not atividade:
        raise HTTPException(status_code=404, detail="Atividade not found")
    
    fornecedor = crud_fornecedor.get_fornecedor_by_user_id(db, current_user.id)
    if not fornecedor or atividade.fornecedor_id != fornecedor.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    return crud_atividade.update_atividade(db, atividade_id, atividade_update)


@router.delete("/{atividade_id}")
def delete_atividade(atividade_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Elimina atividade"""
    atividade = crud_atividade.get_atividade(db, atividade_id)
    if not atividade:
        raise HTTPException(status_code=404, detail="Atividade not found")
    
    fornecedor = crud_fornecedor.get_fornecedor_by_user_id(db, current_user.id)
    if not fornecedor or atividade.fornecedor_id != fornecedor.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    crud_atividade.delete_atividade(db, atividade_id)
    return {"message": "Atividade deleted successfully"}


@router.get("/recomendadas/list", response_model=List[AtividadeResponse])
def get_atividades_recomendadas(params: RecomendacaoParams, db: Session = Depends(get_db)):
    """Obtém atividades recomendadas baseado em critérios"""
    atividades = crud_atividade.get_atividades_recomendadas(
        db,
        n_pessoas=params.n_pessoas,
        orcamento=params.orcamento,
        localizacao=params.localizacao,
        tipo_empresa=params.tipo_empresa
    )
    return atividades


@router.post("/recomendadas", response_model=List[AtividadeResponse])
def post_atividades_recomendadas(params: RecomendacaoParams, db: Session = Depends(get_db)):
    """Obtém atividades recomendadas (POST)"""
    atividades = crud_atividade.get_atividades_recomendadas(
        db,
        n_pessoas=params.n_pessoas,
        orcamento=params.orcamento,
        localizacao=params.localizacao,
        tipo_empresa=params.tipo_empresa,
        categoria=params.categoria,
        clima=params.clima,
        duracao_max=params.duracao_max
    )
    return atividades


@router.post("/{atividade_id}/aprovar")
def aprovar_atividade(atividade_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Aprova uma atividade (apenas admin)"""
    if current_user.tipo.value != "admin":
        raise HTTPException(status_code=403, detail="Only admins can approve atividades")
    
    atividade = crud_atividade.get_atividade(db, atividade_id)
    if not atividade:
        raise HTTPException(status_code=404, detail="Atividade not found")
    
    atividade.aprovada = True
    atividade.estado = EstadoAtividade.APROVADA
    db.commit()
    db.refresh(atividade)
    
    return {"message": "Atividade aprovada com sucesso", "atividade_id": atividade_id}


@router.post("/{atividade_id}/rejeitar")
def rejeitar_atividade(atividade_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Rejeita uma atividade (apenas admin)"""
    if current_user.tipo.value != "admin":
        raise HTTPException(status_code=403, detail="Only admins can reject atividades")
    
    atividade = crud_atividade.get_atividade(db, atividade_id)
    if not atividade:
        raise HTTPException(status_code=404, detail="Atividade not found")
    
    atividade.aprovada = False
    atividade.estado = EstadoAtividade.REJEITADA
    db.commit()
    db.refresh(atividade)
    
    return {"message": "Atividade rejeitada", "atividade_id": atividade_id}


@router.get("/pendentes/list", response_model=List[AtividadeResponse])
def list_atividades_pendentes(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Lista atividades pendentes de aprovação (apenas admin)"""
    if current_user.tipo.value != "admin":
        raise HTTPException(status_code=403, detail="Only admins can view pending atividades")
    
    atividades = db.query(Atividade).filter(Atividade.aprovada == False).all()
    return atividades

