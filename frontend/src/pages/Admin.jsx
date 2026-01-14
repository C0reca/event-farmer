import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';

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
    return <div className="text-center py-12">A carregar...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Painel Administrativo</h1>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'dashboard'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => {
              setActiveTab('atividades');
              carregarAtividadesPendentes();
            }}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'atividades'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Atividades Pendentes ({atividadesPendentes.length})
          </button>
          <button
            onClick={() => {
              setActiveTab('relatorios');
              carregarRelatorios();
            }}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'relatorios'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Relatórios
          </button>
        </nav>
      </div>

      {/* Dashboard Tab */}
      {activeTab === 'dashboard' && dashboardData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Total Empresas</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">{dashboardData.n_empresas}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Total Atividades</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">{dashboardData.n_atividades}</p>
            <p className="text-sm text-green-600 mt-1">
              {dashboardData.n_atividades_aprovadas} aprovadas
            </p>
            <p className="text-sm text-yellow-600">
              {dashboardData.n_atividades_pendentes} pendentes
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Total Reservas</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">{dashboardData.n_reservas}</p>
            <p className="text-sm text-blue-600 mt-1">
              {dashboardData.n_reservas_confirmadas} confirmadas
            </p>
            <p className="text-sm text-yellow-600">
              {dashboardData.n_reservas_pendentes} pendentes
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Total Fornecedores</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">{dashboardData.n_fornecedores}</p>
          </div>
        </div>
      )}

      {/* Atividades Pendentes Tab */}
      {activeTab === 'atividades' && (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Atividades Pendentes de Aprovação</h2>
          {atividadesPendentes.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <p className="text-gray-600">Nenhuma atividade pendente de aprovação</p>
            </div>
          ) : (
            <div className="space-y-4">
              {atividadesPendentes.map((atividade) => (
                <div key={atividade.id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900">{atividade.nome}</h3>
                      <p className="text-gray-600 mt-1">{atividade.descricao}</p>
                      <div className="mt-3 flex flex-wrap gap-4 text-sm">
                        <span className="text-gray-500">
                          <strong>Tipo:</strong> {atividade.tipo}
                        </span>
                        <span className="text-gray-500">
                          <strong>Preço:</strong> €{atividade.preco_por_pessoa}/pessoa
                        </span>
                        <span className="text-gray-500">
                          <strong>Capacidade:</strong> {atividade.capacidade_max} pessoas
                        </span>
                        <span className="text-gray-500">
                          <strong>Localização:</strong> {atividade.localizacao}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => aprovarAtividade(atividade.id)}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md font-medium"
                      >
                        ✓ Aprovar
                      </button>
                      <button
                        onClick={() => rejeitarAtividade(atividade.id)}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md font-medium"
                      >
                        ✗ Rejeitar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Relatórios Tab */}
      {activeTab === 'relatorios' && (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Relatórios Detalhados</h2>
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">A carregar relatórios...</p>
            </div>
          ) : relatorios ? (
            <div className="space-y-6">
              {relatorios.reservas_30d !== undefined && (
                <div className="bg-white rounded-lg shadow p-6 mb-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Resumo dos Últimos 30 Dias</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Total de Reservas</p>
                      <p className="text-2xl font-bold text-blue-600">{relatorios.reservas_30d}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Faturação Total</p>
                      <p className="text-2xl font-bold text-green-600">€{relatorios.faturacao_30d?.toFixed(2) || '0.00'}</p>
                    </div>
                  </div>
                </div>
              )}
              <div className="bg-white rounded-lg shadow p-6 mb-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Top 5 Atividades Mais Reservadas</h3>
                {relatorios.top_atividades && relatorios.top_atividades.length > 0 ? (
                  <ul className="space-y-2">
                    {relatorios.top_atividades.map((atividade, index) => (
                      <li key={index} className="flex justify-between items-center py-2 border-b">
                        <span>{atividade.nome}</span>
                        <span className="font-bold text-blue-600">{atividade.total_reservas} reservas</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 text-center py-4">Ainda não há atividades com reservas confirmadas</p>
                )}
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Top 5 Fornecedores</h3>
                {relatorios.top_fornecedores && relatorios.top_fornecedores.length > 0 ? (
                  <ul className="space-y-2">
                    {relatorios.top_fornecedores.map((fornecedor, index) => (
                      <li key={index} className="flex justify-between items-center py-2 border-b">
                        <div>
                          <span className="font-medium">{fornecedor.nome}</span>
                          <p className="text-sm text-gray-500">{fornecedor.total_reservas} reservas</p>
                        </div>
                        <span className="font-bold text-green-600">€{fornecedor.faturacao?.toFixed(2) || '0.00'}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 text-center py-4">Ainda não há fornecedores com reservas confirmadas</p>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <p className="text-gray-600">Clique em "Relatórios" para carregar os dados</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Admin;

