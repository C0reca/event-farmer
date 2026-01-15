import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';
import ReservationForm from '../components/ReservationForm';
import ReservationFormGuest from '../components/ReservationFormGuest';
import AppLayout from '../components/layout/AppLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

function AtividadeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
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
    return (
      <AppLayout>
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-secondary-600">A carregar...</p>
        </div>
      </AppLayout>
    );
  }

  if (!atividade) {
    return null;
  }

  const imagens = atividade.imagens ? JSON.parse(atividade.imagens || '[]') : [];
  const imagemPrincipal = imagens[0] || 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800';

  return (
    <AppLayout maxWidth="7xl" showHeader={false}>
      {/* Botão Voltar */}
      <Button
        onClick={() => navigate(-1)}
        variant="ghost"
        className="mb-6"
      >
        ← Voltar
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Coluna Principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Galeria de Imagens */}
          <Card padding="none" className="overflow-hidden">
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
                    className="w-full h-20 object-cover rounded-lg cursor-pointer hover:opacity-75 transition-opacity"
                  />
                ))}
              </div>
            )}
          </Card>

          {/* Informações */}
          <Card>
            <div className="mb-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-secondary-900 mb-3">{atividade.nome}</h1>
                  <div className="flex items-center gap-4 flex-wrap">
                    {atividade.rating_medio > 0 && (
                      <div className="flex items-center gap-2">
                        {renderStars(Math.round(atividade.rating_medio))}
                        <span className="text-lg font-semibold text-secondary-900">{atividade.rating_medio.toFixed(1)}</span>
                        <span className="text-secondary-500 text-sm">({atividade.total_avaliacoes || 0} avaliações)</span>
                      </div>
                    )}
                    {atividade.categoria && (
                      <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-semibold">
                        {atividade.categoria}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div>
                  <p className="text-sm text-secondary-500 mb-1">Tipo</p>
                  <p className="font-semibold text-secondary-900">{atividade.tipo}</p>
                </div>
                <div>
                  <p className="text-sm text-secondary-500 mb-1">Localização</p>
                  <p className="font-semibold text-secondary-900">📍 {atividade.localizacao || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-secondary-500 mb-1">Capacidade</p>
                  <p className="font-semibold text-secondary-900">👥 {atividade.capacidade_max} pessoas</p>
                </div>
                {atividade.duracao_minutos && (
                  <div>
                    <p className="text-sm text-secondary-500 mb-1">Duração</p>
                    <p className="font-semibold text-secondary-900">⏱️ {atividade.duracao_minutos} min</p>
                  </div>
                )}
              </div>

              {atividade.descricao && (
                <div className="mb-6">
                  <h2 className="text-xl font-bold mb-2 text-secondary-900">Descrição</h2>
                  <p className="text-secondary-700 leading-relaxed">{atividade.descricao}</p>
                </div>
              )}

              {/* Mapa (placeholder) */}
              {atividade.localizacao && (
                <div>
                  <h2 className="text-xl font-bold mb-2 text-secondary-900">Localização</h2>
                  <div className="bg-secondary-200 h-64 rounded-lg flex items-center justify-center">
                    <p className="text-secondary-500">Mapa de {atividade.localizacao} (Integração Google Maps futura)</p>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Avaliações */}
          <Card>
            <Card.Header>
              <Card.Title>Avaliações ({avaliacoes.length})</Card.Title>
            </Card.Header>
            <Card.Content>
              {/* Formulário de Avaliação */}
              <Card className="mb-6 bg-secondary-50" padding="md">
                <h3 className="font-semibold mb-4 text-secondary-900">Avalie esta atividade</h3>
                <form onSubmit={handleAvaliar} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-secondary-700">Avaliação (1-5 estrelas)</label>
                    <div className="flex gap-1">
                      {renderStars(rating, true, setRating)}
                    </div>
                  </div>
                  <Input.Textarea
                    label="Comentário (opcional)"
                    value={comentario}
                    onChange={(e) => setComentario(e.target.value)}
                    rows="3"
                    placeholder="Partilhe a sua experiência..."
                  />
                  <Button type="submit">
                    Enviar Avaliação
                  </Button>
                </form>
              </Card>

              {/* Lista de Avaliações */}
              {avaliacoes.length === 0 ? (
                <p className="text-secondary-500 text-center py-8">Ainda não há avaliações para esta atividade.</p>
              ) : (
                <div className="space-y-4">
                  {avaliacoes.map((avaliacao) => (
                    <div key={avaliacao.id} className="border-b border-secondary-200 pb-4 last:border-0">
                      <div className="flex items-center gap-2 mb-2">
                        {renderStars(avaliacao.rating)}
                        <span className="text-sm text-secondary-500">
                          {new Date(avaliacao.data_criacao).toLocaleDateString('pt-PT')}
                        </span>
                      </div>
                      {avaliacao.comentario && (
                        <p className="text-secondary-700">{avaliacao.comentario}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Card.Content>
          </Card>
        </div>

        {/* Sidebar - Reserva */}
        <div className="lg:col-span-1">
          <Card className="sticky top-4">
            <div className="mb-6">
              <div className="text-4xl font-bold text-primary-600 mb-1">
                €{atividade.preco_por_pessoa.toFixed(2)}
              </div>
              <div className="text-secondary-500">por pessoa</div>
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex justify-between">
                <span className="text-secondary-600">Capacidade máxima:</span>
                <span className="font-semibold text-secondary-900">{atividade.capacidade_max} pessoas</span>
              </div>
              {atividade.clima && (
                <div className="flex justify-between">
                  <span className="text-secondary-600">Clima:</span>
                  <span className="font-semibold text-secondary-900 capitalize">{atividade.clima}</span>
                </div>
              )}
              {atividade.duracao_minutos && (
                <div className="flex justify-between">
                  <span className="text-secondary-600">Duração:</span>
                  <span className="font-semibold text-secondary-900">{atividade.duracao_minutos} minutos</span>
                </div>
              )}
            </div>

            <Button
              onClick={() => setShowReservationForm(true)}
              className="w-full"
              size="lg"
            >
              Reservar Agora
            </Button>
          </Card>
        </div>
      </div>

      {/* Modal de Reserva */}
      {showReservationForm && (
        user && user.tipo === 'empresa' ? (
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
        ) : (
          <ReservationFormGuest
            atividade={atividade}
            onClose={() => setShowReservationForm(false)}
            onSubmit={async (data) => {
              try {
                await api.post('/reservas/guest', data);
                toast.success('Reserva criada com sucesso! Receberá um email de confirmação em breve.');
                setShowReservationForm(false);
              } catch (error) {
                toast.error('Erro ao criar reserva: ' + (error.response?.data?.detail || 'Tente novamente.'));
              }
            }}
          />
        )
      )}
    </AppLayout>
  );
}

export default AtividadeDetail;

