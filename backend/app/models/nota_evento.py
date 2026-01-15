from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base


class NotaEvento(Base):
    __tablename__ = "notas_evento"

    id = Column(Integer, primary_key=True, index=True)
    reserva_id = Column(Integer, ForeignKey("reservas.id"), nullable=False)
    titulo = Column(String)
    conteudo = Column(Text, nullable=False)
    criado_por_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    data_criacao = Column(DateTime, default=datetime.utcnow)
    data_atualizacao = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relacionamentos
    reserva = relationship("Reserva", back_populates="notas")
    criado_por = relationship("User", backref="notas_criadas")
