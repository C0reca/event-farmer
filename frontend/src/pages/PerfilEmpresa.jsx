import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';

function PerfilEmpresa() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [empresa, setEmpresa] = useState(null);
  const [formData, setFormData] = useState({
    nome: '',
    setor: '',
    n_funcionarios: '',
    localizacao: '',
    orcamento_medio: '',
    preferencia_atividades: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!authLoading && (!user || user.tipo !== 'empresa')) {
      navigate('/login');
      return;
    }

    loadEmpresa();
  }, [user, authLoading, navigate]);

  const loadEmpresa = async () => {
    try {
      const response = await api.get('/empresas/me');
      setEmpresa(response.data);
      setFormData({
        nome: response.data.nome || '',
        setor: response.data.setor || '',
        n_funcionarios: response.data.n_funcionarios || '',
        localizacao: response.data.localizacao || '',
        orcamento_medio: response.data.orcamento_medio || '',
        preferencia_atividades: response.data.preferencia_atividades || ''
      });
    } catch (error) {
      toast.error('Erro ao carregar dados da empresa');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      await api.put(`/empresas/${empresa.id}`, {
        nome: formData.nome,
        setor: formData.setor || null,
        n_funcionarios: formData.n_funcionarios ? parseInt(formData.n_funcionarios) : null,
        localizacao: formData.localizacao || null,
        orcamento_medio: formData.orcamento_medio ? parseFloat(formData.orcamento_medio) : null,
        preferencia_atividades: formData.preferencia_atividades || null
      });
      toast.success('Perfil atualizado com sucesso!');
      loadEmpresa();
    } catch (error) {
      toast.error('Erro ao atualizar perfil: ' + (error.response?.data?.detail || 'Tente novamente.'));
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return <div className="text-center py-12">A carregar...</div>;
  }

  if (!empresa) {
    return <div className="text-center py-12">Empresa não encontrada</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Gestão de Perfil</h1>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-6">Informações da Empresa</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome da Empresa *
              </label>
              <input
                type="text"
                required
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Setor
              </label>
              <input
                type="text"
                value={formData.setor}
                onChange={(e) => setFormData({ ...formData, setor: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="ex: Tecnologia, Saúde, etc."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nº Funcionários
              </label>
              <input
                type="number"
                min="1"
                value={formData.n_funcionarios}
                onChange={(e) => setFormData({ ...formData, n_funcionarios: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Localização
              </label>
              <input
                type="text"
                value={formData.localizacao}
                onChange={(e) => setFormData({ ...formData, localizacao: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="ex: Lisboa"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Orçamento Médio (€)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.orcamento_medio}
                onChange={(e) => setFormData({ ...formData, orcamento_medio: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Preferências de Atividades
            </label>
            <textarea
              value={formData.preferencia_atividades}
              onChange={(e) => setFormData({ ...formData, preferencia_atividades: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              rows="4"
              placeholder="Descreva os tipos de atividades que a sua empresa prefere..."
            />
          </div>

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium disabled:opacity-50"
            >
              {saving ? 'A guardar...' : 'Guardar Alterações'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default PerfilEmpresa;

