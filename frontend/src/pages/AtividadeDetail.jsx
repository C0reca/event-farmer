import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../services/api';
import ReservationForm from '../components/ReservationForm';

function AtividadeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [atividade, setAtividade] = useState(null);
  const [avaliacoes, setAvaliacaoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showReservationForm, setShowReservationForm] = useState(false);
  const [rating, setRating] = useState(0);
  const [comentario, setComentario] = useState('');

  useEffect(() => {
    loadAtividade();
    loadAvaliacoes();
  }, [id]);

  const loadAtividade = async () => {
    try {
      const response = await api.get(`/atividades/${id}`);
      setAtividade(response.data);
    } catch (error) {
      toast.error('Erro ao carregar atividade');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const loadAvaliacoes = async () => {
    try {
      const response = await api.get(`/avaliacoes/atividade/${id}`);
      setAvaliacaoes(response.data);
    } catch (error) {
      console.error('Erro ao carregar avaliações:', error);
    }
  };

  const handleAvaliar = async (e) => {
    e.preventDefault();
    if (rating < 1 || rating > 5) {
      toast.error('Por favor, selecione uma avaliação de 1 a 5 estrelas');
      return;
    }

    try {
      await api.post('/avaliacoes', {
        atividade_id: parseInt(id),
        rating: rating,
        comentario: comentario || null
      });
      toast.success('Avaliação enviada com sucesso!');
      setRating(0);
      setComentario('');
      loadAvaliacoes();
      loadAtividade(); // Recarregar para atualizar rating médio
    } catch (error) {
      toast.error('Erro ao enviar avaliação: ' + (error.response?.data?.detail || 'Tente novamente.'));
    }
  };

  const renderStars = (rating, interactive = false, onRate = null) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span
          key={i}
          className={`text-2xl cursor-pointer ${i <= rating ? 'text-yellow-400' : 'text-gray-300'} ${interactive ? 'hover:text-yellow-300' : ''}`}
          onClick={interactive && onRate ? () => onRate(i) : undefined}
        >
          ★
        </span>
      );
    }
    return stars;
  };

  if (loading) {
    return <div className="text-center py-12">A carregar...</div>;
  }

  if (!atividade) {
    return null;
  }

  const imagens = atividade.imagens ? JSON.parse(atividade.imagens || '[]') : [];
  const imagemPrincipal = imagens[0] || 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Botão Voltar */}
      <button
        onClick={() => navigate(-1)}
        className="mb-4 text-blue-600 hover:text-blue-700 flex items-center gap-2"
      >
        ← Voltar
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Coluna Principal */}
        <div className="lg:col-span-2">
          {/* Galeria de Imagens */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
            <img 
              src={imagemPrincipal} 
              alt={atividade.nome}
              className="w-full h-96 object-cover"
            />
            {imagens.length > 1 && (
              <div className="grid grid-cols-4 gap-2 p-4">
                {imagens.slice(1, 5).map((img, idx) => (
                  <img 
                    key={idx}
                    src={img} 
                    alt={`${atividade.nome} ${idx + 2}`}
                    className="w-full h-20 object-cover rounded cursor-pointer hover:opacity-75"
                  />
                ))}
              </div>
            )}
          </div>

          {/* Informações */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{atividade.nome}</h1>
                <div className="flex items-center gap-4 mb-4">
                  {atividade.rating_medio > 0 && (
                    <div className="flex items-center gap-2">
                      {renderStars(Math.round(atividade.rating_medio))}
                      <span className="text-lg font-semibold">{atividade.rating_medio.toFixed(1)}</span>
                      <span className="text-gray-500">({atividade.total_avaliacoes || 0} avaliações)</span>
                    </div>
                  )}
                  {atividade.categoria && (
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                      {atividade.categoria}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div>
                <p className="text-sm text-gray-500">Tipo</p>
                <p className="font-semibold">{atividade.tipo}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Localização</p>
                <p className="font-semibold">📍 {atividade.localizacao || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Capacidade</p>
                <p className="font-semibold">👥 {atividade.capacidade_max} pessoas</p>
              </div>
              {atividade.duracao_minutos && (
                <div>
                  <p className="text-sm text-gray-500">Duração</p>
                  <p className="font-semibold">⏱️ {atividade.duracao_minutos} min</p>
                </div>
              )}
            </div>

            {atividade.descricao && (
              <div className="mb-6">
                <h2 className="text-xl font-bold mb-2">Descrição</h2>
                <p className="text-gray-700">{atividade.descricao}</p>
              </div>
            )}

            {/* Mapa (placeholder) */}
            {atividade.localizacao && (
              <div className="mb-6">
                <h2 className="text-xl font-bold mb-2">Localização</h2>
                <div className="bg-gray-200 h-64 rounded-lg flex items-center justify-center">
                  <p className="text-gray-500">Mapa de {atividade.localizacao} (Integração Google Maps futura)</p>
                </div>
              </div>
            )}
          </div>

          {/* Avaliações */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold mb-4">Avaliações ({avaliacoes.length})</h2>
            
            {/* Formulário de Avaliação */}
            <form onSubmit={handleAvaliar} className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold mb-2">Avalie esta atividade</h3>
              <div className="mb-3">
                <label className="block text-sm font-medium mb-2">Avaliação (1-5 estrelas)</label>
                <div className="flex gap-1">
                  {renderStars(rating, true, setRating)}
                </div>
              </div>
              <div className="mb-3">
                <label className="block text-sm font-medium mb-2">Comentário (opcional)</label>
                <textarea
                  value={comentario}
                  onChange={(e) => setComentario(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows="3"
                  placeholder="Partilhe a sua experiência..."
                />
              </div>
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium"
              >
                Enviar Avaliação
              </button>
            </form>

            {/* Lista de Avaliações */}
            {avaliacoes.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Ainda não há avaliações para esta atividade.</p>
            ) : (
              <div className="space-y-4">
                {avaliacoes.map((avaliacao) => (
                  <div key={avaliacao.id} className="border-b pb-4 last:border-0">
                    <div className="flex items-center gap-2 mb-2">
                      {renderStars(avaliacao.rating)}
                      <span className="text-sm text-gray-500">
                        {new Date(avaliacao.data_criacao).toLocaleDateString('pt-PT')}
                      </span>
                    </div>
                    {avaliacao.comentario && (
                      <p className="text-gray-700">{avaliacao.comentario}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar - Reserva */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
            <div className="mb-6">
              <div className="text-4xl font-bold text-blue-600 mb-1">
                €{atividade.preco_por_pessoa.toFixed(2)}
              </div>
              <div className="text-gray-500">por pessoa</div>
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">Capacidade máxima:</span>
                <span className="font-semibold">{atividade.capacidade_max} pessoas</span>
              </div>
              {atividade.clima && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Clima:</span>
                  <span className="font-semibold capitalize">{atividade.clima}</span>
                </div>
              )}
              {atividade.duracao_minutos && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Duração:</span>
                  <span className="font-semibold">{atividade.duracao_minutos} minutos</span>
                </div>
              )}
            </div>

            <button
              onClick={() => setShowReservationForm(true)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-bold text-lg transition-colors"
            >
              Reservar Agora
            </button>
          </div>
        </div>
      </div>

      {/* Modal de Reserva */}
      {showReservationForm && (
        <ReservationForm
          atividade={atividade}
          onClose={() => setShowReservationForm(false)}
          onSubmit={async (data) => {
            try {
              await api.post('/reservas', data);
              toast.success('Reserva criada com sucesso!');
              setShowReservationForm(false);
            } catch (error) {
              toast.error('Erro ao criar reserva: ' + (error.response?.data?.detail || 'Tente novamente.'));
            }
          }}
        />
      )}
    </div>
  );
}

export default AtividadeDetail;

