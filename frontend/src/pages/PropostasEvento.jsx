import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import AppLayout from '../components/layout/AppLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Clock, MapPin, Users, Euro, CheckCircle2, Edit2, ArrowRight } from 'lucide-react';
import EditarPropostaModal from '../components/EditarPropostaModal';
import DivisaoGruposModal from '../components/DivisaoGruposModal';
import api from '../services/api';

function PropostasEvento() {
  const location = useLocation();
  const navigate = useNavigate();
  const responseData = location.state?.propostas;
  const [propostas, setPropostas] = useState(responseData?.propostas || []);
  const [propostaSelecionada, setPropostaSelecionada] = useState(null);
  const [propostaEditando, setPropostaEditando] = useState(null);
  const [mostrarDivisaoGrupos, setMostrarDivisaoGrupos] = useState(false);
  const [atividadesDisponiveis, setAtividadesDisponiveis] = useState([]);

  if (!propostas || propostas.length === 0) {
    return (
      <AppLayout>
        <div className="text-center py-12">
          <p className="text-navy-600 mb-4">Nenhuma proposta disponível.</p>
          <Button onClick={() => navigate('/')}>
            Voltar para Início
          </Button>
        </div>
      </AppLayout>
    );
  }

  const handleConfirmarProposta = async (propostaId) => {
    // TODO: Implementar confirmação e criação de reserva
    toast.success(`Proposta ${propostaId} selecionada! Redirecionando para confirmação...`);
    navigate('/checkout-evento', { state: { proposta: propostas.find(p => p.id === propostaId) } });
  };

  return (
    <AppLayout
      title="Propostas do Seu Evento"
      description="Escolha uma das 3 propostas personalizadas ou edite conforme necessário"
    >
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-navy-900 mb-2">
          Escolha a Proposta Ideal
        </h1>
        <p className="text-navy-600">
          Recebemos 3 propostas personalizadas para o seu evento. Compare e escolha a melhor opção.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {propostas.map((proposta) => (
          <Card
            key={proposta.id}
            className={`relative ${propostaSelecionada === proposta.id ? 'ring-2 ring-primary' : ''}`}
            hover
          >
            <Card.Header>
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl font-bold text-primary">Proposta {proposta.id.split('_').pop() || proposta.id}</span>
                {propostaSelecionada === proposta.id && (
                  <CheckCircle2 className="h-6 w-6 text-success" />
                )}
              </div>
              <Card.Title className="text-xl">{proposta.titulo}</Card.Title>
              <Card.Description>{proposta.resumo}</Card.Description>
            </Card.Header>
            
            <Card.Content>
              {/* Preço */}
              <div className="bg-primary-50 rounded-lg p-4 mb-4">
                <div className="flex items-baseline justify-between">
                  <span className="text-sm font-medium text-navy-700">Preço Total</span>
                  <span className="text-3xl font-bold text-primary-600">
                    €{proposta.preco_total.toFixed(2)}
                  </span>
                </div>
                <p className="text-sm text-navy-600 mt-1">
                  €{proposta.preco_por_pessoa.toFixed(2)} por pessoa
                </p>
              </div>

              {/* Agenda */}
              <div className="space-y-3 mb-4">
                <h4 className="font-semibold text-navy-900 mb-2">Agenda do Dia</h4>
                {proposta.agenda.map((item, idx) => (
                  <div key={idx} className="border-l-2 border-primary pl-3 py-2">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-navy-900">{item.nome}</p>
                        {item.horario && (
                          <p className="text-xs text-navy-600 flex items-center gap-1 mt-1">
                            <Clock className="h-3 w-3" />
                            {item.horario}
                          </p>
                        )}
                        {item.local && (
                          <p className="text-xs text-navy-600 flex items-center gap-1 mt-1">
                            <MapPin className="h-3 w-3" />
                            {item.local}
                          </p>
                        )}
                      </div>
                      <span className="text-sm font-semibold text-primary">
                        €{item.preco.toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* O que está incluído */}
              <div className="mb-4">
                <h4 className="font-semibold text-navy-900 mb-2 text-sm">O que está incluído:</h4>
                <ul className="space-y-1">
                  {proposta.inclusoes.map((inclusao, idx) => (
                    <li key={idx} className="text-sm text-navy-600 flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-success flex-shrink-0" />
                      {inclusao}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Notas importantes */}
              {proposta.notas_importantes && (
                <div className="bg-warning-50 border border-warning-200 rounded-lg p-3 mb-4">
                  <p className="text-xs font-semibold text-warning-700 mb-1">Notas Importantes</p>
                  <p className="text-xs text-warning-600">{proposta.notas_importantes}</p>
                </div>
              )}
            </Card.Content>

            <Card.Footer>
              <div className="flex gap-2 w-full">
                <div className="flex gap-2 flex-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleEditarProposta(proposta)}
                  >
                    <Edit2 className="h-4 w-4 mr-1" />
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setPropostaSelecionada(proposta.id);
                      setMostrarDivisaoGrupos(true);
                    }}
                    title="Dividir equipa em grupos"
                  >
                    <Users className="h-4 w-4" />
                  </Button>
                </div>
                <Button
                  size="sm"
                  className="flex-1"
                  onClick={() => handleConfirmarProposta(proposta.id)}
                >
                  Escolher
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </Card.Footer>
          </Card>
        ))}
      </div>

      {/* Comparação Rápida */}
      <Card className="mb-8">
        <Card.Header>
          <Card.Title>Comparação Rápida</Card.Title>
        </Card.Header>
        <Card.Content>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-grey">
                  <th className="text-left py-3 px-4 font-semibold text-navy-900">Critério</th>
                  {propostas.map((p) => (
                    <th key={p.id} className="text-center py-3 px-4 font-semibold text-navy-900">
                      Proposta {p.id.split('_').pop() || p.id}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-grey">
                  <td className="py-3 px-4 font-medium text-navy-700">Preço Total</td>
                  {propostas.map((p) => (
                    <td key={p.id} className="text-center py-3 px-4">
                      <span className="font-bold text-primary">€{p.preco_total.toFixed(2)}</span>
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-grey">
                  <td className="py-3 px-4 font-medium text-navy-700">Preço por Pessoa</td>
                  {propostas.map((p) => (
                    <td key={p.id} className="text-center py-3 px-4">
                      €{p.preco_por_pessoa.toFixed(2)}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-grey">
                  <td className="py-3 px-4 font-medium text-navy-700">Nº de Atividades</td>
                  {propostas.map((p) => (
                    <td key={p.id} className="text-center py-3 px-4">
                      {p.agenda.filter(a => a.tipo === 'atividade').length}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium text-navy-700">Estilo</td>
                  {propostas.map((p) => (
                    <td key={p.id} className="text-center py-3 px-4">
                      {p.titulo}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </Card.Content>
      </Card>
    </AppLayout>
  );
}

export default PropostasEvento;
