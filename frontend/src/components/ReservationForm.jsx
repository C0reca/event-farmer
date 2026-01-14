import { useState } from 'react';

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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold mb-4">Reservar: {atividade.nome}</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Data
            </label>
            <input
              type="date"
              required
              value={formData.data}
              onChange={(e) => setFormData({ ...formData, data: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              min={new Date().toISOString().split('T')[0]}
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Número de Pessoas
            </label>
            <input
              type="number"
              required
              min="1"
              max={atividade.capacidade_max}
              value={formData.n_pessoas}
              onChange={(e) => setFormData({ ...formData, n_pessoas: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-sm text-gray-500 mt-1">
              Capacidade máxima: {atividade.capacidade_max} pessoas
            </p>
          </div>
          <div className="mb-4">
            <p className="text-lg font-semibold">
              Preço Total: €{(atividade.preco_por_pessoa * formData.n_pessoas).toFixed(2)}
            </p>
          </div>
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-md font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium"
            >
              Confirmar Reserva
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ReservationForm;

