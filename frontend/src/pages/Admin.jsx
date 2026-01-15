import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';
import AppLayout from '../components/layout/AppLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

function Admin() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [relatorios, setRelatorios] = useState(null);
  const [atividadesPendentes, setAtividadesPendentes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    if (!authLoading && (!user || user.tipo !== 'admin')) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user && user.tipo === 'admin') {
      carregarDashboard();
      carregarAtividadesPendentes();
    }
  }, [user]);

  const carregarDashboard = async () => {
    try {
      const response = await api.get('/admin/dashboard');
      setDashboardData(response.data);
    } catch (error) {
      toast.error('Erro ao carregar dashboard');
      console.error(error);
    }
  };

  const carregarRelatorios = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/relatorios');
      setRelatorios(response.data);
      if (!response.data.top_atividades || response.data.top_atividades.length === 0) {
        toast.info('Ainda não há dados suficientes para gerar relatórios');
      }
    } catch (error) {
      toast.error('Erro ao carregar relatórios: ' + (error.response?.data?.detail || error.message));
      console.error('Erro ao carregar relatórios:', error);
    }
    setLoading(false);
  };

  const carregarAtividadesPendentes = async () => {
    try {
      const response = await api.get('/atividades/pendentes/list');
      setAtividadesPendentes(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const aprovarAtividade = async (atividadeId) => {
    try {
      await api.post(`/atividades/${atividadeId}/aprovar`);
      toast.success('Atividade aprovada com sucesso!');
      carregarAtividadesPendentes();
      carregarDashboard();
    } catch (error) {
      toast.error('Erro ao aprovar atividade');
      console.error(error);
    }
  };

  const rejeitarAtividade = async (atividadeId) => {
    try {
      await api.post(`/atividades/${atividadeId}/rejeitar`);
      toast.success('Atividade rejeitada');
      carregarAtividadesPendentes();
      carregarDashboard();
    } catch (error) {
      toast.error('Erro ao rejeitar atividade');
      console.error(error);
    }
  };

  if (authLoading) {
    return (
      <AppLayout>
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-secondary-600">A carregar...</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout
      title="Painel Administrativo"
      description="Gerencie atividades, reservas e visualize relatórios"
    >
      {/* Tabs */}
      <div className="border-b border-secondary-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'dashboard'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-secondary-500 hover:text-secondary-700 hover:border-secondary-300'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => {
              setActiveTab('atividades');
              carregarAtividadesPendentes();
            }}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'atividades'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-secondary-500 hover:text-secondary-700 hover:border-secondary-300'
            }`}
          >
            Atividades Pendentes ({atividadesPendentes.length})
          </button>
          <button
            onClick={() => {
              setActiveTab('relatorios');
              carregarRelatorios();
            }}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'relatorios'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-secondary-500 hover:text-secondary-700 hover:border-secondary-300'
            }`}
          >
            Relatórios
          </button>
        </nav>
      </div>

      {/* Dashboard Tab */}
      {activeTab === 'dashboard' && dashboardData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <h3 className="text-sm font-medium text-secondary-500 mb-2">Total Empresas</h3>
            <p className="text-3xl font-bold text-secondary-900">{dashboardData.n_empresas}</p>
          </Card>
          <Card>
            <h3 className="text-sm font-medium text-secondary-500 mb-2">Total Atividades</h3>
            <p className="text-3xl font-bold text-secondary-900 mb-2">{dashboardData.n_atividades}</p>
            <div className="space-y-1">
              <p className="text-sm text-success-600">
                {dashboardData.n_atividades_aprovadas} aprovadas
              </p>
              <p className="text-sm text-warning-600">
                {dashboardData.n_atividades_pendentes} pendentes
              </p>
            </div>
          </Card>
          <Card>
            <h3 className="text-sm font-medium text-secondary-500 mb-2">Total Reservas</h3>
            <p className="text-3xl font-bold text-secondary-900 mb-2">{dashboardData.n_reservas}</p>
            <div className="space-y-1">
              <p className="text-sm text-primary-600">
                {dashboardData.n_reservas_confirmadas} confirmadas
              </p>
              <p className="text-sm text-warning-600">
                {dashboardData.n_reservas_pendentes} pendentes
              </p>
            </div>
          </Card>
          <Card>
            <h3 className="text-sm font-medium text-secondary-500 mb-2">Total Fornecedores</h3>
            <p className="text-3xl font-bold text-secondary-900">{dashboardData.n_fornecedores}</p>
          </Card>
        </div>
      )}

      {/* Atividades Pendentes Tab */}
      {activeTab === 'atividades' && (
        <div>
          <h2 className="text-2xl font-bold text-secondary-900 mb-6">Atividades Pendentes de Aprovação</h2>
          {atividadesPendentes.length === 0 ? (
            <Card className="text-center py-12">
              <p className="text-secondary-600">Nenhuma atividade pendente de aprovação</p>
            </Card>
          ) : (
            <div className="space-y-4">
              {atividadesPendentes.map((atividade) => (
                <Card key={atividade.id} hover={true}>
                  <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-secondary-900 mb-2">{atividade.nome}</h3>
                      {atividade.descricao && (
                        <p className="text-secondary-600 mb-4">{atividade.descricao}</p>
                      )}
                      <div className="flex flex-wrap gap-4 text-sm">
                        <div>
                          <span className="text-secondary-500">Tipo:</span>{' '}
                          <span className="font-semibold text-secondary-900">{atividade.tipo}</span>
                        </div>
                        <div>
                          <span className="text-secondary-500">Preço:</span>{' '}
                          <span className="font-semibold text-primary-600">€{atividade.preco_por_pessoa}/pessoa</span>
                        </div>
                        <div>
                          <span className="text-secondary-500">Capacidade:</span>{' '}
                          <span className="font-semibold text-secondary-900">{atividade.capacidade_max} pessoas</span>
                        </div>
                        {atividade.localizacao && (
                          <div>
                            <span className="text-secondary-500">Localização:</span>{' '}
                            <span className="font-semibold text-secondary-900">{atividade.localizacao}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => aprovarAtividade(atividade.id)}
                        variant="secondary"
                        size="sm"
                        className="bg-success-600 hover:bg-success-700"
                      >
                        ✓ Aprovar
                      </Button>
                      <Button
                        onClick={() => rejeitarAtividade(atividade.id)}
                        variant="danger"
                        size="sm"
                      >
                        ✗ Rejeitar
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Relatórios Tab */}
      {activeTab === 'relatorios' && (
        <div>
          <h2 className="text-2xl font-bold text-secondary-900 mb-6">Relatórios Detalhados</h2>
          {loading ? (
            <Card className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
              <p className="mt-4 text-secondary-600">A carregar relatórios...</p>
            </Card>
          ) : relatorios ? (
            <div className="space-y-6">
              {relatorios.reservas_30d !== undefined && (
                <Card>
                  <Card.Header>
                    <Card.Title>Resumo dos Últimos 30 Dias</Card.Title>
                  </Card.Header>
                  <Card.Content>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <p className="text-sm text-secondary-500 mb-2">Total de Reservas</p>
                        <p className="text-3xl font-bold text-primary-600">{relatorios.reservas_30d}</p>
                      </div>
                      <div>
                        <p className="text-sm text-secondary-500 mb-2">Faturação Total</p>
                        <p className="text-3xl font-bold text-success-600">€{relatorios.faturacao_30d?.toFixed(2) || '0.00'}</p>
                      </div>
                    </div>
                  </Card.Content>
                </Card>
              )}
              <Card>
                <Card.Header>
                  <Card.Title>Top 5 Atividades Mais Reservadas</Card.Title>
                </Card.Header>
                <Card.Content>
                  {relatorios.top_atividades && relatorios.top_atividades.length > 0 ? (
                    <ul className="space-y-3">
                      {relatorios.top_atividades.map((atividade, index) => (
                        <li key={index} className="flex justify-between items-center py-3 border-b border-secondary-200 last:border-0">
                          <span className="font-medium text-secondary-900">{atividade.nome}</span>
                          <span className="font-bold text-primary-600">{atividade.total_reservas} reservas</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-secondary-500 text-center py-4">Ainda não há atividades com reservas confirmadas</p>
                  )}
                </Card.Content>
              </Card>
              <Card>
                <Card.Header>
                  <Card.Title>Top 5 Fornecedores</Card.Title>
                </Card.Header>
                <Card.Content>
                  {relatorios.top_fornecedores && relatorios.top_fornecedores.length > 0 ? (
                    <ul className="space-y-3">
                      {relatorios.top_fornecedores.map((fornecedor, index) => (
                        <li key={index} className="flex justify-between items-center py-3 border-b border-secondary-200 last:border-0">
                          <div>
                            <span className="font-medium text-secondary-900">{fornecedor.nome}</span>
                            <p className="text-sm text-secondary-500">{fornecedor.total_reservas} reservas</p>
                          </div>
                          <span className="font-bold text-success-600">€{fornecedor.faturacao?.toFixed(2) || '0.00'}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-secondary-500 text-center py-4">Ainda não há fornecedores com reservas confirmadas</p>
                  )}
                </Card.Content>
              </Card>
            </div>
          ) : (
            <Card className="text-center py-12">
              <p className="text-secondary-600">Clique em "Relatórios" para carregar os dados</p>
            </Card>
          )}
        </div>
      )}
    </AppLayout>
  );
}

export default Admin;

