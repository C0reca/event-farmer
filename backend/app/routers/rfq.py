from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.core.dependencies import get_current_user_required
from app.models.user import User
from app.crud import rfq as crud_rfq, empresa as crud_empresa
from app.schemas.rfq import RFQCreate, RFQResponse
from app.services.email import email_service

router = APIRouter(prefix="/rfq", tags=["rfq"])


@router.post("/", response_model=RFQResponse)
def create_rfq(rfq: RFQCreate, current_user: User = Depends(get_current_user_required), db: Session = Depends(get_db)):
    """Cria novo RFQ (Request for Quote)"""
    if current_user.tipo.value != "empresa":
        raise HTTPException(status_code=403, detail="Only empresas can create RFQs")
    
    empresa = crud_empresa.get_empresa_by_user_id(db, current_user.id)
    if not empresa:
        raise HTTPException(status_code=404, detail="Empresa profile not found")
    
    db_rfq = crud_rfq.create_rfq(db, rfq, empresa.id)
    
    # Contar número de propostas (será 0 inicialmente)
    from app.crud import proposta as crud_proposta
    num_propostas = len(crud_proposta.get_propostas_by_rfq(db, db_rfq.id))
    
    # Enviar notificação por email para a empresa
    rfq_dict = {
        "id": db_rfq.id,
        "n_pessoas": db_rfq.n_pessoas,
        "data_preferida": db_rfq.data_preferida.isoformat(),
        "localizacao": db_rfq.localizacao,
        "orcamento_max": db_rfq.orcamento_max,
        "objetivo": db_rfq.objetivo
    }
    email_service.send_rfq_created_notification(rfq_dict, current_user.email)
    
    # Notificar fornecedores (em background - por agora apenas log)
    # TODO: Buscar fornecedores relevantes e notificar
    # from app.crud import fornecedor as crud_fornecedor
    # fornecedores = crud_fornecedor.get_fornecedores_relevantes(db, db_rfq)
    # for fornecedor in fornecedores:
    #     email_service.send_rfq_received_notification(rfq_dict, fornecedor.user.email)
    
    return {
        "id": db_rfq.id,
        "empresa_id": db_rfq.empresa_id,
        "n_pessoas": db_rfq.n_pessoas,
        "data_preferida": db_rfq.data_preferida,
        "data_alternativa": db_rfq.data_alternativa,
        "localizacao": db_rfq.localizacao,
        "raio_km": db_rfq.raio_km,
        "orcamento_max": db_rfq.orcamento_max,
        "objetivo": db_rfq.objetivo,
        "preferencias": db_rfq.preferencias,
        "categoria_preferida": db_rfq.categoria_preferida,
        "clima_preferido": db_rfq.clima_preferido,
        "duracao_max_minutos": db_rfq.duracao_max_minutos,
        "estado": db_rfq.estado.value,
        "data_criacao": db_rfq.data_criacao.isoformat(),
        "num_propostas": num_propostas
    }


@router.get("/", response_model=List[RFQResponse])
def list_my_rfqs(current_user: User = Depends(get_current_user_required), db: Session = Depends(get_db)):
    """Lista RFQs da empresa logada"""
    if current_user.tipo.value != "empresa":
        raise HTTPException(status_code=403, detail="Only empresas can access this endpoint")
    
    empresa = crud_empresa.get_empresa_by_user_id(db, current_user.id)
    if not empresa:
        raise HTTPException(status_code=404, detail="Empresa profile not found")
    
    rfqs = crud_rfq.get_rfqs_by_empresa(db, empresa.id)
    
    from app.crud import proposta as crud_proposta
    result = []
    for rfq in rfqs:
        num_propostas = len(crud_proposta.get_propostas_by_rfq(db, rfq.id))
        result.append({
            "id": rfq.id,
            "empresa_id": rfq.empresa_id,
            "n_pessoas": rfq.n_pessoas,
            "data_preferida": rfq.data_preferida,
            "data_alternativa": rfq.data_alternativa,
            "localizacao": rfq.localizacao,
            "raio_km": rfq.raio_km,
            "orcamento_max": rfq.orcamento_max,
            "objetivo": rfq.objetivo,
            "preferencias": rfq.preferencias,
            "categoria_preferida": rfq.categoria_preferida,
            "clima_preferido": rfq.clima_preferido,
            "duracao_max_minutos": rfq.duracao_max_minutos,
            "estado": rfq.estado.value,
            "data_criacao": rfq.data_criacao.isoformat(),
            "num_propostas": num_propostas
        })
    
    return result


@router.get("/{rfq_id}", response_model=RFQResponse)
def get_rfq(rfq_id: int, current_user: User = Depends(get_current_user_required), db: Session = Depends(get_db)):
    """Obtém detalhes de um RFQ"""
    rfq = crud_rfq.get_rfq(db, rfq_id)
    if not rfq:
        raise HTTPException(status_code=404, detail="RFQ not found")
    
    # Verificar permissão
    if current_user.tipo.value == "empresa":
        empresa = crud_empresa.get_empresa_by_user_id(db, current_user.id)
        if not empresa or rfq.empresa_id != empresa.id:
            raise HTTPException(status_code=403, detail="Not authorized")
    elif current_user.tipo.value == "fornecedor":
        # Fornecedor pode ver RFQs abertos
        if rfq.estado.value != "aberto":
            raise HTTPException(status_code=403, detail="RFQ is not open")
    else:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    from app.crud import proposta as crud_proposta
    num_propostas = len(crud_proposta.get_propostas_by_rfq(db, rfq.id))
    
    return {
        "id": rfq.id,
        "empresa_id": rfq.empresa_id,
        "n_pessoas": rfq.n_pessoas,
        "data_preferida": rfq.data_preferida,
        "data_alternativa": rfq.data_alternativa,
        "localizacao": rfq.localizacao,
        "raio_km": rfq.raio_km,
        "orcamento_max": rfq.orcamento_max,
        "objetivo": rfq.objetivo,
        "preferencias": rfq.preferencias,
        "categoria_preferida": rfq.categoria_preferida,
        "clima_preferido": rfq.clima_preferido,
        "duracao_max_minutos": rfq.duracao_max_minutos,
        "estado": rfq.estado.value,
        "data_criacao": rfq.data_criacao.isoformat(),
        "num_propostas": num_propostas
    }


@router.get("/fornecedor/disponiveis", response_model=List[RFQResponse])
def list_rfqs_disponiveis(current_user: User = Depends(get_current_user_required), db: Session = Depends(get_db)):
    """Lista RFQs disponíveis para fornecedores responderem"""
    if current_user.tipo.value != "fornecedor":
        raise HTTPException(status_code=403, detail="Only fornecedores can access this endpoint")
    
    from app.crud import fornecedor as crud_fornecedor
    fornecedor = crud_fornecedor.get_fornecedor_by_user_id(db, current_user.id)
    if not fornecedor:
        raise HTTPException(status_code=404, detail="Fornecedor profile not found")
    
    # Por agora, retorna todos os RFQs abertos
    # Futuramente pode filtrar por localização, categoria, etc.
    rfqs = crud_rfq.get_rfqs_abertos(db)
    
    from app.crud import proposta as crud_proposta
    result = []
    for rfq in rfqs:
        # Verificar se já enviou proposta
        propostas = crud_proposta.get_propostas_by_rfq(db, rfq.id)
        ja_respondeu = any(p.fornecedor_id == fornecedor.id for p in propostas)
        
        if not ja_respondeu:  # Só mostrar se ainda não respondeu
            num_propostas = len(propostas)
            result.append({
                "id": rfq.id,
                "empresa_id": rfq.empresa_id,
                "n_pessoas": rfq.n_pessoas,
                "data_preferida": rfq.data_preferida,
                "data_alternativa": rfq.data_alternativa,
                "localizacao": rfq.localizacao,
                "raio_km": rfq.raio_km,
                "orcamento_max": rfq.orcamento_max,
                "objetivo": rfq.objetivo,
                "preferencias": rfq.preferencias,
                "categoria_preferida": rfq.categoria_preferida,
                "clima_preferido": rfq.clima_preferido,
                "duracao_max_minutos": rfq.duracao_max_minutos,
                "estado": rfq.estado.value,
                "data_criacao": rfq.data_criacao.isoformat(),
                "num_propostas": num_propostas
            })
    
    return result


@router.post("/{rfq_id}/cancelar", response_model=RFQResponse)
def cancelar_rfq(rfq_id: int, current_user: User = Depends(get_current_user_required), db: Session = Depends(get_db)):
    """Cancela um RFQ"""
    if current_user.tipo.value != "empresa":
        raise HTTPException(status_code=403, detail="Only empresas can cancel RFQs")
    
    empresa = crud_empresa.get_empresa_by_user_id(db, current_user.id)
    if not empresa:
        raise HTTPException(status_code=404, detail="Empresa profile not found")
    
    rfq = crud_rfq.get_rfq(db, rfq_id)
    if not rfq or rfq.empresa_id != empresa.id:
        raise HTTPException(status_code=404, detail="RFQ not found or not authorized")
    
    rfq = crud_rfq.cancelar_rfq(db, rfq_id)
    
    from app.crud import proposta as crud_proposta
    num_propostas = len(crud_proposta.get_propostas_by_rfq(db, rfq.id))
    
    return {
        "id": rfq.id,
        "empresa_id": rfq.empresa_id,
        "n_pessoas": rfq.n_pessoas,
        "data_preferida": rfq.data_preferida,
        "data_alternativa": rfq.data_alternativa,
        "localizacao": rfq.localizacao,
        "raio_km": rfq.raio_km,
        "orcamento_max": rfq.orcamento_max,
        "objetivo": rfq.objetivo,
        "preferencias": rfq.preferencias,
        "categoria_preferida": rfq.categoria_preferida,
        "clima_preferido": rfq.clima_preferido,
        "duracao_max_minutos": rfq.duracao_max_minutos,
        "estado": rfq.estado.value,
        "data_criacao": rfq.data_criacao.isoformat(),
        "num_propostas": num_propostas
    }
