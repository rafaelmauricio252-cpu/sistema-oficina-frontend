# CustomSnackbar - Componente de Feedback Global

Componente de Snackbar reutilizável para exibir mensagens de feedback ao usuário.

## Características

- Posicionamento: bottom-center
- Auto-hide após 6 segundos
- Suporte para 4 tipos de severidade: success, error, warning, info
- Design consistente com Material-UI
- Fácil integração via hook

## Como Usar

### 1. Envolver a aplicação com o SnackbarProvider

No arquivo principal (App.tsx ou index.tsx):

```tsx
import { SnackbarProvider } from './components/Snackbar';

function App() {
  return (
    <SnackbarProvider>
      {/* Resto da aplicação */}
    </SnackbarProvider>
  );
}
```

### 2. Usar o hook useSnackbar em qualquer componente

```tsx
import { useSnackbar } from '../../components/Snackbar';

function MeuComponente() {
  const { showSnackbar } = useSnackbar();

  const handleSuccess = () => {
    showSnackbar('Operação realizada com sucesso!', 'success');
  };

  const handleError = () => {
    showSnackbar('Erro ao realizar operação', 'error');
  };

  const handleWarning = () => {
    showSnackbar('Atenção: verifique os dados', 'warning');
  };

  const handleInfo = () => {
    showSnackbar('Informação importante', 'info');
  };

  return (
    // Seu JSX aqui
  );
}
```

## API

### showSnackbar(message, severity?)

- **message** (string, obrigatório): Mensagem a ser exibida
- **severity** (string, opcional): Tipo de alerta - 'success' | 'error' | 'warning' | 'info'
  - Padrão: 'success'

## Exemplos de Uso

```tsx
// Mensagem de sucesso (padrão)
showSnackbar('Cliente cadastrado com sucesso!');

// Mensagem de erro
showSnackbar('Erro ao carregar dados', 'error');

// Mensagem de aviso
showSnackbar('Estoque baixo detectado', 'warning');

// Mensagem informativa
showSnackbar('Esta ação não pode ser desfeita', 'info');
```
