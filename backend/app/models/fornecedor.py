from sqlalchemy import Column, Integer, String, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.database import Base


class Fornecedor(Base):
    __tablename__ = "fornecedores"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    nome = Column(String, nullable=False)
    localizacao = Column(String)
    descricao = Column(Text)
    contacto = Column(String)

    # Relacionamentos
    user = relationship("User", back_populates="fornecedor")
    atividades = relationship("Atividade", back_populates="fornecedor")
    avaliacoes = relationship("Avaliacao", back_populates="fornecedor")

