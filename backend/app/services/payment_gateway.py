"""
Serviço de integração com gateway de pagamento
Por agora, mock. Em produção, integrar com Stripe, PayPal, etc.
"""
import os
import json
from typing import Dict, Optional, Any
from datetime import datetime


class PaymentGateway:
    """Abstração para gateway de pagamento"""
    
    def __init__(self):
        self.provider = os.getenv("PAYMENT_GATEWAY", "mock")  # mock, stripe, paypal
        self.stripe_secret_key = os.getenv("STRIPE_SECRET_KEY")
        self.stripe_public_key = os.getenv("STRIPE_PUBLIC_KEY")
    
    def create_payment_intent(
        self,
        amount: float,
        currency: str = "eur",
        metadata: Optional[Dict[str, Any]] = None,
        payment_method: str = "card"
    ) -> Dict[str, Any]:
        """
        Cria intenção de pagamento no gateway
        
        Returns:
            {
                "payment_intent_id": "...",
                "client_secret": "...",  # Para Stripe
                "status": "requires_payment_method",
                "gateway": "stripe"
            }
        """
        if self.provider == "stripe" and self.stripe_secret_key:
            # TODO: Integrar com Stripe
            # import stripe
            # stripe.api_key = self.stripe_secret_key
            # intent = stripe.PaymentIntent.create(
            #     amount=int(amount * 100),  # Stripe usa centavos
            #     currency=currency,
            #     metadata=metadata or {}
            # )
            # return {
            #     "payment_intent_id": intent.id,
            #     "client_secret": intent.client_secret,
            #     "status": intent.status,
            #     "gateway": "stripe"
            # }
            pass
        
        # Mock para desenvolvimento
        payment_id = f"mock_pi_{datetime.now().timestamp()}"
        return {
            "payment_intent_id": payment_id,
            "client_secret": f"mock_secret_{payment_id}",
            "status": "requires_payment_method",
            "gateway": "mock"
        }
    
    def confirm_payment(
        self,
        payment_intent_id: str,
        payment_method_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Confirma pagamento no gateway
        
        Returns:
            {
                "success": True/False,
                "transaction_id": "...",
                "status": "succeeded",
                "gateway_response": {...}
            }
        """
        if self.provider == "stripe" and self.stripe_secret_key:
            # TODO: Integrar com Stripe
            # import stripe
            # stripe.api_key = self.stripe_secret_key
            # intent = stripe.PaymentIntent.confirm(payment_intent_id)
            # return {
            #     "success": intent.status == "succeeded",
            #     "transaction_id": intent.id,
            #     "status": intent.status,
            #     "gateway_response": intent.to_dict()
            # }
            pass
        
        # Mock para desenvolvimento - simula sucesso
        return {
            "success": True,
            "transaction_id": payment_intent_id.replace("mock_pi_", "mock_tx_"),
            "status": "succeeded",
            "gateway_response": {
                "id": payment_intent_id,
                "status": "succeeded",
                "amount": 0,
                "currency": "eur"
            }
        }
    
    def create_mbway_payment(
        self,
        amount: float,
        telefone: str,
        metadata: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Cria pagamento MB Way
        
        Returns:
            {
                "payment_id": "...",
                "status": "pending",
                "gateway": "mbway"
            }
        """
        # TODO: Integrar com gateway MB Way (ex: Easypay, Ifthenpay)
        # Por agora, mock
        payment_id = f"mock_mbway_{datetime.now().timestamp()}"
        return {
            "payment_id": payment_id,
            "status": "pending",
            "gateway": "mbway",
            "telefone": telefone
        }
    
    def verify_payment_status(
        self,
        payment_id: str
    ) -> Dict[str, Any]:
        """
        Verifica status do pagamento no gateway
        """
        if self.provider == "stripe" and self.stripe_secret_key:
            # TODO: Integrar com Stripe
            pass
        
        # Mock
        return {
            "payment_id": payment_id,
            "status": "succeeded",
            "gateway": "mock"
        }


# Instância global
payment_gateway = PaymentGateway()
