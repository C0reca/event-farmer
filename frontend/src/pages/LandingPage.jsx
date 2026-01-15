import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import ActivityCard from '../components/ActivityCard';
import ReservationFormGuest from '../components/ReservationFormGuest';
import CriarEventoForm from '../components/CriarEventoForm';
import { toast } from 'react-toastify';
import { 
  CheckCircle2, 
  Users, 
  Calendar, 
  Sparkles,
  ArrowRight,
  Shield,
  Zap,
  Target,
  TrendingUp,
  Building2,
  Briefcase,
  Star,
  Mail,
  Linkedin,
  X,
  MapPin,
  Clock,
  Users as UsersIcon,
  Search
} from 'lucide-react';
import api from '../services/api';

function LandingPage() {
  const navigate = useNavigate();
  const [destaques, setDestaques] = useState([]);
  const [fornecedores, setFornecedores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingFornecedores, setLoadingFornecedores] = useState(true);
  
  // Busca e reserva
  const [buscaForm, setBuscaForm] = useState({
    localizacao: '',
    n_pessoas: '',
    data: '',
    categoria: ''
  });
  const [resultadosBusca, setResultadosBusca] = useState([]);
  const [buscando, setBuscando] = useState(false);
  const [atividadeSelecionada, setAtividadeSelecionada] = useState(null);
  const [mostrarFormReserva, setMostrarFormReserva] = useState(false);
  const [mostrarCriarEvento, setMostrarCriarEvento] = useState(false);

  useEffect(() => {
    const carregarDestaques = async () => {
      try {
        // Buscar atividades aprovadas (limitado a 6 para destaque)
        const response = await api.get('/atividades/?limit=6');
        setDestaques(response.data || []);
      } catch (error) {
        console.error('Erro ao carregar atividades:', error);
        // Fallback para dados mock se a API não estiver disponível
        setDestaques([
          {
            id: 1,
            nome: 'Canoagem no Tejo',
            descricao: 'Passeio de canoagem pelo rio Tejo com guia experiente. Perfeito para team building ao ar livre.',
            preco_por_pessoa: 25.0,
            localizacao: 'Lisboa',
            capacidade_max: 30,
            duracao_minutos: 120,
            categoria: 'Aventura',
            tipo: 'Outdoor',
            imagens: JSON.stringify(['https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800']),
          },
          {
            id: 2,
            nome: 'Workshop de Culinária',
            descricao: 'Aprende a cozinhar pratos deliciosos enquanto trabalhas em equipa. Experiência hands-on e divertida.',
            preco_por_pessoa: 45.0,
            localizacao: 'Porto',
            capacidade_max: 20,
            duracao_minutos: 180,
            categoria: 'Workshop',
            tipo: 'Indoor',
            imagens: JSON.stringify(['https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800']),
          },
          {
            id: 3,
            nome: 'Paintball Estratégico',
            descricao: 'Jogo de paintball em campo ao ar livre. Ideal para desenvolver estratégia e trabalho em equipa.',
            preco_por_pessoa: 35.0,
            localizacao: 'Sintra',
            capacidade_max: 40,
            duracao_minutos: 90,
            categoria: 'Team Building',
            tipo: 'Outdoor',
            imagens: JSON.stringify(['https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800']),
          },
          {
            id: 4,
            nome: 'Passeio de Barco',
            descricao: 'Passeio relaxante pela costa de Cascais. Perfeito para eventos corporativos e networking.',
            preco_por_pessoa: 40.0,
            localizacao: 'Cascais',
            capacidade_max: 20,
            duracao_minutos: 180,
            categoria: 'Relax',
            tipo: 'Outdoor',
            imagens: JSON.stringify(['https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800']),
          },
          {
            id: 5,
            nome: 'Escape Room Temático',
            descricao: 'Desafio mental em equipa. Resolve puzzles e escapa da sala antes do tempo acabar.',
            preco_por_pessoa: 28.0,
            localizacao: 'Lisboa',
            capacidade_max: 12,
            duracao_minutos: 60,
            categoria: 'Team Building',
            tipo: 'Indoor',
            imagens: JSON.stringify(['https://images.unsplash.com/photo-1511512578047-dfb367c4206e?w=800']),
          },
          {
            id: 6,
            nome: 'Trilho de Aventura',
            descricao: 'Caminhada guiada por trilhos naturais com atividades de orientação e trabalho em equipa.',
            preco_por_pessoa: 30.0,
            localizacao: 'Serra da Estrela',
            capacidade_max: 25,
            duracao_minutos: 240,
            categoria: 'Aventura',
            tipo: 'Outdoor',
            imagens: JSON.stringify(['https://images.unsplash.com/photo-1551632811-561732d1e306?w=800']),
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    const carregarFornecedores = async () => {
      try {
        // Buscar fornecedores verificados (limitado a 6 para destaque)
        const response = await api.get('/fornecedores/?limit=6');
        setFornecedores(response.data || []);
      } catch (error) {
        console.error('Erro ao carregar fornecedores:', error);
        // Fallback para dados mock
        setFornecedores([
          { id: 1, nome: 'Adventure Tours', localizacao: 'Lisboa', descricao: 'Especialistas em atividades ao ar livre' },
          { id: 2, nome: 'Culinary Experiences', localizacao: 'Porto', descricao: 'Workshops de culinária premium' },
          { id: 3, nome: 'Team Building Pro', localizacao: 'Sintra', descricao: 'Team building profissional' },
          { id: 4, nome: 'Coastal Adventures', localizacao: 'Cascais', descricao: 'Aventuras na costa portuguesa' },
          { id: 5, nome: 'Escape Masters', localizacao: 'Lisboa', descricao: 'Escape rooms temáticos' },
          { id: 6, nome: 'Nature Trails', localizacao: 'Serra da Estrela', descricao: 'Trilhos e caminhadas guiadas' },
        ]);
      } finally {
        setLoadingFornecedores(false);
      }
    };

    carregarDestaques();
    carregarFornecedores();
  }, []);

  const handleBuscarAtividades = async (e) => {
    e.preventDefault();
    setBuscando(true);
    
    try {
      const params = new URLSearchParams();
      if (buscaForm.localizacao) params.append('localizacao', buscaForm.localizacao);
      if (buscaForm.n_pessoas) params.append('n_pessoas', buscaForm.n_pessoas);
      if (buscaForm.data) params.append('data', buscaForm.data);
      if (buscaForm.categoria) params.append('categoria', buscaForm.categoria);
      
      const response = await api.get(`/atividades/?${params.toString()}`);
      setResultadosBusca(response.data || []);
      
      if (response.data && response.data.length > 0) {
        document.getElementById('resultados-busca')?.scrollIntoView({ behavior: 'smooth' });
      } else {
        toast.info('Nenhuma atividade encontrada. Tente outros critérios.');
      }
    } catch (error) {
      console.error('Erro ao buscar atividades:', error);
      toast.error('Erro ao buscar atividades. Tente novamente.');
    } finally {
      setBuscando(false);
    }
  };

  const handleReservar = (atividade) => {
    setAtividadeSelecionada(atividade);
    setMostrarFormReserva(true);
  };

  const handleSubmitReserva = async (dadosReserva) => {
    try {
      const response = await api.post('/reservas/guest', dadosReserva);
      toast.success('Reserva criada com sucesso! Verifique o seu email.');
      setMostrarFormReserva(false);
      setAtividadeSelecionada(null);
      // Opcional: redirecionar para página de confirmação
    } catch (error) {
      toast.error('Erro ao criar reserva: ' + (error.response?.data?.detail || 'Tente novamente.'));
    }
  };

  return (
    <div className="min-h-screen bg-white-soft">
      {/* 1. Hero Section - Gradiente #0E1424 → #1F4FFF */}
      <section className="relative overflow-hidden bg-gradient-to-br from-navy-900 via-navy-800 to-primary">
        <div className="max-w-7xl mx-auto container-padding py-24 md:py-32 lg:py-40">
          <div className="text-center max-w-4xl mx-auto text-white">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
              Reserve o seu evento de equipa agora
            </h1>
            <p className="text-xl md:text-2xl mb-4 max-w-3xl mx-auto text-white">
              Encontre e reserve atividades em minutos, sem criar conta.
            </p>
            <p className="text-lg md:text-xl mb-10 max-w-2xl mx-auto text-white leading-relaxed">
              Milhares de atividades verificadas. Reserve agora e pague depois. Sem complicações.
            </p>
            
            {/* Formulário de Busca Proeminente */}
            <Card className="max-w-4xl mx-auto mb-8 bg-white/95 backdrop-blur-sm shadow-2xl">
              <Card.Content className="p-6">
                <form onSubmit={handleBuscarAtividades} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Input
                      label="Localização"
                      type="text"
                      value={buscaForm.localizacao}
                      onChange={(e) => setBuscaForm({ ...buscaForm, localizacao: e.target.value })}
                      placeholder="ex: Lisboa"
                      className="bg-white"
                    />
                    <Input
                      label="Nº Pessoas"
                      type="number"
                      min="1"
                      value={buscaForm.n_pessoas}
                      onChange={(e) => setBuscaForm({ ...buscaForm, n_pessoas: e.target.value })}
                      placeholder="ex: 20"
                      className="bg-white"
                    />
                    <Input
                      label="Data"
                      type="date"
                      value={buscaForm.data}
                      onChange={(e) => setBuscaForm({ ...buscaForm, data: e.target.value })}
                      min={new Date().toISOString().split('T')[0]}
                      className="bg-white"
                    />
                    <div className="flex items-end">
                      <Button
                        type="submit"
                        size="lg"
                        className="w-full h-[42px]"
                        loading={buscando}
                      >
                        <Search className="mr-2 h-5 w-5" />
                        Buscar
                      </Button>
                    </div>
                  </div>
                </form>
              </Card.Content>
            </Card>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button
                onClick={() => setMostrarCriarEvento(true)}
                size="lg"
                variant="primary"
                className="px-8 bg-primary hover:bg-primary-600"
              >
                Criar Evento
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                onClick={() => {
                  document.getElementById('experiencias-destaque')?.scrollIntoView({ behavior: 'smooth' });
                }}
                size="lg"
                variant="outline"
                className="px-8 border-2 border-white text-white hover:bg-white/10"
              >
                Ver Atividades em Destaque
              </Button>
            </div>

            {/* Trust Signals */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-white">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-success" />
                <span>Para equipas de 5 a 500+</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-success" />
                <span>Fornecedores verificados</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-success" />
                <span>Pagamento e logística centralizados</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. O Problema - Background branco (#F7F9FC) */}
      <section className="py-20 lg:py-32 bg-white-soft">
        <div className="max-w-7xl mx-auto container-padding">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-navy-900 mb-6">
              Organizar eventos de equipa não devia ser um segundo trabalho.
            </h2>
            <p className="text-lg md:text-xl text-navy-700 mb-8 leading-relaxed">
              Emails intermináveis, orçamentos confusos, fornecedores pouco claros, zero visibilidade e demasiadas decisões manuais.
              <br /><br />
              A maioria das empresas perde tempo, dinheiro e energia a tentar organizar algo que devia unir a equipa — não desgastá-la.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12 text-left">
              {[
                'Demasiados fornecedores, pouca clareza',
                'Orçamentos difíceis de comparar',
                'Falta de controlo e visibilidade',
                'Processos manuais e repetitivos',
              ].map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-grey-200 flex items-center justify-center mt-1">
                    <X className="h-4 w-4 text-navy-600" />
                  </div>
                  <p className="text-navy-700">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 3. A Solução - Background Light Grey (#E5E8EF) */}
      <section className="py-20 lg:py-32 bg-grey">
        <div className="max-w-7xl mx-auto container-padding">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-navy-900 mb-6">
              A plataforma tudo-em-um para eventos de equipa.
            </h2>
            <p className="text-lg md:text-xl text-navy-700 max-w-3xl mx-auto">
              A TeamSync centraliza todo o processo — desde a descoberta até à execução — numa única plataforma simples e transparente.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card hover={true} className="text-center bg-white">
              <div className="mb-6">
                <div className="inline-flex p-4 rounded-2xl bg-primary/10">
                  <Sparkles className="h-8 w-8 text-primary" />
                </div>
              </div>
              <Card.Title className="text-xl mb-3 text-navy-900">Descoberta inteligente</Card.Title>
              <Card.Description className="text-base text-navy-700">
                Sugestões de experiências com base no tipo de equipa, orçamento, localização e objetivos.
              </Card.Description>
            </Card>

            <Card hover={true} className="text-center bg-white">
              <div className="mb-6">
                <div className="inline-flex p-4 rounded-2xl bg-primary/10">
                  <Zap className="h-8 w-8 text-primary" />
                </div>
              </div>
              <Card.Title className="text-xl mb-3 text-navy-900">Reservas centralizadas</Card.Title>
              <Card.Description className="text-base text-navy-700">
                Pedidos, confirmações, pagamentos e comunicação num único fluxo.
              </Card.Description>
            </Card>

            <Card hover={true} className="text-center bg-white">
              <div className="mb-6">
                <div className="inline-flex p-4 rounded-2xl bg-primary/10">
                  <Target className="h-8 w-8 text-primary" />
                </div>
              </div>
              <Card.Title className="text-xl mb-3 text-navy-900">Logística organizada</Card.Title>
              <Card.Description className="text-base text-navy-700">
                Datas, participantes, fornecedores, pagamentos e detalhes sempre sob controlo.
              </Card.Description>
            </Card>
          </div>
        </div>
      </section>

      {/* 4. Como Funciona - Background branco */}
      <section className="py-20 lg:py-32 bg-white">
        <div className="max-w-7xl mx-auto container-padding">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-navy-900 mb-6">
              Como Funciona
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                step: '1',
                title: 'Define o teu evento',
                description: 'Diz-nos o número de pessoas, local, orçamento e objetivo.',
                icon: Users,
              },
              {
                step: '2',
                title: 'Recebe sugestões',
                description: 'Selecionamos experiências e fornecedores adequados à tua equipa.',
                icon: Sparkles,
              },
              {
                step: '3',
                title: 'Reserva com confiança',
                description: 'Confirma tudo num único local, sem trocas infinitas de emails.',
                icon: CheckCircle2,
              },
              {
                step: '4',
                title: 'Executa sem stress',
                description: 'A TeamSync acompanha o processo para garantir que corre tudo bem.',
                icon: TrendingUp,
              },
            ].map((item) => (
              <div key={item.step} className="relative">
                <div className="flex flex-col items-center text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-white shadow-lg mb-4">
                    <span className="text-2xl font-bold">{item.step}</span>
                  </div>
                  <item.icon className="h-6 w-6 text-primary mb-3" />
                  <h3 className="text-lg font-semibold text-navy-900 mb-2">{item.title}</h3>
                  <p className="text-sm text-navy-700 leading-relaxed">{item.description}</p>
                </div>
                {item.step !== '4' && (
                  <div className="hidden lg:block absolute top-8 left-full w-full h-0.5 bg-grey-200 -ml-4" style={{ width: 'calc(100% - 2rem)' }}></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4.5. Experiências em Destaque */}
      <section className="py-20 lg:py-32 bg-white-soft">
        <div className="max-w-7xl mx-auto container-padding">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-navy-900 mb-4">
              Experiências em Destaque
            </h2>
            <p className="text-lg md:text-xl text-navy-700 max-w-2xl mx-auto">
              Descobre algumas das experiências mais populares na nossa plataforma
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <div className="h-48 bg-grey-200 rounded-t-2xl"></div>
                  <div className="p-6 space-y-4">
                    <div className="h-6 bg-grey-200 rounded w-3/4"></div>
                    <div className="h-4 bg-grey-200 rounded w-full"></div>
                    <div className="h-4 bg-grey-200 rounded w-2/3"></div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {destaques.map((atividade) => (
                <ActivityCard
                  key={atividade.id}
                  atividade={atividade}
                  onReserve={handleReservar}
                />
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Button
              as={Link}
              to="/dashboard"
              size="lg"
              variant="outline"
              className="px-8"
            >
              Ver Todas as Atividades
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* 5. Tipos de Experiências - Background Dark Navy (#0E1424) */}
      <section className="py-20 lg:py-32 bg-navy-900 text-white">
        <div className="max-w-7xl mx-auto container-padding">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-white">
              Experiências para todas as equipas.
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            {[
              'Team Building',
              'Atividades Outdoor',
              'Workshops & Formações',
              'Eventos Corporativos',
              'Offsites & Retreats',
              'Eventos Sociais Internos',
            ].map((tipo) => (
              <div 
                key={tipo} 
                className="text-center p-4 bg-white rounded-xl border-2 border-primary/20 hover:border-primary hover:shadow-lg hover:shadow-primary/20 transition-all cursor-pointer group"
              >
                <p className="text-sm font-medium text-navy-900 group-hover:text-primary transition-colors">{tipo}</p>
              </div>
            ))}
          </div>

          <div className="text-center">
            <p className="text-white/90 italic text-base">
              Sempre com fornecedores verificados e experiência corporate-ready.
            </p>
          </div>
        </div>
      </section>

      {/* 5.5. Nossos Parceiros / Fornecedores */}
      <section className="py-16 lg:py-20 bg-white border-y border-grey">
        <div className="max-w-7xl mx-auto container-padding">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">
              Parceiros Verificados
            </p>
            <h2 className="text-2xl md:text-3xl font-bold text-navy-900 mb-4">
              Trabalhamos com os melhores fornecedores
            </h2>
            <p className="text-base text-navy-600 max-w-2xl mx-auto">
              Todos os nossos fornecedores passam por um rigoroso processo de validação para garantir qualidade e confiança
            </p>
          </div>

          {loadingFornecedores ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="w-16 h-16 rounded-full bg-grey-200 mx-auto mb-3"></div>
                  <div className="h-4 bg-grey-200 rounded w-3/4 mx-auto mb-2"></div>
                  <div className="h-3 bg-grey-200 rounded w-1/2 mx-auto"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6 items-center">
              {fornecedores.map((fornecedor) => (
                <div
                  key={fornecedor.id}
                  className="flex flex-col items-center justify-center p-4 rounded-xl border-2 border-grey hover:border-primary/30 hover:bg-primary/5 transition-all group cursor-pointer"
                >
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-md">
                    <Building2 className="h-8 w-8 text-white" />
                  </div>
                  <p className="text-sm font-semibold text-navy-900 text-center mb-1 line-clamp-2">
                    {fornecedor.nome}
                  </p>
                  {fornecedor.localizacao && (
                    <p className="text-xs text-navy-600 text-center flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {fornecedor.localizacao}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <p className="text-sm text-navy-600 mb-4">
              Mais de 50 fornecedores verificados em toda a região
            </p>
            <Button
              as={Link}
              to="/register?type=supplier"
              variant="outline"
              size="sm"
              className="text-primary border-primary hover:bg-primary/10"
            >
              Tornar-se parceiro
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* 6. Para Quem É - Background branco */}
      <section className="py-20 lg:py-32 bg-white">
        <div className="max-w-7xl mx-auto container-padding">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <Card hover={true} className="bg-white">
              <div className="mb-6">
                <div className="inline-flex p-4 rounded-2xl bg-primary/10">
                  <Building2 className="h-8 w-8 text-primary" />
                </div>
              </div>
              <Card.Title className="text-2xl mb-3 text-navy-900">Empresas</Card.Title>
              <Card.Description className="text-base leading-relaxed text-navy-700">
                Para HR, Office Managers e líderes que querem eventos bem feitos, sem perder tempo.
              </Card.Description>
            </Card>

            <Card hover={true} className="bg-white border-l-4 border-l-grey">
              <div className="mb-6">
                <div className="inline-flex p-4 rounded-2xl bg-primary/10">
                  <Briefcase className="h-8 w-8 text-primary" />
                </div>
              </div>
              <Card.Title className="text-2xl mb-3 text-navy-900">Fornecedores</Card.Title>
              <Card.Description className="text-base leading-relaxed text-navy-700">
                Mais visibilidade, menos gestão administrativa e acesso a clientes corporate.
              </Card.Description>
            </Card>
          </div>
        </div>
      </section>

      {/* 7. Porquê TeamSync - Background azul muito claro (#EEF2FF) */}
      <section className="py-20 lg:py-32 bg-primary-50">
        <div className="max-w-7xl mx-auto container-padding">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-navy-900 mb-6">
              Mais do que um marketplace. Um parceiro.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              'Curadoria de fornecedores',
              'Foco B2B e corporate',
              'Transparência total',
              'Plataforma pensada para escalar',
              'Experiência consistente para empresas e fornecedores',
            ].map((item) => (
              <div key={item} className="flex items-start gap-3">
                <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                <p className="text-navy-900 font-medium">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. Confiança & Qualidade - Background branco, checkmarks verde */}
      <section className="py-20 lg:py-32 bg-white">
        <div className="max-w-7xl mx-auto container-padding">
          <div className="max-w-3xl mx-auto text-center">
            <div className="mb-6">
              <div className="inline-flex p-4 rounded-2xl bg-primary/10">
                <Shield className="h-10 w-10 text-primary" />
              </div>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-navy-900 mb-6">
              Confiança & Qualidade
            </h2>
            <p className="text-lg md:text-xl text-navy-700 mb-8 leading-relaxed">
              Todos os fornecedores da TeamSync passam por um processo de validação.
              A plataforma existe para proteger o tempo, o orçamento e a experiência das equipas.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
              <div className="flex items-start gap-3">
                <Star className="h-6 w-6 text-success flex-shrink-0 mt-1" />
                <div>
                  <p className="font-semibold text-navy-900 mb-1">Fornecedores verificados</p>
                  <p className="text-sm text-navy-700">Processo rigoroso de validação</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Star className="h-6 w-6 text-success flex-shrink-0 mt-1" />
                <div>
                  <p className="font-semibold text-navy-900 mb-1">Avaliações internas</p>
                  <p className="text-sm text-navy-700">Feedback contínuo das empresas</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Star className="h-6 w-6 text-success flex-shrink-0 mt-1" />
                <div>
                  <p className="font-semibold text-navy-900 mb-1">Suporte humano</p>
                  <p className="text-sm text-navy-700">Quando precisas</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 9. CTA Final - Gradiente invertido #1F4FFF → #0E1424 */}
      <section className="py-20 lg:py-32 bg-gradient-to-br from-primary to-navy-900 text-white">
        <div className="max-w-4xl mx-auto container-padding text-center">
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-6">
            Planeia o teu próximo evento em minutos, não em semanas.
          </h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
            <Button
              as={Link}
              to="/register"
              size="lg"
              variant="primary"
              className="px-8 bg-white text-primary hover:bg-white/90 font-semibold"
            >
              Começar agora
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              as={Link}
              to="/contact"
              size="lg"
              variant="outline"
              className="px-8 border-2 border-white text-white hover:bg-white/10 font-semibold"
            >
              Falar com a TeamSync
            </Button>
          </div>
        </div>
      </section>

      {/* 10. Footer - Background Dark Navy */}
      <footer className="bg-navy-900 text-white/80">
        <div className="max-w-7xl mx-auto container-padding py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-xl font-bold text-white mb-4">TeamSync</h3>
              <p className="text-sm text-white/70">
                A plataforma tudo-em-um para eventos de equipa.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-4">Produto</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/#how-it-works" className="text-white/70 hover:text-white transition-colors">Como funciona</Link></li>
                <li><Link to="/#experiences" className="text-white/70 hover:text-white transition-colors">Experiências</Link></li>
                <li><Link to="/#for-companies" className="text-white/70 hover:text-white transition-colors">Para empresas</Link></li>
                <li><Link to="/#for-suppliers" className="text-white/70 hover:text-white transition-colors">Para fornecedores</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-4">Empresa</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/about" className="text-white/70 hover:text-white transition-colors">Sobre</Link></li>
                <li><Link to="/contact" className="text-white/70 hover:text-white transition-colors">Contactos</Link></li>
                <li><Link to="/terms" className="text-white/70 hover:text-white transition-colors">Termos & Privacidade</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-4">Contacto</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="mailto:info@teamsync.com" className="flex items-center gap-2 text-white/70 hover:text-white transition-colors">
                    <Mail className="h-4 w-4" />
                    info@teamsync.com
                  </a>
                </li>
                <li>
                  <a href="https://linkedin.com/company/teamsync" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-white/70 hover:text-white transition-colors">
                    <Linkedin className="h-4 w-4" />
                    LinkedIn
                  </a>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-navy-800 pt-8 text-center text-sm text-white/60">
            <p>&copy; {new Date().getFullYear()} TeamSync. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>

      {/* Modal de Criar Evento */}
      {mostrarCriarEvento && (
        <CriarEventoForm
          onClose={() => setMostrarCriarEvento(false)}
          onSubmit={async (dados) => {
            try {
              // Preparar dados para envio (garantir tipos corretos)
              const dadosEnvio = {
                ...dados,
                n_pessoas: parseInt(dados.n_pessoas) || 0,
                data_fim: dados.data_fim || null,
                observacoes: dados.observacoes || null,
                tipos_atividades: dados.tipos_atividades || []
              };
              
              console.log('Enviando dados:', dadosEnvio); // Debug
              
              const response = await api.post('/eventos/criar', dadosEnvio);
              setMostrarCriarEvento(false);
              toast.success('Propostas geradas com sucesso!');
              // Redirecionar para página de propostas com dados do evento
              navigate('/propostas-evento', { 
                state: { 
                  propostas: response.data,
                  eventoData: dadosEnvio // Passar dados do evento original
                } 
              });
            } catch (error) {
              console.error('Erro ao criar evento:', error.response?.data); // Debug
              const errorMsg = error.response?.data?.detail || 
                              (error.response?.data?.detail && Array.isArray(error.response.data.detail) 
                                ? error.response.data.detail.map(e => e.msg || e.loc?.join('.')).join(', ')
                                : 'Tente novamente.');
              toast.error('Erro ao criar evento: ' + errorMsg);
            }
          }}
        />
      )}

      {/* Modal de Reserva */}
      {mostrarFormReserva && atividadeSelecionada && (
        <ReservationFormGuest
          atividade={atividadeSelecionada}
          onClose={() => {
            setMostrarFormReserva(false);
            setAtividadeSelecionada(null);
          }}
          onSubmit={handleSubmitReserva}
        />
      )}
    </div>
  );
}

export default LandingPage;
