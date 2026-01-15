import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';
import ActivityCard from '../components/ActivityCard';
import ReservationForm from '../components/ReservationForm';
import AppLayout from '../components/layout/AppLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Loader from '../components/ui/Loader';

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
      title="Dashboard"
      description="Encontre e reserve as melhores atividades de team building para sua empresa"
    >
      {/* Quick Actions */}
      <div className="mb-6 flex flex-wrap gap-3">
        <Button
          as={Link}
          to="/rfqs"
          variant="primary"
          size="lg"
        >
          📋 Criar Pedido de Proposta (RFQ)
        </Button>
        <Button
          as={Link}
          to="/rfqs"
          variant="outline"
          size="lg"
        >
          Ver Meus RFQs
        </Button>
      </div>

      {/* Formulário de Busca com Filtros Avançados */}
      <Card className="mb-8" hover={false}>
        <Card.Header>
          <Card.Title>Encontrar Atividades Recomendadas</Card.Title>
          <Card.Description>
            Utilize os filtros abaixo para encontrar atividades que se adequem às suas necessidades
          </Card.Description>
        </Card.Header>
        <Card.Content>
          <form onSubmit={handleSearch} className="space-y-6">
            {/* Primeira linha - Filtros principais */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Input
                label="Nº Pessoas"
                type="number"
                required
                min="1"
                value={formData.n_pessoas}
                onChange={(e) => setFormData({ ...formData, n_pessoas: e.target.value })}
              />
              <Input
                label="Orçamento (€)"
                type="number"
                step="0.01"
                value={formData.orcamento}
                onChange={(e) => setFormData({ ...formData, orcamento: e.target.value })}
                placeholder="ex: 500.00"
              />
              <Input
                label="Localização"
                type="text"
                value={formData.localizacao}
                onChange={(e) => setFormData({ ...formData, localizacao: e.target.value })}
                placeholder="ex: Lisboa"
              />
              <Input
                label="Duração Máx (min)"
                type="number"
                min="1"
                value={formData.duracao_max}
                onChange={(e) => setFormData({ ...formData, duracao_max: e.target.value })}
                placeholder="ex: 180"
              />
            </div>

            {/* Segunda linha - Filtros avançados */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input.Select
                label="Categoria"
                value={formData.categoria}
                onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
              >
                <option value="">Todas</option>
                <option value="aventura">Aventura</option>
                <option value="relax">Relax</option>
                <option value="team_building">Team Building</option>
                <option value="esporte">Desporto</option>
                <option value="cultural">Cultural</option>
                <option value="gastronomia">Gastronomia</option>
              </Input.Select>
              <Input.Select
                label="Clima"
                value={formData.clima}
                onChange={(e) => setFormData({ ...formData, clima: e.target.value })}
              >
                <option value="">Todos</option>
                <option value="indoor">Indoor</option>
                <option value="outdoor">Outdoor</option>
                <option value="ambos">Ambos</option>
              </Input.Select>
              <div className="flex items-end">
                <Button
                  type="submit"
                  disabled={loading}
                  loading={loading}
                  className="w-full"
                  size="lg"
                >
                  🔍 Buscar Atividades
                </Button>
              </div>
            </div>
          </form>
        </Card.Content>
      </Card>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <Loader size="lg" />
          <p className="mt-4 text-navy-600">A procurar atividades...</p>
        </div>
      )}

      {/* Lista de Atividades */}
      {!loading && atividades.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-secondary-900">
              Atividades Recomendadas
            </h2>
            <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-semibold">
              {atividades.length} {atividades.length === 1 ? 'atividade' : 'atividades'}
            </span>
          </div>
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

      {!loading && atividades.length === 0 && (
        <Card className="text-center py-12">
          <div className="max-w-md mx-auto">
            <svg
              className="mx-auto h-12 w-12 text-secondary-400 mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h3 className="text-lg font-semibold text-secondary-900 mb-2">
              Nenhuma atividade encontrada
            </h3>
            <p className="text-secondary-600">
              Tente ajustar os filtros de busca para encontrar mais resultados.
            </p>
          </div>
        </Card>
      )}

      {/* Modal de Reserva */}
      {selectedAtividade && (
        <ReservationForm
          atividade={selectedAtividade}
          onClose={() => setSelectedAtividade(null)}
          onSubmit={handleReservationSubmit}
        />
      )}
    </AppLayout>
  );
}

export default Dashboard;

