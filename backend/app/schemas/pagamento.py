from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


class PagamentoCreate(BaseModel):
    reserva_id: int
    metodo: str  # "cartao", "transferencia", "mbway", "paypal"
    email_fatura: Optional[EmailStr] = None
    descricao: Optional[str] = None


class PagamentoCartaoCreate(PagamentoCreate):
    # Dados do cartão (serão processados pelo gateway, não armazenados)
    numero_cartao: Optional[str] = None  # Apenas para validação inicial
    nome_titular: Optional[str] = None
    data_validade: Optional[str] = None
    cvv: Optional[str] = None


class PagamentoMBWayCreate(PagamentoCreate):
    telefone: str


class PagamentoResponse(BaseModel):
    id: int
    reserva_id: int
    valor: float
    metodo: str
    estado: str
    gateway_payment_id: Optional[str]
    gateway_transaction_id: Optional[str]
    descricao: Optional[str]
    email_fatura: Optional[str]
    data_criacao: str
    data_atualizacao: str
    data_conclusao: Optional[str]
    
    class Config:
        from_attributes = True


class PagamentoConfirmar(BaseModel):
    payment_intent_id: Optional[str] = None  # Para Stripe
    transaction_id: Optional[str] = None  # Para outros gateways
    success: bool
    gateway_response: Optional[dict] = None
