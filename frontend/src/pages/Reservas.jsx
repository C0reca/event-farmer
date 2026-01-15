import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';
import AppLayout from '../components/layout/AppLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Loader from '../components/ui/Loader';

function Reservas() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [empresaId, setEmpresaId] = useState(null);

  useEffect(() => {
    if (!authLoading && (!user || user.tipo !== 'empresa')) {
      navigate('/login');
      return;
    }

    // Buscar empresa do usuário
    const fetchEmpresa = async () => {
      try {
        const response = await api.get('/empresas/me');
        setEmpresaId(response.data.id);
        loadReservas(response.data.id);
      } catch (error) {
        console.error('Erro ao buscar empresa:', error);
        setLoading(false);
      }
    };

    if (user) {
      fetchEmpresa();
    }
  }, [user, authLoading, navigate]);

  const loadReservas = async (empId) => {
    try {
      const response = await api.get(`/reservas/${empId}`);
      setReservas(response.data);
    } catch (error) {
      console.error('Erro ao carregar reservas:', error);
    }
    setLoading(false);
  };

  const handleCancel = async (reservaId) => {
    if (!window.confirm('Tem certeza que deseja cancelar esta reserva?')) {
      return;
    }

    try {
      await api.post('/reservas/cancelar', { reserva_id: reservaId });
      toast.success('Reserva cancelada com sucesso!');
      if (empresaId) {
        loadReservas(empresaId);
      }
    } catch (error) {
      toast.error('Erro ao cancelar reserva: ' + (error.response?.data?.detail || 'Tente novamente.'));
    }
  };

  if (authLoading || loading) {
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
      title="Minhas Reservas"
      description="Gerencie todas as suas reservas de atividades"
    >
      {reservas.length === 0 ? (
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
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            <h3 className="text-lg font-semibold text-secondary-900 mb-2">
              Nenhuma reserva encontrada
            </h3>
            <p className="text-secondary-600 mb-6">
              Comece a explorar atividades e faça sua primeira reserva!
            </p>
            <Button as={Link} to="/dashboard">
              Explorar Atividades
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {reservas.map((reserva) => {
            const estadoColors = {
              confirmada: 'bg-success-100 text-success-700 border-success-200',
              pendente: 'bg-warning-100 text-warning-700 border-warning-200',
              cancelada: 'bg-danger-100 text-danger-700 border-danger-200',
              recusada: 'bg-secondary-100 text-secondary-700 border-secondary-200'
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
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-secondary-500 mb-1">Data</p>
                        <p className="font-semibold text-secondary-900">
                          {new Date(reserva.data).toLocaleDateString('pt-PT')}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-secondary-500 mb-1">Pessoas</p>
                        <p className="font-semibold text-secondary-900">{reserva.n_pessoas}</p>
                      </div>
                      <div>
                        <p className="text-sm text-secondary-500 mb-1">Preço Total</p>
                        <p className="font-semibold text-primary-600">
                          €{reserva.preco_total.toFixed(2)}
                        </p>
                      </div>
                      {reserva.atividade && (
                        <div>
                          <p className="text-sm text-secondary-500 mb-1">Preço/pessoa</p>
                          <p className="font-semibold text-secondary-900">
                            €{reserva.atividade.preco_por_pessoa.toFixed(2)}
                          </p>
                        </div>
                      )}
                    </div>
                    {reserva.atividade && (
                      <div className="flex flex-wrap gap-2">
                        <span className="px-2.5 py-1 bg-secondary-100 text-secondary-700 text-xs font-medium rounded-full">
                          {reserva.atividade.tipo}
                        </span>
                      </div>
                    )}
                    <div className="mt-4 flex gap-2">
                      <Button
                        as={Link}
                        to={`/evento/${reserva.id}`}
                        variant="outline"
                        size="sm"
                      >
                        Ver Evento
                      </Button>
                      {reserva.estado === 'pendente' && (
                        <Button
                          onClick={() => handleCancel(reserva.id)}
                          variant="danger"
                          size="sm"
                        >
                          Cancelar
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </AppLayout>
  );
}

export default Reservas;

