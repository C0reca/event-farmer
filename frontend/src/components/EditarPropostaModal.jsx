import { useState, useEffect } from 'react';
import Card from './ui/Card';
import Button from './ui/Button';
import Input from './ui/Input';
import { X, Plus, Trash2, Clock, MapPin } from 'lucide-react';
import api from '../services/api';

function EditarPropostaModal({ proposta, onClose, onSave, atividadesDisponiveis = [] }) {
  const [agendaEditada, setAgendaEditada] = useState([...proposta.agenda]);
  const [salvando, setSalvando] = useState(false);
  const [mostrarAdicionarAtividade, setMostrarAdicionarAtividade] = useState(false);
  const [novaAtividade, setNovaAtividade] = useState({
    atividade_id: '',
    horario_inicio: '',
    horario_fim: ''
  });

  const handleRemoverItem = (index) => {
    setAgendaEditada(agendaEditada.filter((_, i) => i !== index));
  };

  const handleEditarItem = (index, campo, valor) => {
    const novaAgenda = [...agendaEditada];
    novaAgenda[index] = { ...novaAgenda[index], [campo]: valor };
    setAgendaEditada(novaAgenda);
  };

  const handleAdicionarAtividade = () => {
    if (!novaAtividade.atividade_id || !novaAtividade.horario_inicio || !novaAtividade.horario_fim) {
      return;
    }

    const atividade = atividadesDisponiveis.find(a => a.id === parseInt(novaAtividade.atividade_id));
    if (!atividade) return;

    const preco = atividade.preco_por_pessoa * proposta.preco_total / proposta.preco_por_pessoa; // Aproximação

    const novoItem = {
      tipo: 'atividade',
      nome: atividade.nome,
      fornecedor: atividade.fornecedor?.nome || 'Fornecedor',
      local: atividade.localizacao,
      horario: `${novaAtividade.horario_inicio} - ${novaAtividade.horario_fim}`,
      duracao_minutos: atividade.duracao_minutos || 120,
      preco: preco,
      descricao: atividade.descricao,
      atividade_id: atividade.id
    };

    setAgendaEditada([...agendaEditada, novoItem]);
    setMostrarAdicionarAtividade(false);
    setNovaAtividade({ atividade_id: '', horario_inicio: '', horario_fim: '' });
  };

  const handleAdicionarAlmoco = () => {
    const novoAlmoco = {
      tipo: 'almoco',
      nome: 'Almoço em Restaurante Local',
      fornecedor: 'Restaurante Parceiro',
      local: proposta.agenda[0]?.local || 'A definir',
      horario: '13:00 - 14:30',
      duracao_minutos: 90,
      preco: 25.0 * (proposta.preco_total / proposta.preco_por_pessoa), // Aproximação
      descricao: 'Menu completo'
    };
    setAgendaEditada([...agendaEditada, novoAlmoco]);
  };

  const handleAdicionarTransporte = () => {
    const novoTransporte = {
      tipo: 'transporte',
      nome: 'Transporte de/para Local',
      fornecedor: 'Transporte Parceiro',
      local: proposta.agenda[0]?.local || 'A definir',
      horario: '08:00 - 19:00',
      preco: 15.0 * (proposta.preco_total / proposta.preco_por_pessoa), // Aproximação
      descricao: 'Transporte em autocarro confortável'
    };
    setAgendaEditada([...agendaEditada, novoTransporte]);
  };

  const calcularPrecoTotal = () => {
    return agendaEditada.reduce((total, item) => total + item.preco, 0);
  };

  const handleSalvar = async () => {
    setSalvando(true);
    try {
      const propostaAtualizada = {
        ...proposta,
        agenda: agendaEditada,
        preco_total: calcularPrecoTotal(),
        preco_por_pessoa: calcularPrecoTotal() / (proposta.preco_total / proposta.preco_por_pessoa)
      };
      
      await onSave(propostaAtualizada);
      onClose();
    } catch (error) {
      console.error('Erro ao salvar:', error);
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <Card className="max-w-4xl w-full my-8 max-h-[90vh] overflow-y-auto" shadow="xl">
        <Card.Header>
          <div className="flex justify-between items-start">
            <div>
              <Card.Title>Editar Proposta {proposta.id}</Card.Title>
              <Card.Description>
                Modifique atividades, horários, almoço e transporte conforme necessário
              </Card.Description>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </Card.Header>
        
        <Card.Content>
          <div className="space-y-4">
            {/* Agenda Editável */}
            {agendaEditada.map((item, index) => (
              <div key={index} className="border border-grey-300 rounded-lg p-4 bg-white-soft">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-1 bg-primary-100 text-primary-700 rounded text-xs font-semibold uppercase">
                        {item.tipo}
                      </span>
                      {item.tipo === 'atividade' && (
                        <Input
                          type="text"
                          value={item.nome}
                          onChange={(e) => handleEditarItem(index, 'nome', e.target.value)}
                          className="flex-1 text-sm"
                        />
                      )}
                      {item.tipo !== 'atividade' && (
                        <span className="font-semibold text-navy-900">{item.nome}</span>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div>
                        <label className="block text-xs text-navy-500 mb-1">Horário</label>
                        <div className="flex gap-2">
                          <Input
                            type="time"
                            value={item.horario?.split(' - ')[0] || ''}
                            onChange={(e) => {
                              const fim = item.horario?.split(' - ')[1] || '';
                              handleEditarItem(index, 'horario', `${e.target.value} - ${fim}`);
                            }}
                            className="flex-1 text-sm"
                          />
                          <Input
                            type="time"
                            value={item.horario?.split(' - ')[1] || ''}
                            onChange={(e) => {
                              const inicio = item.horario?.split(' - ')[0] || '';
                              handleEditarItem(index, 'horario', `${inicio} - ${e.target.value}`);
                            }}
                            className="flex-1 text-sm"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-xs text-navy-500 mb-1">Local</label>
                        <Input
                          type="text"
                          value={item.local || ''}
                          onChange={(e) => handleEditarItem(index, 'local', e.target.value)}
                          className="text-sm"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-xs text-navy-500 mb-1">Preço (€)</label>
                        <Input
                          type="number"
                          step="0.01"
                          value={item.preco || 0}
                          onChange={(e) => handleEditarItem(index, 'preco', parseFloat(e.target.value) || 0)}
                          className="text-sm"
                        />
                      </div>
                      
                      {item.duracao_minutos && (
                        <div>
                          <label className="block text-xs text-navy-500 mb-1">Duração (min)</label>
                          <Input
                            type="number"
                            value={item.duracao_minutos}
                            onChange={(e) => handleEditarItem(index, 'duracao_minutos', parseInt(e.target.value) || 0)}
                            className="text-sm"
                          />
                        </div>
                      )}
                    </div>
                    
                    {item.descricao && (
                      <div className="mt-3">
                        <label className="block text-xs text-navy-500 mb-1">Descrição</label>
                        <Input.Textarea
                          rows="2"
                          value={item.descricao}
                          onChange={(e) => handleEditarItem(index, 'descricao', e.target.value)}
                          className="text-sm"
                        />
                      </div>
                    )}
                  </div>
                  
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleRemoverItem(index)}
                    className="ml-4"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}

            {/* Botões para Adicionar */}
            <div className="flex flex-wrap gap-2 pt-4 border-t border-grey">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setMostrarAdicionarAtividade(!mostrarAdicionarAtividade)}
              >
                <Plus className="h-4 w-4 mr-1" />
                Adicionar Atividade
              </Button>
              {!agendaEditada.some(a => a.tipo === 'almoco') && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAdicionarAlmoco}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Adicionar Almoço
                </Button>
              )}
              {!agendaEditada.some(a => a.tipo === 'transporte') && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAdicionarTransporte}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Adicionar Transporte
                </Button>
              )}
            </div>

            {/* Formulário para Adicionar Atividade */}
            {mostrarAdicionarAtividade && (
              <Card className="bg-primary-50 border-primary-200">
                <Card.Content className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <Input.Select
                      label="Atividade"
                      value={novaAtividade.atividade_id}
                      onChange={(e) => setNovaAtividade({ ...novaAtividade, atividade_id: e.target.value })}
                      className="text-sm"
                    >
                      <option value="">Selecione...</option>
                      {atividadesDisponiveis.map((atividade) => (
                        <option key={atividade.id} value={atividade.id}>
                          {atividade.nome} - €{atividade.preco_por_pessoa?.toFixed(2)}/pessoa
                        </option>
                      ))}
                    </Input.Select>
                    <Input
                      label="Horário Início"
                      type="time"
                      value={novaAtividade.horario_inicio}
                      onChange={(e) => setNovaAtividade({ ...novaAtividade, horario_inicio: e.target.value })}
                      className="text-sm"
                    />
                    <Input
                      label="Horário Fim"
                      type="time"
                      value={novaAtividade.horario_fim}
                      onChange={(e) => setNovaAtividade({ ...novaAtividade, horario_fim: e.target.value })}
                      className="text-sm"
                    />
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Button
                      size="sm"
                      onClick={handleAdicionarAtividade}
                      disabled={!novaAtividade.atividade_id || !novaAtividade.horario_inicio || !novaAtividade.horario_fim}
                    >
                      Adicionar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setMostrarAdicionarAtividade(false);
                        setNovaAtividade({ atividade_id: '', horario_inicio: '', horario_fim: '' });
                      }}
                    >
                      Cancelar
                    </Button>
                  </div>
                </Card.Content>
              </Card>
            )}

            {/* Resumo do Preço */}
            <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 mt-4">
              <div className="flex items-baseline justify-between">
                <span className="text-sm font-medium text-navy-700">Novo Preço Total:</span>
                <span className="text-2xl font-bold text-primary-600">
                  €{calcularPrecoTotal().toFixed(2)}
                </span>
              </div>
              <p className="text-xs text-navy-500 mt-1">
                Preço anterior: €{proposta.preco_total.toFixed(2)}
              </p>
            </div>
          </div>
        </Card.Content>

        <Card.Footer>
          <div className="flex justify-end gap-3 w-full">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={salvando}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSalvar}
              loading={salvando}
              disabled={salvando}
            >
              Salvar Alterações
            </Button>
          </div>
        </Card.Footer>
      </Card>
    </div>
  );
}

export default EditarPropostaModal;
