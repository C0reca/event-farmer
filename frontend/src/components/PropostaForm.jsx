import { useState, useEffect } from 'react';
import Card from './ui/Card';
import Button from './ui/Button';
import Input from './ui/Input';
import api from '../services/api';

function PropostaForm({ rfq, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    atividade_id: '',
    preco_total: '',
    preco_por_pessoa: '',
    descricao: '',
    extras: '',
    condicoes: '',
    data_proposta: rfq.data_preferida || '',
    duracao_minutos: ''
  });

  const [atividades, setAtividades] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingAtividades, setLoadingAtividades] = useState(true);

  useEffect(() => {
    loadAtividades();
  }, []);

  const loadAtividades = async () => {
    try {
      const response = await api.get('/atividades/');
      // Filtrar apenas atividades do fornecedor logado
      // Por agora, mostrar todas (será filtrado no backend)
      setAtividades(response.data);
    } catch (error) {
      console.error('Erro ao carregar atividades:', error);
    } finally {
      setLoadingAtividades(false);
    }
  };

  const handleAtividadeChange = (atividadeId) => {
    const atividade = atividades.find(a => a.id === parseInt(atividadeId));
    if (atividade) {
      const precoPorPessoa = atividade.preco_por_pessoa;
      const precoTotal = precoPorPessoa * rfq.n_pessoas;
      
      setFormData({
        ...formData,
        atividade_id: atividadeId,
        preco_por_pessoa: precoPorPessoa.toFixed(2),
        preco_total: precoTotal.toFixed(2),
        duracao_minutos: atividade.duracao_minutos || ''
      });
    }
  };

  const handlePrecoChange = (field, value) => {
    const numValue = parseFloat(value) || 0;
    setFormData({
      ...formData,
      [field]: value,
      ...(field === 'preco_por_pessoa' && {
        preco_total: (numValue * rfq.n_pessoas).toFixed(2)
      }),
      ...(field === 'preco_total' && {
        preco_por_pessoa: (numValue / rfq.n_pessoas).toFixed(2)
      })
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const propostaData = {
        rfq_id: rfq.id,
        atividade_id: formData.atividade_id ? parseInt(formData.atividade_id) : null,
        preco_total: parseFloat(formData.preco_total),
        preco_por_pessoa: parseFloat(formData.preco_por_pessoa),
        descricao: formData.descricao,
        extras: formData.extras || null,
        condicoes: formData.condicoes || null,
        data_proposta: formData.data_proposta,
        duracao_minutos: formData.duracao_minutos ? parseInt(formData.duracao_minutos) : null
      };
      
      await onSubmit(propostaData);
    } finally {
      setLoading(false);
    }
  };

  const minDate = new Date().toISOString().split('T')[0];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <Card className="max-w-3xl w-full my-8" shadow="xl">
        <Card.Header>
          <Card.Title>Enviar Proposta</Card.Title>
          <Card.Description>
            RFQ #{rfq.id} - {rfq.n_pessoas} pessoas, {rfq.localizacao}
          </Card.Description>
        </Card.Header>
        <Card.Content>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Informações do RFQ (read-only) */}
            <div className="bg-white-soft rounded-lg p-4 border border-grey">
              <h3 className="text-sm font-semibold text-navy-700 mb-2">Detalhes do Pedido</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-navy-500">Pessoas:</span> <span className="font-semibold">{rfq.n_pessoas}</span>
                </div>
                <div>
                  <span className="text-navy-500">Orçamento max:</span> <span className="font-semibold">€{rfq.orcamento_max.toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-navy-500">Localização:</span> <span className="font-semibold">{rfq.localizacao}</span>
                </div>
                {rfq.objetivo && (
                  <div>
                    <span className="text-navy-500">Objetivo:</span> <span className="font-semibold capitalize">{rfq.objetivo}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Atividade (opcional) */}
            <div>
              <Input.Select
                label="Atividade (opcional)"
                value={formData.atividade_id}
                onChange={(e) => handleAtividadeChange(e.target.value)}
                disabled={loadingAtividades}
              >
                <option value="">Criar proposta personalizada (sem atividade específica)</option>
                {atividades.map((atividade) => (
                  <option key={atividade.id} value={atividade.id}>
                    {atividade.nome} - €{atividade.preco_por_pessoa.toFixed(2)}/pessoa
                  </option>
                ))}
              </Input.Select>
              {loadingAtividades && (
                <p className="text-xs text-navy-500 mt-1">A carregar atividades...</p>
              )}
            </div>

            {/* Preços */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Preço por Pessoa (€) *"
                type="number"
                required
                step="0.01"
                min="0"
                value={formData.preco_por_pessoa}
                onChange={(e) => handlePrecoChange('preco_por_pessoa', e.target.value)}
              />
              
              <Input
                label="Preço Total (€) *"
                type="number"
                required
                step="0.01"
                min="0"
                value={formData.preco_total}
                onChange={(e) => handlePrecoChange('preco_total', e.target.value)}
                helperText={`Para ${rfq.n_pessoas} pessoas`}
              />
            </div>

            {/* Data e Duração */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Data Proposta *"
                type="date"
                required
                min={minDate}
                value={formData.data_proposta}
                onChange={(e) => setFormData({ ...formData, data_proposta: e.target.value })}
              />
              
              <Input
                label="Duração (minutos)"
                type="number"
                min="1"
                value={formData.duracao_minutos}
                onChange={(e) => setFormData({ ...formData, duracao_minutos: e.target.value })}
                placeholder="ex: 180"
              />
            </div>

            {/* Descrição */}
            <Input.Textarea
              label="O que está incluído *"
              required
              rows="4"
              value={formData.descricao}
              onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              placeholder="Descreva o que está incluído na proposta: equipamento, guias, materiais, etc."
            />

            {/* Extras */}
            <Input.Textarea
              label="Extras Disponíveis (opcional)"
              rows="3"
              value={formData.extras}
              onChange={(e) => setFormData({ ...formData, extras: e.target.value })}
              placeholder="Ex: Transporte, almoço, seguro adicional..."
            />

            {/* Condições */}
            <Input.Textarea
              label="Condições Especiais (opcional)"
              rows="3"
              value={formData.condicoes}
              onChange={(e) => setFormData({ ...formData, condicoes: e.target.value })}
              placeholder="Ex: Cancelamento até 7 dias antes, pagamento 50% no ato..."
            />

            {/* Resumo */}
            <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
              <div className="flex items-baseline justify-between mb-2">
                <span className="text-sm font-medium text-navy-700">Preço Total:</span>
                <span className="text-2xl font-bold text-primary-600">
                  €{formData.preco_total || '0.00'}
                </span>
              </div>
              <p className="text-xs text-navy-500">
                €{formData.preco_por_pessoa || '0.00'} por pessoa × {rfq.n_pessoas} pessoas
              </p>
              {parseFloat(formData.preco_total) > rfq.orcamento_max && (
                <p className="text-xs text-error-600 mt-2">
                  ⚠️ Preço acima do orçamento máximo (€{rfq.orcamento_max.toFixed(2)})
                </p>
              )}
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
                  Enviar Proposta
                </Button>
              </div>
            </Card.Footer>
          </form>
        </Card.Content>
      </Card>
    </div>
  );
}

export default PropostaForm;
