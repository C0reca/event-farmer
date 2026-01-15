import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';
import AppLayout from '../components/layout/AppLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Loader from '../components/ui/Loader';

function RFQDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [rfq, setRfq] = useState(null);
  const [propostas, setPropostas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRFQ();
    loadPropostas();
  }, [id]);

  const loadRFQ = async () => {
    try {
      const response = await api.get(`/rfq/${id}`);
      setRfq(response.data);
    } catch (error) {
      toast.error('Erro ao carregar RFQ');
      navigate('/rfqs');
    } finally {
      setLoading(false);
    }
  };

  const loadPropostas = async () => {
    try {
      const response = await api.get(`/propostas/rfq/${id}`);
      setPropostas(response.data);
    } catch (error) {
      console.error('Erro ao carregar propostas:', error);
    }
  };

  const handleAceitarProposta = async (propostaId) => {
    if (!window.confirm('Tem certeza que deseja aceitar esta proposta? Isso criará uma reserva.')) {
      return;
    }

    try {
      await api.post(`/propostas/${propostaId}/aceitar`);
      toast.success('Proposta aceite!');
      loadRFQ();
      loadPropostas();
      // Redirecionar para comparação
      navigate(`/propostas/comparar?rfq=${rfq.id}`);
    } catch (error) {
      toast.error('Erro ao aceitar proposta: ' + (error.response?.data?.detail || 'Tente novamente.'));
    }
  };

  const handleRecusarProposta = async (propostaId) => {
    if (!window.confirm('Tem certeza que deseja recusar esta proposta?')) {
      return;
    }

    try {
      await api.post(`/propostas/${propostaId}/recusar`);
      toast.success('Proposta recusada.');
      loadPropostas();
    } catch (error) {
      toast.error('Erro ao recusar proposta: ' + (error.response?.data?.detail || 'Tente novamente.'));
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('pt-PT');
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="text-center py-12">
          <Loader size="lg" />
          <p className="mt-4 text-navy-600">A carregar...</p>
        </div>
      </AppLayout>
    );
  }

  if (!rfq) {
    return null;
  }

  return (
    <AppLayout
      title={`RFQ #${rfq.id}`}
      description="Detalhes do pedido de proposta e propostas recebidas"
    >
      <div className="mb-6">
        <Button
          onClick={() => navigate('/rfqs')}
          variant="ghost"
          size="sm"
        >
          ← Voltar para RFQs
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Detalhes do RFQ */}
        <div className="lg:col-span-1">
          <Card>
            <Card.Header>
              <Card.Title>Detalhes do RFQ</Card.Title>
            </Card.Header>
            <Card.Content>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-navy-500 mb-1">Estado</p>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    rfq.estado === 'aberto' ? 'bg-primary-100 text-primary-700' :
                    rfq.estado === 'em_negociacao' ? 'bg-warning-100 text-warning-700' :
                    rfq.estado === 'fechado' ? 'bg-success-100 text-success-700' :
                    'bg-error-100 text-error-700'
                  }`}>
                    {rfq.estado.charAt(0).toUpperCase() + rfq.estado.slice(1)}
                  </span>
                </div>

                <div>
                  <p className="text-sm text-navy-500 mb-1">Número de Pessoas</p>
                  <p className="font-semibold text-navy-900">{rfq.n_pessoas}</p>
                </div>

                <div>
                  <p className="text-sm text-navy-500 mb-1">Data Preferida</p>
                  <p className="font-semibold text-navy-900">{formatDate(rfq.data_preferida)}</p>
                </div>

                {rfq.data_alternativa && (
                  <div>
                    <p className="text-sm text-navy-500 mb-1">Data Alternativa</p>
                    <p className="font-semibold text-navy-900">{formatDate(rfq.data_alternativa)}</p>
                  </div>
                )}

                <div>
                  <p className="text-sm text-navy-500 mb-1">Localização</p>
                  <p className="font-semibold text-navy-900">{rfq.localizacao}</p>
                  <p className="text-xs text-navy-500">Raio: {rfq.raio_km} km</p>
                </div>

                <div>
                  <p className="text-sm text-navy-500 mb-1">Orçamento Máximo</p>
                  <p className="font-semibold text-navy-900">€{rfq.orcamento_max.toFixed(2)}</p>
                </div>

                {rfq.objetivo && (
                  <div>
                    <p className="text-sm text-navy-500 mb-1">Objetivo</p>
                    <p className="font-semibold text-navy-900 capitalize">{rfq.objetivo}</p>
                  </div>
                )}

                {rfq.preferencias && (
                  <div>
                    <p className="text-sm text-navy-500 mb-1">Preferências</p>
                    <p className="text-navy-700 text-sm">{rfq.preferencias}</p>
                  </div>
                )}

                {rfq.categoria_preferida && (
                  <div>
                    <p className="text-sm text-navy-500 mb-1">Categoria</p>
                    <p className="font-semibold text-navy-900 capitalize">{rfq.categoria_preferida}</p>
                  </div>
                )}

                {rfq.clima_preferido && (
                  <div>
                    <p className="text-sm text-navy-500 mb-1">Clima</p>
                    <p className="font-semibold text-navy-900 capitalize">{rfq.clima_preferido}</p>
                  </div>
                )}

                {rfq.duracao_max_minutos && (
                  <div>
                    <p className="text-sm text-navy-500 mb-1">Duração Máx</p>
                    <p className="font-semibold text-navy-900">{rfq.duracao_max_minutos} minutos</p>
                  </div>
                )}
              </div>
            </Card.Content>
          </Card>
        </div>

        {/* Propostas */}
        <div className="lg:col-span-2">
          <Card>
            <Card.Header>
              <Card.Title>
                Propostas Recebidas ({propostas.length})
              </Card.Title>
              <Card.Description>
                {propostas.length === 0 
                  ? 'Ainda não recebeu propostas. Os fornecedores serão notificados.'
                  : 'Compare as propostas e escolha a melhor opção para o seu evento.'}
              </Card.Description>
            </Card.Header>
            <Card.Content>
              {propostas.length === 0 ? (
                <div className="text-center py-12">
                  <svg
                    className="mx-auto h-12 w-12 text-navy-400 mb-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <p className="text-navy-600">Aguardando propostas dos fornecedores...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {propostas.map((proposta) => (
                    <Card key={proposta.id} className="border-2" hover>
                      <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <h3 className="text-lg font-semibold text-navy-900">
                              {proposta.fornecedor_nome}
                            </h3>
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${
                              proposta.estado === 'pendente' ? 'bg-warning-100 text-warning-700' :
                              proposta.estado === 'aceite' ? 'bg-success-100 text-success-700' :
                              'bg-error-100 text-error-700'
                            }`}>
                              {proposta.estado.charAt(0).toUpperCase() + proposta.estado.slice(1)}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-4 mb-3">
                            <div>
                              <p className="text-sm text-navy-500">Preço Total</p>
                              <p className="text-2xl font-bold text-primary-600">
                                €{proposta.preco_total.toFixed(2)}
                              </p>
                              <p className="text-xs text-navy-500">
                                €{proposta.preco_por_pessoa.toFixed(2)} por pessoa
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-navy-500">Data Proposta</p>
                              <p className="font-semibold text-navy-900">
                                {formatDate(proposta.data_proposta)}
                              </p>
                              {proposta.duracao_minutos && (
                                <p className="text-xs text-navy-500">
                                  {proposta.duracao_minutos} minutos
                                </p>
                              )}
                            </div>
                          </div>

                          {proposta.descricao && (
                            <div className="mb-3">
                              <p className="text-sm font-semibold text-navy-700 mb-1">O que está incluído:</p>
                              <p className="text-sm text-navy-600">{proposta.descricao}</p>
                            </div>
                          )}

                          {proposta.extras && (
                            <div className="mb-3">
                              <p className="text-sm font-semibold text-navy-700 mb-1">Extras:</p>
                              <p className="text-sm text-navy-600">{proposta.extras}</p>
                            </div>
                          )}

                          {proposta.condicoes && (
                            <div className="mb-3">
                              <p className="text-sm font-semibold text-navy-700 mb-1">Condições:</p>
                              <p className="text-sm text-navy-600">{proposta.condicoes}</p>
                            </div>
                          )}

                          {proposta.atividade_nome && (
                            <p className="text-xs text-navy-500">
                              Atividade: {proposta.atividade_nome}
                            </p>
                          )}
                        </div>

                        <div className="flex flex-col gap-2 md:min-w-[150px]">
                          {proposta.estado === 'pendente' ? (
                            <>
                              <Button
                                onClick={async () => {
                                  await handleAceitarProposta(proposta.id);
                                  // Recarregar dados para obter reserva_id
                                  await loadRFQ();
                                  // Buscar reserva criada
                                  try {
                                    const propostasResponse = await api.get(`/propostas/rfq/${rfq.id}`);
                                    const propostaAceite = propostasResponse.data.find(p => p.id === proposta.id);
                                    if (propostaAceite?.reserva_id) {
                                      navigate(`/checkout/${propostaAceite.reserva_id}`);
                                    } else {
                                      navigate('/reservas');
                                    }
                                  } catch (error) {
                                    navigate('/reservas');
                                  }
                                }}
                                size="sm"
                              >
                                Aceitar e Pagar
                              </Button>
                              <Button
                                onClick={() => handleRecusarProposta(proposta.id)}
                                variant="outline"
                                size="sm"
                              >
                                Recusar
                              </Button>
                            </>
                          ) : proposta.estado === 'aceite' ? (
                            <div className="text-center">
                              <p className="text-sm font-semibold text-success-600 mb-2">
                                ✓ Proposta Aceite
                              </p>
                              <Link to={`/propostas/comparar?rfq=${rfq.id}`}>
                                <Button variant="outline" size="sm">
                                  Ver Comparação
                                </Button>
                              </Link>
                            </div>
                          ) : (
                            <p className="text-sm text-navy-500 text-center">
                              Proposta recusada
                            </p>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </Card.Content>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}

export default RFQDetail;
