import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';

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
    return <div className="text-center py-12">A carregar...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Minhas Reservas</h1>

      {reservas.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <p className="text-gray-600 text-lg mb-4">Nenhuma reserva encontrada.</p>
          <a
            href="/dashboard"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Explorar atividades →
          </a>
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
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {reserva.estado}
                      </span>
                    </div>
                  </div>
                  {reserva.atividade && (
                    <div className="mt-4 text-sm text-gray-600">
                      <p>
                        <span className="font-semibold">Tipo:</span> {reserva.atividade.tipo}
                      </p>
                      <p>
                        <span className="font-semibold">Preço por pessoa:</span>{' '}
                        €{reserva.atividade.preco_por_pessoa.toFixed(2)}
                      </p>
                    </div>
                  )}
                </div>
                {reserva.estado === 'pendente' && (
                  <button
                    onClick={() => handleCancel(reserva.id)}
                    className="ml-4 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md text-sm font-medium"
                  >
                    Cancelar
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Reservas;

