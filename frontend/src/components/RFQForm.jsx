import { useState } from 'react';
import Card from './ui/Card';
import Button from './ui/Button';
import Input from './ui/Input';

function RFQForm({ onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    n_pessoas: 10,
    data_preferida: '',
    data_alternativa: '',
    localizacao: '',
    raio_km: 50,
    orcamento_max: '',
    objetivo: '',
    preferencias: '',
    categoria_preferida: '',
    clima_preferido: '',
    duracao_max_minutos: ''
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const rfqData = {
        n_pessoas: parseInt(formData.n_pessoas),
        data_preferida: formData.data_preferida,
        data_alternativa: formData.data_alternativa || null,
        localizacao: formData.localizacao,
        raio_km: parseInt(formData.raio_km),
        orcamento_max: parseFloat(formData.orcamento_max),
        objetivo: formData.objetivo || null,
        preferencias: formData.preferencias || null,
        categoria_preferida: formData.categoria_preferida || null,
        clima_preferido: formData.clima_preferido || null,
        duracao_max_minutos: formData.duracao_max_minutos ? parseInt(formData.duracao_max_minutos) : null
      };
      
      await onSubmit(rfqData);
    } finally {
      setLoading(false);
    }
  };

  const minDate = new Date().toISOString().split('T')[0];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <Card className="max-w-3xl w-full my-8" shadow="xl">
        <Card.Header>
          <Card.Title>Criar Pedido de Proposta (RFQ)</Card.Title>
          <Card.Description>
            Preencha o brief do seu evento. Os fornecedores receberão este pedido e enviarão propostas personalizadas.
          </Card.Description>
        </Card.Header>
        <Card.Content>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Informações Básicas */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-navy-900 border-b border-grey pb-2">
                Informações Básicas
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Número de Pessoas *"
                  type="number"
                  required
                  min="1"
                  value={formData.n_pessoas}
                  onChange={(e) => setFormData({ ...formData, n_pessoas: e.target.value })}
                />
                
                <Input
                  label="Orçamento Máximo (€) *"
                  type="number"
                  required
                  step="0.01"
                  min="0"
                  value={formData.orcamento_max}
                  onChange={(e) => setFormData({ ...formData, orcamento_max: e.target.value })}
                  placeholder="ex: 1000.00"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Data Preferida *"
                  type="date"
                  required
                  min={minDate}
                  value={formData.data_preferida}
                  onChange={(e) => setFormData({ ...formData, data_preferida: e.target.value })}
                />
                
                <Input
                  label="Data Alternativa (opcional)"
                  type="date"
                  min={formData.data_preferida || minDate}
                  value={formData.data_alternativa}
                  onChange={(e) => setFormData({ ...formData, data_alternativa: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Localização *"
                  type="text"
                  required
                  value={formData.localizacao}
                  onChange={(e) => setFormData({ ...formData, localizacao: e.target.value })}
                  placeholder="ex: Lisboa"
                />
                
                <Input
                  label="Raio de Busca (km)"
                  type="number"
                  min="1"
                  max="500"
                  value={formData.raio_km}
                  onChange={(e) => setFormData({ ...formData, raio_km: e.target.value })}
                  helperText="Distância máxima da localização"
                />
              </div>
            </div>

            {/* Objetivo e Preferências */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-navy-900 border-b border-grey pb-2">
                Objetivo e Preferências
              </h3>
              
              <Input.Select
                label="Objetivo do Evento"
                value={formData.objetivo}
                onChange={(e) => setFormData({ ...formData, objetivo: e.target.value })}
              >
                <option value="">Selecione um objetivo</option>
                <option value="bonding">Bonding / Team Building</option>
                <option value="onboarding">Onboarding</option>
                <option value="celebração">Celebração</option>
                <option value="formação">Formação / Desenvolvimento</option>
                <option value="networking">Networking</option>
                <option value="retiro">Retiro / Offsite</option>
                <option value="outro">Outro</option>
              </Input.Select>

              <Input.Textarea
                label="Preferências e Restrições"
                value={formData.preferencias}
                onChange={(e) => setFormData({ ...formData, preferencias: e.target.value })}
                rows="4"
                placeholder="Ex: Preferimos atividades ao ar livre, sem necessidade de transporte próprio, acessíveis para pessoas com mobilidade reduzida..."
              />
            </div>

            {/* Filtros Opcionais */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-navy-900 border-b border-grey pb-2">
                Filtros Opcionais
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input.Select
                  label="Categoria Preferida"
                  value={formData.categoria_preferida}
                  onChange={(e) => setFormData({ ...formData, categoria_preferida: e.target.value })}
                >
                  <option value="">Todas</option>
                  <option value="aventura">Aventura</option>
                  <option value="relax">Relax</option>
                  <option value="team_building">Team Building</option>
                  <option value="esporte">Desporto</option>
                  <option value="cultural">Cultural</option>
                  <option value="gastronomia">Gastronomia</option>
                </Input.Select>

                <Input.Select
                  label="Clima Preferido"
                  value={formData.clima_preferido}
                  onChange={(e) => setFormData({ ...formData, clima_preferido: e.target.value })}
                >
                  <option value="">Todos</option>
                  <option value="indoor">Indoor</option>
                  <option value="outdoor">Outdoor</option>
                  <option value="ambos">Ambos</option>
                </Input.Select>

                <Input
                  label="Duração Máx (minutos)"
                  type="number"
                  min="1"
                  value={formData.duracao_max_minutos}
                  onChange={(e) => setFormData({ ...formData, duracao_max_minutos: e.target.value })}
                  placeholder="ex: 180"
                />
              </div>
            </div>
            
            <Card.Footer className="pt-4 pb-0 px-0">
              <div className="flex justify-end gap-3 w-full">
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
                  Enviar RFQ
                </Button>
              </div>
            </Card.Footer>
          </form>
        </Card.Content>
      </Card>
    </div>
  );
}

export default RFQForm;
