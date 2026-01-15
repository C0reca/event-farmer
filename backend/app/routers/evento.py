"""
Router para gestão completa do evento (reserva)
Inclui mensagens, documentos e notas
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.core.dependencies import get_current_user_required
from app.models.user import User
from app.crud import (
    reserva as crud_reserva,
    empresa as crud_empresa,
    fornecedor as crud_fornecedor,
    mensagem as crud_mensagem,
    documento as crud_documento,
    nota_evento as crud_nota
)
from app.schemas.mensagem import MensagemCreate, MensagemResponse
from app.schemas.documento import DocumentoCreate, DocumentoResponse
from app.schemas.nota_evento import NotaEventoCreate, NotaEventoUpdate, NotaEventoResponse

router = APIRouter(prefix="/evento", tags=["evento"])


@router.get("/{reserva_id}")
def get_evento_completo(reserva_id: int, current_user: User = Depends(get_current_user_required), db: Session = Depends(get_db)):
    """Obtém todos os dados do evento (single source of truth)"""
    reserva = crud_reserva.get_reserva(db, reserva_id)
    if not reserva:
        raise HTTPException(status_code=404, detail="Reserva not found")
    
    # Verificar permissão
    empresa = reserva.empresa
    fornecedor = reserva.atividade.fornecedor if reserva.atividade else None
    
    is_empresa = current_user.tipo.value == "empresa" and empresa and empresa.user_id == current_user.id
    is_fornecedor = current_user.tipo.value == "fornecedor" and fornecedor and fornecedor.user_id == current_user.id
    
    if not (is_empresa or is_fornecedor):
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Buscar todos os dados relacionados
    mensagens = crud_mensagem.get_mensagens_by_reserva(db, reserva_id)
    documentos = crud_documento.get_documentos_by_reserva(db, reserva_id)
    notas = crud_nota.get_notas_by_reserva(db, reserva_id)
    
    # Formatar resposta
    atividade_info = {
        "id": reserva.atividade.id,
        "nome": reserva.atividade.nome,
        "tipo": reserva.atividade.tipo,
        "localizacao": reserva.atividade.localizacao,
        "preco_por_pessoa": reserva.atividade.preco_por_pessoa
    }
    
    empresa_info = {
        "id": empresa.id,
        "nome": empresa.nome,
        "localizacao": empresa.localizacao,
        "contacto": empresa.user.email
    }
    
    fornecedor_info = None
    if fornecedor:
        fornecedor_info = {
            "id": fornecedor.id,
            "nome": fornecedor.nome,
            "localizacao": fornecedor.localizacao,
            "contacto": fornecedor.contacto or fornecedor.user.email
        }
    
    return {
        "reserva": {
            "id": reserva.id,
            "data": reserva.data.isoformat(),
            "n_pessoas": reserva.n_pessoas,
            "preco_total": reserva.preco_total,
            "estado": reserva.estado.value,
            "data_criacao": reserva.data_criacao.isoformat()
        },
        "atividade": atividade_info,
        "empresa": empresa_info,
        "fornecedor": fornecedor_info,
        "mensagens": [
            {
                "id": m.id,
                "remetente_id": m.remetente_id,
                "destinatario_id": m.destinatario_id,
                "conteudo": m.conteudo,
                "lida": m.lida,
                "data_criacao": m.data_criacao.isoformat(),
                "remetente_nome": m.remetente.nome
            }
            for m in mensagens
        ],
        "documentos": [
            {
                "id": d.id,
                "nome": d.nome,
                "url": d.url,
                "tipo": d.tipo,
                "descricao": d.descricao,
                "uploaded_by_id": d.uploaded_by_id,
                "data_upload": d.data_upload.isoformat(),
                "uploaded_by_nome": d.uploaded_by.nome
            }
            for d in documentos
        ],
        "notas": [
            {
                "id": n.id,
                "titulo": n.titulo,
                "conteudo": n.conteudo,
                "criado_por_id": n.criado_por_id,
                "data_criacao": n.data_criacao.isoformat(),
                "data_atualizacao": n.data_atualizacao.isoformat(),
                "criado_por_nome": n.criado_por.nome
            }
            for n in notas
        ]
    }


@router.post("/{reserva_id}/mensagens", response_model=MensagemResponse)
def create_mensagem(
    reserva_id: int,
    mensagem: MensagemCreate,
    current_user: User = Depends(get_current_user_required),
    db: Session = Depends(get_db)
):
    """Cria nova mensagem no evento"""
    reserva = crud_reserva.get_reserva(db, reserva_id)
    if not reserva:
        raise HTTPException(status_code=404, detail="Reserva not found")
    
    # Verificar permissão e determinar destinatário
    empresa = reserva.empresa
    fornecedor = reserva.atividade.fornecedor if reserva.atividade else None
    
    if current_user.tipo.value == "empresa":
        if not empresa or empresa.user_id != current_user.id:
            raise HTTPException(status_code=403, detail="Not authorized")
        destinatario_id = fornecedor.user_id if fornecedor else None
    elif current_user.tipo.value == "fornecedor":
        if not fornecedor or fornecedor.user_id != current_user.id:
            raise HTTPException(status_code=403, detail="Not authorized")
        destinatario_id = empresa.user_id if empresa else None
    else:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    if not destinatario_id:
        raise HTTPException(status_code=400, detail="Destinatário não encontrado")
    
    mensagem_data = MensagemCreate(
        reserva_id=reserva_id,
        destinatario_id=destinatario_id,
        conteudo=mensagem.conteudo
    )
    
    db_mensagem = crud_mensagem.create_mensagem(db, mensagem_data, current_user.id)
    
    # Notificar destinatário por email
    from app.services.email import email_service
    destinatario = db.query(User).filter(User.id == destinatario_id).first()
    if destinatario:
        # TODO: Enviar email de notificação de nova mensagem
        pass
    
    return {
        "id": db_mensagem.id,
        "reserva_id": db_mensagem.reserva_id,
        "remetente_id": db_mensagem.remetente_id,
        "destinatario_id": db_mensagem.destinatario_id,
        "conteudo": db_mensagem.conteudo,
        "lida": db_mensagem.lida,
        "data_criacao": db_mensagem.data_criacao.isoformat(),
        "remetente_nome": current_user.nome
    }


@router.post("/{reserva_id}/documentos", response_model=DocumentoResponse)
def create_documento(
    reserva_id: int,
    documento: DocumentoCreate,
    current_user: User = Depends(get_current_user_required),
    db: Session = Depends(get_db)
):
    """Upload de documento para o evento"""
    reserva = crud_reserva.get_reserva(db, reserva_id)
    if not reserva:
        raise HTTPException(status_code=404, detail="Reserva not found")
    
    # Verificar permissão
    empresa = reserva.empresa
    fornecedor = reserva.atividade.fornecedor if reserva.atividade else None
    
    is_empresa = current_user.tipo.value == "empresa" and empresa and empresa.user_id == current_user.id
    is_fornecedor = current_user.tipo.value == "fornecedor" and fornecedor and fornecedor.user_id == current_user.id
    
    if not (is_empresa or is_fornecedor):
        raise HTTPException(status_code=403, detail="Not authorized")
    
    documento_data = DocumentoCreate(
        reserva_id=reserva_id,
        **documento.dict()
    )
    
    db_documento = crud_documento.create_documento(db, documento_data, current_user.id)
    
    return {
        "id": db_documento.id,
        "reserva_id": db_documento.reserva_id,
        "nome": db_documento.nome,
        "url": db_documento.url,
        "tipo": db_documento.tipo,
        "descricao": db_documento.descricao,
        "uploaded_by_id": db_documento.uploaded_by_id,
        "data_upload": db_documento.data_upload.isoformat(),
        "uploaded_by_nome": current_user.nome
    }


@router.post("/{reserva_id}/notas", response_model=NotaEventoResponse)
def create_nota(
    reserva_id: int,
    nota: NotaEventoCreate,
    current_user: User = Depends(get_current_user_required),
    db: Session = Depends(get_db)
):
    """Cria nota no evento"""
    reserva = crud_reserva.get_reserva(db, reserva_id)
    if not reserva:
        raise HTTPException(status_code=404, detail="Reserva not found")
    
    # Verificar permissão
    empresa = reserva.empresa
    fornecedor = reserva.atividade.fornecedor if reserva.atividade else None
    
    is_empresa = current_user.tipo.value == "empresa" and empresa and empresa.user_id == current_user.id
    is_fornecedor = current_user.tipo.value == "fornecedor" and fornecedor and fornecedor.user_id == current_user.id
    
    if not (is_empresa or is_fornecedor):
        raise HTTPException(status_code=403, detail="Not authorized")
    
    nota_data = NotaEventoCreate(
        reserva_id=reserva_id,
        **nota.dict()
    )
    
    db_nota = crud_nota.create_nota(db, nota_data, current_user.id)
    
    return {
        "id": db_nota.id,
        "reserva_id": db_nota.reserva_id,
        "titulo": db_nota.titulo,
        "conteudo": db_nota.conteudo,
        "criado_por_id": db_nota.criado_por_id,
        "data_criacao": db_nota.data_criacao.isoformat(),
        "data_atualizacao": db_nota.data_atualizacao.isoformat(),
        "criado_por_nome": current_user.nome
    }


@router.get("/{reserva_id}/mensagens", response_model=List[MensagemResponse])
def get_mensagens(reserva_id: int, current_user: User = Depends(get_current_user_required), db: Session = Depends(get_db)):
    """Lista mensagens do evento"""
    reserva = crud_reserva.get_reserva(db, reserva_id)
    if not reserva:
        raise HTTPException(status_code=404, detail="Reserva not found")
    
    # Verificar permissão
    empresa = reserva.empresa
    fornecedor = reserva.atividade.fornecedor if reserva.atividade else None
    
    is_empresa = current_user.tipo.value == "empresa" and empresa and empresa.user_id == current_user.id
    is_fornecedor = current_user.tipo.value == "fornecedor" and fornecedor and fornecedor.user_id == current_user.id
    
    if not (is_empresa or is_fornecedor):
        raise HTTPException(status_code=403, detail="Not authorized")
    
    mensagens = crud_mensagem.get_mensagens_by_reserva(db, reserva_id)
    
    return [
        {
            "id": m.id,
            "reserva_id": m.reserva_id,
            "remetente_id": m.remetente_id,
            "destinatario_id": m.destinatario_id,
            "conteudo": m.conteudo,
            "lida": m.lida,
            "data_criacao": m.data_criacao.isoformat(),
            "remetente_nome": m.remetente.nome
        }
        for m in mensagens
    ]
