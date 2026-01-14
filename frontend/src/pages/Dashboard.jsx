import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';
import ActivityCard from '../components/ActivityCard';
import ReservationForm from '../components/ReservationForm';

function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    n_pessoas: 10,
    orcamento: '',
    localizacao: '',
    tipo_empresa: '',
    categoria: '',
    clima: '',
    duracao_max: ''
  });
  const [atividades, setAtividades] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedAtividade, setSelectedAtividade] = useState(null);

  useEffect(() => {
    if (!authLoading && (!user || user.tipo !== 'empresa')) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  // Função para buscar atividades (reutilizável)
  const buscarAtividades = useCallback(async (params = null, showToast = true) => {
    setLoading(true);

    try {
      const searchParams = params || {
        n_pessoas: parseInt(formData.n_pessoas),
        orcamento: formData.orcamento ? parseFloat(formData.orcamento) : null,
        localizacao: formData.localizacao || null,
        tipo_empresa: formData.tipo_empresa || null,
        categoria: formData.categoria || null,
        clima: formData.clima || null,
        duracao_max: formData.duracao_max ? parseInt(formData.duracao_max) : null
      };

      const response = await api.post('/atividades/recomendadas', searchParams);
      setAtividades(response.data);
      
      if (showToast) {
        if (response.data.length === 0) {
          toast.info('Nenhuma atividade encontrada com os critérios especificados.');
        } else {
          toast.success(`${response.data.length} atividades encontradas!`);
        }
      }
    } catch (error) {
      if (showToast) {
        toast.error('Erro ao buscar atividades. Tente novamente.');
      }
      console.error(error);
    }
    setLoading(false);
  }, [formData]);

  // Carregar atividades automaticamente ao montar o componente
  useEffect(() => {
    if (!authLoading && user && user.tipo === 'empresa') {
      // Buscar atividades com valores padrão (n_pessoas: 10)
      const carregarAtividadesIniciais = async () => {
        setLoading(true);
        try {
          const response = await api.post('/atividades/recomendadas', { n_pessoas: 10 });
          setAtividades(response.data);
        } catch (error) {
          console.error('Erro ao carregar atividades iniciais:', error);
        }
        setLoading(false);
      };
      carregarAtividadesIniciais();
    }
  }, [authLoading, user]);

  const handleSearch = async (e) => {
    e.preventDefault();
    await buscarAtividades();
  };

  const handleReserve = (atividade) => {
    setSelectedAtividade(atividade);
  };

  const handleReservationSubmit = async (reservationData) => {
    try {
      await api.post('/reservas', reservationData);
      toast.success('Reserva criada com sucesso!');
      setSelectedAtividade(null);
      // Recarregar atividades recomendadas
      await buscarAtividades();
    } catch (error) {
      toast.error('Erro ao criar reserva: ' + (error.response?.data?.detail || 'Tente novamente.'));
    }
  };

  if (authLoading) {
    return <div className="text-center py-12">A carregar...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>

      {/* Formulário de Busca com Filtros Avançados */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-bold mb-4">Encontrar Atividades Recomendadas</h2>
        <form onSubmit={handleSearch} className="space-y-4">
          {/* Primeira linha - Filtros principais */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nº Pessoas *
              </label>
              <input
                type="number"
                required
                min="1"
                value={formData.n_pessoas}
                onChange={(e) => setFormData({ ...formData, n_pessoas: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Orçamento (€)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.orcamento}
                onChange={(e) => setFormData({ ...formData, orcamento: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Localização
              </label>
              <input
                type="text"
                value={formData.localizacao}
                onChange={(e) => setFormData({ ...formData, localizacao: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="ex: Lisboa"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Duração Máx (min)
              </label>
              <input
                type="number"
                min="1"
                value={formData.duracao_max}
                onChange={(e) => setFormData({ ...formData, duracao_max: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="ex: 180"
              />
            </div>
          </div>

          {/* Segunda linha - Filtros avançados */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Categoria
              </label>
              <select
                value={formData.categoria}
                onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Todas</option>
                <option value="aventura">Aventura</option>
                <option value="relax">Relax</option>
                <option value="team_building">Team Building</option>
                <option value="esporte">Desporto</option>
                <option value="cultural">Cultural</option>
                <option value="gastronomia">Gastronomia</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Clima
              </label>
              <select
                value={formData.clima}
                onChange={(e) => setFormData({ ...formData, clima: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Todos</option>
                <option value="indoor">Indoor</option>
                <option value="outdoor">Outdoor</option>
                <option value="ambos">Ambos</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium disabled:opacity-50 transition-colors"
              >
                {loading ? 'A buscar...' : '🔍 Buscar Atividades'}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Lista de Atividades */}
      {atividades.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Atividades Recomendadas ({atividades.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {atividades.map((atividade) => (
              <ActivityCard
                key={atividade.id}
                atividade={atividade}
                onReserve={handleReserve}
              />
            ))}
          </div>
        </div>
      )}

      {atividades.length === 0 && !loading && (
        <div className="text-center py-12 bg-white rounded-lg shadow-md">
          <p className="text-gray-600">
            Nenhuma atividade encontrada. Tente ajustar os filtros de busca.
          </p>
        </div>
      )}

      {/* Modal de Reserva */}
      {selectedAtividade && (
        <ReservationForm
          atividade={selectedAtividade}
          onClose={() => setSelectedAtividade(null)}
          onSubmit={handleReservationSubmit}
        />
      )}
    </div>
  );
}

export default Dashboard;

