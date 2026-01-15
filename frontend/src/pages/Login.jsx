import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(formData.email, formData.password);

    if (result.success) {
      // Redirecionar conforme o tipo de usuário
      const user = JSON.parse(localStorage.getItem('user'));
      if (user) {
        switch (user.tipo) {
          case 'empresa':
            navigate('/dashboard');
            break;
          case 'fornecedor':
            navigate('/fornecedor');
            break;
          case 'admin':
            navigate('/admin');
            break;
          default:
            navigate('/dashboard');
        }
      } else {
        navigate('/dashboard');
      }
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <Card>
          <Card.Header className="text-center">
            <Card.Title className="text-3xl">Iniciar Sessão</Card.Title>
            <Card.Description className="mt-2">
              Ou{' '}
              <Link to="/register" className="font-medium text-primary-600 hover:text-primary-700">
                crie uma conta nova
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
              
              <Input
                label="Email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="seu@email.com"
                error={error && error.includes('email') ? error : ''}
              />
              
              <Input
                label="Password"
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
                error={error && error.includes('password') ? error : ''}
              />

              <Button
                type="submit"
                disabled={loading}
                loading={loading}
                className="w-full"
                size="lg"
              >
                Iniciar Sessão
              </Button>
            </form>
          </Card.Content>
        </Card>
      </div>
    </div>
  );
}

export default Login;

