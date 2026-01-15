import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';
import AppLayout from '../components/layout/AppLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Loader from '../components/ui/Loader';

function CompararPropostas() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const rfqId = searchParams.get('rfq');
  
  const [rfq, setRfq] = useState(null);
  const [propostas, setPropostas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProposta, setSelectedProposta] = useState(null);

  useEffect(() => {
    if (!rfqId) {
      navigate('/rfqs');
      return;
    }

    loadData();
  }, [rfqId]);

  const loadData = async () => {
    try {
      const [rfqResponse, propostasResponse] = await Promise.all([
        api.get(`/rfq/${rfqId}`),
        api.get(`/propostas/rfq/${rfqId}`)
      ]);
      
      setRfq(rfqResponse.data);
      setPropostas(propostasResponse.data);
    } catch (error) {
      toast.error('Erro ao carregar dados');
      navigate('/rfqs');
    } finally {
      setLoading(false);
    }
  };

  const handleAceitarProposta = async (propostaId) => {
    if (!window.confirm('Tem certeza que deseja aceitar esta proposta? Isso criará uma reserva.')) {
      return;
    }

    try {
      await api.post(`/propostas/${propostaId}/aceitar`);
      toast.success('Proposta aceite! Será redirecionado para criar a reserva.');
      loadData();
      // TODO: Redirecionar para checkout/pagamento
    } catch (error) {
      toast.error('Erro ao aceitar proposta: ' + (error.response?.data?.detail || 'Tente novamente.'));
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

  if (!rfq || propostas.length === 0) {
    return (
      <AppLayout>
        <div className="text-center py-12">
          <p className="text-navy-600">Nenhuma proposta para comparar.</p>
          <Button onClick={() => navigate('/rfqs')} className="mt-4">
            Voltar para RFQs
          </Button>
        </div>
      </AppLayout>
    );
  }

  // Ordenar propostas por preço (menor primeiro)
  const propostasOrdenadas = [...propostas].sort((a, b) => a.preco_total - b.preco_total);

  return (
    <AppLayout
      title="Comparar Propostas"
      description="Compare as propostas recebidas e escolha a melhor opção"
    >
      <div className="mb-6">
        <Button
          onClick={() => navigate(`/rfq/${rfqId}`)}
          variant="ghost"
          size="sm"
        >
          ← Voltar para RFQ
        </Button>
      </div>

      {/* Resumo do RFQ */}
      <Card className="mb-6">
        <Card.Header>
          <Card.Title>RFQ #{rfq.id}</Card.Title>
        </Card.Header>
        <Card.Content>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-navy-500">Pessoas</p>
              <p className="font-semibold text-navy-900">{rfq.n_pessoas}</p>
            </div>
            <div>
              <p className="text-navy-500">Data</p>
              <p className="font-semibold text-navy-900">{formatDate(rfq.data_preferida)}</p>
            </div>
            <div>
              <p className="text-navy-500">Localização</p>
              <p className="font-semibold text-navy-900">{rfq.localizacao}</p>
            </div>
            <div>
              <p className="text-navy-500">Orçamento Max</p>
              <p className="font-semibold text-navy-900">€{rfq.orcamento_max.toFixed(2)}</p>
            </div>
          </div>
        </Card.Content>
      </Card>

      {/* Comparação lado a lado */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-navy-900 mb-4">
          {propostas.length} {propostas.length === 1 ? 'Proposta Recebida' : 'Propostas Recebidas'}
        </h2>
        
        <div className={`grid grid-cols-1 ${propostas.length <= 2 ? 'md:grid-cols-2' : 'md:grid-cols-3'} gap-4`}>
          {propostasOrdenadas.map((proposta, index) => (
            <Card 
              key={proposta.id} 
              className={`relative ${selectedProposta === proposta.id ? 'ring-2 ring-primary-500' : ''} ${
                index === 0 ? 'border-2 border-success-500' : ''
              }`}
              hover
            >
              {index === 0 && (
                <div className="absolute top-2 right-2 bg-success-500 text-white px-2 py-1 rounded text-xs font-semibold">
                  Melhor Preço
                </div>
              )}
              
              <Card.Header>
                <Card.Title className="text-lg">{proposta.fornecedor_nome}</Card.Title>
                <Card.Description>
                  {proposta.atividade_nome || 'Proposta personalizada'}
                </Card.Description>
              </Card.Header>
              
              <Card.Content>
                <div className="space-y-4">
                  {/* Preço */}
                  <div className="text-center pb-4 border-b border-grey">
                    <p className="text-sm text-navy-500 mb-1">Preço Total</p>
                    <p className="text-3xl font-bold text-primary-600">
                      €{proposta.preco_total.toFixed(2)}
                    </p>
                    <p className="text-sm text-navy-500 mt-1">
                      €{proposta.preco_por_pessoa.toFixed(2)} por pessoa
                    </p>
                  </div>

                  {/* Informações */}
                  <div className="space-y-2 text-sm">
                    <div>
                      <p className="text-navy-500">Data Proposta</p>
                      <p className="font-semibold text-navy-900">{formatDate(proposta.data_proposta)}</p>
                    </div>
                    {proposta.duracao_minutos && (
                      <div>
                        <p className="text-navy-500">Duração</p>
                        <p className="font-semibold text-navy-900">{proposta.duracao_minutos} minutos</p>
                      </div>
                    )}
                  </div>

                  {/* O que está incluído */}
                  {proposta.descricao && (
                    <div>
                      <p className="text-sm font-semibold text-navy-700 mb-1">O que está incluído:</p>
                      <p className="text-sm text-navy-600 line-clamp-3">{proposta.descricao}</p>
                    </div>
                  )}

                  {/* Extras */}
                  {proposta.extras && (
                    <div>
                      <p className="text-sm font-semibold text-navy-700 mb-1">Extras:</p>
                      <p className="text-sm text-navy-600 line-clamp-2">{proposta.extras}</p>
                    </div>
                  )}

                  {/* Condições */}
                  {proposta.condicoes && (
                    <div>
                      <p className="text-sm font-semibold text-navy-700 mb-1">Condições:</p>
                      <p className="text-sm text-navy-600 line-clamp-2">{proposta.condicoes}</p>
                    </div>
                  )}

                  {/* Estado */}
                  <div className="pt-2 border-t border-grey">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      proposta.estado === 'pendente' ? 'bg-warning-100 text-warning-700' :
                      proposta.estado === 'aceite' ? 'bg-success-100 text-success-700' :
                      'bg-error-100 text-error-700'
                    }`}>
                      {proposta.estado.charAt(0).toUpperCase() + proposta.estado.slice(1)}
                    </span>
                  </div>
                </div>
              </Card.Content>

              <Card.Footer>
                {proposta.estado === 'pendente' ? (
                  <div className="w-full space-y-2">
                    <Button
                      onClick={async () => {
                        await handleAceitarProposta(proposta.id);
                        // Recarregar dados para obter reserva_id
                        await loadData();
                        // Buscar reserva criada
                        try {
                          const propostasResponse = await api.get(`/propostas/rfq/${rfqId}`);
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
                      className="w-full"
                      size="sm"
                    >
                      Aceitar e Pagar
                    </Button>
                    <Button
                      onClick={() => setSelectedProposta(proposta.id)}
                      variant={selectedProposta === proposta.id ? 'primary' : 'outline'}
                      className="w-full"
                      size="sm"
                    >
                      {selectedProposta === proposta.id ? 'Selecionada' : 'Selecionar'}
                    </Button>
                  </div>
                ) : proposta.estado === 'aceite' ? (
                  <div className="w-full text-center">
                    <p className="text-sm font-semibold text-success-600 mb-2">
                      ✓ Proposta Aceite
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => navigate(`/rfq/${rfqId}`)}
                    >
                      Ver Detalhes
                    </Button>
                  </div>
                ) : (
                  <p className="text-sm text-navy-500 text-center w-full">
                    Proposta recusada
                  </p>
                )}
              </Card.Footer>
            </Card>
          ))}
        </div>
      </div>

      {/* Ações em lote (se múltiplas selecionadas) */}
      {selectedProposta && (
        <Card className="bg-primary-50 border-primary-200">
          <Card.Content>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-navy-900">Proposta selecionada</p>
                <p className="text-sm text-navy-600">
                  Pronto para aceitar e criar reserva
                </p>
              </div>
              <Button
                onClick={() => {
                  const proposta = propostas.find(p => p.id === selectedProposta);
                  if (proposta) {
                    handleAceitarProposta(proposta.id);
                  }
                }}
              >
                Aceitar e Continuar
              </Button>
            </div>
          </Card.Content>
        </Card>
      )}
    </AppLayout>
  );
}

export default CompararPropostas;
