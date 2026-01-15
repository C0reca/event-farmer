import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';
import AppLayout from '../components/layout/AppLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import RFQForm from '../components/RFQForm';
import Loader from '../components/ui/Loader';

function RFQs() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [rfqs, setRfqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRFQForm, setShowRFQForm] = useState(false);

  useEffect(() => {
    if (!authLoading && (!user || user.tipo !== 'empresa')) {
      navigate('/login');
      return;
    }

    if (user) {
      loadRFQs();
    }
  }, [user, authLoading, navigate]);

  const loadRFQs = async () => {
    try {
      const response = await api.get('/rfq/');
      setRfqs(response.data);
    } catch (error) {
      toast.error('Erro ao carregar RFQs');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRFQ = async (rfqData) => {
    try {
      await api.post('/rfq/', rfqData);
      toast.success('RFQ criado com sucesso! Os fornecedores receberão notificação.');
      setShowRFQForm(false);
      loadRFQs();
    } catch (error) {
      toast.error('Erro ao criar RFQ: ' + (error.response?.data?.detail || 'Tente novamente.'));
    }
  };

  const handleCancelRFQ = async (rfqId) => {
    if (!window.confirm('Tem certeza que deseja cancelar este RFQ?')) {
      return;
    }

    try {
      await api.post(`/rfq/${rfqId}/cancelar`);
      toast.success('RFQ cancelado com sucesso!');
      loadRFQs();
    } catch (error) {
      toast.error('Erro ao cancelar RFQ: ' + (error.response?.data?.detail || 'Tente novamente.'));
    }
  };

  const getEstadoBadge = (estado) => {
    const badges = {
      aberto: 'bg-primary-100 text-primary-700',
      em_negociacao: 'bg-warning-100 text-warning-700',
      fechado: 'bg-success-100 text-success-700',
      cancelado: 'bg-error-100 text-error-700'
    };
    return badges[estado] || 'bg-grey-100 text-grey-700';
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
      title="Meus Pedidos de Proposta (RFQ)"
      description="Gerencie os seus pedidos de proposta e acompanhe as respostas dos fornecedores"
    >
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Pedidos de Proposta</h1>
          <p className="text-navy-600 mt-1">
            {rfqs.length} {rfqs.length === 1 ? 'pedido' : 'pedidos'}
          </p>
        </div>
        <Button
          onClick={() => setShowRFQForm(true)}
          size="lg"
        >
          + Criar Novo RFQ
        </Button>
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
              Ainda não tem pedidos de proposta
            </h3>
            <p className="text-navy-600 mb-4">
              Crie o seu primeiro RFQ para receber propostas personalizadas dos fornecedores.
            </p>
            <Button onClick={() => setShowRFQForm(true)}>
              Criar Primeiro RFQ
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {rfqs.map((rfq) => (
            <Card key={rfq.id} hover>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getEstadoBadge(rfq.estado)}`}>
                      {rfq.estado.charAt(0).toUpperCase() + rfq.estado.slice(1)}
                    </span>
                    <span className="text-sm text-navy-500">
                      {formatDate(rfq.data_criacao)}
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

                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-navy-600">
                      {rfq.num_propostas} {rfq.num_propostas === 1 ? 'proposta' : 'propostas'} recebidas
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Link to={`/rfq/${rfq.id}`}>
                    <Button variant="outline" size="sm">
                      Ver Detalhes
                    </Button>
                  </Link>
                  {rfq.estado === 'aberto' || rfq.estado === 'em_negociacao' ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCancelRFQ(rfq.id)}
                    >
                      Cancelar
                    </Button>
                  ) : null}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {showRFQForm && (
        <RFQForm
          onClose={() => setShowRFQForm(false)}
          onSubmit={handleCreateRFQ}
        />
      )}
    </AppLayout>
  );
}

export default RFQs;
