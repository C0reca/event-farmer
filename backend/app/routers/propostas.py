from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.core.dependencies import get_current_user_required
from app.models.user import User
from app.crud import proposta as crud_proposta, fornecedor as crud_fornecedor, empresa as crud_empresa
from app.schemas.proposta import PropostaCreate, PropostaUpdate, PropostaResponse
from app.services.email import email_service

router = APIRouter(prefix="/propostas", tags=["propostas"])


@router.post("/", response_model=PropostaResponse)
def create_proposta(proposta: PropostaCreate, current_user: User = Depends(get_current_user_required), db: Session = Depends(get_db)):
    """Cria nova proposta (fornecedor)"""
    if current_user.tipo.value != "fornecedor":
        raise HTTPException(status_code=403, detail="Only fornecedores can create propostas")
    
    fornecedor = crud_fornecedor.get_fornecedor_by_user_id(db, current_user.id)
    if not fornecedor:
        raise HTTPException(status_code=404, detail="Fornecedor profile not found")
    
    try:
        db_proposta = crud_proposta.create_proposta(db, proposta, fornecedor.id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    
    # Buscar informações relacionadas
    fornecedor_nome = fornecedor.nome
    atividade_nome = None
    if db_proposta.atividade_id:
        from app.models.atividade import Atividade
        atividade = db.query(Atividade).filter(Atividade.id == db_proposta.atividade_id).first()
        if atividade:
            atividade_nome = atividade.nome
    
    # Notificar empresa que recebeu proposta
    from app.crud import rfq as crud_rfq
    rfq = crud_rfq.get_rfq(db, db_proposta.rfq_id)
    if rfq:
        empresa = rfq.empresa
        if empresa and empresa.user:
            proposta_dict = {
                "rfq_id": db_proposta.rfq_id,
                "preco_total": db_proposta.preco_total,
                "preco_por_pessoa": db_proposta.preco_por_pessoa,
                "data_proposta": db_proposta.data_proposta.isoformat()
            }
            email_service.send_proposta_received_notification(
                proposta_dict,
                empresa.user.email,
                fornecedor_nome
            )
    
    return {
        "id": db_proposta.id,
        "rfq_id": db_proposta.rfq_id,
        "fornecedor_id": db_proposta.fornecedor_id,
        "atividade_id": db_proposta.atividade_id,
        "preco_total": db_proposta.preco_total,
        "preco_por_pessoa": db_proposta.preco_por_pessoa,
        "descricao": db_proposta.descricao,
        "extras": db_proposta.extras,
        "condicoes": db_proposta.condicoes,
        "data_proposta": db_proposta.data_proposta,
        "duracao_minutos": db_proposta.duracao_minutos,
        "estado": db_proposta.estado.value,
        "data_criacao": db_proposta.data_criacao.isoformat(),
        "fornecedor_nome": fornecedor_nome,
        "fornecedor_rating": None,  # TODO: calcular rating médio do fornecedor
        "atividade_nome": atividade_nome
    }


@router.get("/rfq/{rfq_id}", response_model=List[PropostaResponse])
def get_propostas_by_rfq(rfq_id: int, current_user: User = Depends(get_current_user_required), db: Session = Depends(get_db)):
    """Lista propostas de um RFQ (empresa)"""
    from app.crud import rfq as crud_rfq
    
    rfq = crud_rfq.get_rfq(db, rfq_id)
    if not rfq:
        raise HTTPException(status_code=404, detail="RFQ not found")
    
    # Verificar permissão
    if current_user.tipo.value == "empresa":
        empresa = crud_empresa.get_empresa_by_user_id(db, current_user.id)
        if not empresa or rfq.empresa_id != empresa.id:
            raise HTTPException(status_code=403, detail="Not authorized")
    elif current_user.tipo.value == "fornecedor":
        raise HTTPException(status_code=403, detail="Fornecedores cannot view all propostas of an RFQ")
    else:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    propostas = crud_proposta.get_propostas_by_rfq(db, rfq_id)
    
    result = []
    for proposta in propostas:
        fornecedor = proposta.fornecedor
        atividade_nome = None
        if proposta.atividade_id:
            atividade = proposta.atividade
            if atividade:
                atividade_nome = atividade.nome
        
        result.append({
            "id": proposta.id,
            "rfq_id": proposta.rfq_id,
            "fornecedor_id": proposta.fornecedor_id,
            "atividade_id": proposta.atividade_id,
            "preco_total": proposta.preco_total,
            "preco_por_pessoa": proposta.preco_por_pessoa,
            "descricao": proposta.descricao,
            "extras": proposta.extras,
            "condicoes": proposta.condicoes,
            "data_proposta": proposta.data_proposta,
            "duracao_minutos": proposta.duracao_minutos,
            "estado": proposta.estado.value,
            "data_criacao": proposta.data_criacao.isoformat(),
            "fornecedor_nome": fornecedor.nome,
            "fornecedor_rating": None,  # TODO: calcular rating
            "atividade_nome": atividade_nome,
            "reserva_id": proposta.reserva.id if proposta.reserva else None
        })
    
    return result


@router.get("/minhas", response_model=List[PropostaResponse])
def get_my_propostas(current_user: User = Depends(get_current_user_required), db: Session = Depends(get_db)):
    """Lista propostas do fornecedor logado"""
    if current_user.tipo.value != "fornecedor":
        raise HTTPException(status_code=403, detail="Only fornecedores can access this endpoint")
    
    fornecedor = crud_fornecedor.get_fornecedor_by_user_id(db, current_user.id)
    if not fornecedor:
        raise HTTPException(status_code=404, detail="Fornecedor profile not found")
    
    propostas = crud_proposta.get_propostas_by_fornecedor(db, fornecedor.id)
    
    result = []
    for proposta in propostas:
        atividade_nome = None
        if proposta.atividade_id:
            atividade = proposta.atividade
            if atividade:
                atividade_nome = atividade.nome
        
        result.append({
            "id": proposta.id,
            "rfq_id": proposta.rfq_id,
            "fornecedor_id": proposta.fornecedor_id,
            "atividade_id": proposta.atividade_id,
            "preco_total": proposta.preco_total,
            "preco_por_pessoa": proposta.preco_por_pessoa,
            "descricao": proposta.descricao,
            "extras": proposta.extras,
            "condicoes": proposta.condicoes,
            "data_proposta": proposta.data_proposta,
            "duracao_minutos": proposta.duracao_minutos,
            "estado": proposta.estado.value,
            "data_criacao": proposta.data_criacao.isoformat(),
            "fornecedor_nome": fornecedor.nome,
            "fornecedor_rating": None,
            "atividade_nome": atividade_nome
        })
    
    return result


@router.post("/{proposta_id}/aceitar", response_model=PropostaResponse)
def aceitar_proposta(proposta_id: int, current_user: User = Depends(get_current_user_required), db: Session = Depends(get_db)):
    """Aceita uma proposta (empresa)"""
    if current_user.tipo.value != "empresa":
        raise HTTPException(status_code=403, detail="Only empresas can accept propostas")
    
    empresa = crud_empresa.get_empresa_by_user_id(db, current_user.id)
    if not empresa:
        raise HTTPException(status_code=404, detail="Empresa profile not found")
    
    proposta = crud_proposta.get_proposta(db, proposta_id)
    if not proposta:
        raise HTTPException(status_code=404, detail="Proposta not found")
    
    # Verificar se o RFQ pertence à empresa
    from app.crud import rfq as crud_rfq
    rfq = crud_rfq.get_rfq(db, proposta.rfq_id)
    if not rfq or rfq.empresa_id != empresa.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    proposta = crud_proposta.aceitar_proposta(db, proposta_id)
    if not proposta:
        raise HTTPException(status_code=400, detail="Could not accept proposta")
    
    fornecedor = proposta.fornecedor
    atividade_nome = None
    if proposta.atividade_id:
        atividade = proposta.atividade
        if atividade:
            atividade_nome = atividade.nome
    
    # Criar reserva automaticamente quando aceita proposta
    from app.crud import reserva as crud_reserva
    from app.schemas.reserva import ReservaCreate
    from app.models.reserva import Reserva, EstadoReserva
    
    # Verificar se já existe reserva para esta proposta
    reserva_existente = db.query(Reserva).filter(
        Reserva.proposta_id == proposta_id
    ).first()
    
    if not reserva_existente:
        # Criar reserva
        reserva_data = ReservaCreate(
            atividade_id=proposta.atividade_id if proposta.atividade_id else None,
            data=proposta.data_proposta,
            n_pessoas=rfq.n_pessoas
        )
        
        # Calcular preço total
        if proposta.atividade_id and atividade:
            preco_total = atividade.preco_por_pessoa * rfq.n_pessoas
        else:
            preco_total = proposta.preco_total
        
        db_reserva = crud_reserva.create_reserva(
            db,
            reserva_data,
            empresa.id,
            preco_total=preco_total,
            proposta_id=proposta_id
        )
    else:
        db_reserva = reserva_existente
    
    # Notificar fornecedor que proposta foi aceite
    if fornecedor and fornecedor.user:
        proposta_dict = {
            "rfq_id": proposta.rfq_id,
            "preco_total": proposta.preco_total,
            "data_proposta": proposta.data_proposta.isoformat()
        }
        email_service.send_proposta_aceite_notification(
            proposta_dict,
            fornecedor.user.email,
            empresa.nome
        )
    
    return {
        "id": proposta.id,
        "rfq_id": proposta.rfq_id,
        "fornecedor_id": proposta.fornecedor_id,
        "atividade_id": proposta.atividade_id,
        "preco_total": proposta.preco_total,
        "preco_por_pessoa": proposta.preco_por_pessoa,
        "descricao": proposta.descricao,
        "extras": proposta.extras,
        "condicoes": proposta.condicoes,
        "data_proposta": proposta.data_proposta,
        "duracao_minutos": proposta.duracao_minutos,
        "estado": proposta.estado.value,
        "data_criacao": proposta.data_criacao.isoformat(),
        "fornecedor_nome": fornecedor.nome,
        "fornecedor_rating": None,
        "atividade_nome": atividade_nome,
        "reserva_id": db_reserva.id if db_reserva else None
    }


@router.post("/{proposta_id}/recusar", response_model=PropostaResponse)
def recusar_proposta(proposta_id: int, current_user: User = Depends(get_current_user_required), db: Session = Depends(get_db)):
    """Recusa uma proposta (empresa)"""
    if current_user.tipo.value != "empresa":
        raise HTTPException(status_code=403, detail="Only empresas can reject propostas")
    
    empresa = crud_empresa.get_empresa_by_user_id(db, current_user.id)
    if not empresa:
        raise HTTPException(status_code=404, detail="Empresa profile not found")
    
    proposta = crud_proposta.get_proposta(db, proposta_id)
    if not proposta:
        raise HTTPException(status_code=404, detail="Proposta not found")
    
    # Verificar se o RFQ pertence à empresa
    from app.crud import rfq as crud_rfq
    rfq = crud_rfq.get_rfq(db, proposta.rfq_id)
    if not rfq or rfq.empresa_id != empresa.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    proposta = crud_proposta.recusar_proposta(db, proposta_id)
    if not proposta:
        raise HTTPException(status_code=400, detail="Could not reject proposta")
    
    fornecedor = proposta.fornecedor
    atividade_nome = None
    if proposta.atividade_id:
        atividade = proposta.atividade
        if atividade:
            atividade_nome = atividade.nome
    
    return {
        "id": proposta.id,
        "rfq_id": proposta.rfq_id,
        "fornecedor_id": proposta.fornecedor_id,
        "atividade_id": proposta.atividade_id,
        "preco_total": proposta.preco_total,
        "preco_por_pessoa": proposta.preco_por_pessoa,
        "descricao": proposta.descricao,
        "extras": proposta.extras,
        "condicoes": proposta.condicoes,
        "data_proposta": proposta.data_proposta,
        "duracao_minutos": proposta.duracao_minutos,
        "estado": proposta.estado.value,
        "data_criacao": proposta.data_criacao.isoformat(),
        "fornecedor_nome": fornecedor.nome,
        "fornecedor_rating": None,
        "atividade_nome": atividade_nome
    }
