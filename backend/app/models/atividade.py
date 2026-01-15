from sqlalchemy import Column, Integer, String, Float, ForeignKey, Text, Boolean, Enum as SQLEnum
from sqlalchemy.orm import relationship
import enum
from app.database import Base


class TipoClima(str, enum.Enum):
    INDOOR = "indoor"
    OUTDOOR = "outdoor"
    AMBOS = "ambos"


class CategoriaAtividade(str, enum.Enum):
    AVENTURA = "aventura"
    RELAX = "relax"
    TEAM_BUILDING = "team_building"
    ESPORTE = "esporte"
    CULTURAL = "cultural"
    GASTRONOMIA = "gastronomia"


class EstadoAtividade(str, enum.Enum):
    PENDENTE = "pendente"
    APROVADA = "aprovada"
    REJEITADA = "rejeitada"


class Atividade(Base):
    __tablename__ = "atividades"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String, nullable=False)
    tipo = Column(String, nullable=False)  # canoagem, barco, paintball, etc.
    categoria = Column(String)  # aventura, relax, team_building, etc.
    preco_por_pessoa = Column(Float, nullable=False)
    capacidade_max = Column(Integer, nullable=False)
    localizacao = Column(String)
    descricao = Column(Text)
    imagens = Column(Text)  # JSON string com URLs das imagens
    fornecedor_id = Column(Integer, ForeignKey("fornecedores.id"), nullable=False)
    # Novos campos
    clima = Column(String)  # indoor, outdoor, ambos
    duracao_minutos = Column(Integer)  # Duração estimada em minutos
    estado = Column(SQLEnum(EstadoAtividade), default=EstadoAtividade.PENDENTE)
    aprovada = Column(Boolean, default=False)
    rating_medio = Column(Float, default=0.0)  # Calculado automaticamente
    total_avaliacoes = Column(Integer, default=0)

    # Relacionamentos
    fornecedor = relationship("Fornecedor", back_populates="atividades")
    reservas = relationship("Reserva", back_populates="atividade")
    avaliacoes = relationship("Avaliacao", back_populates="atividade")
    propostas = relationship("Proposta", back_populates="atividade")

