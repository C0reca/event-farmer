import { useState } from 'react';
import Card from './ui/Card';
import Button from './ui/Button';
import Input from './ui/Input';

function ReservationForm({ atividade, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    data: '',
    n_pessoas: atividade.capacidade_max || 10
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      atividade_id: atividade.id,
      data: formData.data,
      n_pessoas: parseInt(formData.n_pessoas)
    });
  };

  const precoTotal = (atividade.preco_por_pessoa * formData.n_pessoas).toFixed(2);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-md w-full" shadow="xl">
        <Card.Header>
          <Card.Title>Reservar Atividade</Card.Title>
          <Card.Description>{atividade.nome}</Card.Description>
        </Card.Header>
        <Card.Content>
          <form onSubmit={handleSubmit} className="space-y-4">
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
            
            <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
              <div className="flex items-baseline justify-between">
                <span className="text-sm font-medium text-secondary-700">Preço Total:</span>
                <span className="text-2xl font-bold text-primary-600">
                  €{precoTotal}
                </span>
              </div>
              <p className="text-xs text-secondary-500 mt-1">
                €{atividade.preco_por_pessoa.toFixed(2)} por pessoa × {formData.n_pessoas} pessoas
              </p>
            </div>
            
            <Card.Footer className="pt-4 pb-0 px-0">
              <div className="flex justify-end gap-3 w-full">
                <Button
                  type="button"
                  onClick={onClose}
                  variant="outline"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                >
                  Confirmar Reserva
                </Button>
              </div>
            </Card.Footer>
          </form>
        </Card.Content>
      </Card>
    </div>
  );
}

export default ReservationForm;

