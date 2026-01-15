"""
Serviço de Email para TeamSync
Usa Resend como provider (pode ser facilmente trocado)
"""
import os
from typing import Optional, Dict, Any
from datetime import datetime

# Por agora, vamos usar um serviço simples
# Em produção, usar Resend, SendGrid, Mailgun, etc.

class EmailService:
    """Serviço de envio de emails"""
    
    def __init__(self):
        self.enabled = os.getenv("EMAIL_ENABLED", "false").lower() == "true"
        self.from_email = os.getenv("EMAIL_FROM", "noreply@teamsync.com")
        self.from_name = os.getenv("EMAIL_FROM_NAME", "TeamSync")
        
    def send_email(
        self,
        to: str,
        subject: str,
        html_content: str,
        text_content: Optional[str] = None
    ) -> bool:
        """
        Envia email
        
        Por agora, apenas loga o email (modo desenvolvimento)
        Em produção, integrar com Resend/SendGrid/etc.
        """
        if not self.enabled:
            print(f"📧 [EMAIL DISABLED] To: {to}")
            print(f"   Subject: {subject}")
            print(f"   Content: {text_content or html_content[:100]}...")
            return True
        
        # TODO: Integrar com Resend ou outro serviço
        # Exemplo com Resend:
        # import resend
        # resend.api_key = os.getenv("RESEND_API_KEY")
        # resend.Emails.send({
        #     "from": f"{self.from_name} <{self.from_email}>",
        #     "to": [to],
        #     "subject": subject,
        #     "html": html_content,
        #     "text": text_content
        # })
        
        print(f"📧 [EMAIL] To: {to}")
        print(f"   Subject: {subject}")
        print(f"   Content: {text_content or html_content[:100]}...")
        return True
    
    def send_rfq_created_notification(self, rfq_data: Dict[str, Any], empresa_email: str) -> bool:
        """Notifica empresa que RFQ foi criado"""
        subject = f"RFQ #{rfq_data['id']} criado com sucesso"
        
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: #1F4FFF; color: white; padding: 20px; border-radius: 8px 8px 0 0; }}
                .content {{ background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; }}
                .button {{ display: inline-block; background: #1F4FFF; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>TeamSync</h1>
                </div>
                <div class="content">
                    <h2>RFQ Criado com Sucesso!</h2>
                    <p>O seu pedido de proposta (RFQ #{rfq_data['id']}) foi criado e os fornecedores serão notificados.</p>
                    
                    <h3>Detalhes do RFQ:</h3>
                    <ul>
                        <li><strong>Pessoas:</strong> {rfq_data['n_pessoas']}</li>
                        <li><strong>Data:</strong> {rfq_data['data_preferida']}</li>
                        <li><strong>Localização:</strong> {rfq_data['localizacao']}</li>
                        <li><strong>Orçamento:</strong> €{rfq_data['orcamento_max']:.2f}</li>
                    </ul>
                    
                    <p>Receberá notificações quando os fornecedores enviarem propostas.</p>
                    
                    <a href="{os.getenv('FRONTEND_URL', 'http://localhost:5173')}/rfq/{rfq_data['id']}" class="button">
                        Ver RFQ
                    </a>
                </div>
            </div>
        </body>
        </html>
        """
        
        text_content = f"""
        TeamSync - RFQ Criado com Sucesso!
        
        O seu pedido de proposta (RFQ #{rfq_data['id']}) foi criado.
        
        Detalhes:
        - Pessoas: {rfq_data['n_pessoas']}
        - Data: {rfq_data['data_preferida']}
        - Localização: {rfq_data['localizacao']}
        - Orçamento: €{rfq_data['orcamento_max']:.2f}
        
        Receberá notificações quando os fornecedores enviarem propostas.
        """
        
        return self.send_email(empresa_email, subject, html_content, text_content)
    
    def send_rfq_received_notification(self, rfq_data: Dict[str, Any], fornecedor_email: str) -> bool:
        """Notifica fornecedor que recebeu um novo RFQ"""
        subject = f"Novo RFQ #{rfq_data['id']} disponível"
        
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: #1F4FFF; color: white; padding: 20px; border-radius: 8px 8px 0 0; }}
                .content {{ background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; }}
                .button {{ display: inline-block; background: #1F4FFF; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>TeamSync</h1>
                </div>
                <div class="content">
                    <h2>Novo RFQ Disponível!</h2>
                    <p>Recebeu um novo pedido de proposta que pode responder.</p>
                    
                    <h3>Detalhes do RFQ:</h3>
                    <ul>
                        <li><strong>Pessoas:</strong> {rfq_data['n_pessoas']}</li>
                        <li><strong>Data:</strong> {rfq_data['data_preferida']}</li>
                        <li><strong>Localização:</strong> {rfq_data['localizacao']}</li>
                        <li><strong>Orçamento:</strong> €{rfq_data['orcamento_max']:.2f}</li>
                        {f"<li><strong>Objetivo:</strong> {rfq_data.get('objetivo', 'N/A')}</li>" if rfq_data.get('objetivo') else ""}
                    </ul>
                    
                    <a href="{os.getenv('FRONTEND_URL', 'http://localhost:5173')}/fornecedor/rfqs" class="button">
                        Ver e Responder
                    </a>
                </div>
            </div>
        </body>
        </html>
        """
        
        text_content = f"""
        TeamSync - Novo RFQ Disponível!
        
        Recebeu um novo pedido de proposta (RFQ #{rfq_data['id']}).
        
        Detalhes:
        - Pessoas: {rfq_data['n_pessoas']}
        - Data: {rfq_data['data_preferida']}
        - Localização: {rfq_data['localizacao']}
        - Orçamento: €{rfq_data['orcamento_max']:.2f}
        
        Aceda à plataforma para enviar uma proposta.
        """
        
        return self.send_email(fornecedor_email, subject, html_content, text_content)
    
    def send_proposta_received_notification(
        self,
        proposta_data: Dict[str, Any],
        empresa_email: str,
        fornecedor_nome: str
    ) -> bool:
        """Notifica empresa que recebeu uma proposta"""
        subject = f"Nova proposta recebida para RFQ #{proposta_data['rfq_id']}"
        
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: #1F4FFF; color: white; padding: 20px; border-radius: 8px 8px 0 0; }}
                .content {{ background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; }}
                .button {{ display: inline-block; background: #1F4FFF; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px; }}
                .highlight {{ background: white; padding: 15px; border-radius: 6px; margin: 15px 0; border-left: 4px solid #1F4FFF; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>TeamSync</h1>
                </div>
                <div class="content">
                    <h2>Nova Proposta Recebida!</h2>
                    <p>Recebeu uma nova proposta do fornecedor <strong>{fornecedor_nome}</strong>.</p>
                    
                    <div class="highlight">
                        <h3>Detalhes da Proposta:</h3>
                        <ul>
                            <li><strong>Preço Total:</strong> €{proposta_data['preco_total']:.2f}</li>
                            <li><strong>Preço por Pessoa:</strong> €{proposta_data['preco_por_pessoa']:.2f}</li>
                            <li><strong>Data Proposta:</strong> {proposta_data['data_proposta']}</li>
                        </ul>
                    </div>
                    
                    <a href="{os.getenv('FRONTEND_URL', 'http://localhost:5173')}/rfq/{proposta_data['rfq_id']}" class="button">
                        Ver e Comparar Propostas
                    </a>
                </div>
            </div>
        </body>
        </html>
        """
        
        text_content = f"""
        TeamSync - Nova Proposta Recebida!
        
        Recebeu uma nova proposta do fornecedor {fornecedor_nome} para o RFQ #{proposta_data['rfq_id']}.
        
        Detalhes:
        - Preço Total: €{proposta_data['preco_total']:.2f}
        - Preço por Pessoa: €{proposta_data['preco_por_pessoa']:.2f}
        - Data: {proposta_data['data_proposta']}
        
        Aceda à plataforma para ver e comparar propostas.
        """
        
        return self.send_email(empresa_email, subject, html_content, text_content)
    
    def send_proposta_aceite_notification(
        self,
        proposta_data: Dict[str, Any],
        fornecedor_email: str,
        empresa_nome: str
    ) -> bool:
        """Notifica fornecedor que proposta foi aceite"""
        subject = f"Proposta aceite! RFQ #{proposta_data['rfq_id']}"
        
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: #2ED47A; color: white; padding: 20px; border-radius: 8px 8px 0 0; }}
                .content {{ background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; }}
                .button {{ display: inline-block; background: #2ED47A; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px; }}
                .highlight {{ background: white; padding: 15px; border-radius: 6px; margin: 15px 0; border-left: 4px solid #2ED47A; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>TeamSync</h1>
                </div>
                <div class="content">
                    <h2>🎉 Proposta Aceite!</h2>
                    <p>A sua proposta foi aceite pela empresa <strong>{empresa_nome}</strong>!</p>
                    
                    <div class="highlight">
                        <h3>Detalhes:</h3>
                        <ul>
                            <li><strong>Preço Total:</strong> €{proposta_data['preco_total']:.2f}</li>
                            <li><strong>Data do Evento:</strong> {proposta_data['data_proposta']}</li>
                        </ul>
                    </div>
                    
                    <p>A empresa será contactada para finalizar a reserva e pagamento.</p>
                    
                    <a href="{os.getenv('FRONTEND_URL', 'http://localhost:5173')}/fornecedor" class="button">
                        Ver Detalhes
                    </a>
                </div>
            </div>
        </body>
        </html>
        """
        
        text_content = f"""
        TeamSync - Proposta Aceite!
        
        A sua proposta foi aceite pela empresa {empresa_nome} para o RFQ #{proposta_data['rfq_id']}.
        
        Detalhes:
        - Preço Total: €{proposta_data['preco_total']:.2f}
        - Data: {proposta_data['data_proposta']}
        
        A empresa será contactada para finalizar a reserva.
        """
        
        return self.send_email(fornecedor_email, subject, html_content, text_content)
    
    def send_reserva_confirmada_notification(
        self,
        reserva_data: Dict[str, Any],
        empresa_email: str,
        fornecedor_nome: str
    ) -> bool:
        """Notifica empresa que reserva foi confirmada"""
        subject = f"Reserva confirmada - {reserva_data.get('atividade_nome', 'Evento')}"
        
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: #2ED47A; color: white; padding: 20px; border-radius: 8px 8px 0 0; }}
                .content {{ background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; }}
                .button {{ display: inline-block; background: #2ED47A; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>TeamSync</h1>
                </div>
                <div class="content">
                    <h2>✅ Reserva Confirmada!</h2>
                    <p>A sua reserva foi confirmada pelo fornecedor <strong>{fornecedor_nome}</strong>.</p>
                    
                    <h3>Detalhes:</h3>
                    <ul>
                        <li><strong>Atividade:</strong> {reserva_data.get('atividade_nome', 'N/A')}</li>
                        <li><strong>Data:</strong> {reserva_data.get('data', 'N/A')}</li>
                        <li><strong>Pessoas:</strong> {reserva_data.get('n_pessoas', 'N/A')}</li>
                        <li><strong>Preço Total:</strong> €{reserva_data.get('preco_total', 0):.2f}</li>
                    </ul>
                    
                    <a href="{os.getenv('FRONTEND_URL', 'http://localhost:5173')}/reservas" class="button">
                        Ver Reserva
                    </a>
                </div>
            </div>
        </body>
        </html>
        """
        
        text_content = f"""
        TeamSync - Reserva Confirmada!
        
        A sua reserva foi confirmada pelo fornecedor {fornecedor_nome}.
        
        Detalhes:
        - Atividade: {reserva_data.get('atividade_nome', 'N/A')}
        - Data: {reserva_data.get('data', 'N/A')}
        - Pessoas: {reserva_data.get('n_pessoas', 'N/A')}
        - Preço: €{reserva_data.get('preco_total', 0):.2f}
        """
        
        return self.send_email(empresa_email, subject, html_content, text_content)


# Instância global do serviço
email_service = EmailService()
