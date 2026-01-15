import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';
import AppLayout from '../components/layout/AppLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Loader from '../components/ui/Loader';

function EventoDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [evento, setEvento] = useState(null);
  const [loading, setLoading] = useState(true);
  const [novaMensagem, setNovaMensagem] = useState('');
  const [enviandoMensagem, setEnviandoMensagem] = useState(false);
  const [novaNota, setNovaNota] = useState({ titulo: '', conteudo: '' });
  const [mostrarFormNota, setMostrarFormNota] = useState(false);

  useEffect(() => {
    loadEvento();
  }, [id]);

  const loadEvento = async () => {
    try {
      const response = await api.get(`/evento/${id}`);
      setEvento(response.data);
    } catch (error) {
      toast.error('Erro ao carregar evento');
      navigate('/reservas');
    } finally {
      setLoading(false);
    }
  };

  const handleEnviarMensagem = async (e) => {
    e.preventDefault();
    if (!novaMensagem.trim()) return;

    setEnviandoMensagem(true);
    try {
      await api.post(`/evento/${id}/mensagens`, {
        reserva_id: parseInt(id),
        destinatario_id: 0, // Será determinado no backend
        conteudo: novaMensagem
      });
      setNovaMensagem('');
      toast.success('Mensagem enviada!');
      loadEvento();
    } catch (error) {
      toast.error('Erro ao enviar mensagem: ' + (error.response?.data?.detail || 'Tente novamente.'));
    } finally {
      setEnviandoMensagem(false);
    }
  };

  const handleCriarNota = async (e) => {
    e.preventDefault();
    if (!novaNota.conteudo.trim()) return;

    try {
      await api.post(`/evento/${id}/notas`, {
        reserva_id: parseInt(id),
        titulo: novaNota.titulo || null,
        conteudo: novaNota.conteudo
      });
      setNovaNota({ titulo: '', conteudo: '' });
      setMostrarFormNota(false);
      toast.success('Nota criada!');
      loadEvento();
    } catch (error) {
      toast.error('Erro ao criar nota: ' + (error.response?.data?.detail || 'Tente novamente.'));
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('pt-PT', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('pt-PT');
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="text-center py-12">
          <Loader size="lg" />
          <p className="mt-4 text-navy-600">A carregar evento...</p>
        </div>
      </AppLayout>
    );
  }

  if (!evento) {
    return null;
  }

  const isEmpresa = user?.tipo === 'empresa';
  const outroParticipante = isEmpresa ? evento.fornecedor : evento.empresa;

  return (
    <AppLayout
      title={`Evento #${evento.reserva.id}`}
      description={`${evento.atividade.nome} - ${formatDate(evento.reserva.data)}`}
    >
      <div className="mb-6">
        <Button
          onClick={() => navigate('/reservas')}
          variant="ghost"
          size="sm"
        >
          ← Voltar para Reservas
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coluna Principal - Mensagens e Notas */}
        <div className="lg:col-span-2 space-y-6">
          {/* Informações do Evento */}
          <Card>
            <Card.Header>
              <Card.Title>{evento.atividade.nome}</Card.Title>
              <Card.Description>
                {formatDate(evento.reserva.data)} • {evento.reserva.n_pessoas} pessoas
              </Card.Description>
            </Card.Header>
            <Card.Content>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-navy-500">Estado</p>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold inline-block mt-1 ${
                    evento.reserva.estado === 'confirmada' ? 'bg-success-100 text-success-700' :
                    evento.reserva.estado === 'pendente' ? 'bg-warning-100 text-warning-700' :
                    'bg-error-100 text-error-700'
                  }`}>
                    {evento.reserva.estado.charAt(0).toUpperCase() + evento.reserva.estado.slice(1)}
                  </span>
                </div>
                <div>
                  <p className="text-navy-500">Preço Total</p>
                  <p className="font-semibold text-navy-900">€{evento.reserva.preco_total.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-navy-500">Localização</p>
                  <p className="font-semibold text-navy-900">{evento.atividade.localizacao}</p>
                </div>
                <div>
                  <p className="text-navy-500">Contacto</p>
                  <p className="font-semibold text-navy-900">{outroParticipante?.contacto || 'N/A'}</p>
                </div>
              </div>
            </Card.Content>
          </Card>

          {/* Mensagens */}
          <Card>
            <Card.Header>
              <Card.Title>Mensagens</Card.Title>
              <Card.Description>
                Comunicação com {outroParticipante?.nome || 'o outro participante'}
              </Card.Description>
            </Card.Header>
            <Card.Content>
              <div className="space-y-4 mb-4 max-h-96 overflow-y-auto">
                {evento.mensagens.length === 0 ? (
                  <p className="text-center text-navy-500 py-8">
                    Nenhuma mensagem ainda. Comece a conversa!
                  </p>
                ) : (
                  evento.mensagens.map((msg) => {
                    const isMine = msg.remetente_id === user?.id;
                    return (
                      <div
                        key={msg.id}
                        className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[70%] rounded-lg p-3 ${
                            isMine
                              ? 'bg-primary-100 text-navy-900'
                              : 'bg-white-soft text-navy-900 border border-grey'
                          }`}
                        >
                          <p className="text-xs text-navy-500 mb-1">
                            {msg.remetente_nome} • {formatDateTime(msg.data_criacao)}
                          </p>
                          <p className="text-sm whitespace-pre-wrap">{msg.conteudo}</p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <form onSubmit={handleEnviarMensagem} className="flex gap-2">
                <Input
                  value={novaMensagem}
                  onChange={(e) => setNovaMensagem(e.target.value)}
                  placeholder="Escreva uma mensagem..."
                  className="flex-1"
                />
                <Button
                  type="submit"
                  loading={enviandoMensagem}
                  disabled={!novaMensagem.trim() || enviandoMensagem}
                  size="sm"
                >
                  Enviar
                </Button>
              </form>
            </Card.Content>
          </Card>

          {/* Notas */}
          <Card>
            <Card.Header>
              <div className="flex justify-between items-center">
                <div>
                  <Card.Title>Notas do Evento</Card.Title>
                  <Card.Description>
                    Notas privadas sobre este evento
                  </Card.Description>
                </div>
                <Button
                  onClick={() => setMostrarFormNota(!mostrarFormNota)}
                  variant="outline"
                  size="sm"
                >
                  {mostrarFormNota ? 'Cancelar' : '+ Nova Nota'}
                </Button>
              </div>
            </Card.Header>
            <Card.Content>
              {mostrarFormNota && (
                <form onSubmit={handleCriarNota} className="mb-4 p-4 bg-white-soft rounded-lg border border-grey">
                  <Input
                    label="Título (opcional)"
                    value={novaNota.titulo}
                    onChange={(e) => setNovaNota({ ...novaNota, titulo: e.target.value })}
                    placeholder="ex: Checklist pré-evento"
                    className="mb-3"
                  />
                  <Input.Textarea
                    label="Conteúdo *"
                    required
                    rows="4"
                    value={novaNota.conteudo}
                    onChange={(e) => setNovaNota({ ...novaNota, conteudo: e.target.value })}
                    placeholder="Escreva a sua nota..."
                    className="mb-3"
                  />
                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      onClick={() => {
                        setMostrarFormNota(false);
                        setNovaNota({ titulo: '', conteudo: '' });
                      }}
                      variant="outline"
                      size="sm"
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      size="sm"
                      disabled={!novaNota.conteudo.trim()}
                    >
                      Criar Nota
                    </Button>
                  </div>
                </form>
              )}

              <div className="space-y-3">
                {evento.notas.length === 0 ? (
                  <p className="text-center text-navy-500 py-8">
                    Nenhuma nota ainda. Crie uma nota para guardar informações importantes!
                  </p>
                ) : (
                  evento.notas.map((nota) => (
                    <div
                      key={nota.id}
                      className="p-4 bg-white-soft rounded-lg border border-grey"
                    >
                      {nota.titulo && (
                        <h4 className="font-semibold text-navy-900 mb-2">{nota.titulo}</h4>
                      )}
                      <p className="text-sm text-navy-700 whitespace-pre-wrap mb-2">
                        {nota.conteudo}
                      </p>
                      <p className="text-xs text-navy-500">
                        Por {nota.criado_por_nome} • {formatDateTime(nota.data_criacao)}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </Card.Content>
          </Card>
        </div>

        {/* Sidebar - Documentos e Info */}
        <div className="space-y-6">
          {/* Documentos */}
          <Card>
            <Card.Header>
              <Card.Title>Documentos</Card.Title>
              <Card.Description>
                Ficheiros partilhados
              </Card.Description>
            </Card.Header>
            <Card.Content>
              {evento.documentos.length === 0 ? (
                <p className="text-center text-navy-500 py-8 text-sm">
                  Nenhum documento ainda
                </p>
              ) : (
                <div className="space-y-2">
                  {evento.documentos.map((doc) => (
                    <a
                      key={doc.id}
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 p-2 rounded-lg hover:bg-white-soft transition-colors"
                    >
                      <svg
                        className="w-5 h-5 text-navy-400"
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
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-navy-900 truncate">
                          {doc.nome}
                        </p>
                        <p className="text-xs text-navy-500">
                          {doc.tipo || 'Documento'} • {formatDate(doc.data_upload)}
                        </p>
                      </div>
                    </a>
                  ))}
                </div>
              )}
            </Card.Content>
          </Card>

          {/* Informações do Participante */}
          <Card>
            <Card.Header>
              <Card.Title>
                {isEmpresa ? 'Fornecedor' : 'Empresa'}
              </Card.Title>
            </Card.Header>
            <Card.Content>
              {outroParticipante ? (
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-navy-500">Nome</p>
                    <p className="font-semibold text-navy-900">{outroParticipante.nome}</p>
                  </div>
                  <div>
                    <p className="text-navy-500">Localização</p>
                    <p className="font-semibold text-navy-900">{outroParticipante.localizacao || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-navy-500">Contacto</p>
                    <p className="font-semibold text-navy-900">{outroParticipante.contacto || 'N/A'}</p>
                  </div>
                </div>
              ) : (
                <p className="text-navy-500 text-sm">Informação não disponível</p>
              )}
            </Card.Content>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}

export default EventoDetail;
