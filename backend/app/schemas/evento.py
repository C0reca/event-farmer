from pydantic import BaseModel, field_validator
from typing import List, Optional
from datetime import date


class EventoCreate(BaseModel):
    """Schema para criar evento (brief inicial)"""
    data_inicio: date
    data_fim: Optional[date] = None
    duracao_atividades: str  # manha, tarde, dia_todo
    n_pessoas: int
    localizacao: str
    tipos_atividades: List[str]  # aventuras, artes, workshops, outdoor, indoor
    almoco: bool = False
    transporte: bool = False
    expectativa_preco: str  # €, €€, €€€
    observacoes: Optional[str] = None
    empresa_id: Optional[int] = None  # Se usuário autenticado
    email: Optional[str] = None  # Se usuário não autenticado
    nome_empresa: Optional[str] = None  # Se usuário não autenticado
    
    @field_validator('data_fim', mode='before')
    @classmethod
    def validate_data_fim(cls, v):
        """Converte string vazia para None"""
        if v == '' or v is None:
            return None
        return v
    
    @field_validator('observacoes', mode='before')
    @classmethod
    def validate_observacoes(cls, v):
        """Converte string vazia para None"""
        if v == '' or v is None:
            return None
        return v
    
    @field_validator('n_pessoas', mode='before')
    @classmethod
    def validate_n_pessoas(cls, v):
        """Converte string para int"""
        if isinstance(v, str):
            try:
                return int(v)
            except ValueError:
                raise ValueError('n_pessoas deve ser um número')
        return v


class PropostaEventoItem(BaseModel):
    """Item de uma proposta (atividade, almoço, transporte)"""
    tipo: str  # atividade, almoco, transporte
    nome: str
    fornecedor: Optional[str] = None
    local: Optional[str] = None
    horario: Optional[str] = None
    duracao_minutos: Optional[int] = None
    preco: float
    descricao: Optional[str] = None
    atividade_id: Optional[int] = None


class PropostaEvento(BaseModel):
    """Uma proposta completa de evento"""
    id: str  # A, B, C
    titulo: str  # "Aventura & Outdoor", "Criativa & Relax", etc.
    agenda: List[PropostaEventoItem]  # Ordenado por horário
    preco_total: float
    preco_por_pessoa: float
    resumo: str
    notas_importantes: Optional[str] = None
    inclusoes: List[str]  # O que está incluído


class EventoPropostasResponse(BaseModel):
    """Resposta com 3 propostas geradas"""
    evento_id: int
    propostas: List[PropostaEvento]


class PropostaEventoUpdate(BaseModel):
    """Atualização de uma proposta"""
    proposta_id: str  # A, B, ou C
    agenda: List[PropostaEventoItem]
    observacoes: Optional[str] = None
