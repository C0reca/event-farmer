from sqlalchemy import Column, Integer, String, DateTime, Enum
from sqlalchemy.orm import relationship
import enum
from datetime import datetime
from app.database import Base


class TipoUsuario(str, enum.Enum):
    EMPRESA = "empresa"
    FORNECEDOR = "fornecedor"
    ADMIN = "admin"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=False)
    tipo = Column(Enum(TipoUsuario), nullable=False)
    data_criacao = Column(DateTime, default=datetime.utcnow)

    # Relacionamentos
    empresa = relationship("Empresa", back_populates="user", uselist=False)
    fornecedor = relationship("Fornecedor", back_populates="user", uselist=False)

