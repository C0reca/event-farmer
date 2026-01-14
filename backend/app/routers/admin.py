from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.models.empresa import Empresa
from app.models.atividade import Atividade
from app.models.reserva import Reserva
from app.models.fornecedor import Fornecedor

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/dashboard")
def get_dashboard(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Dashboard com métricas básicas"""
    # Verificar se é admin
    if current_user.tipo.value != "admin":
        raise HTTPException(status_code=403, detail="Only admins can access this endpoint")
    
    # Contar empresas
    n_empresas = db.query(func.count(Empresa.id)).scalar()
    
    # Contar atividades
    n_atividades = db.query(func.count(Atividade.id)).scalar()
    n_atividades_aprovadas = db.query(func.count(Atividade.id)).filter(
        Atividade.aprovada == True
    ).scalar()
    n_atividades_pendentes = db.query(func.count(Atividade.id)).filter(
        Atividade.aprovada == False
    ).scalar()
    
    # Contar reservas
    n_reservas = db.query(func.count(Reserva.id)).scalar()
    n_reservas_pendentes = db.query(func.count(Reserva.id)).filter(
        Reserva.estado == "pendente"
    ).scalar()
    n_reservas_confirmadas = db.query(func.count(Reserva.id)).filter(
        Reserva.estado == "confirmada"
    ).scalar()
    
    # Calcular faturação total (reservas confirmadas)
    faturacao = db.query(func.sum(Reserva.preco_total)).filter(
        Reserva.estado == "confirmada"
    ).scalar() or 0
    
    # Contar fornecedores
    n_fornecedores = db.query(func.count(Fornecedor.id)).scalar()
    
    return {
        "n_empresas": n_empresas,
        "n_atividades": n_atividades,
        "n_atividades_aprovadas": n_atividades_aprovadas,
        "n_atividades_pendentes": n_atividades_pendentes,
        "n_reservas": n_reservas,
        "n_reservas_pendentes": n_reservas_pendentes,
        "n_reservas_confirmadas": n_reservas_confirmadas,
        "n_fornecedores": n_fornecedores,
        "faturacao_total": float(faturacao)
    }


@router.get("/relatorios")
def get_relatorios(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Relatórios detalhados (apenas admin)"""
    from datetime import datetime, timedelta
    
    if current_user.tipo.value != "admin":
        raise HTTPException(status_code=403, detail="Only admins can access this endpoint")
    
    # Últimos 30 dias
    data_inicio = datetime.utcnow() - timedelta(days=30)
    
    # Reservas dos últimos 30 dias
    reservas_30d = db.query(func.count(Reserva.id)).filter(
        Reserva.data_criacao >= data_inicio
    ).scalar()
    
    # Faturação dos últimos 30 dias
    faturacao_30d = db.query(func.sum(Reserva.preco_total)).filter(
        Reserva.estado == "confirmada",
        Reserva.data_criacao >= data_inicio
    ).scalar() or 0
    
    # Top atividades mais reservadas
    from app.models.atividade import Atividade
    top_atividades = db.query(
        Atividade.nome,
        func.count(Reserva.id).label('total_reservas')
    ).select_from(Atividade).join(
        Reserva, Atividade.id == Reserva.atividade_id
    ).filter(
        Reserva.estado == "confirmada"
    ).group_by(Atividade.id, Atividade.nome).order_by(
        func.count(Reserva.id).desc()
    ).limit(5).all()
    
    # Top fornecedores
    top_fornecedores = db.query(
        Fornecedor.nome,
        func.count(Reserva.id).label('total_reservas'),
        func.sum(Reserva.preco_total).label('faturacao')
    ).select_from(Fornecedor).join(
        Atividade, Fornecedor.id == Atividade.fornecedor_id
    ).join(
        Reserva, Atividade.id == Reserva.atividade_id
    ).filter(
        Reserva.estado == "confirmada"
    ).group_by(Fornecedor.id, Fornecedor.nome).order_by(
        func.count(Reserva.id).desc()
    ).limit(5).all()
    
    return {
        "periodo": "últimos 30 dias",
        "reservas_30d": reservas_30d,
        "faturacao_30d": float(faturacao_30d),
        "top_atividades": [
            {"nome": nome, "total_reservas": total} 
            for nome, total in top_atividades
        ],
        "top_fornecedores": [
            {
                "nome": nome,
                "total_reservas": total,
                "faturacao": float(fat)
            }
            for nome, total, fat in top_fornecedores
        ]
    }

