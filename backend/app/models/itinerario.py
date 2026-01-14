from sqlalchemy import Column, Integer, String, ForeignKey, Date, Text, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base


class Itinerario(Base):
    __tablename__ = "itinerarios"

    id = Column(Integer, primary_key=True, index=True)
    empresa_id = Column(Integer, ForeignKey("empresas.id"), nullable=False)
    data = Column(Date, nullable=False)
    atividades = Column(Text)  # JSON string com lista de atividades
    restaurante_sugerido = Column(String)
    data_criacao = Column(DateTime, default=datetime.utcnow)

    # Relacionamentos
    empresa = relationship("Empresa", back_populates="itinerarios")

