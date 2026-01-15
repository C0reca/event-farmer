import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

function Register() {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    password: '',
    tipo: 'empresa',
    // Campos específicos de empresa
    setor: '',
    n_funcionarios: '',
    localizacao: '',
    orcamento_medio: '',
    // Campos específicos de fornecedor
    contacto: '',
    descricao: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const userData = {
      nome: formData.nome,
      email: formData.email,
      password: formData.password,
      tipo: formData.tipo
    };

    try {
      const response = await fetch('http://localhost:8000/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || 'Erro ao registar');
      }

      const user = await response.json();
      
      // Fazer login automático
      const loginResponse = await fetch('http://localhost:8000/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, password: formData.password })
      });

      if (loginResponse.ok) {
        const { access_token } = await loginResponse.json();
        localStorage.setItem('token', access_token);
        
        // Criar perfil (empresa ou fornecedor)
        if (formData.tipo === 'empresa') {
          const empresaData = {
            nome: formData.nome,
            setor: formData.setor || null,
            n_funcionarios: formData.n_funcionarios ? parseInt(formData.n_funcionarios) : null,
            localizacao: formData.localizacao || null,
            orcamento_medio: formData.orcamento_medio ? parseFloat(formData.orcamento_medio) : null
          };
          
          try {
            await fetch('http://localhost:8000/empresas/', {
              method: 'POST',
              headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${access_token}`
              },
              body: JSON.stringify(empresaData)
            });
          } catch (e) {
            console.error('Erro ao criar perfil de empresa:', e);
          }
          
          navigate('/dashboard');
        } else {
          const fornecedorData = {
            nome: formData.nome,
            localizacao: formData.localizacao || null,
            descricao: formData.descricao || null,
            contacto: formData.contacto || null
          };
          
          try {
            await fetch('http://localhost:8000/fornecedores/', {
              method: 'POST',
              headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${access_token}`
              },
              body: JSON.stringify(fornecedorData)
            });
          } catch (e) {
            console.error('Erro ao criar perfil de fornecedor:', e);
          }
          
          navigate('/fornecedor');
        }
      } else {
        navigate('/login');
      }
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full">
        <Card>
          <Card.Header className="text-center">
            <Card.Title className="text-3xl">Criar Conta</Card.Title>
            <Card.Description className="mt-2">
              Ou{' '}
              <Link to="/login" className="font-medium text-primary-600 hover:text-primary-700">
                faça login na sua conta
              </Link>
            </Card.Description>
          </Card.Header>
          <Card.Content>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-danger-50 border border-danger-200 text-danger-700 px-4 py-3 rounded-lg text-sm" role="alert">
                  {error}
                </div>
              )}
              
              <div className="space-y-4">
                <Input.Select
                  label="Tipo de Conta"
                  value={formData.tipo}
                  onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                  required
                >
                  <option value="empresa">Empresa</option>
                  <option value="fornecedor">Fornecedor</option>
                </Input.Select>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Nome"
                    type="text"
                    required
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  />

                  <Input
                    label="Email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="seu@email.com"
                  />
                </div>

                <Input
                  label="Password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                />

                {formData.tipo === 'empresa' && (
                  <div className="space-y-4 pt-4 border-t border-secondary-200">
                    <h3 className="text-lg font-semibold text-secondary-900">Informações da Empresa</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="Setor"
                        type="text"
                        value={formData.setor}
                        onChange={(e) => setFormData({ ...formData, setor: e.target.value })}
                        placeholder="ex: Tecnologia"
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
                  </div>
                )}

                {formData.tipo === 'fornecedor' && (
                  <div className="space-y-4 pt-4 border-t border-secondary-200">
                    <h3 className="text-lg font-semibold text-secondary-900">Informações do Fornecedor</h3>
                    <Input
                      label="Localização"
                      type="text"
                      value={formData.localizacao}
                      onChange={(e) => setFormData({ ...formData, localizacao: e.target.value })}
                      placeholder="ex: Lisboa"
                    />
                    <Input.Textarea
                      label="Descrição"
                      value={formData.descricao}
                      onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                      rows="3"
                      placeholder="Descreva os seus serviços..."
                    />
                    <Input
                      label="Contacto"
                      type="text"
                      value={formData.contacto}
                      onChange={(e) => setFormData({ ...formData, contacto: e.target.value })}
                      placeholder="ex: +351 912 345 678"
                    />
                  </div>
                )}
              </div>

              <Button
                type="submit"
                disabled={loading}
                loading={loading}
                className="w-full"
                size="lg"
              >
                Criar Conta
              </Button>
            </form>
          </Card.Content>
        </Card>
      </div>
    </div>
  );
}

export default Register;

