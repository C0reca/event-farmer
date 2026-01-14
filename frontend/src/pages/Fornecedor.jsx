import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';

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
    return <div className="text-center py-12">A carregar...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Painel do Fornecedor</h1>
        {activeTab === 'atividades' && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium"
          >
            {showForm ? 'Cancelar' : '+ Nova Atividade'}
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('atividades')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'atividades'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Minhas Atividades ({atividades.length})
          </button>
          <button
            onClick={() => setActiveTab('reservas')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'reservas'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Reservas Recebidas ({reservas.length})
          </button>
        </nav>
      </div>

      {/* Formulário de Nova Atividade */}
      {showForm && activeTab === 'atividades' && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Criar Nova Atividade</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome *
                </label>
                <input
                  type="text"
                  required
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo *
                </label>
                <input
                  type="text"
                  required
                  value={formData.tipo}
                  onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
                  placeholder="ex: canoagem, paintball"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Categoria
                </label>
                <select
                  value={formData.categoria}
                  onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
                >
                  <option value="">Selecione...</option>
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
                >
                  <option value="">Selecione...</option>
                  <option value="indoor">Indoor</option>
                  <option value="outdoor">Outdoor</option>
                  <option value="ambos">Ambos</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Preço por Pessoa (€) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.preco_por_pessoa}
                  onChange={(e) => setFormData({ ...formData, preco_por_pessoa: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Capacidade Máxima *
                </label>
                <input
                  type="number"
                  required
                  value={formData.capacidade_max}
                  onChange={(e) => setFormData({ ...formData, capacidade_max: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Duração (minutos)
                </label>
                <input
                  type="number"
                  value={formData.duracao_minutos}
                  onChange={(e) => setFormData({ ...formData, duracao_minutos: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL da Imagem
                </label>
                <input
                  type="url"
                  value={formData.imagens}
                  onChange={(e) => setFormData({ ...formData, imagens: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descrição
              </label>
              <textarea
                value={formData.descricao}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
                rows="3"
              />
            </div>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium"
            >
              Criar Atividade
            </button>
          </form>
        </div>
      )}

      {/* Tab: Atividades */}
      {activeTab === 'atividades' && (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Minhas Atividades ({atividades.length})
          </h2>
          {atividades.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <p className="text-gray-600 text-lg">Nenhuma atividade criada ainda.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {atividades.map((atividade) => (
                <div key={atividade.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-bold text-gray-800">{atividade.nome}</h3>
                      {atividade.aprovada ? (
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">Aprovada</span>
                      ) : (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full">Pendente</span>
                      )}
                    </div>
                    <p className="text-gray-600 text-sm mb-2">
                      <span className="font-semibold">Tipo:</span> {atividade.tipo}
                    </p>
                    {atividade.categoria && (
                      <p className="text-gray-600 text-sm mb-2">
                        <span className="font-semibold">Categoria:</span> {atividade.categoria}
                      </p>
                    )}
                    <p className="text-gray-600 text-sm mb-2">
                      <span className="font-semibold">Preço:</span> €{atividade.preco_por_pessoa.toFixed(2)}/pessoa
                    </p>
                    <p className="text-gray-600 text-sm mb-2">
                      <span className="font-semibold">Capacidade:</span> {atividade.capacidade_max} pessoas
                    </p>
                    {atividade.localizacao && (
                      <p className="text-gray-600 text-sm mb-2">
                        <span className="font-semibold">Localização:</span> {atividade.localizacao}
                      </p>
                    )}
                    {atividade.descricao && (
                      <p className="text-gray-600 text-sm line-clamp-2">{atividade.descricao}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: Reservas */}
      {activeTab === 'reservas' && (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Reservas Recebidas ({reservas.length})
          </h2>
          {reservas.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <p className="text-gray-600 text-lg">Nenhuma reserva recebida ainda.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {reservas.map((reserva) => (
                <div key={reserva.id} className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-800 mb-2">
                        {reserva.atividade?.nome || 'Atividade'}
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                        <div>
                          <span className="font-semibold">Data:</span>{' '}
                          {new Date(reserva.data).toLocaleDateString('pt-PT')}
                        </div>
                        <div>
                          <span className="font-semibold">Pessoas:</span> {reserva.n_pessoas}
                        </div>
                        <div>
                          <span className="font-semibold">Preço Total:</span>{' '}
                          €{reserva.preco_total.toFixed(2)}
                        </div>
                        <div>
                          <span className="font-semibold">Estado:</span>{' '}
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              reserva.estado === 'confirmada'
                                ? 'bg-green-100 text-green-800'
                                : reserva.estado === 'pendente'
                                ? 'bg-yellow-100 text-yellow-800'
                                : reserva.estado === 'recusada'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {reserva.estado}
                          </span>
                        </div>
                      </div>
                    </div>
                    {reserva.estado === 'pendente' && (
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => handleAceitarReserva(reserva.id)}
                          className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md text-sm font-medium"
                        >
                          ✓ Aceitar
                        </button>
                        <button
                          onClick={() => handleRecusarReserva(reserva.id)}
                          className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md text-sm font-medium"
                        >
                          ✗ Recusar
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Fornecedor;

