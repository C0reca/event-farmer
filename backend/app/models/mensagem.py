from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base


class Mensagem(Base):
    __tablename__ = "mensagens"

    id = Column(Integer, primary_key=True, index=True)
    reserva_id = Column(Integer, ForeignKey("reservas.id"), nullable=False)
    remetente_id = Column(Integer, ForeignKey("users.id"), nullable=False)  # User que enviou
    destinatario_id = Column(Integer, ForeignKey("users.id"), nullable=False)  # User que recebe
    conteudo = Column(Text, nullable=False)
    lida = Column(Boolean, default=False)
    data_criacao = Column(DateTime, default=datetime.utcnow)
    
    # Relacionamentos
    reserva = relationship("Reserva", back_populates="mensagens")
    remetente = relationship("User", foreign_keys=[remetente_id], backref="mensagens_enviadas")
    destinatario = relationship("User", foreign_keys=[destinatario_id], backref="mensagens_recebidas")
