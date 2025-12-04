# Guia de Teste - Sistema de Login

## Como Testar o Sistema de Autenticação

### 1. Verificar se os servidores estão rodando

Backend deve estar em: http://localhost:3000
Frontend deve estar em: http://localhost:5174

### 2. Acessar o Sistema

1. Abra o navegador e vá para: http://localhost:5174
2. Você será automaticamente redirecionado para a tela de login

### 3. Fazer Login (Primeira vez)

Use as credenciais do administrador padrão:
- **Email**: admin@oficina.com
- **Senha**: admin123

### 4. Trocar Senha Obrigatória

Após o primeiro login, o sistema irá forçar a troca de senha:
- Digite uma nova senha (mínimo 6 caracteres)
- Confirme a nova senha
- Clique em "Alterar Senha"

### 5. Explorar o Sistema

Após trocar a senha, você terá acesso ao dashboard e todos os módulos:
- Dashboard
- Clientes
- Veículos
- Mecânicos
- Serviços
- Peças
- Ordem de Serviço
- Financeiro (Dashboard e Receitas)

### 6. Testar Logout

- Clique no botão "Sair" no canto superior direito
- Você será redirecionado para a tela de login
- O token será removido do localStorage

### 7. Fazer Login com a Nova Senha

- Entre novamente com admin@oficina.com
- Use a nova senha que você definiu
- Desta vez, NÃO será solicitado trocar senha

## Fluxo de Autenticação Implementado

```
1. Usuário acessa /
   → Redireciona para /login (se não autenticado)

2. Usuário faz login
   → Token salvo no localStorage
   → Dados do usuário carregados
   → Redireciona para /dashboard

3. Se deve_trocar_senha = true
   → Abre dialog de troca de senha (obrigatório)
   → Não pode fechar até trocar

4. Navegação protegida
   → Todas as rotas verificam autenticação
   → Token incluído em todas as requisições
   → Menu filtrado por permissões

5. Logout
   → Remove token
   → Limpa estado do usuário
   → Redireciona para /login

6. Token inválido/expirado
   → Interceptor detecta erro 401
   → Remove token automaticamente
   → Redireciona para /login
```

## Credenciais de Teste

### Administrador
- Email: admin@oficina.com
- Senha inicial: admin123
- Tipo: admin
- Permissões: Todas
- Deve trocar senha: SIM (no primeiro login)

### Usuário Comum (pode criar depois)
- Tipo: comum
- Permissões: Específicas por módulo
- Pode ter acesso restrito

## Verificar Permissões

Como admin, você verá TODOS os itens do menu.

Se você criar um usuário comum com permissões limitadas (por exemplo, apenas "clientes" e "veiculos"), ele verá apenas:
- Dashboard (sempre visível)
- Clientes
- Veículos

Os outros módulos serão ocultados automaticamente.

## Problemas Comuns

### 1. Não consigo acessar o sistema
- Verifique se o backend está rodando na porta 3000
- Verifique se o frontend está rodando na porta 5174
- Veja o console do navegador (F12) para erros

### 2. Erro 401 após login
- Verifique se o backend está processando corretamente
- Veja os logs do backend
- Limpe o localStorage (F12 → Application → Local Storage → Clear)

### 3. Não abre dialog de trocar senha
- Verifique se o usuário tem deve_trocar_senha = true no banco
- Veja o console do navegador para erros

### 4. Token não está sendo enviado
- Verifique se o interceptor do axios está configurado
- Veja a aba Network (F12) nas requisições
- Procure pelo header "Authorization: Bearer <token>"

## Próximos Passos

Após testar o login com sucesso, você pode:

1. **PARTE 3**: Implementar gerenciamento de usuários (CRUD de usuários)
2. Testar permissões granulares
3. Implementar recuperação de senha
4. Adicionar logs de auditoria
5. Implementar refresh token
