import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../services/api';
import AppLayout from '../components/layout/AppLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Loader from '../components/ui/Loader';

function ReservasMultiplas() {
  const location = useLocation();
  const navigate = useNavigate();
  const reservasIds = location.state?.reservas_ids || [];
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processando, setProcessando] = useState(false);

  useEffect(() => {
    carregarReservas();
  }, []);

  const carregarReservas = async () => {
    try {
      const reservasData = await Promise.all(
        reservasIds.map(id => api.get(`/reservas/${id}`).then(r => r.data).catch(() => null))
      );
      setReservas(reservasData.filter(r => r !== null));
    } catch (error) {
      toast.error('Erro ao carregar reservas');
    } finally {
      setLoading(false);
    }
  };

  const precoTotal = reservas.reduce((sum, r) => sum + (r.preco_total || 0), 0);

  const handlePagarTodas = async () => {
    setProcessando(true);
    try {
      // Criar pagamento para todas as reservas
      // Por agora, redirecionar para checkout da primeira
      if (reservasIds.length > 0) {
        navigate(`/checkout/${reservasIds[0]}`);
      }
    } catch (error) {
      toast.error('Erro ao processar pagamento');
    } finally {
      setProcessando(false);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="text-center py-12">
          <Loader size="lg" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout
      title="Múltiplas Reservas"
      description="Resumo das reservas criadas para o seu evento"
    >
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-navy-900 mb-2">
            {reservas.length} Reserva(s) Criada(s)
          </h1>
          <p className="text-navy-600">
            O seu evento foi dividido em {reservas.length} reserva(s). Pode pagar todas de uma vez.
          </p>
        </div>

        <div className="space-y-4 mb-6">
          {reservas.map((reserva) => (
            <Card key={reserva.id} hover>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-navy-900">
                    {reserva.atividade?.nome || 'Atividade'}
                  </h3>
                  <p className="text-sm text-navy-600">
                    {new Date(reserva.data).toLocaleDateString('pt-PT')} • {reserva.n_pessoas} pessoas
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-primary-600">
                    €{reserva.preco_total?.toFixed(2) || '0.00'}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/checkout/${reserva.id}`)}
                  >
                    Pagar Individual
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <Card className="bg-primary-50 border-primary-200">
          <Card.Content>
            <div className="flex items-center justify-between mb-4">
              <span className="text-lg font-semibold text-navy-900">Total a Pagar:</span>
              <span className="text-3xl font-bold text-primary-600">
                €{precoTotal.toFixed(2)}
              </span>
            </div>
            <Button
              onClick={handlePagarTodas}
              className="w-full"
              loading={processando}
              disabled={processando}
              size="lg"
            >
              Pagar Todas as Reservas
            </Button>
          </Card.Content>
        </Card>
      </div>
    </AppLayout>
  );
}

export default ReservasMultiplas;
