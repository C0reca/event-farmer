import { useState } from 'react';
import Card from './ui/Card';
import Button from './ui/Button';
import Input from './ui/Input';
import { Link } from 'react-router-dom';

function ReservationFormGuest({ atividade, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    data: '',
    n_pessoas: Math.min(atividade.capacidade_max || 10, 10),
    nome_empresa: '',
    email: '',
    telefone: '',
    nome_contacto: '',
    localizacao: ''
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await onSubmit({
        atividade_id: atividade.id,
        data: formData.data,
        n_pessoas: parseInt(formData.n_pessoas),
        nome_empresa: formData.nome_empresa,
        email: formData.email,
        telefone: formData.telefone || null,
        nome_contacto: formData.nome_contacto || null,
        localizacao: formData.localizacao || null
      });
    } finally {
      setLoading(false);
    }
  };

  const precoTotal = (atividade.preco_por_pessoa * formData.n_pessoas).toFixed(2);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <Card className="max-w-2xl w-full my-8" shadow="xl">
        <Card.Header>
          <Card.Title>Reservar Atividade</Card.Title>
          <Card.Description>{atividade.nome}</Card.Description>
        </Card.Header>
        <Card.Content>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Informações da Reserva */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-navy-900 border-b border-grey pb-2">
                Informações da Reserva
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Data"
                  type="date"
                  required
                  value={formData.data}
                  onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                />
                
                <Input
                  label="Número de Pessoas"
                  type="number"
                  required
                  min="1"
                  max={atividade.capacidade_max}
                  value={formData.n_pessoas}
                  onChange={(e) => setFormData({ ...formData, n_pessoas: e.target.value })}
                  helperText={`Capacidade máxima: ${atividade.capacidade_max} pessoas`}
                />
              </div>
            </div>

            {/* Informações de Contacto */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-navy-900 border-b border-grey pb-2">
                Informações de Contacto
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Nome da Empresa"
                  type="text"
                  required
                  value={formData.nome_empresa}
                  onChange={(e) => setFormData({ ...formData, nome_empresa: e.target.value })}
                  placeholder="ex: TechCorp"
                />
                
                <Input
                  label="Email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="ex: contacto@empresa.com"
                />
                
                <Input
                  label="Nome do Contacto"
                  type="text"
                  value={formData.nome_contacto}
                  onChange={(e) => setFormData({ ...formData, nome_contacto: e.target.value })}
                  placeholder="ex: João Silva"
                />
                
                <Input
                  label="Telefone"
                  type="tel"
                  value={formData.telefone}
                  onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                  placeholder="ex: +351 123 456 789"
                />
                
                <Input
                  label="Localização"
                  type="text"
                  value={formData.localizacao}
                  onChange={(e) => setFormData({ ...formData, localizacao: e.target.value })}
                  placeholder="ex: Lisboa"
                  className="md:col-span-2"
                />
              </div>
            </div>
            
            {/* Preço Total */}
            <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
              <div className="flex items-baseline justify-between">
                <span className="text-sm font-medium text-navy-700">Preço Total:</span>
                <span className="text-2xl font-bold text-primary-600">
                  €{precoTotal}
                </span>
              </div>
              <p className="text-xs text-navy-500 mt-1">
                €{atividade.preco_por_pessoa.toFixed(2)} por pessoa × {formData.n_pessoas} pessoas
              </p>
            </div>

            {/* Aviso */}
            <div className="bg-warning-50 border border-warning-200 rounded-lg p-4">
              <p className="text-sm text-navy-700">
                <strong>Nota:</strong> Ao criar uma reserva sem conta, receberá um email de confirmação. 
                Pode criar uma conta depois para gerir todas as suas reservas.
              </p>
            </div>
            
            <Card.Footer className="pt-4 pb-0 px-0">
              <div className="flex flex-col sm:flex-row justify-between gap-3 w-full">
                <div className="text-sm text-navy-600 flex items-center">
                  Já tem conta?{' '}
                  <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium ml-1">
                    Iniciar sessão
                  </Link>
                </div>
                <div className="flex gap-3">
                  <Button
                    type="button"
                    onClick={onClose}
                    variant="outline"
                    disabled={loading}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    loading={loading}
                    disabled={loading}
                  >
                    Confirmar Reserva
                  </Button>
                </div>
              </div>
            </Card.Footer>
          </form>
        </Card.Content>
      </Card>
    </div>
  );
}

export default ReservationFormGuest;
