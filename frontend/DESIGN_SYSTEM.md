# Design System - TeamEvents

## Visão Geral

Este documento descreve o design system implementado para a aplicação TeamEvents, garantindo consistência visual e uma experiência de usuário moderna e profissional.

## Cores

### Paleta Principal

- **Primary (Azul)**: Cor principal da aplicação
  - `primary-600`: Cor principal (#2563eb)
  - `primary-700`: Hover states (#1d4ed8)
  - `primary-500`: Focus rings (#3b82f6)

- **Secondary (Cinza)**: Cores neutras para textos e backgrounds
  - `secondary-50`: Background principal (#f8fafc)
  - `secondary-900`: Texto principal (#0f172a)
  - `secondary-600`: Texto secundário (#475569)

- **Success (Verde)**: Estados de sucesso
  - `success-600`: #16a34a

- **Danger (Vermelho)**: Ações destrutivas e erros
  - `danger-600`: #dc2626

- **Warning (Amarelo)**: Avisos e ratings
  - `warning-500`: #f59e0b

## Tipografia

- **Fonte**: Inter (Google Fonts)
- **Tamanhos**:
  - `text-xs`: 0.75rem (12px)
  - `text-sm`: 0.875rem (14px)
  - `text-base`: 1rem (16px)
  - `text-lg`: 1.125rem (18px)
  - `text-xl`: 1.25rem (20px)
  - `text-2xl`: 1.5rem (24px)
  - `text-3xl`: 1.875rem (30px)
  - `text-4xl`: 2.25rem (36px)

## Componentes Base

### Button (`/src/components/ui/Button.jsx`)

Botão reutilizável com múltiplas variantes e tamanhos.

**Variantes:**
- `primary`: Botão principal (padrão)
- `secondary`: Botão secundário
- `danger`: Ações destrutivas
- `outline`: Botão com borda
- `ghost`: Estilo minimalista

**Tamanhos:**
- `sm`: Pequeno
- `md`: Médio (padrão)
- `lg`: Grande

**Props:**
- `variant`: Variante do botão
- `size`: Tamanho do botão
- `loading`: Estado de carregamento
- `disabled`: Estado desabilitado
- `as`: Renderizar como outro elemento (ex: Link)

**Exemplo:**
```jsx
<Button variant="primary" size="md" loading={false}>
  Clique aqui
</Button>
```

### Card (`/src/components/ui/Card.jsx`)

Container para conteúdo agrupado.

**Sub-componentes:**
- `Card.Header`: Cabeçalho do card
- `Card.Title`: Título do card
- `Card.Description`: Descrição do card
- `Card.Content`: Conteúdo principal
- `Card.Footer`: Rodapé do card

**Props:**
- `padding`: `none`, `sm`, `md` (padrão), `lg`
- `shadow`: `none`, `sm`, `md` (padrão), `lg`, `xl`
- `hover`: Efeito hover (true/false)

**Exemplo:**
```jsx
<Card hover={true}>
  <Card.Header>
    <Card.Title>Título</Card.Title>
    <Card.Description>Descrição</Card.Description>
  </Card.Header>
  <Card.Content>
    Conteúdo aqui
  </Card.Content>
</Card>
```

### Input (`/src/components/ui/Input.jsx`)

Componente de input com label, erro e helper text.

**Sub-componentes:**
- `Input.Select`: Select dropdown
- `Input.Textarea`: Textarea

**Props:**
- `label`: Label do input
- `error`: Mensagem de erro
- `helperText`: Texto de ajuda
- `required`: Campo obrigatório

**Exemplo:**
```jsx
<Input
  label="Email"
  type="email"
  required
  error={errors.email}
  helperText="Digite seu email"
/>
```

### AppLayout (`/src/components/layout/AppLayout.jsx`)

Layout base para todas as páginas.

**Props:**
- `title`: Título da página
- `description`: Descrição da página
- `maxWidth`: Largura máxima (`sm`, `md`, `lg`, `xl`, `2xl`, `3xl`, `4xl`, `5xl`, `6xl`, `7xl`, `full`)
- `showHeader`: Mostrar cabeçalho (true/false)

**Exemplo:**
```jsx
<AppLayout
  title="Dashboard"
  description="Gerencie suas atividades"
  maxWidth="7xl"
>
  Conteúdo da página
</AppLayout>
```

## Espaçamentos

Espaçamentos consistentes usando o sistema de grid do Tailwind:
- `container-padding`: Padding horizontal responsivo
- `section-spacing`: Espaçamento vertical entre seções

## Bordas

- `rounded-sm`: 0.125rem (2px)
- `rounded`: 0.375rem (6px) - padrão
- `rounded-md`: 0.5rem (8px)
- `rounded-lg`: 0.75rem (12px)
- `rounded-xl`: 1rem (16px)
- `rounded-2xl`: 1.5rem (24px)
- `rounded-full`: 9999px

## Sombras

- `shadow-sm`: Sombra pequena
- `shadow-md`: Sombra média (padrão)
- `shadow-lg`: Sombra grande
- `shadow-xl`: Sombra extra grande

## Responsividade

O design system é totalmente responsivo usando breakpoints do Tailwind:
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px

## Uso

Todos os componentes estão localizados em:
- `/src/components/ui/` - Componentes base
- `/src/components/layout/` - Componentes de layout

Para usar os componentes, importe-os normalmente:

```jsx
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import AppLayout from '../components/layout/AppLayout';
```

## Melhorias Implementadas

1. ✅ Design system completo com cores, tipografia e espaçamentos
2. ✅ Componentes base reutilizáveis (Button, Card, Input)
3. ✅ Layout base (AppLayout) para consistência
4. ✅ Dashboard refatorado como exemplo
5. ✅ Navbar atualizado com design system
6. ✅ ActivityCard e ReservationForm melhorados
7. ✅ Responsividade garantida
8. ✅ Acessibilidade (ARIA labels, focus states)

## Próximos Passos

Para aplicar o design system em outras páginas:

1. Importar `AppLayout` e envolver o conteúdo
2. Substituir botões por `<Button>`
3. Substituir containers por `<Card>`
4. Substituir inputs por `<Input>`
5. Usar classes do design system (cores, espaçamentos)
