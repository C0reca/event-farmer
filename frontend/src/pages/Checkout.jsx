import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';
import AppLayout from '../components/layout/AppLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Loader from '../components/ui/Loader';

function Checkout() {
  const { id } = useParams(); // reserva_id
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [reserva, setReserva] = useState(null);
  const [pagamento, setPagamento] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processando, setProcessando] = useState(false);
  
  // Formulário
  const [metodoPagamento, setMetodoPagamento] = useState('cartao');
  const [dadosCartao, setDadosCartao] = useState({
    numero: '',
    nome: '',
    validade: '',
    cvv: ''
  });
  const [dadosMBWay, setDadosMBWay] = useState({
    telefone: ''
  });
  const [emailFatura, setEmailFatura] = useState(user?.email || '');

  useEffect(() => {
    if (!user || user.tipo !== 'empresa') {
      navigate('/login');
      return;
    }
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      const [reservaResponse, pagamentoResponse] = await Promise.all([
        api.get(`/reservas/${id}`).catch(() => null),
        api.get(`/pagamentos/reserva/${id}`).catch(() => null)
      ]);
      
      if (reservaResponse) {
        setReserva(reservaResponse.data);
      }
      
      if (pagamentoResponse) {
        setPagamento(pagamentoResponse.data);
        if (pagamentoResponse.data.estado === 'concluido') {
          toast.success('Pagamento já foi concluído!');
          navigate(`/evento/${id}`);
        }
      }
    } catch (error) {
      toast.error('Erro ao carregar dados');
      navigate('/reservas');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitCartao = async (e) => {
    e.preventDefault();
    setProcessando(true);
    
    try {
      // Criar payment intent
      const response = await api.post('/pagamentos/cartao', {
        reserva_id: parseInt(id),
        metodo: 'cartao',
        email_fatura: emailFatura,
        descricao: `Pagamento reserva #${id}`,
        numero_cartao: dadosCartao.numero,
        nome_titular: dadosCartao.nome,
        data_validade: dadosCartao.validade,
        cvv: dadosCartao.cvv
      });
      
      const { pagamento_id, payment_intent_id, client_secret } = response.data;
      
      // Por agora, simular confirmação (em produção, usar Stripe.js)
      // TODO: Integrar com Stripe.js para processar pagamento real
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simular processamento
      
      // Confirmar pagamento
      const confirmResponse = await api.post(`/pagamentos/${pagamento_id}/confirmar`, {
        payment_intent_id: payment_intent_id,
        success: true,
        gateway_response: {
          id: payment_intent_id,
          status: 'succeeded'
        }
      });
      
      toast.success('Pagamento concluído com sucesso!');
      navigate(`/evento/${id}`);
    } catch (error) {
      toast.error('Erro ao processar pagamento: ' + (error.response?.data?.detail || 'Tente novamente.'));
    } finally {
      setProcessando(false);
    }
  };

  const handleSubmitMBWay = async (e) => {
    e.preventDefault();
    setProcessando(true);
    
    try {
      const response = await api.post('/pagamentos/mbway', {
        reserva_id: parseInt(id),
        metodo: 'mbway',
        telefone: dadosMBWay.telefone,
        email_fatura: emailFatura,
        descricao: `Pagamento MB Way reserva #${id}`
      });
      
      toast.success(`Pedido MB Way enviado para ${dadosMBWay.telefone}. Confirme no seu telemóvel.`);
      
      // Em produção, verificar status periodicamente ou via webhook
      // Por agora, simular confirmação após 3 segundos
      setTimeout(async () => {
        try {
          await api.post(`/pagamentos/${response.data.pagamento_id}/confirmar`, {
            transaction_id: response.data.payment_id,
            success: true
          });
          toast.success('Pagamento MB Way confirmado!');
          navigate(`/evento/${id}`);
        } catch (error) {
          console.error('Erro ao confirmar MB Way:', error);
        }
      }, 3000);
    } catch (error) {
      toast.error('Erro ao criar pagamento MB Way: ' + (error.response?.data?.detail || 'Tente novamente.'));
      setProcessando(false);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="text-center py-12">
          <Loader size="lg" />
          <p className="mt-4 text-navy-600">A carregar checkout...</p>
        </div>
      </AppLayout>
    );
  }

  if (!reserva) {
    return (
      <AppLayout>
        <div className="text-center py-12">
          <p className="text-navy-600">Reserva não encontrada.</p>
          <Button onClick={() => navigate('/reservas')} className="mt-4">
            Voltar para Reservas
          </Button>
        </div>
      </AppLayout>
    );
  }

  if (pagamento && pagamento.estado === 'concluido') {
    return (
      <AppLayout>
        <div className="text-center py-12">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-success-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-navy-900 mb-2">Pagamento Concluído!</h2>
            <p className="text-navy-600 mb-6">
              O seu pagamento foi processado com sucesso.
            </p>
            <Button onClick={() => navigate(`/evento/${id}`)}>
              Ver Evento
            </Button>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout
      title="Checkout"
      description="Complete o pagamento da sua reserva"
    >
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Formulário de Pagamento */}
          <div className="lg:col-span-2">
            <Card>
              <Card.Header>
                <Card.Title>Método de Pagamento</Card.Title>
              </Card.Header>
              <Card.Content>
                {/* Seleção de Método */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <button
                    type="button"
                    onClick={() => setMetodoPagamento('cartao')}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      metodoPagamento === 'cartao'
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-grey hover:border-primary-300'
                    }`}
                  >
                    <div className="text-center">
                      <svg className="w-8 h-8 mx-auto mb-2 text-navy-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                      <p className="font-semibold text-navy-900">Cartão</p>
                    </div>
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => setMetodoPagamento('mbway')}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      metodoPagamento === 'mbway'
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-grey hover:border-primary-300'
                    }`}
                  >
                    <div className="text-center">
                      <svg className="w-8 h-8 mx-auto mb-2 text-navy-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                      <p className="font-semibold text-navy-900">MB Way</p>
                    </div>
                  </button>
                </div>

                {/* Formulário Cartão */}
                {metodoPagamento === 'cartao' && (
                  <form onSubmit={handleSubmitCartao} className="space-y-4">
                    <Input
                      label="Número do Cartão"
                      type="text"
                      required
                      placeholder="1234 5678 9012 3456"
                      value={dadosCartao.numero}
                      onChange={(e) => setDadosCartao({ ...dadosCartao, numero: e.target.value.replace(/\s/g, '') })}
                      maxLength={16}
                    />
                    
                    <Input
                      label="Nome no Cartão"
                      type="text"
                      required
                      placeholder="João Silva"
                      value={dadosCartao.nome}
                      onChange={(e) => setDadosCartao({ ...dadosCartao, nome: e.target.value })}
                    />
                    
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        label="Validade (MM/AA)"
                        type="text"
                        required
                        placeholder="12/25"
                        value={dadosCartao.validade}
                        onChange={(e) => {
                          let value = e.target.value.replace(/\D/g, '');
                          if (value.length >= 2) {
                            value = value.slice(0, 2) + '/' + value.slice(2, 4);
                          }
                          setDadosCartao({ ...dadosCartao, validade: value });
                        }}
                        maxLength={5}
                      />
                      
                      <Input
                        label="CVV"
                        type="text"
                        required
                        placeholder="123"
                        value={dadosCartao.cvv}
                        onChange={(e) => setDadosCartao({ ...dadosCartao, cvv: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                        maxLength={4}
                      />
                    </div>
                    
                    <Input
                      label="Email para Fatura"
                      type="email"
                      value={emailFatura}
                      onChange={(e) => setEmailFatura(e.target.value)}
                      placeholder="fatura@example.com"
                    />
                    
                    <Button
                      type="submit"
                      className="w-full"
                      loading={processando}
                      disabled={processando}
                    >
                      {processando ? 'Processando...' : `Pagar €${reserva.preco_total.toFixed(2)}`}
                    </Button>
                  </form>
                )}

                {/* Formulário MB Way */}
                {metodoPagamento === 'mbway' && (
                  <form onSubmit={handleSubmitMBWay} className="space-y-4">
                    <Input
                      label="Número de Telemóvel"
                      type="tel"
                      required
                      placeholder="912 345 678"
                      value={dadosMBWay.telefone}
                      onChange={(e) => setDadosMBWay({ ...dadosMBWay, telefone: e.target.value.replace(/\D/g, '') })}
                    />
                    
                    <Input
                      label="Email para Fatura"
                      type="email"
                      value={emailFatura}
                      onChange={(e) => setEmailFatura(e.target.value)}
                      placeholder="fatura@example.com"
                    />
                    
                    <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 mb-4">
                      <p className="text-sm text-navy-700">
                        <strong>Como funciona:</strong> Receberá uma notificação no seu telemóvel para confirmar o pagamento. 
                        Confirme no app MB Way para completar a transação.
                      </p>
                    </div>
                    
                    <Button
                      type="submit"
                      className="w-full"
                      loading={processando}
                      disabled={processando}
                    >
                      {processando ? 'Enviando...' : `Enviar Pedido MB Way - €${reserva.preco_total.toFixed(2)}`}
                    </Button>
                  </form>
                )}
              </Card.Content>
            </Card>
          </div>

          {/* Resumo */}
          <div>
            <Card>
              <Card.Header>
                <Card.Title>Resumo da Reserva</Card.Title>
              </Card.Header>
              <Card.Content>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-navy-500 mb-1">Atividade</p>
                    <p className="font-semibold text-navy-900">
                      {reserva.atividade?.nome || 'N/A'}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-navy-500 mb-1">Data</p>
                    <p className="font-semibold text-navy-900">
                      {new Date(reserva.data).toLocaleDateString('pt-PT')}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-navy-500 mb-1">Número de Pessoas</p>
                    <p className="font-semibold text-navy-900">{reserva.n_pessoas}</p>
                  </div>
                  
                  <div className="border-t border-grey pt-4">
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-sm text-navy-500">Subtotal</p>
                      <p className="font-semibold text-navy-900">
                        €{reserva.preco_total.toFixed(2)}
                      </p>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-lg font-bold text-navy-900">Total</p>
                      <p className="text-2xl font-bold text-primary-600">
                        €{reserva.preco_total.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              </Card.Content>
            </Card>
            
            <div className="mt-4 text-center">
              <Button
                onClick={() => navigate('/reservas')}
                variant="ghost"
                size="sm"
              >
                ← Voltar
              </Button>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

export default Checkout;
