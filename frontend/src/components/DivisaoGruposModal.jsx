import { useState } from 'react';
import Card from './ui/Card';
import Button from './ui/Button';
import Input from './ui/Input';
import { Users, Plus, Trash2, X } from 'lucide-react';

function DivisaoGruposModal({ nPessoasTotal, proposta, onClose, onSave }) {
  const [grupos, setGrupos] = useState([
    { id: 1, nome: 'Grupo A', n_pessoas: nPessoasTotal, atividades: [] }
  ]);
  const [proximoId, setProximoId] = useState(2);
  const [salvando, setSalvando] = useState(false);

  const totalPessoas = grupos.reduce((sum, g) => sum + g.n_pessoas, 0);

  const handleAdicionarGrupo = () => {
    setGrupos([...grupos, { id: proximoId, nome: `Grupo ${String.fromCharCode(64 + proximoId)}`, n_pessoas: 0, atividades: [] }]);
    setProximoId(proximoId + 1);
  };

  const handleRemoverGrupo = (id) => {
    if (grupos.length <= 1) return;
    setGrupos(grupos.filter(g => g.id !== id));
  };

  const handleAtualizarGrupo = (id, campo, valor) => {
    setGrupos(grupos.map(g => 
      g.id === id ? { ...g, [campo]: valor } : g
    ));
  };

  const handleAtribuirAtividade = (grupoId, itemAgenda) => {
    setGrupos(grupos.map(g => {
      if (g.id === grupoId) {
        const atividades = [...g.atividades];
        if (!atividades.find(a => a.id === itemAgenda.id)) {
          atividades.push({ ...itemAgenda, grupo_id: grupoId });
        }
        return { ...g, atividades };
      }
      return g;
    }));
  };

  const handleRemoverAtividadeGrupo = (grupoId, atividadeId) => {
    setGrupos(grupos.map(g => 
      g.id === grupoId 
        ? { ...g, atividades: g.atividades.filter(a => a.id !== atividadeId) }
        : g
    ));
  };

  const handleSalvar = async () => {
    if (totalPessoas !== nPessoasTotal) {
      alert(`O total de pessoas (${totalPessoas}) deve ser igual a ${nPessoasTotal}`);
      return;
    }

    setSalvando(true);
    try {
      await onSave({ grupos, proposta_original: proposta });
      onClose();
    } catch (error) {
      console.error('Erro ao salvar divisão:', error);
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <Card className="max-w-5xl w-full my-8 max-h-[90vh] overflow-y-auto" shadow="xl">
        <Card.Header>
          <div className="flex justify-between items-start">
            <div>
              <Card.Title>Dividir Equipa em Grupos</Card.Title>
              <Card.Description>
                Organize a equipa em grupos diferentes para atividades paralelas
              </Card.Description>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </Card.Header>

        <Card.Content>
          <div className="space-y-6">
            {/* Resumo */}
            <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-navy-700">Total de Pessoas:</span>
                <span className={`text-xl font-bold ${totalPessoas === nPessoasTotal ? 'text-success-600' : 'text-error-600'}`}>
                  {totalPessoas} / {nPessoasTotal}
                </span>
              </div>
              {totalPessoas !== nPessoasTotal && (
                <p className="text-xs text-error-600 mt-2">
                  ⚠️ O total deve ser igual a {nPessoasTotal} pessoas
                </p>
              )}
            </div>

            {/* Grupos */}
            {grupos.map((grupo) => (
              <Card key={grupo.id} className="border-2">
                <Card.Header>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <Input
                        type="text"
                        value={grupo.nome}
                        onChange={(e) => handleAtualizarGrupo(grupo.id, 'nome', e.target.value)}
                        className="w-auto min-w-[150px] text-sm"
                      />
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-navy-500" />
                        <Input
                          type="number"
                          min="1"
                          value={grupo.n_pessoas}
                          onChange={(e) => handleAtualizarGrupo(grupo.id, 'n_pessoas', parseInt(e.target.value) || 0)}
                          className="w-24 text-sm"
                        />
                        <span className="text-sm text-navy-600">pessoas</span>
                      </div>
                    </div>
                    {grupos.length > 1 && (
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleRemoverGrupo(grupo.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </Card.Header>
                <Card.Content>
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-navy-700 mb-2">Atividades do Grupo</h4>
                    
                    {/* Atividades já atribuídas */}
                    {grupo.atividades.length > 0 && (
                      <div className="space-y-2">
                        {grupo.atividades.map((atividade) => (
                          <div key={atividade.id} className="flex items-center justify-between p-2 bg-white-soft rounded border border-grey">
                            <span className="text-sm text-navy-900">{atividade.nome}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoverAtividadeGrupo(grupo.id, atividade.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Atribuir atividades da agenda */}
                    <div className="border-t border-grey pt-3">
                      <p className="text-xs text-navy-500 mb-2">Atribuir atividades da proposta:</p>
                      <div className="flex flex-wrap gap-2">
                        {proposta.agenda
                          .filter(item => item.tipo === 'atividade')
                          .filter(item => !grupo.atividades.find(a => a.id === item.id))
                          .map((item) => (
                            <Button
                              key={item.id}
                              variant="outline"
                              size="sm"
                              onClick={() => handleAtribuirAtividade(grupo.id, item)}
                            >
                              <Plus className="h-3 w-3 mr-1" />
                              {item.nome}
                            </Button>
                          ))}
                      </div>
                    </div>
                  </div>
                </Card.Content>
              </Card>
            ))}

            {/* Adicionar Grupo */}
            <Button
              variant="outline"
              onClick={handleAdicionarGrupo}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Grupo
            </Button>
          </div>
        </Card.Content>

        <Card.Footer>
          <div className="flex justify-end gap-3 w-full">
            <Button variant="outline" onClick={onClose} disabled={salvando}>
              Cancelar
            </Button>
            <Button
              onClick={handleSalvar}
              loading={salvando}
              disabled={salvando || totalPessoas !== nPessoasTotal}
            >
              Salvar Divisão
            </Button>
          </div>
        </Card.Footer>
      </Card>
    </div>
  );
}

export default DivisaoGruposModal;
