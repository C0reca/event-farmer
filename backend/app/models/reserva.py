from sqlalchemy import Column, Integer, Float, ForeignKey, Date, Enum, DateTime
from sqlalchemy.orm import relationship
import enum
from datetime import datetime
from app.database import Base


class EstadoReserva(str, enum.Enum):
    PENDENTE = "pendente"
    CONFIRMADA = "confirmada"
    CANCELADA = "cancelada"
    RECUSADA = "recusada"


class Reserva(Base):
    __tablename__ = "reservas"

    id = Column(Integer, primary_key=True, index=True)
    empresa_id = Column(Integer, ForeignKey("empresas.id"), nullable=False)
    atividade_id = Column(Integer, ForeignKey("atividades.id"), nullable=False)
    proposta_id = Column(Integer, ForeignKey("propostas.id"), nullable=True)  # Opcional, reserva pode vir de proposta
    data = Column(Date, nullable=False)
    n_pessoas = Column(Integer, nullable=False)
    preco_total = Column(Float, nullable=False)
    estado = Column(Enum(EstadoReserva), default=EstadoReserva.PENDENTE)
    data_criacao = Column(DateTime, default=datetime.utcnow)

    # Relacionamentos
    empresa = relationship("Empresa", back_populates="reservas")
    atividade = relationship("Atividade", back_populates="reservas")
    proposta = relationship("Proposta", back_populates="reserva")
    mensagens = relationship("Mensagem", back_populates="reserva", cascade="all, delete-orphan")
    documentos = relationship("Documento", back_populates="reserva", cascade="all, delete-orphan")
    notas = relationship("NotaEvento", back_populates="reserva", cascade="all, delete-orphan")
    pagamento = relationship("Pagamento", back_populates="reserva", uselist=False, cascade="all, delete-orphan")

