import { useState } from 'react';
import AppLayout from '../components/layout/AppLayout';
import Card from '../components/ui/Card';
import Loader from '../components/ui/Loader';
import Button from '../components/ui/Button';

/**
 * Página de teste para o componente Loader
 * Demonstra os diferentes tamanhos e variações
 */
function LoaderTest() {
  const [showLoader, setShowLoader] = useState(true);

  return (
    <AppLayout
      title="Teste do Loader TeamSync"
      description="Demonstração do componente Loader com diferentes tamanhos"
    >
      <div className="space-y-8">
        {/* Informações */}
        <Card>
          <Card.Header>
            <Card.Title>TeamSync Loader</Card.Title>
            <Card.Description>
              Loader animado com barras sincronizadas que representam o conceito de "sync".
              Usa as cores do design system TeamSync (azul primary + coral accent).
            </Card.Description>
          </Card.Header>
        </Card>

        {/* Tamanhos */}
        <Card>
          <Card.Header>
            <Card.Title>Tamanhos Disponíveis</Card.Title>
          </Card.Header>
          <Card.Content>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-8">
              {/* Small */}
              <div className="text-center space-y-4">
                <div className="flex justify-center">
                  <Loader size="sm" />
                </div>
                <div>
                  <h3 className="font-semibold text-navy-900 mb-1">Small (sm)</h3>
                  <p className="text-sm text-navy-600">64px × 38px</p>
                </div>
              </div>

              {/* Medium */}
              <div className="text-center space-y-4">
                <div className="flex justify-center">
                  <Loader size="md" />
                </div>
                <div>
                  <h3 className="font-semibold text-navy-900 mb-1">Medium (md)</h3>
                  <p className="text-sm text-navy-600">96px × 56px (padrão)</p>
                </div>
              </div>

              {/* Large */}
              <div className="text-center space-y-4">
                <div className="flex justify-center">
                  <Loader size="lg" />
                </div>
                <div>
                  <h3 className="font-semibold text-navy-900 mb-1">Large (lg)</h3>
                  <p className="text-sm text-navy-600">128px × 74px</p>
                </div>
              </div>
            </div>
          </Card.Content>
        </Card>

        {/* Exemplos de Uso */}
        <Card>
          <Card.Header>
            <Card.Title>Exemplos de Uso</Card.Title>
          </Card.Header>
          <Card.Content>
            <div className="space-y-6">
              {/* Loading State Simples */}
              <div className="p-6 bg-white-soft rounded-xl border border-grey">
                <h4 className="font-semibold text-navy-900 mb-4">Loading State Simples</h4>
                <div className="text-center py-8">
                  {showLoader ? (
                    <>
                      <Loader size="md" />
                      <p className="mt-4 text-navy-600">A carregar dados...</p>
                    </>
                  ) : (
                    <p className="text-navy-600">Conteúdo carregado!</p>
                  )}
                </div>
                <div className="flex justify-center mt-4">
                  <Button
                    onClick={() => setShowLoader(!showLoader)}
                    variant="outline"
                    size="sm"
                  >
                    {showLoader ? 'Simular Carregamento Completo' : 'Mostrar Loader Novamente'}
                  </Button>
                </div>
              </div>

              {/* Em Card */}
              <div className="p-6 bg-white-soft rounded-xl border border-grey">
                <h4 className="font-semibold text-navy-900 mb-4">Dentro de um Card</h4>
                <Card className="bg-white">
                  <Card.Content>
                    <div className="text-center py-8">
                      <Loader size="lg" />
                      <p className="mt-4 text-navy-600">Processando...</p>
                    </div>
                  </Card.Content>
                </Card>
              </div>

              {/* Inline */}
              <div className="p-6 bg-white-soft rounded-xl border border-grey">
                <h4 className="font-semibold text-navy-900 mb-4">Inline com Texto</h4>
                <div className="flex items-center gap-4">
                  <Loader size="sm" />
                  <span className="text-navy-700">Aguardando confirmação...</span>
                </div>
              </div>
            </div>
          </Card.Content>
        </Card>

        {/* Características */}
        <Card>
          <Card.Header>
            <Card.Title>Características</Card.Title>
          </Card.Header>
          <Card.Content>
            <ul className="space-y-2 text-navy-700">
              <li className="flex items-start">
                <span className="text-primary-500 mr-2">✓</span>
                <span>Animação suave com barras sincronizadas</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary-500 mr-2">✓</span>
                <span>Cores do design system TeamSync (azul + coral)</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary-500 mr-2">✓</span>
                <span>Respeita preferências de movimento reduzido (prefers-reduced-motion)</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary-500 mr-2">✓</span>
                <span>Acessível com aria-label e role="status"</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary-500 mr-2">✓</span>
                <span>Três tamanhos disponíveis: sm, md, lg</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary-500 mr-2">✓</span>
                <span>Gradientes animados que representam "sync"</span>
              </li>
            </ul>
          </Card.Content>
        </Card>
      </div>
    </AppLayout>
  );
}

export default LoaderTest;
