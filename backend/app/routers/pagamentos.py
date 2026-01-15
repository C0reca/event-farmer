"""
Router para gestão de pagamentos
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.core.dependencies import get_current_user_required
from app.models.user import User
from app.crud import (
    reserva as crud_reserva,
    empresa as crud_empresa,
    pagamento as crud_pagamento
)
from app.schemas.pagamento import (
    PagamentoCreate,
    PagamentoCartaoCreate,
    PagamentoMBWayCreate,
    PagamentoResponse,
    PagamentoConfirmar
)
from app.services.payment_gateway import payment_gateway
from app.models.pagamento import EstadoPagamento
import json

router = APIRouter(prefix="/pagamentos", tags=["pagamentos"])


@router.post("/", response_model=PagamentoResponse)
def create_pagamento(
    pagamento_data: PagamentoCreate,
    current_user: User = Depends(get_current_user_required),
    db: Session = Depends(get_db)
):
    """Cria novo pagamento para uma reserva"""
    # Verificar se usuário é empresa
    if current_user.tipo.value != "empresa":
        raise HTTPException(status_code=403, detail="Only empresas can create payments")
    
    # Buscar empresa
    empresa = crud_empresa.get_empresa_by_user_id(db, current_user.id)
    if not empresa:
        raise HTTPException(status_code=404, detail="Empresa not found")
    
    # Verificar reserva
    reserva = crud_reserva.get_reserva(db, pagamento_data.reserva_id)
    if not reserva:
        raise HTTPException(status_code=404, detail="Reserva not found")
    
    # Verificar se reserva pertence à empresa
    if reserva.empresa_id != empresa.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Verificar se já existe pagamento
    pagamento_existente = crud_pagamento.get_pagamento_by_reserva(db, pagamento_data.reserva_id)
    if pagamento_existente:
        raise HTTPException(status_code=400, detail="Payment already exists for this reservation")
    
    # Criar pagamento
    db_pagamento = crud_pagamento.create_pagamento(
        db,
        pagamento_data,
        reserva.preco_total
    )
    
    return {
        "id": db_pagamento.id,
        "reserva_id": db_pagamento.reserva_id,
        "valor": db_pagamento.valor,
        "metodo": db_pagamento.metodo.value,
        "estado": db_pagamento.estado.value,
        "gateway_payment_id": db_pagamento.gateway_payment_id,
        "gateway_transaction_id": db_pagamento.gateway_transaction_id,
        "descricao": db_pagamento.descricao,
        "email_fatura": db_pagamento.email_fatura,
        "data_criacao": db_pagamento.data_criacao.isoformat(),
        "data_atualizacao": db_pagamento.data_atualizacao.isoformat(),
        "data_conclusao": db_pagamento.data_conclusao.isoformat() if db_pagamento.data_conclusao else None
    }


@router.post("/cartao", response_model=dict)
def create_pagamento_cartao(
    pagamento_data: PagamentoCartaoCreate,
    current_user: User = Depends(get_current_user_required),
    db: Session = Depends(get_db)
):
    """Cria pagamento com cartão (via gateway)"""
    if current_user.tipo.value != "empresa":
        raise HTTPException(status_code=403, detail="Only empresas can create payments")
    
    empresa = crud_empresa.get_empresa_by_user_id(db, current_user.id)
    if not empresa:
        raise HTTPException(status_code=404, detail="Empresa not found")
    
    reserva = crud_reserva.get_reserva(db, pagamento_data.reserva_id)
    if not reserva:
        raise HTTPException(status_code=404, detail="Reserva not found")
    
    if reserva.empresa_id != empresa.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Criar pagamento no banco
    pagamento_create = PagamentoCreate(
        reserva_id=pagamento_data.reserva_id,
        metodo="cartao",
        email_fatura=pagamento_data.email_fatura,
        descricao=pagamento_data.descricao or f"Pagamento reserva #{reserva.id}"
    )
    
    db_pagamento = crud_pagamento.create_pagamento(
        db,
        pagamento_create,
        reserva.preco_total
    )
    
    # Criar payment intent no gateway
    payment_intent = payment_gateway.create_payment_intent(
        amount=reserva.preco_total,
        currency="eur",
        metadata={
            "reserva_id": reserva.id,
            "empresa_id": empresa.id,
            "pagamento_id": db_pagamento.id
        },
        payment_method="card"
    )
    
    # Atualizar pagamento com gateway info
    crud_pagamento.update_pagamento_status(
        db,
        db_pagamento.id,
        EstadoPagamento.PROCESSANDO,
        gateway_payment_id=payment_intent.get("payment_intent_id"),
        gateway_response=payment_intent
    )
    
    return {
        "pagamento_id": db_pagamento.id,
        "payment_intent_id": payment_intent.get("payment_intent_id"),
        "client_secret": payment_intent.get("client_secret"),
        "status": payment_intent.get("status"),
        "gateway": payment_intent.get("gateway"),
        "public_key": payment_gateway.stripe_public_key  # Para Stripe no frontend
    }


@router.post("/mbway", response_model=dict)
def create_pagamento_mbway(
    pagamento_data: PagamentoMBWayCreate,
    current_user: User = Depends(get_current_user_required),
    db: Session = Depends(get_db)
):
    """Cria pagamento MB Way"""
    if current_user.tipo.value != "empresa":
        raise HTTPException(status_code=403, detail="Only empresas can create payments")
    
    empresa = crud_empresa.get_empresa_by_user_id(db, current_user.id)
    if not empresa:
        raise HTTPException(status_code=404, detail="Empresa not found")
    
    reserva = crud_reserva.get_reserva(db, pagamento_data.reserva_id)
    if not reserva:
        raise HTTPException(status_code=404, detail="Reserva not found")
    
    if reserva.empresa_id != empresa.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Criar pagamento
    pagamento_create = PagamentoCreate(
        reserva_id=pagamento_data.reserva_id,
        metodo="mbway",
        email_fatura=pagamento_data.email_fatura,
        descricao=pagamento_data.descricao or f"Pagamento MB Way reserva #{reserva.id}"
    )
    
    db_pagamento = crud_pagamento.create_pagamento(
        db,
        pagamento_create,
        reserva.preco_total
    )
    
    # Criar pagamento MB Way no gateway
    mbway_payment = payment_gateway.create_mbway_payment(
        amount=reserva.preco_total,
        telefone=pagamento_data.telefone,
        metadata={
            "reserva_id": reserva.id,
            "empresa_id": empresa.id,
            "pagamento_id": db_pagamento.id
        }
    )
    
    # Atualizar pagamento
    crud_pagamento.update_pagamento_status(
        db,
        db_pagamento.id,
        EstadoPagamento.PROCESSANDO,
        gateway_payment_id=mbway_payment.get("payment_id"),
        gateway_response=mbway_payment
    )
    
    return {
        "pagamento_id": db_pagamento.id,
        "payment_id": mbway_payment.get("payment_id"),
        "status": mbway_payment.get("status"),
        "telefone": pagamento_data.telefone,
        "gateway": mbway_payment.get("gateway")
    }


@router.post("/{pagamento_id}/confirmar", response_model=PagamentoResponse)
def confirmar_pagamento(
    pagamento_id: int,
    confirmacao: PagamentoConfirmar,
    current_user: User = Depends(get_current_user_required),
    db: Session = Depends(get_db)
):
    """Confirma pagamento após processamento no gateway"""
    pagamento = crud_pagamento.get_pagamento(db, pagamento_id)
    if not pagamento:
        raise HTTPException(status_code=404, detail="Payment not found")
    
    # Verificar permissão
    reserva = pagamento.reserva
    empresa = reserva.empresa
    if empresa.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Confirmar no gateway
    if confirmacao.payment_intent_id or confirmacao.transaction_id:
        payment_id = confirmacao.payment_intent_id or confirmacao.transaction_id
        gateway_result = payment_gateway.confirm_payment(payment_id)
        
        if gateway_result.get("success") or confirmacao.success:
            estado = EstadoPagamento.CONCLUIDO
        else:
            estado = EstadoPagamento.FALHADO
    else:
        estado = EstadoPagamento.CONCLUIDO if confirmacao.success else EstadoPagamento.FALHADO
        gateway_result = confirmacao.gateway_response or {}
    
    # Atualizar pagamento
    db_pagamento = crud_pagamento.update_pagamento_status(
        db,
        pagamento_id,
        estado,
        gateway_transaction_id=gateway_result.get("transaction_id"),
        gateway_response=gateway_result
    )
    
    # Se pagamento concluído, atualizar estado da reserva
    if estado == EstadoPagamento.CONCLUIDO:
        from app.models.reserva import EstadoReserva
        reserva.estado = EstadoReserva.CONFIRMADA
        db.commit()
        
        # Notificar por email
        from app.services.email import email_service
        if empresa and empresa.user:
            reserva_dict = {
                "atividade_nome": reserva.atividade.nome if reserva.atividade else "Evento",
                "data": reserva.data.isoformat(),
                "n_pessoas": reserva.n_pessoas,
                "preco_total": reserva.preco_total
            }
            fornecedor_nome = reserva.atividade.fornecedor.nome if reserva.atividade and reserva.atividade.fornecedor else "Fornecedor"
            email_service.send_reserva_confirmada_notification(
                reserva_dict,
                empresa.user.email,
                fornecedor_nome
            )
    
    return {
        "id": db_pagamento.id,
        "reserva_id": db_pagamento.reserva_id,
        "valor": db_pagamento.valor,
        "metodo": db_pagamento.metodo.value,
        "estado": db_pagamento.estado.value,
        "gateway_payment_id": db_pagamento.gateway_payment_id,
        "gateway_transaction_id": db_pagamento.gateway_transaction_id,
        "descricao": db_pagamento.descricao,
        "email_fatura": db_pagamento.email_fatura,
        "data_criacao": db_pagamento.data_criacao.isoformat(),
        "data_atualizacao": db_pagamento.data_atualizacao.isoformat(),
        "data_conclusao": db_pagamento.data_conclusao.isoformat() if db_pagamento.data_conclusao else None
    }


@router.get("/reserva/{reserva_id}", response_model=PagamentoResponse)
def get_pagamento_by_reserva(
    reserva_id: int,
    current_user: User = Depends(get_current_user_required),
    db: Session = Depends(get_db)
):
    """Busca pagamento de uma reserva"""
    pagamento = crud_pagamento.get_pagamento_by_reserva(db, reserva_id)
    if not pagamento:
        raise HTTPException(status_code=404, detail="Payment not found")
    
    # Verificar permissão
    reserva = pagamento.reserva
    empresa = reserva.empresa
    if empresa.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    return {
        "id": pagamento.id,
        "reserva_id": pagamento.reserva_id,
        "valor": pagamento.valor,
        "metodo": pagamento.metodo.value,
        "estado": pagamento.estado.value,
        "gateway_payment_id": pagamento.gateway_payment_id,
        "gateway_transaction_id": pagamento.gateway_transaction_id,
        "descricao": pagamento.descricao,
        "email_fatura": pagamento.email_fatura,
        "data_criacao": pagamento.data_criacao.isoformat(),
        "data_atualizacao": pagamento.data_atualizacao.isoformat(),
        "data_conclusao": pagamento.data_conclusao.isoformat() if pagamento.data_conclusao else None
    }
