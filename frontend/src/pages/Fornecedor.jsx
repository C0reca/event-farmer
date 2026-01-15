import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';
import AppLayout from '../components/layout/AppLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

function Fornecedor() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [atividades, setAtividades] = useState([]);
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('atividades'); // 'atividades' ou 'reservas'
  const [formData, setFormData] = useState({
    nome: '',
    tipo: '',
    categoria: '',
    preco_por_pessoa: '',
    capacidade_max: '',
    localizacao: '',
    descricao: '',
    imagens: '',
    clima: '',
    duracao_minutos: ''
  });
  const [showForm, setShowForm] = useState(false);
  const [fornecedorId, setFornecedorId] = useState(null);

  useEffect(() => {
    if (!authLoading && (!user || user.tipo !== 'fornecedor')) {
      navigate('/login');
      return;
    }

    // Buscar fornecedor do usuário
    const fetchFornecedor = async () => {
      try {
        const response = await api.get('/fornecedores/me');
        setFornecedorId(response.data.id);
        await loadAtividades(response.data.id);
        await loadReservas(response.data.id);
      } catch (error) {
        console.error('Erro ao buscar fornecedor:', error);
        setLoading(false);
      }
    };

    if (user) {
      fetchFornecedor();
    }
  }, [user, authLoading, navigate]);

  const loadAtividades = async (fornId) => {
    try {
      const response = await api.get(`/atividades/`);
      const fornecedorAtividades = response.data.filter(a => a.fornecedor_id === fornId);
      setAtividades(fornecedorAtividades);
    } catch (error) {
      console.error('Erro ao carregar atividades:', error);
    }
  };

  const loadReservas = async (fornId) => {
    try {
      const response = await api.get(`/reservas/fornecedor/${fornId}`);
      setReservas(response.data);
    } catch (error) {
      console.error('Erro ao carregar reservas:', error);
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/atividades', {
        ...formData,
        preco_por_pessoa: parseFloat(formData.preco_por_pessoa),
        capacidade_max: parseInt(formData.capacidade_max),
        duracao_minutos: formData.duracao_minutos ? parseInt(formData.duracao_minutos) : null,
        imagens: formData.imagens ? JSON.stringify([formData.imagens]) : null
      });
      toast.success('Atividade criada com sucesso! Aguardando aprovação.');
      setShowForm(false);
      setFormData({
        nome: '',
        tipo: '',
        categoria: '',
        preco_por_pessoa: '',
        capacidade_max: '',
        localizacao: '',
        descricao: '',
        imagens: '',
        clima: '',
        duracao_minutos: ''
      });
      if (fornecedorId) {
        await loadAtividades(fornecedorId);
      }
    } catch (error) {
      toast.error('Erro ao criar atividade: ' + (error.response?.data?.detail || 'Tente novamente.'));
    }
  };

  const handleAceitarReserva = async (reservaId) => {
    try {
      await api.post(`/reservas/${reservaId}/aceitar`);
      toast.success('Reserva aceite com sucesso!');
      if (fornecedorId) {
        await loadReservas(fornecedorId);
      }
    } catch (error) {
      toast.error('Erro ao aceitar reserva: ' + (error.response?.data?.detail || 'Tente novamente.'));
    }
  };

  const handleRecusarReserva = async (reservaId) => {
    if (!window.confirm('Tem certeza que deseja recusar esta reserva?')) {
      return;
    }
    try {
      await api.post(`/reservas/${reservaId}/recusar`);
      toast.success('Reserva recusada.');
      if (fornecedorId) {
        await loadReservas(fornecedorId);
      }
    } catch (error) {
      toast.error('Erro ao recusar reserva: ' + (error.response?.data?.detail || 'Tente novamente.'));
    }
  };

  if (authLoading || loading) {
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
      title="Painel do Fornecedor"
      description="Gerencie suas atividades e reservas recebidas"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        {activeTab === 'atividades' && (
          <Button
            onClick={() => setShowForm(!showForm)}
            variant={showForm ? 'outline' : 'primary'}
          >
            {showForm ? 'Cancelar' : '+ Nova Atividade'}
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-secondary-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('atividades')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'atividades'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-secondary-500 hover:text-secondary-700 hover:border-secondary-300'
            }`}
          >
            Minhas Atividades ({atividades.length})
          </button>
          <button
            onClick={() => setActiveTab('reservas')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'reservas'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-secondary-500 hover:text-secondary-700 hover:border-secondary-300'
            }`}
          >
            Reservas Recebidas ({reservas.length})
          </button>
        </nav>
      </div>

      {/* Formulário de Nova Atividade */}
      {showForm && activeTab === 'atividades' && (
        <Card className="mb-8">
          <Card.Header>
            <Card.Title>Criar Nova Atividade</Card.Title>
            <Card.Description>
              Preencha os dados abaixo para criar uma nova atividade. A atividade ficará pendente até aprovação do administrador.
            </Card.Description>
          </Card.Header>
          <Card.Content>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Nome"
                  type="text"
                  required
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                />
                <Input
                  label="Tipo"
                  type="text"
                  required
                  value={formData.tipo}
                  onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                  placeholder="ex: canoagem, paintball"
                />
                <Input.Select
                  label="Categoria"
                  value={formData.categoria}
                  onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                >
                  <option value="">Selecione...</option>
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
                  <option value="">Selecione...</option>
                  <option value="indoor">Indoor</option>
                  <option value="outdoor">Outdoor</option>
                  <option value="ambos">Ambos</option>
                </Input.Select>
                <Input
                  label="Preço por Pessoa (€)"
                  type="number"
                  step="0.01"
                  required
                  value={formData.preco_por_pessoa}
                  onChange={(e) => setFormData({ ...formData, preco_por_pessoa: e.target.value })}
                />
                <Input
                  label="Capacidade Máxima"
                  type="number"
                  required
                  min="1"
                  value={formData.capacidade_max}
                  onChange={(e) => setFormData({ ...formData, capacidade_max: e.target.value })}
                />
                <Input
                  label="Duração (minutos)"
                  type="number"
                  min="1"
                  value={formData.duracao_minutos}
                  onChange={(e) => setFormData({ ...formData, duracao_minutos: e.target.value })}
                />
                <Input
                  label="Localização"
                  type="text"
                  value={formData.localizacao}
                  onChange={(e) => setFormData({ ...formData, localizacao: e.target.value })}
                  placeholder="ex: Lisboa"
                />
                <Input
                  label="URL da Imagem"
                  type="url"
                  value={formData.imagens}
                  onChange={(e) => setFormData({ ...formData, imagens: e.target.value })}
                  placeholder="https://exemplo.com/imagem.jpg"
                />
              </div>
              <Input.Textarea
                label="Descrição"
                value={formData.descricao}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                rows="4"
                placeholder="Descreva a atividade..."
              />
              <Button type="submit">
                Criar Atividade
              </Button>
            </form>
          </Card.Content>
        </Card>
      )}

      {/* Tab: Atividades */}
      {activeTab === 'atividades' && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-secondary-900">
              Minhas Atividades
            </h2>
            <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-semibold">
              {atividades.length} {atividades.length === 1 ? 'atividade' : 'atividades'}
            </span>
          </div>
          {atividades.length === 0 ? (
            <Card className="text-center py-12">
              <p className="text-secondary-600 text-lg">Nenhuma atividade criada ainda.</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {atividades.map((atividade) => (
                <Card key={atividade.id} hover={true}>
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-bold text-secondary-900 flex-1">{atividade.nome}</h3>
                    {atividade.aprovada ? (
                      <span className="px-2.5 py-1 bg-success-100 text-success-700 text-xs font-semibold rounded-full ml-2">
                        Aprovada
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 bg-warning-100 text-warning-700 text-xs font-semibold rounded-full ml-2">
                        Pendente
                      </span>
                    )}
                  </div>
                  <div className="space-y-2 text-sm">
                    <p className="text-secondary-600">
                      <span className="font-semibold text-secondary-900">Tipo:</span> {atividade.tipo}
                    </p>
                    {atividade.categoria && (
                      <p className="text-secondary-600">
                        <span className="font-semibold text-secondary-900">Categoria:</span> {atividade.categoria}
                      </p>
                    )}
                    <p className="text-secondary-600">
                      <span className="font-semibold text-secondary-900">Preço:</span>{' '}
                      <span className="text-primary-600 font-bold">€{atividade.preco_por_pessoa.toFixed(2)}</span>/pessoa
                    </p>
                    <p className="text-secondary-600">
                      <span className="font-semibold text-secondary-900">Capacidade:</span> {atividade.capacidade_max} pessoas
                    </p>
                    {atividade.localizacao && (
                      <p className="text-secondary-600">
                        <span className="font-semibold text-secondary-900">📍</span> {atividade.localizacao}
                      </p>
                    )}
                    {atividade.descricao && (
                      <p className="text-secondary-600 line-clamp-2 mt-2">{atividade.descricao}</p>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: Reservas */}
      {activeTab === 'reservas' && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-secondary-900">
              Reservas Recebidas
            </h2>
            <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-semibold">
              {reservas.length} {reservas.length === 1 ? 'reserva' : 'reservas'}
            </span>
          </div>
          {reservas.length === 0 ? (
            <Card className="text-center py-12">
              <p className="text-secondary-600 text-lg">Nenhuma reserva recebida ainda.</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {reservas.map((reserva) => {
                const estadoColors = {
                  confirmada: 'bg-success-100 text-success-700 border-success-200',
                  pendente: 'bg-warning-100 text-warning-700 border-warning-200',
                  recusada: 'bg-danger-100 text-danger-700 border-danger-200',
                  cancelada: 'bg-secondary-100 text-secondary-700 border-secondary-200'
                };
                const estadoColor = estadoColors[reserva.estado] || estadoColors.pendente;

                return (
                  <Card key={reserva.id} hover={true}>
                    <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-4">
                          <h3 className="text-xl font-bold text-secondary-900">
                            {reserva.atividade?.nome || 'Atividade'}
                          </h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${estadoColor}`}>
                            {reserva.estado}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-secondary-500 mb-1">Data</p>
                            <p className="font-semibold text-secondary-900">
                              {new Date(reserva.data).toLocaleDateString('pt-PT')}
                            </p>
                          </div>
                          <div>
                            <p className="text-secondary-500 mb-1">Pessoas</p>
                            <p className="font-semibold text-secondary-900">{reserva.n_pessoas}</p>
                          </div>
                          <div>
                            <p className="text-secondary-500 mb-1">Preço Total</p>
                            <p className="font-semibold text-primary-600">
                              €{reserva.preco_total.toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </div>
                      {reserva.estado === 'pendente' && (
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleAceitarReserva(reserva.id)}
                            variant="secondary"
                            size="sm"
                            className="bg-success-600 hover:bg-success-700"
                          >
                            ✓ Aceitar
                          </Button>
                          <Button
                            onClick={() => handleRecusarReserva(reserva.id)}
                            variant="danger"
                            size="sm"
                          >
                            ✗ Recusar
                          </Button>
                        </div>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}
    </AppLayout>
  );
}

export default Fornecedor;

