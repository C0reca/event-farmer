import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Reservas from './pages/Reservas';
import Fornecedor from './pages/Fornecedor';
import Admin from './pages/Admin';
import AtividadeDetail from './pages/AtividadeDetail';
import PerfilEmpresa from './pages/PerfilEmpresa';
import LoaderTest from './pages/LoaderTest';
import RFQs from './pages/RFQs';
import RFQDetail from './pages/RFQDetail';
import FornecedorRFQs from './pages/FornecedorRFQs';
import CompararPropostas from './pages/CompararPropostas';
import EventoDetail from './pages/EventoDetail';
import Checkout from './pages/Checkout';
import PropostasEvento from './pages/PropostasEvento';
import CheckoutEvento from './pages/CheckoutEvento';
import ReservasMultiplas from './pages/ReservasMultiplas';
import Navbar from './components/Navbar';
import Toast from './components/Toast';
import { AuthProvider } from './hooks/useAuth';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/atividade/:id" element={<AtividadeDetail />} />
            <Route path="/reservas" element={<Reservas />} />
            <Route path="/fornecedor" element={<Fornecedor />} />
            <Route path="/fornecedor/rfqs" element={<FornecedorRFQs />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/perfil" element={<PerfilEmpresa />} />
            <Route path="/rfqs" element={<RFQs />} />
            <Route path="/rfq/:id" element={<RFQDetail />} />
            <Route path="/propostas/comparar" element={<CompararPropostas />} />
            <Route path="/evento/:id" element={<EventoDetail />} />
            <Route path="/checkout/:id" element={<Checkout />} />
            <Route path="/propostas-evento" element={<PropostasEvento />} />
            <Route path="/checkout-evento" element={<CheckoutEvento />} />
            <Route path="/reservas-multiplas" element={<ReservasMultiplas />} />
            <Route path="/loader-test" element={<LoaderTest />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <Toast />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;

