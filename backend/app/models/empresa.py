from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Float, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base


class Empresa(Base):
    __tablename__ = "empresas"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    nome = Column(String, nullable=False)
    setor = Column(String)
    n_funcionarios = Column(Integer)
    localizacao = Column(String)
    orcamento_medio = Column(Float)
    preferencia_atividades = Column(Text)  # JSON string ou texto livre

    # Relacionamentos
    user = relationship("User", back_populates="empresa")
    reservas = relationship("Reserva", back_populates="empresa")
    itinerarios = relationship("Itinerario", back_populates="empresa")
    avaliacoes = relationship("Avaliacao", back_populates="empresa")

