from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.crud import reserva as crud_reserva, empresa as crud_empresa
from app.schemas.reserva import ReservaCreate, ReservaResponse, ReservaCancel

router = APIRouter(prefix="/reservas", tags=["reservas"])


@router.post("/", response_model=ReservaResponse)
def create_reserva(reserva: ReservaCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Cria nova reserva"""
    if current_user.tipo.value != "empresa":
        raise HTTPException(status_code=403, detail="Only empresas can create reservas")
    
    empresa = crud_empresa.get_empresa_by_user_id(db, current_user.id)
    if not empresa:
        raise HTTPException(status_code=404, detail="Empresa profile not found")
    
    db_reserva = crud_reserva.create_reserva(db, reserva, empresa.id)
    if not db_reserva:
        raise HTTPException(status_code=400, detail="Could not create reserva. Check capacidade and atividade exists.")
    
    # Adicionar info da atividade
    atividade_info = {
        "id": db_reserva.atividade.id,
        "nome": db_reserva.atividade.nome,
        "tipo": db_reserva.atividade.tipo,
        "preco_por_pessoa": db_reserva.atividade.preco_por_pessoa
    }
    
    reserva_dict = {
        "id": db_reserva.id,
        "empresa_id": db_reserva.empresa_id,
        "atividade_id": db_reserva.atividade_id,
        "data": db_reserva.data,
        "n_pessoas": db_reserva.n_pessoas,
        "preco_total": db_reserva.preco_total,
        "estado": db_reserva.estado.value,
        "atividade": atividade_info
    }
    
    return reserva_dict


@router.get("/{empresa_id}", response_model=List[ReservaResponse])
def list_reservas_empresa(empresa_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Lista reservas de uma empresa"""
    empresa = crud_empresa.get_empresa(db, empresa_id)
    if not empresa:
        raise HTTPException(status_code=404, detail="Empresa not found")
    
    if empresa.user_id != current_user.id and current_user.tipo.value != "fornecedor":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    reservas = crud_reserva.get_reservas_by_empresa(db, empresa_id)
    
    # Adicionar info das atividades
    result = []
    for reserva in reservas:
        atividade_info = {
            "id": reserva.atividade.id,
            "nome": reserva.atividade.nome,
            "tipo": reserva.atividade.tipo,
            "preco_por_pessoa": reserva.atividade.preco_por_pessoa
        }
        result.append({
            "id": reserva.id,
            "empresa_id": reserva.empresa_id,
            "atividade_id": reserva.atividade_id,
            "data": reserva.data,
            "n_pessoas": reserva.n_pessoas,
            "preco_total": reserva.preco_total,
            "estado": reserva.estado.value,
            "atividade": atividade_info
        })
    
    return result


@router.post("/cancelar", response_model=ReservaResponse)
def cancelar_reserva(cancel: ReservaCancel, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Cancela uma reserva"""
    reserva = crud_reserva.get_reserva(db, cancel.reserva_id)
    if not reserva:
        raise HTTPException(status_code=404, detail="Reserva not found")
    
    empresa = crud_empresa.get_empresa(db, reserva.empresa_id)
    if empresa.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    db_reserva = crud_reserva.cancelar_reserva(db, cancel.reserva_id)
    
    atividade_info = {
        "id": db_reserva.atividade.id,
        "nome": db_reserva.atividade.nome,
        "tipo": db_reserva.atividade.tipo,
        "preco_por_pessoa": db_reserva.atividade.preco_por_pessoa
    }
    
    return {
        "id": db_reserva.id,
        "empresa_id": db_reserva.empresa_id,
        "atividade_id": db_reserva.atividade_id,
        "data": db_reserva.data,
        "n_pessoas": db_reserva.n_pessoas,
        "preco_total": db_reserva.preco_total,
        "estado": db_reserva.estado.value,
        "atividade": atividade_info
    }


@router.get("/fornecedor/{fornecedor_id}", response_model=List[ReservaResponse])
def list_reservas_fornecedor(fornecedor_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Lista reservas de um fornecedor"""
    from app.crud import fornecedor as crud_fornecedor
    
    fornecedor = crud_fornecedor.get_fornecedor(db, fornecedor_id)
    if not fornecedor:
        raise HTTPException(status_code=404, detail="Fornecedor not found")
    
    # Verificar se é o próprio fornecedor ou admin
    if current_user.tipo.value != "admin":
        fornecedor_user = crud_fornecedor.get_fornecedor_by_user_id(db, current_user.id)
        if not fornecedor_user or fornecedor_user.id != fornecedor_id:
            raise HTTPException(status_code=403, detail="Not authorized")
    
    # Buscar reservas das atividades do fornecedor
    from app.models.reserva import Reserva
    from app.models.atividade import Atividade
    
    reservas = db.query(Reserva).join(Atividade).filter(
        Atividade.fornecedor_id == fornecedor_id
    ).all()
    
    result = []
    for reserva in reservas:
        atividade_info = {
            "id": reserva.atividade.id,
            "nome": reserva.atividade.nome,
            "tipo": reserva.atividade.tipo,
            "preco_por_pessoa": reserva.atividade.preco_por_pessoa
        }
        result.append({
            "id": reserva.id,
            "empresa_id": reserva.empresa_id,
            "atividade_id": reserva.atividade_id,
            "data": reserva.data,
            "n_pessoas": reserva.n_pessoas,
            "preco_total": reserva.preco_total,
            "estado": reserva.estado.value,
            "atividade": atividade_info
        })
    
    return result


@router.post("/{reserva_id}/aceitar", response_model=ReservaResponse)
def aceitar_reserva(reserva_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Aceita uma reserva (fornecedor)"""
    from app.crud import fornecedor as crud_fornecedor
    from app.models.reserva import Reserva, EstadoReserva
    
    reserva = crud_reserva.get_reserva(db, reserva_id)
    if not reserva:
        raise HTTPException(status_code=404, detail="Reserva not found")
    
    # Verificar se o fornecedor é dono da atividade
    fornecedor = crud_fornecedor.get_fornecedor_by_user_id(db, current_user.id)
    if not fornecedor or reserva.atividade.fornecedor_id != fornecedor.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    reserva.estado = EstadoReserva.CONFIRMADA
    db.commit()
    db.refresh(reserva)
    
    atividade_info = {
        "id": reserva.atividade.id,
        "nome": reserva.atividade.nome,
        "tipo": reserva.atividade.tipo,
        "preco_por_pessoa": reserva.atividade.preco_por_pessoa
    }
    
    return {
        "id": reserva.id,
        "empresa_id": reserva.empresa_id,
        "atividade_id": reserva.atividade_id,
        "data": reserva.data,
        "n_pessoas": reserva.n_pessoas,
        "preco_total": reserva.preco_total,
        "estado": reserva.estado.value,
        "atividade": atividade_info
    }


@router.post("/{reserva_id}/recusar", response_model=ReservaResponse)
def recusar_reserva(reserva_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Recusa uma reserva (fornecedor)"""
    from app.crud import fornecedor as crud_fornecedor
    from app.models.reserva import Reserva, EstadoReserva
    
    reserva = crud_reserva.get_reserva(db, reserva_id)
    if not reserva:
        raise HTTPException(status_code=404, detail="Reserva not found")
    
    # Verificar se o fornecedor é dono da atividade
    fornecedor = crud_fornecedor.get_fornecedor_by_user_id(db, current_user.id)
    if not fornecedor or reserva.atividade.fornecedor_id != fornecedor.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    reserva.estado = EstadoReserva.RECUSADA
    db.commit()
    db.refresh(reserva)
    
    atividade_info = {
        "id": reserva.atividade.id,
        "nome": reserva.atividade.nome,
        "tipo": reserva.atividade.tipo,
        "preco_por_pessoa": reserva.atividade.preco_por_pessoa
    }
    
    return {
        "id": reserva.id,
        "empresa_id": reserva.empresa_id,
        "atividade_id": reserva.atividade_id,
        "data": reserva.data,
        "n_pessoas": reserva.n_pessoas,
        "preco_total": reserva.preco_total,
        "estado": reserva.estado.value,
        "atividade": atividade_info
    }

