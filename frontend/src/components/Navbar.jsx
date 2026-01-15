import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Button from './ui/Button';

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-white border-b border-grey shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto container-padding">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link 
              to="/" 
              className="flex items-center px-2 py-2 text-2xl font-bold text-primary hover:text-primary-600 transition-colors"
            >
              TeamSync
            </Link>
          </div>
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <span className="text-sm text-navy-600 font-medium hidden sm:inline">
                  Olá, <span className="text-navy-900 font-semibold">{user.nome}</span>
                </span>
                {user.tipo === 'empresa' && (
                  <>
                    <Link 
                      to="/dashboard" 
                      className="text-sm text-navy-700 hover:text-primary px-3 py-2 rounded-xl font-medium transition-colors"
                    >
                      Dashboard
                    </Link>
                    <Link 
                      to="/rfqs" 
                      className="text-sm text-navy-700 hover:text-primary px-3 py-2 rounded-xl font-medium transition-colors"
                    >
                      RFQs
                    </Link>
                    <Link 
                      to="/reservas" 
                      className="text-sm text-navy-700 hover:text-primary px-3 py-2 rounded-xl font-medium transition-colors"
                    >
                      Reservas
                    </Link>
                    <Link 
                      to="/perfil" 
                      className="text-sm text-navy-700 hover:text-primary px-3 py-2 rounded-xl font-medium transition-colors"
                    >
                      Perfil
                    </Link>
                  </>
                )}
                {user.tipo === 'fornecedor' && (
                  <>
                    <Link 
                      to="/fornecedor" 
                      className="text-sm text-navy-700 hover:text-primary px-3 py-2 rounded-xl font-medium transition-colors"
                    >
                      Painel
                    </Link>
                    <Link 
                      to="/fornecedor/rfqs" 
                      className="text-sm text-navy-700 hover:text-primary px-3 py-2 rounded-xl font-medium transition-colors"
                    >
                      RFQs
                    </Link>
                  </>
                )}
                {user.tipo === 'admin' && (
                  <Link 
                    to="/admin" 
                    className="text-sm text-navy-700 hover:text-primary px-3 py-2 rounded-xl font-medium transition-colors"
                  >
                    Admin
                  </Link>
                )}
                <Button
                  onClick={handleLogout}
                  variant="danger"
                  size="sm"
                >
                  Sair
                </Button>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="text-sm text-navy-700 hover:text-primary px-3 py-2 rounded-xl font-medium transition-colors"
                >
                  Login
                </Link>
                <Button
                  as={Link}
                  to="/register"
                  size="sm"
                >
                  Registar
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;

