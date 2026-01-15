"""
Router para criação de eventos e geração de propostas
"""
from fastapi import APIRouter, Depends, HTTPException, status, Body
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.crud import empresa as crud_empresa
from app.models.atividade import Atividade
from app.schemas.evento import (
    EventoCreate,
    EventoPropostasResponse,
    PropostaEvento,
    PropostaEventoItem,
    PropostaEventoUpdate
)
from app.services.proposta_generator import gerar_propostas_evento

router = APIRouter(prefix="/eventos", tags=["eventos"])


@router.post("/criar", response_model=EventoPropostasResponse)
def criar_evento(
    evento_data: EventoCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Cria evento e gera 3 propostas personalizadas
    """
    # Se usuário autenticado, buscar empresa
    empresa_id = None
    if current_user and current_user.tipo.value == "empresa":
        empresa = crud_empresa.get_empresa_by_user_id(db, current_user.id)
        if empresa:
            empresa_id = empresa.id
    
    # Gerar propostas usando o serviço
    propostas = gerar_propostas_evento(db, evento_data)
    
    # Por agora, retornar propostas geradas
    # Em produção, salvar evento e propostas no banco
    return {
        "evento_id": 1,  # TODO: criar evento no banco
        "propostas": propostas
    }


@router.post("/propostas/{proposta_id}/editar", response_model=PropostaEvento)
def editar_proposta(
    proposta_id: str,
    proposta_atualizada: dict = Body(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Edita uma proposta (revalida disponibilidade se necessário)
    Por agora, apenas retorna a proposta atualizada (validação será feita no frontend)
    """
    # TODO: Implementar validação de disponibilidade no backend
    # Por agora, aceitar edições do frontend
    return proposta_atualizada


@router.post("/propostas/{proposta_id}/confirmar")
def confirmar_proposta(
    proposta_id: str,
    proposta_data: dict = Body(...),
    grupos: Optional[List[dict]] = Body(None),
    current_user: Optional[User] = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Confirma uma proposta e cria reserva(s)
    Se grupos for fornecido, cria reservas separadas para cada grupo
    Se usuário não autenticado, cria empresa temporária
    """
    from app.crud import reserva as crud_reserva, user as crud_user
    from app.schemas.reserva import ReservaCreate, ReservaGuestCreate
    from app.models.reserva import EstadoReserva
    from app.models.user import TipoUsuario
    from datetime import datetime, date
    
    # Buscar ou criar empresa
    empresa_id = None
    
    if current_user and current_user.tipo.value == "empresa":
        # Usuário autenticado como empresa
        empresa = crud_empresa.get_empresa_by_user_id(db, current_user.id)
        if empresa:
            empresa_id = empresa.id
    elif proposta_data.get('email') and proposta_data.get('nome_empresa'):
        # Usuário não autenticado - criar empresa temporária
        # Verificar se já existe usuário com esse email
        user_guest = crud_user.get_user_by_email(db, proposta_data['email'])
        
        if not user_guest:
            # Criar usuário guest
            from app.schemas.user import UserCreate
            user_data = UserCreate(
                email=proposta_data['email'],
                password="guest_temp",  # Senha temporária
                nome=proposta_data.get('nome_empresa', 'Guest'),
                tipo=TipoUsuario.EMPRESA
            )
            user_guest = crud_user.create_user(db, user_data)
        
        # Verificar se empresa já existe
        empresa = crud_empresa.get_empresa_by_user_id(db, user_guest.id)
        if not empresa:
            # Criar empresa
            from app.schemas.empresa import EmpresaCreate
            empresa_data = EmpresaCreate(
                nome=proposta_data['nome_empresa'],
                localizacao=proposta_data.get('localizacao', ''),
                telefone=proposta_data.get('telefone'),
                email=proposta_data['email']
            )
            empresa = crud_empresa.create_empresa(db, empresa_data, user_guest.id)
        
        empresa_id = empresa.id if empresa else None
    
    if not empresa_id:
        raise HTTPException(
            status_code=400, 
            detail="Não foi possível identificar ou criar a empresa. Por favor, faça login ou forneça email e nome da empresa."
        )
    
    # Extrair data do evento (assumindo que está na proposta ou usar data atual)
    evento_data = proposta_data.get('data_evento')
    if isinstance(evento_data, str):
        try:
            evento_data = datetime.fromisoformat(evento_data).date()
        except:
            evento_data = datetime.now().date()
    elif not evento_data:
        evento_data = datetime.now().date()
    
    reservas_criadas = []
    
    if grupos:
        # Criar reservas por grupo
        for grupo in grupos:
            for atividade_item in grupo.get('atividades', []):
                if atividade_item.get('tipo') == 'atividade' and atividade_item.get('atividade_id'):
                    atividade = db.query(Atividade).filter(
                        Atividade.id == atividade_item['atividade_id']
                    ).first()
                    
                    if atividade:
                        reserva_data = ReservaCreate(
                            atividade_id=atividade.id,
                            data=evento_data,
                            n_pessoas=grupo['n_pessoas']
                        )
                        
                        preco_total = atividade.preco_por_pessoa * grupo['n_pessoas']
                        
                        reserva = crud_reserva.create_reserva(
                            db,
                            reserva_data,
                            empresa_id,
                            preco_total=preco_total
                        )
                        if reserva:
                            reservas_criadas.append(reserva.id)
    else:
        # Criar reservas normais baseadas na agenda da proposta
        agenda = proposta_data.get('agenda', [])
        for item in agenda:
            if item.get('tipo') == 'atividade' and item.get('atividade_id'):
                atividade = db.query(Atividade).filter(
                    Atividade.id == item['atividade_id']
                ).first()
                
                if atividade:
                    # Calcular número de pessoas (usar preço para inferir)
                    n_pessoas = int(proposta_data.get('preco_total', 0) / proposta_data.get('preco_por_pessoa', 1)) if proposta_data.get('preco_por_pessoa', 0) > 0 else 1
                    
                    reserva_data = ReservaCreate(
                        atividade_id=atividade.id,
                        data=evento_data,
                        n_pessoas=n_pessoas
                    )
                    
                    preco_total = atividade.preco_por_pessoa * n_pessoas
                    
                    reserva = crud_reserva.create_reserva(
                        db,
                        reserva_data,
                        empresa_id,
                        preco_total=preco_total
                    )
                    if reserva:
                        reservas_criadas.append(reserva.id)
    
    if not reservas_criadas:
        raise HTTPException(status_code=400, detail="Nenhuma reserva foi criada. Verifique se há atividades válidas na proposta.")
    
    return {
        "reservas_criadas": reservas_criadas,
        "total_reservas": len(reservas_criadas),
        "mensagem": f"{len(reservas_criadas)} reserva(s) criada(s) com sucesso"
    }
