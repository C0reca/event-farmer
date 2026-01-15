from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.core.dependencies import get_current_user, get_current_user_required
from app.core.security import get_password_hash
from app.models.user import User, TipoUsuario
from app.crud import reserva as crud_reserva, empresa as crud_empresa
from app.schemas.reserva import ReservaCreate, ReservaGuestCreate, ReservaResponse, ReservaCancel
from app.services.email import email_service

router = APIRouter(prefix="/reservas", tags=["reservas"])


@router.post("/", response_model=ReservaResponse)
def create_reserva(
    reserva: ReservaCreate, 
    current_user: User = Depends(get_current_user_required), 
    db: Session = Depends(get_db)
):
    """Cria nova reserva (requer autenticação)"""
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


@router.post("/guest", response_model=ReservaResponse)
def create_reserva_guest(reserva_guest: ReservaGuestCreate, db: Session = Depends(get_db)):
    """Cria reserva sem autenticação (guest) - cria empresa temporária se necessário"""
    from app.models.empresa import Empresa
    
    # Verificar se já existe uma empresa guest com este email
    # Buscar por user com este email e tipo empresa
    user_guest = db.query(User).filter(
        User.email == reserva_guest.email,
        User.tipo == TipoUsuario.EMPRESA
    ).first()
    
    if user_guest:
        # Usar empresa existente
        empresa = crud_empresa.get_empresa_by_user_id(db, user_guest.id)
        if not empresa:
            # Criar empresa se não existir
            from app.schemas.empresa import EmpresaCreate
            empresa_data = EmpresaCreate(
                nome=reserva_guest.nome_empresa,
                localizacao=reserva_guest.localizacao,
                setor=None,
                n_funcionarios=None,
                orcamento_medio=None,
                preferencia_atividades=None
            )
            empresa = crud_empresa.create_empresa(db, empresa_data, user_guest.id)
    else:
        # Criar user guest e empresa
        user_guest = User(
            nome=reserva_guest.nome_empresa,
            email=reserva_guest.email,
            password=get_password_hash("guest_temp_password"),  # Password temporário
            tipo=TipoUsuario.EMPRESA
        )
        db.add(user_guest)
        db.commit()
        db.refresh(user_guest)
        
        # Criar empresa
        from app.schemas.empresa import EmpresaCreate
        empresa_data = EmpresaCreate(
            nome=reserva_guest.nome_empresa,
            localizacao=reserva_guest.localizacao,
            setor=None,
            n_funcionarios=None,
            orcamento_medio=None,
            preferencia_atividades=None
        )
        empresa = crud_empresa.create_empresa(db, empresa_data, user_guest.id)
    
    # Criar reserva
    reserva_data = ReservaCreate(
        atividade_id=reserva_guest.atividade_id,
        data=reserva_guest.data,
        n_pessoas=reserva_guest.n_pessoas
    )
    
    db_reserva = crud_reserva.create_reserva(db, reserva_data, empresa.id)
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
    
    # Notificar empresa que reserva foi confirmada
    empresa = reserva.empresa
    if empresa and empresa.user:
        reserva_dict = {
            "atividade_nome": reserva.atividade.nome,
            "data": reserva.data.isoformat(),
            "n_pessoas": reserva.n_pessoas,
            "preco_total": reserva.preco_total
        }
        fornecedor_nome = reserva.atividade.fornecedor.nome if reserva.atividade.fornecedor else "Fornecedor"
        email_service.send_reserva_confirmada_notification(
            reserva_dict,
            empresa.user.email,
            fornecedor_nome
        )
    
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

