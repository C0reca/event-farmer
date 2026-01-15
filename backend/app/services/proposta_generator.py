"""
Serviço para gerar propostas de evento personalizadas
"""
from sqlalchemy.orm import Session
from typing import List
from app.schemas.evento import EventoCreate, PropostaEvento, PropostaEventoItem
from app.crud import atividade as crud_atividade


def gerar_propostas_evento(db: Session, evento: EventoCreate, evento_id: int = None) -> List[PropostaEvento]:
    """
    Gera 3 propostas personalizadas baseadas nos critérios do evento
    """
    import uuid
    
    # Buscar atividades disponíveis baseadas nos critérios
    atividades = buscar_atividades_relevantes(db, evento)
    
    # Gerar 3 propostas diferentes com IDs únicos
    propostas = []
    
    # Proposta 1: Aventura & Outdoor
    proposta_a = criar_proposta_aventura(evento, atividades)
    proposta_a.id = f"prop_{uuid.uuid4().hex[:8]}" if evento_id is None else f"prop_{evento_id}_1"
    propostas.append(proposta_a)
    
    # Proposta 2: Criativa & Relax
    proposta_b = criar_proposta_criativa(evento, atividades)
    proposta_b.id = f"prop_{uuid.uuid4().hex[:8]}" if evento_id is None else f"prop_{evento_id}_2"
    propostas.append(proposta_b)
    
    # Proposta 3: Híbrida / Corporate-friendly
    proposta_c = criar_proposta_hibrida(evento, atividades)
    proposta_c.id = f"prop_{uuid.uuid4().hex[:8]}" if evento_id is None else f"prop_{evento_id}_3"
    propostas.append(proposta_c)
    
    return propostas


def buscar_atividades_relevantes(db: Session, evento: EventoCreate):
    """Busca atividades que correspondem aos critérios"""
    # Por agora, buscar todas as atividades aprovadas
    # Em produção, filtrar por localização, tipo, capacidade, etc.
    from app.models.atividade import Atividade, EstadoAtividade
    atividades = db.query(Atividade).filter(
        Atividade.estado == EstadoAtividade.APROVADA
    ).all()
    
    # Filtrar por critérios básicos
    atividades_filtradas = []
    for atividade in atividades:
        # Verificar capacidade
        if atividade.capacidade_max < evento.n_pessoas:
            continue
        
        # Verificar tipos
        if evento.tipos_atividades:
            tipo_match = False
            for tipo in evento.tipos_atividades:
                if tipo in atividade.categoria.lower() or tipo in atividade.tipo.lower():
                    tipo_match = True
                    break
            if not tipo_match and len(evento.tipos_atividades) > 0:
                continue
        
        atividades_filtradas.append(atividade)
    
    return atividades_filtradas[:10]  # Limitar a 10 para não sobrecarregar


def criar_proposta_aventura(evento: EventoCreate, atividades: List) -> PropostaEvento:
    """Cria proposta focada em aventura e outdoor"""
    # Filtrar atividades de aventura/outdoor
    atividades_aventura = [
        a for a in atividades 
        if 'aventura' in a.categoria.lower() or 'outdoor' in a.tipo.lower() or 'outdoor' in a.clima.lower()
    ]
    
    if not atividades_aventura:
        atividades_aventura = atividades[:2]  # Fallback
    
    agenda = []
    preco_total = 0
    
    # Manhã: Atividade principal
    if evento.duracao_atividades in ['manha', 'dia_todo']:
        atividade_manha = atividades_aventura[0] if atividades_aventura else None
        if atividade_manha:
            preco = atividade_manha.preco_por_pessoa * evento.n_pessoas
            agenda.append(PropostaEventoItem(
                tipo="atividade",
                nome=atividade_manha.nome,
                fornecedor=atividade_manha.fornecedor.nome if atividade_manha.fornecedor else "Fornecedor",
                local=atividade_manha.localizacao,
                horario="09:00 - 13:00",
                duracao_minutos=atividade_manha.duracao_minutos or 240,
                preco=preco,
                descricao=atividade_manha.descricao,
                atividade_id=atividade_manha.id
            ))
            preco_total += preco
    
    # Almoço
    if evento.almoco:
        preco_almoco = 25.0 * evento.n_pessoas  # €25 por pessoa
        agenda.append(PropostaEventoItem(
            tipo="almoco",
            nome="Almoço em Restaurante Local",
            fornecedor="Restaurante Parceiro",
            local=evento.localizacao,
            horario="13:00 - 14:30",
            duracao_minutos=90,
            preco=preco_almoco,
            descricao="Menu completo com entrada, prato principal e sobremesa"
        ))
        preco_total += preco_almoco
    
    # Tarde: Atividade complementar (se dia todo)
    if evento.duracao_atividades == 'dia_todo' and len(atividades_aventura) > 1:
        atividade_tarde = atividades_aventura[1]
        preco = atividade_tarde.preco_por_pessoa * evento.n_pessoas
        agenda.append(PropostaEventoItem(
            tipo="atividade",
            nome=atividade_tarde.nome,
            fornecedor=atividade_tarde.fornecedor.nome if atividade_tarde.fornecedor else "Fornecedor",
            local=atividade_tarde.localizacao,
            horario="15:00 - 18:00",
            duracao_minutos=atividade_tarde.duracao_minutos or 180,
            preco=preco,
            descricao=atividade_tarde.descricao,
            atividade_id=atividade_tarde.id
        ))
        preco_total += preco
    
    # Transporte
    if evento.transporte:
        preco_transporte = 15.0 * evento.n_pessoas  # €15 por pessoa
        agenda.append(PropostaEventoItem(
            tipo="transporte",
            nome="Transporte de/para Local",
            fornecedor="Transporte Parceiro",
            local=evento.localizacao,
            horario="08:00 - 19:00",
            preco=preco_transporte,
            descricao="Transporte em autocarro confortável"
        ))
        preco_total += preco_transporte
    
    return PropostaEvento(
        id="",  # Será definido na função gerar_propostas_evento
        titulo="Aventura & Outdoor",
        agenda=agenda,
        preco_total=preco_total,
        preco_por_pessoa=preco_total / evento.n_pessoas,
        resumo="Dia repleto de atividades ao ar livre e aventura, perfeito para equipas que gostam de ação e natureza.",
        notas_importantes="Recomendamos roupa confortável e calçado adequado para atividades outdoor.",
        inclusoes=[
            "Todas as atividades incluídas",
            "Equipamento necessário",
            "Guias experientes",
            "Seguro de acidentes pessoais"
        ]
    )


def criar_proposta_criativa(evento: EventoCreate, atividades: List) -> PropostaEvento:
    """Cria proposta focada em criatividade e relaxamento"""
    # Filtrar atividades criativas/workshops
    atividades_criativas = [
        a for a in atividades 
        if 'artes' in a.categoria.lower() or 'workshop' in a.categoria.lower() or 'indoor' in a.tipo.lower()
    ]
    
    if not atividades_criativas:
        atividades_criativas = atividades[:2]  # Fallback
    
    agenda = []
    preco_total = 0
    
    # Manhã: Workshop criativo
    if evento.duracao_atividades in ['manha', 'dia_todo']:
        atividade_manha = atividades_criativas[0] if atividades_criativas else None
        if atividade_manha:
            preco = atividade_manha.preco_por_pessoa * evento.n_pessoas
            agenda.append(PropostaEventoItem(
                tipo="atividade",
                nome=atividade_manha.nome,
                fornecedor=atividade_manha.fornecedor.nome if atividade_manha.fornecedor else "Fornecedor",
                local=atividade_manha.localizacao,
                horario="09:30 - 13:00",
                duracao_minutos=atividade_manha.duracao_minutos or 210,
                preco=preco,
                descricao=atividade_manha.descricao,
                atividade_id=atividade_manha.id
            ))
            preco_total += preco
    
    # Almoço
    if evento.almoco:
        preco_almoco = 30.0 * evento.n_pessoas  # €30 por pessoa (mais premium)
        agenda.append(PropostaEventoItem(
            tipo="almoco",
            nome="Almoço em Restaurante Premium",
            fornecedor="Restaurante Parceiro",
            local=evento.localizacao,
            horario="13:00 - 14:30",
            duracao_minutos=90,
            preco=preco_almoco,
            descricao="Menu gourmet com opções vegetarianas"
        ))
        preco_total += preco_almoco
    
    # Tarde: Atividade relaxante
    if evento.duracao_atividades == 'dia_todo' and len(atividades_criativas) > 1:
        atividade_tarde = atividades_criativas[1]
        preco = atividade_tarde.preco_por_pessoa * evento.n_pessoas
        agenda.append(PropostaEventoItem(
            tipo="atividade",
            nome=atividade_tarde.nome,
            fornecedor=atividade_tarde.fornecedor.nome if atividade_tarde.fornecedor else "Fornecedor",
            local=atividade_tarde.localizacao,
            horario="15:00 - 17:30",
            duracao_minutos=atividade_tarde.duracao_minutos or 150,
            preco=preco,
            descricao=atividade_tarde.descricao,
            atividade_id=atividade_tarde.id
        ))
        preco_total += preco
    
    # Transporte
    if evento.transporte:
        preco_transporte = 15.0 * evento.n_pessoas
        agenda.append(PropostaEventoItem(
            tipo="transporte",
            nome="Transporte de/para Local",
            fornecedor="Transporte Parceiro",
            local=evento.localizacao,
            horario="08:30 - 18:30",
            preco=preco_transporte,
            descricao="Transporte em autocarro confortável"
        ))
        preco_total += preco_transporte
    
    return PropostaEvento(
        id="",  # Será definido na função gerar_propostas_evento
        titulo="Criativa & Relax",
        agenda=agenda,
        preco_total=preco_total,
        preco_por_pessoa=preco_total / evento.n_pessoas,
        resumo="Experiências criativas e relaxantes, ideais para equipas que valorizam aprendizagem e bem-estar.",
        notas_importantes="Atividades adaptáveis a diferentes níveis de experiência.",
        inclusoes=[
            "Todos os materiais incluídos",
            "Instrutores qualificados",
            "Coffee break",
            "Certificado de participação"
        ]
    )


def criar_proposta_hibrida(evento: EventoCreate, atividades: List) -> PropostaEvento:
    """Cria proposta híbrida/corporate-friendly"""
    # Misturar atividades variadas
    agenda = []
    preco_total = 0
    
    # Manhã: Atividade de team building
    atividades_team = [a for a in atividades if 'team' in a.categoria.lower() or 'team' in a.tipo.lower()]
    if not atividades_team:
        atividades_team = atividades[:1]
    
    if evento.duracao_atividades in ['manha', 'dia_todo']:
        atividade_manha = atividades_team[0] if atividades_team else atividades[0] if atividades else None
        if atividade_manha:
            preco = atividade_manha.preco_por_pessoa * evento.n_pessoas
            agenda.append(PropostaEventoItem(
                tipo="atividade",
                nome=atividade_manha.nome,
                fornecedor=atividade_manha.fornecedor.nome if atividade_manha.fornecedor else "Fornecedor",
                local=atividade_manha.localizacao,
                horario="09:00 - 12:30",
                duracao_minutos=atividade_manha.duracao_minutos or 210,
                preco=preco,
                descricao=atividade_manha.descricao,
                atividade_id=atividade_manha.id
            ))
            preco_total += preco
    
    # Almoço
    if evento.almoco:
        preco_almoco = 27.0 * evento.n_pessoas
        agenda.append(PropostaEventoItem(
            tipo="almoco",
            nome="Almoço de Networking",
            fornecedor="Restaurante Parceiro",
            local=evento.localizacao,
            horario="12:30 - 14:00",
            duracao_minutos=90,
            preco=preco_almoco,
            descricao="Menu executivo com espaço para networking"
        ))
        preco_total += preco_almoco
    
    # Tarde: Atividade complementar
    if evento.duracao_atividades == 'dia_todo' and len(atividades) > 1:
        atividade_tarde = atividades[1]
        preco = atividade_tarde.preco_por_pessoa * evento.n_pessoas
        agenda.append(PropostaEventoItem(
            tipo="atividade",
            nome=atividade_tarde.nome,
            fornecedor=atividade_tarde.fornecedor.nome if atividade_tarde.fornecedor else "Fornecedor",
            local=atividade_tarde.localizacao,
            horario="14:30 - 17:00",
            duracao_minutos=atividade_tarde.duracao_minutos or 150,
            preco=preco,
            descricao=atividade_tarde.descricao,
            atividade_id=atividade_tarde.id
        ))
        preco_total += preco
    
    # Transporte
    if evento.transporte:
        preco_transporte = 15.0 * evento.n_pessoas
        agenda.append(PropostaEventoItem(
            tipo="transporte",
            nome="Transporte de/para Local",
            fornecedor="Transporte Parceiro",
            local=evento.localizacao,
            horario="08:00 - 18:00",
            preco=preco_transporte,
            descricao="Transporte em autocarro confortável"
        ))
        preco_total += preco_transporte
    
    return PropostaEvento(
        id="",  # Será definido na função gerar_propostas_evento
        titulo="Híbrida / Corporate-Friendly",
        agenda=agenda,
        preco_total=preco_total,
        preco_por_pessoa=preco_total / evento.n_pessoas,
        resumo="Combinação equilibrada de atividades, perfeita para eventos corporativos formais.",
        notas_importantes="Formato adaptável a diferentes necessidades corporativas.",
        inclusoes=[
            "Atividades estruturadas",
            "Espaço para networking",
            "Suporte logístico completo",
            "Relatório pós-evento"
        ]
    )
