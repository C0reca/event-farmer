import { useState } from 'react';
import Card from './ui/Card';
import Button from './ui/Button';
import Input from './ui/Input';
import { Calendar, Users, Clock, MapPin, UtensilsCrossed, Car, ArrowRight } from 'lucide-react';

function CriarEventoForm({ onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    data_inicio: '',
    data_fim: '',
    duracao_atividades: '', // manha, tarde, dia_todo
    n_pessoas: '',
    tipos_atividades: [], // multi-select
    almoco: false,
    transporte: false,
    expectativa_preco: '', // €, €€, €€€
    localizacao: '',
    observacoes: ''
  });

  const tiposDisponiveis = [
    { id: 'aventuras', label: 'Aventuras' },
    { id: 'artes', label: 'Artes' },
    { id: 'workshops', label: 'Workshops' },
    { id: 'outdoor', label: 'Outdoor' },
    { id: 'indoor', label: 'Indoor' },
  ];

  const handleTipoChange = (tipoId) => {
    setFormData(prev => ({
      ...prev,
      tipos_atividades: prev.tipos_atividades.includes(tipoId)
        ? prev.tipos_atividades.filter(id => id !== tipoId)
        : [...prev.tipos_atividades, tipoId]
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Preparar dados para envio (converter tipos)
    const dadosEnvio = {
      data_inicio: formData.data_inicio, // String no formato YYYY-MM-DD (aceito pelo FastAPI)
      data_fim: formData.data_fim || null, // null se vazio
      duracao_atividades: formData.duracao_atividades,
      n_pessoas: parseInt(formData.n_pessoas, 10), // Converter para int
      localizacao: formData.localizacao,
      tipos_atividades: formData.tipos_atividades,
      almoco: formData.almoco,
      transporte: formData.transporte,
      expectativa_preco: formData.expectativa_preco,
      observacoes: formData.observacoes || null
    };
    
    // Validar campos obrigatórios
    if (!dadosEnvio.data_inicio) {
      alert('Por favor, selecione a data de início');
      return;
    }
    if (!dadosEnvio.duracao_atividades) {
      alert('Por favor, selecione a duração das atividades');
      return;
    }
    if (!dadosEnvio.n_pessoas || dadosEnvio.n_pessoas <= 0) {
      alert('Por favor, informe o número de pessoas');
      return;
    }
    if (!dadosEnvio.localizacao) {
      alert('Por favor, informe a localização');
      return;
    }
    if (!dadosEnvio.tipos_atividades || dadosEnvio.tipos_atividades.length === 0) {
      alert('Por favor, selecione pelo menos um tipo de atividade');
      return;
    }
    if (!dadosEnvio.expectativa_preco) {
      alert('Por favor, selecione a expectativa de preço');
      return;
    }
    
    onSubmit(dadosEnvio);
  };

  const minDate = new Date().toISOString().split('T')[0];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <Card className="max-w-3xl w-full my-8" shadow="xl">
        <Card.Header>
          <Card.Title>Criar Evento de Equipa</Card.Title>
          <Card.Description>
            Preencha os detalhes do seu evento e receba 3 propostas personalizadas
          </Card.Description>
        </Card.Header>
        <Card.Content>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Data */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Data de Início"
                type="date"
                required
                value={formData.data_inicio}
                onChange={(e) => setFormData({ ...formData, data_inicio: e.target.value })}
                min={minDate}
              />
              <Input
                label="Data de Fim (opcional)"
                type="date"
                value={formData.data_fim}
                onChange={(e) => setFormData({ ...formData, data_fim: e.target.value })}
                min={formData.data_inicio || minDate}
                helperText="Deixe em branco para evento de 1 dia"
              />
            </div>

            {/* Duração e Pessoas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-2">
                  <Clock className="inline h-4 w-4 mr-1" />
                  Duração das Atividades
                </label>
                <select
                  required
                  value={formData.duracao_atividades}
                  onChange={(e) => setFormData({ ...formData, duracao_atividades: e.target.value })}
                  className="w-full px-4 py-2 border border-grey-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary"
                >
                  <option value="">Selecione...</option>
                  <option value="manha">Manhã (até 13h)</option>
                  <option value="tarde">Tarde (após 13h)</option>
                  <option value="dia_todo">Dia Todo</option>
                </select>
              </div>
              <Input
                label="Número de Pessoas"
                type="number"
                required
                min="1"
                value={formData.n_pessoas}
                onChange={(e) => setFormData({ ...formData, n_pessoas: e.target.value })}
              />
            </div>

            {/* Localização */}
            <Input
              label="Localização Preferida"
              type="text"
              required
              value={formData.localizacao}
              onChange={(e) => setFormData({ ...formData, localizacao: e.target.value })}
              placeholder="ex: Lisboa, Porto, Sintra..."
            />

            {/* Tipos de Atividades */}
            <div>
              <label className="block text-sm font-medium text-navy-700 mb-3">
                Tipos de Atividades (selecione um ou mais)
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {tiposDisponiveis.map((tipo) => (
                  <button
                    key={tipo.id}
                    type="button"
                    onClick={() => handleTipoChange(tipo.id)}
                    className={`p-3 rounded-xl border-2 transition-all text-left ${
                      formData.tipos_atividades.includes(tipo.id)
                        ? 'border-primary bg-primary-50 text-primary-700'
                        : 'border-grey-300 hover:border-primary-300'
                    }`}
                  >
                    <span className="font-medium">{tipo.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Expectativa de Preço */}
            <div>
              <label className="block text-sm font-medium text-navy-700 mb-3">
                Expectativa de Preço
              </label>
              <div className="grid grid-cols-3 gap-3">
                {['€', '€€', '€€€'].map((nivel) => (
                  <button
                    key={nivel}
                    type="button"
                    onClick={() => setFormData({ ...formData, expectativa_preco: nivel })}
                    className={`p-4 rounded-xl border-2 transition-all text-center ${
                      formData.expectativa_preco === nivel
                        ? 'border-primary bg-primary-50 text-primary-700'
                        : 'border-grey-300 hover:border-primary-300'
                    }`}
                  >
                    <span className="text-2xl font-bold">{nivel}</span>
                    <p className="text-xs mt-1">
                      {nivel === '€' && 'Económico'}
                      {nivel === '€€' && 'Médio'}
                      {nivel === '€€€' && 'Premium'}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Almoço e Transporte */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border border-grey-300 rounded-xl">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.almoco}
                    onChange={(e) => setFormData({ ...formData, almoco: e.target.checked })}
                    className="w-5 h-5 text-primary rounded focus:ring-primary"
                  />
                  <div className="flex items-center gap-2">
                    <UtensilsCrossed className="h-5 w-5 text-navy-600" />
                    <span className="font-medium text-navy-900">Incluir Almoço</span>
                  </div>
                </label>
              </div>
              <div className="p-4 border border-grey-300 rounded-xl">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.transporte}
                    onChange={(e) => setFormData({ ...formData, transporte: e.target.checked })}
                    className="w-5 h-5 text-primary rounded focus:ring-primary"
                  />
                  <div className="flex items-center gap-2">
                    <Car className="h-5 w-5 text-navy-600" />
                    <span className="font-medium text-navy-900">Incluir Transporte</span>
                  </div>
                </label>
              </div>
            </div>

            {/* Observações */}
            <Input.Textarea
              label="Observações Adicionais (opcional)"
              rows="3"
              value={formData.observacoes}
              onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
              placeholder="Ex: Equipa jovem, preferência por atividades ao ar livre..."
            />

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
                  disabled={!formData.data_inicio || !formData.duracao_atividades || !formData.n_pessoas || !formData.localizacao || formData.tipos_atividades.length === 0 || !formData.expectativa_preco}
                >
                  Gerar Propostas
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </Card.Footer>
          </form>
        </Card.Content>
      </Card>
    </div>
  );
}

export default CriarEventoForm;
