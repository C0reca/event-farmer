from sqlalchemy import Column, Integer, String, Float, ForeignKey, Text, DateTime, Enum
from sqlalchemy.orm import relationship
import enum
from datetime import datetime
from app.database import Base


class Avaliacao(Base):
    __tablename__ = "avaliacoes"

    id = Column(Integer, primary_key=True, index=True)
    empresa_id = Column(Integer, ForeignKey("empresas.id"), nullable=False)
    atividade_id = Column(Integer, ForeignKey("atividades.id"), nullable=True)
    fornecedor_id = Column(Integer, ForeignKey("fornecedores.id"), nullable=True)
    rating = Column(Integer, nullable=False)  # 1-5 estrelas
    comentario = Column(Text)
    data_criacao = Column(DateTime, default=datetime.utcnow)

    # Relacionamentos
    empresa = relationship("Empresa", back_populates="avaliacoes")
    atividade = relationship("Atividade", back_populates="avaliacoes")
    fornecedor = relationship("Fornecedor", back_populates="avaliacoes")

