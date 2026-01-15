from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base


class Documento(Base):
    __tablename__ = "documentos"

    id = Column(Integer, primary_key=True, index=True)
    reserva_id = Column(Integer, ForeignKey("reservas.id"), nullable=False)
    nome = Column(String, nullable=False)
    url = Column(String, nullable=False)  # URL do ficheiro (S3, local, etc.)
    tipo = Column(String)  # contrato, foto, certificado, etc.
    descricao = Column(Text)
    uploaded_by_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    data_upload = Column(DateTime, default=datetime.utcnow)
    
    # Relacionamentos
    reserva = relationship("Reserva", back_populates="documentos")
    uploaded_by = relationship("User", backref="documentos_uploaded")
