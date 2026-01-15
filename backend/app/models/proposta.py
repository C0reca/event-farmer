from sqlalchemy import Column, Integer, String, Text, Float, ForeignKey, Date, Enum, DateTime, Boolean
from sqlalchemy.orm import relationship
import enum
from datetime import datetime
from app.database import Base


class EstadoProposta(str, enum.Enum):
    PENDENTE = "pendente"  # Enviada, aguardando resposta
    ACEITE = "aceite"  # Aceite pela empresa
    RECUSADA = "recusada"  # Recusada pela empresa
    EXPIRADA = "expirada"  # Expirada (não respondida a tempo)


class Proposta(Base):
    __tablename__ = "propostas"

    id = Column(Integer, primary_key=True, index=True)
    rfq_id = Column(Integer, ForeignKey("rfqs.id"), nullable=False)
    fornecedor_id = Column(Integer, ForeignKey("fornecedores.id"), nullable=False)
    atividade_id = Column(Integer, ForeignKey("atividades.id"), nullable=True)  # Opcional, pode criar proposta sem atividade específica
    
    # Detalhes da proposta
    preco_total = Column(Float, nullable=False)
    preco_por_pessoa = Column(Float, nullable=False)
    descricao = Column(Text)  # O que está incluído
    extras = Column(Text)  # Extras disponíveis (opcional)
    condicoes = Column(Text)  # Condições especiais, cancelamento, etc.
    data_proposta = Column(Date, nullable=False)  # Data proposta para o evento
    duracao_minutos = Column(Integer)
    
    # Estado
    estado = Column(Enum(EstadoProposta), default=EstadoProposta.PENDENTE)
    data_criacao = Column(DateTime, default=datetime.utcnow)
    data_atualizacao = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    data_expiracao = Column(DateTime)  # Data limite para resposta
    
    # Relacionamentos
    rfq = relationship("RFQ", back_populates="propostas")
    fornecedor = relationship("Fornecedor", back_populates="propostas")
    atividade = relationship("Atividade", back_populates="propostas")
    reserva = relationship("Reserva", back_populates="proposta", uselist=False)
