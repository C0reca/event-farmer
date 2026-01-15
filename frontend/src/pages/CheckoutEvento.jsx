import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';
import AppLayout from '../components/layout/AppLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { CheckCircle2, Clock, MapPin, Users, Euro, FileText } from 'lucide-react';

function CheckoutEvento() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const proposta = location.state?.proposta;
  const grupos = location.state?.grupos;
  const eventoData = location.state?.eventoData; // Dados do evento original
  const [aceiteTermos, setAceiteTermos] = useState(false);
  const [processando, setProcessando] = useState(false);
  
  // Se não autenticado, mostrar campos para criar empresa temporária
  const [dadosEmpresa, setDadosEmpresa] = useState({
    email: '',
    nome_empresa: '',
    telefone: ''
  });

  if (!proposta) {
    return (
      <AppLayout>
        <div className="text-center py-12">
          <p className="text-navy-600 mb-4">Proposta não encontrada.</p>
          <Button onClick={() => navigate('/')}>
            Voltar para Início
          </Button>
        </div>
      </AppLayout>
    );
  }

  const handleConfirmar = async () => {
    if (!aceiteTermos) {
      toast.error('Por favor, aceite os termos e condições');
      return;
    }

    // Se não autenticado, validar dados da empresa
    if (!user) {
      if (!dadosEmpresa.email || !dadosEmpresa.nome_empresa) {
        toast.error('Por favor, preencha email e nome da empresa');
        return;
      }
    }

    setProcessando(true);
    try {
      // Preparar dados da proposta com informações adicionais se necessário
      const propostaEnvio = {
        ...proposta,
        data_evento: eventoData?.data_inicio || proposta.agenda[0]?.horario?.split(' ')[0] || new Date().toISOString().split('T')[0],
        // Adicionar dados da empresa se não autenticado
        ...(user ? {} : {
          email: dadosEmpresa.email,
          nome_empresa: dadosEmpresa.nome_empresa,
          telefone: dadosEmpresa.telefone || null
        })
      };

      // Criar reservas baseadas na proposta
      const response = await api.post(`/eventos/propostas/${proposta.id}/confirmar`, {
        proposta_data: propostaEnvio,
        grupos: grupos || null
      });

      const reservasIds = response.data.reservas_criadas || [];
      
      if (reservasIds.length > 0) {
        // Se múltiplas reservas, redirecionar para primeira ou página de resumo
        toast.success(`${reservasIds.length} reserva(s) criada(s)! Redirecionando para pagamento...`);
        // Redirecionar para checkout da primeira reserva
        navigate(`/checkout/${reservasIds[0]}`);
      } else {
        toast.success('Evento confirmado! Redirecionando para pagamento...');
        navigate('/reservas');
      }
    } catch (error) {
      toast.error('Erro ao confirmar evento: ' + (error.response?.data?.detail || 'Tente novamente.'));
    } finally {
      setProcessando(false);
    }
  };

  return (
    <AppLayout
      title="Confirmar Evento"
      description="Revise os detalhes e confirme o seu evento"
    >
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Button
            onClick={() => navigate('/propostas-evento')}
            variant="ghost"
            size="sm"
          >
            ← Voltar para Propostas
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Resumo da Proposta */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <Card.Header>
                <Card.Title>Proposta {proposta.id}: {proposta.titulo}</Card.Title>
                <Card.Description>{proposta.resumo}</Card.Description>
              </Card.Header>
              <Card.Content>
                {/* Agenda */}
                <div className="space-y-4 mb-6">
                  <h3 className="font-semibold text-navy-900 mb-3">Agenda do Dia</h3>
                  {proposta.agenda.map((item, idx) => (
                    <div key={idx} className="border-l-4 border-primary pl-4 py-3 bg-white-soft rounded-r-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h4 className="font-semibold text-navy-900">{item.nome}</h4>
                          {item.fornecedor && (
                            <p className="text-sm text-navy-600">Fornecedor: {item.fornecedor}</p>
                          )}
                          {item.descricao && (
                            <p className="text-sm text-navy-600 mt-1">{item.descricao}</p>
                          )}
                        </div>
                        <span className="text-lg font-bold text-primary ml-4">
                          €{item.preco.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-4 text-xs text-navy-500 mt-2">
                        {item.horario && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {item.horario}
                          </span>
                        )}
                        {item.local && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {item.local}
                          </span>
                        )}
                        {item.duracao_minutos && (
                          <span>{item.duracao_minutos} minutos</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* O que está incluído */}
                <div className="mb-6">
                  <h3 className="font-semibold text-navy-900 mb-3">O que está incluído</h3>
                  <ul className="space-y-2">
                    {proposta.inclusoes.map((inclusao, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm text-navy-700">
                        <CheckCircle2 className="h-4 w-4 text-success flex-shrink-0" />
                        {inclusao}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Notas importantes */}
                {proposta.notas_importantes && (
                  <div className="bg-warning-50 border border-warning-200 rounded-lg p-4">
                    <h4 className="font-semibold text-warning-700 mb-2">Notas Importantes</h4>
                    <p className="text-sm text-warning-600">{proposta.notas_importantes}</p>
                  </div>
                )}
              </Card.Content>
            </Card>

            {/* Termos e Condições */}
            <Card>
              <Card.Header>
                <Card.Title>Termos e Condições</Card.Title>
              </Card.Header>
              <Card.Content>
                <div className="space-y-3 text-sm text-navy-700">
                  <div>
                    <h4 className="font-semibold mb-1">Cancelamento</h4>
                    <p>Cancelamento até 7 dias antes: reembolso de 100%. Cancelamento até 3 dias antes: reembolso de 50%.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Condições Meteorológicas</h4>
                    <p>Atividades outdoor podem ser reagendadas em caso de condições meteorológicas adversas.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Responsabilidade</h4>
                    <p>Todas as atividades incluem seguro de acidentes pessoais. Os participantes devem seguir as instruções dos guias.</p>
                  </div>
                </div>

                <label className="flex items-start gap-3 mt-6 p-4 border border-grey-300 rounded-lg cursor-pointer hover:bg-white-soft transition-colors">
                  <input
                    type="checkbox"
                    checked={aceiteTermos}
                    onChange={(e) => setAceiteTermos(e.target.checked)}
                    className="mt-1 w-5 h-5 text-primary rounded focus:ring-primary"
                  />
                  <span className="text-sm text-navy-700">
                    Aceito os termos e condições acima e confirmo que li e compreendi todas as informações.
                  </span>
                </label>
              </Card.Content>
            </Card>

            {/* Campos para empresa (se não autenticado) */}
            {!user && (
              <Card>
                <Card.Header>
                  <Card.Title>Dados da Empresa</Card.Title>
                  <Card.Description>
                    Preencha os dados para criar a reserva
                  </Card.Description>
                </Card.Header>
                <Card.Content>
                  <div className="space-y-4">
                    <Input
                      label="Email"
                      type="email"
                      required
                      value={dadosEmpresa.email}
                      onChange={(e) => setDadosEmpresa({ ...dadosEmpresa, email: e.target.value })}
                      placeholder="seu@email.com"
                    />
                    <Input
                      label="Nome da Empresa"
                      type="text"
                      required
                      value={dadosEmpresa.nome_empresa}
                      onChange={(e) => setDadosEmpresa({ ...dadosEmpresa, nome_empresa: e.target.value })}
                      placeholder="Nome da sua empresa"
                    />
                    <Input
                      label="Telefone (opcional)"
                      type="tel"
                      value={dadosEmpresa.telefone}
                      onChange={(e) => setDadosEmpresa({ ...dadosEmpresa, telefone: e.target.value })}
                      placeholder="+351 912 345 678"
                    />
                  </div>
                </Card.Content>
              </Card>
            )}
          </div>

          {/* Sidebar - Resumo e Ações */}
          <div className="space-y-6">
            <Card>
              <Card.Header>
                <Card.Title>Resumo</Card.Title>
              </Card.Header>
              <Card.Content>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-navy-600">Preço Total</span>
                    <span className="text-3xl font-bold text-primary-600">
                      €{proposta.preco_total.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-navy-600">Por Pessoa</span>
                    <span className="font-semibold text-navy-900">
                      €{proposta.preco_por_pessoa.toFixed(2)}
                    </span>
                  </div>
                  
                  <div className="border-t border-grey pt-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-navy-600">Atividades</span>
                      <span className="text-navy-900">
                        {proposta.agenda.filter(a => a.tipo === 'atividade').length}
                      </span>
                    </div>
                    {proposta.agenda.some(a => a.tipo === 'almoco') && (
                      <div className="flex justify-between">
                        <span className="text-navy-600">Almoço</span>
                        <span className="text-navy-900">Incluído</span>
                      </div>
                    )}
                    {proposta.agenda.some(a => a.tipo === 'transporte') && (
                      <div className="flex justify-between">
                        <span className="text-navy-600">Transporte</span>
                        <span className="text-navy-900">Incluído</span>
                      </div>
                    )}
                  </div>
                </div>
              </Card.Content>
              <Card.Footer>
                <Button
                  onClick={handleConfirmar}
                  className="w-full"
                  disabled={!aceiteTermos || processando}
                  loading={processando}
                >
                  Confirmar e Pagar
                </Button>
                <p className="text-xs text-navy-500 text-center mt-3">
                  Pode pagar 100% agora ou um depósito de 30-50%
                </p>
              </Card.Footer>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

export default CheckoutEvento;
