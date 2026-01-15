import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';
import AppLayout from '../components/layout/AppLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Loader from '../components/ui/Loader';
import PropostaForm from '../components/PropostaForm';

function FornecedorRFQs() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [rfqs, setRfqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRFQ, setSelectedRFQ] = useState(null);
  const [showPropostaForm, setShowPropostaForm] = useState(false);

  useEffect(() => {
    if (!authLoading && (!user || user.tipo !== 'fornecedor')) {
      navigate('/login');
      return;
    }

    if (user) {
      loadRFQs();
    }
  }, [user, authLoading, navigate]);

  const loadRFQs = async () => {
    try {
      const response = await api.get('/rfq/fornecedor/disponiveis');
      setRfqs(response.data);
    } catch (error) {
      toast.error('Erro ao carregar RFQs disponíveis');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProposta = (rfq) => {
    setSelectedRFQ(rfq);
    setShowPropostaForm(true);
  };

  const handlePropostaSubmit = async (propostaData) => {
    try {
      await api.post('/propostas/', propostaData);
      toast.success('Proposta enviada com sucesso!');
      setShowPropostaForm(false);
      setSelectedRFQ(null);
      loadRFQs(); // Recarregar para remover RFQ da lista
    } catch (error) {
      toast.error('Erro ao enviar proposta: ' + (error.response?.data?.detail || 'Tente novamente.'));
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('pt-PT');
  };

  if (authLoading || loading) {
    return (
      <AppLayout>
        <div className="text-center py-12">
          <Loader size="lg" />
          <p className="mt-4 text-navy-600">A carregar...</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout
      title="RFQs Disponíveis"
      description="Pedidos de proposta que pode responder"
    >
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-navy-900">RFQs Disponíveis</h1>
        <p className="text-navy-600 mt-1">
          {rfqs.length} {rfqs.length === 1 ? 'pedido disponível' : 'pedidos disponíveis'}
        </p>
      </div>

      {rfqs.length === 0 ? (
        <Card className="text-center py-12">
          <div className="max-w-md mx-auto">
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
            <h3 className="text-lg font-semibold text-navy-900 mb-2">
              Nenhum RFQ disponível no momento
            </h3>
            <p className="text-navy-600">
              Quando empresas criarem pedidos de proposta, aparecerão aqui para responder.
            </p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {rfqs.map((rfq) => (
            <Card key={rfq.id} hover>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="px-3 py-1 rounded-full text-sm font-semibold bg-primary-100 text-primary-700">
                      RFQ #{rfq.id}
                    </span>
                    <span className="text-sm text-navy-500">
                      {formatDate(rfq.data_criacao)}
                    </span>
                    <span className="text-sm text-navy-500">
                      {rfq.num_propostas} {rfq.num_propostas === 1 ? 'proposta' : 'propostas'} já recebidas
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                    <div>
                      <p className="text-sm text-navy-500">Pessoas</p>
                      <p className="font-semibold text-navy-900">{rfq.n_pessoas}</p>
                    </div>
                    <div>
                      <p className="text-sm text-navy-500">Data</p>
                      <p className="font-semibold text-navy-900">{formatDate(rfq.data_preferida)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-navy-500">Localização</p>
                      <p className="font-semibold text-navy-900">{rfq.localizacao}</p>
                      <p className="text-xs text-navy-500">Raio: {rfq.raio_km} km</p>
                    </div>
                    <div>
                      <p className="text-sm text-navy-500">Orçamento</p>
                      <p className="font-semibold text-navy-900">€{rfq.orcamento_max.toFixed(2)}</p>
                    </div>
                  </div>

                  {rfq.objetivo && (
                    <p className="text-sm text-navy-600 mb-2">
                      <strong>Objetivo:</strong> {rfq.objetivo}
                    </p>
                  )}

                  {rfq.preferencias && (
                    <div className="bg-white-soft rounded-lg p-3 mb-2">
                      <p className="text-xs font-semibold text-navy-700 mb-1">Preferências:</p>
                      <p className="text-sm text-navy-600">{rfq.preferencias}</p>
                    </div>
                  )}

                  {rfq.categoria_preferida && (
                    <div className="flex flex-wrap gap-2">
                      {rfq.categoria_preferida && (
                        <span className="px-2 py-1 bg-primary-50 text-primary-700 rounded text-xs font-semibold">
                          {rfq.categoria_preferida}
                        </span>
                      )}
                      {rfq.clima_preferido && (
                        <span className="px-2 py-1 bg-primary-50 text-primary-700 rounded text-xs font-semibold">
                          {rfq.clima_preferido}
                        </span>
                      )}
                      {rfq.duracao_max_minutos && (
                        <span className="px-2 py-1 bg-primary-50 text-primary-700 rounded text-xs font-semibold">
                          Max {rfq.duracao_max_minutos} min
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => handleCreateProposta(rfq)}
                    size="sm"
                  >
                    Enviar Proposta
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {showPropostaForm && selectedRFQ && (
        <PropostaForm
          rfq={selectedRFQ}
          onClose={() => {
            setShowPropostaForm(false);
            setSelectedRFQ(null);
          }}
          onSubmit={handlePropostaSubmit}
        />
      )}
    </AppLayout>
  );
}

export default FornecedorRFQs;
