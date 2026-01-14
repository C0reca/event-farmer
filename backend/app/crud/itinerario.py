from sqlalchemy.orm import Session
import json
from typing import List, Optional
from app.models.itinerario import Itinerario
from app.models.atividade import Atividade
from app.schemas.itinerario import ItinerarioCreate


def get_itinerario(db: Session, itinerario_id: int) -> Optional[Itinerario]:
    """Busca itinerário por ID"""
    return db.query(Itinerario).filter(Itinerario.id == itinerario_id).first()


def get_itinerarios_by_empresa(db: Session, empresa_id: int):
    """Lista itinerários de uma empresa"""
    return db.query(Itinerario).filter(Itinerario.empresa_id == empresa_id).all()


def create_itinerario(db: Session, itinerario: ItinerarioCreate, empresa_id: int) -> Itinerario:
    """Cria novo itinerário"""
    # Buscar atividades e criar lista JSON
    atividades_list = []
    for atividade_id in itinerario.atividades_ids:
        atividade = db.query(Atividade).filter(Atividade.id == atividade_id).first()
        if atividade:
            atividades_list.append({
                "id": atividade.id,
                "nome": atividade.nome,
                "tipo": atividade.tipo,
                "preco_por_pessoa": atividade.preco_por_pessoa,
                "localizacao": atividade.localizacao
            })
    
    atividades_json = json.dumps(atividades_list)
    
    db_itinerario = Itinerario(
        empresa_id=empresa_id,
        data=itinerario.data,
        atividades=atividades_json,
        restaurante_sugerido=itinerario.restaurante_sugerido
    )
    db.add(db_itinerario)
    db.commit()
    db.refresh(db_itinerario)
    return db_itinerario

