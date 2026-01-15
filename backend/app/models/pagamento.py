from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Enum as SQLEnum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from app.database import Base


class EstadoPagamento(str, enum.Enum):
    PENDENTE = "pendente"
    PROCESSANDO = "processando"
    CONCLUIDO = "concluido"
    FALHADO = "falhado"
    CANCELADO = "cancelado"
    REEMBOLSADO = "reembolsado"


class MetodoPagamento(str, enum.Enum):
    CARTAO = "cartao"
    TRANSFERENCIA = "transferencia"
    MBWAY = "mbway"
    PAYPAL = "paypal"


class Pagamento(Base):
    __tablename__ = "pagamentos"

    id = Column(Integer, primary_key=True, index=True)
    reserva_id = Column(Integer, ForeignKey("reservas.id"), nullable=False, unique=True)
    valor = Column(Float, nullable=False)
    metodo = Column(SQLEnum(MetodoPagamento), nullable=False)
    estado = Column(SQLEnum(EstadoPagamento), default=EstadoPagamento.PENDENTE)
    
    # Dados do gateway
    gateway_payment_id = Column(String)  # ID do pagamento no gateway (Stripe, PayPal, etc.)
    gateway_transaction_id = Column(String)  # ID da transação
    gateway_response = Column(String)  # JSON com resposta do gateway
    
    # Dados adicionais
    descricao = Column(String)
    email_fatura = Column(String)
    
    # Timestamps
    data_criacao = Column(DateTime, default=datetime.utcnow)
    data_atualizacao = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    data_conclusao = Column(DateTime)
    
    # Relacionamentos
    reserva = relationship("Reserva", back_populates="pagamento")

