import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';
import AppLayout from '../components/layout/AppLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

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
    return (
      <AppLayout>
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-secondary-600">A carregar...</p>
        </div>
      </AppLayout>
    );
  }

  if (!empresa) {
    return (
      <AppLayout>
        <Card className="text-center py-12">
          <p className="text-secondary-600">Empresa não encontrada</p>
        </Card>
      </AppLayout>
    );
  }

  return (
    <AppLayout
      title="Gestão de Perfil"
      description="Atualize as informações da sua empresa"
      maxWidth="4xl"
    >
      <Card>
        <Card.Header>
          <Card.Title>Informações da Empresa</Card.Title>
          <Card.Description>
            Mantenha seus dados atualizados para receber recomendações mais precisas
          </Card.Description>
        </Card.Header>
        <Card.Content>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Nome da Empresa"
                type="text"
                required
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              />

              <Input
                label="Setor"
                type="text"
                value={formData.setor}
                onChange={(e) => setFormData({ ...formData, setor: e.target.value })}
                placeholder="ex: Tecnologia, Saúde, etc."
              />

              <Input
                label="Nº Funcionários"
                type="number"
                min="1"
                value={formData.n_funcionarios}
                onChange={(e) => setFormData({ ...formData, n_funcionarios: e.target.value })}
              />

              <Input
                label="Localização"
                type="text"
                value={formData.localizacao}
                onChange={(e) => setFormData({ ...formData, localizacao: e.target.value })}
                placeholder="ex: Lisboa"
              />

              <Input
                label="Orçamento Médio (€)"
                type="number"
                step="0.01"
                value={formData.orcamento_medio}
                onChange={(e) => setFormData({ ...formData, orcamento_medio: e.target.value })}
              />
            </div>

            <Input.Textarea
              label="Preferências de Atividades"
              value={formData.preferencia_atividades}
              onChange={(e) => setFormData({ ...formData, preferencia_atividades: e.target.value })}
              rows="4"
              placeholder="Descreva os tipos de atividades que a sua empresa prefere..."
            />

            <Card.Footer className="px-0 pb-0">
              <div className="flex justify-end gap-4 w-full">
                <Button
                  type="button"
                  onClick={() => navigate('/dashboard')}
                  variant="outline"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={saving}
                  loading={saving}
                >
                  Guardar Alterações
                </Button>
              </div>
            </Card.Footer>
          </form>
        </Card.Content>
      </Card>
    </AppLayout>
  );
}

export default PerfilEmpresa;

