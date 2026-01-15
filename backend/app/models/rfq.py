from sqlalchemy import Column, Integer, String, Text, Date, ForeignKey, Enum, DateTime, Float
from sqlalchemy.orm import relationship
import enum
from datetime import datetime
from app.database import Base


class EstadoRFQ(str, enum.Enum):
    ABERTO = "aberto"  # Aguardando propostas
    EM_NEGOCIACAO = "em_negociacao"  # Recebendo propostas
    FECHADO = "fechado"  # Proposta aceite, reserva criada
    CANCELADO = "cancelado"  # Cancelado pela empresa


class RFQ(Base):
    __tablename__ = "rfqs"

    id = Column(Integer, primary_key=True, index=True)
    empresa_id = Column(Integer, ForeignKey("empresas.id"), nullable=False)
    
    # Brief estruturado
    n_pessoas = Column(Integer, nullable=False)
    data_preferida = Column(Date, nullable=False)
    data_alternativa = Column(Date, nullable=True)  # Opcional
    localizacao = Column(String, nullable=False)
    raio_km = Column(Integer, default=50)  # Raio de busca em km
    orcamento_max = Column(Float, nullable=False)
    objetivo = Column(String)  # bonding, onboarding, celebração, formação, etc.
    preferencias = Column(Text)  # Preferências e restrições em texto livre
    
    # Filtros adicionais
    categoria_preferida = Column(String)  # aventura, relax, team_building, etc.
    clima_preferido = Column(String)  # indoor, outdoor, ambos
    duracao_max_minutos = Column(Integer)
    
    # Estado e tracking
    estado = Column(Enum(EstadoRFQ), default=EstadoRFQ.ABERTO)
    data_criacao = Column(DateTime, default=datetime.utcnow)
    data_atualizacao = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relacionamentos
    empresa = relationship("Empresa", back_populates="rfqs")
    propostas = relationship("Proposta", back_populates="rfq", cascade="all, delete-orphan")
