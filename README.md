# 💰 PlanWise - Sistema de Controle Financeiro Pessoal

Sistema web para controle e planejamento financeiro pessoal, permitindo gerenciar receitas, despesas, categorias e visualizar análises financeiras através de gráficos e relatórios.

## 🚀 Tecnologias

- **Angular 20** - Framework web
- **Angular Material** - Componentes UI
- **PrimeNG** - Componentes adicionais
- **Chart.js** - Gráficos e visualizações
- **TypeScript** - Linguagem de programação
- **RxJS** - Programação reativa
- **Express** - Server-side rendering

## ✨ Funcionalidades

### 📊 Dashboard
- Visão geral das finanças do mês atual
- Gráficos de despesas por categoria
- Tendências mensais de receitas e despesas
- Atividades recentes

### 💸 Gestão de Despesas
- Cadastro de despesas
- Categorização
- Visualização detalhada
- Histórico completo

### 💰 Gestão de Receitas
- Cadastro de receitas
- Categorização
- Visualização detalhada
- Histórico completo

### 🏷️ Categorias
- Criação de categorias personalizadas
- Categorias para receitas e despesas
- Gerenciamento completo

### 📈 Análises
- Relatórios financeiros
- Gráficos interativos
- Exportação de dados (PDF e Excel)
- Análise de tendências

### 🔐 Autenticação
- Login e registro de usuários
- Controle de acesso
- Sessão segura

## 🛠️ Instalação

### Pré-requisitos

- Node.js (versão 18 ou superior)
- npm ou yarn

### Passos

1. Clone o repositório:
```bash
git clone <url-do-repositorio>
cd planwise-frontend
```

2. Instale as dependências:
```bash
npm install
```

3. Configure o ambiente:
   - Ajuste a URL da API em `src/environments/environment.ts`

4. Execute o projeto:
```bash
npm start
```

5. Acesse no navegador:
```
http://localhost:4200
```

## 📦 Scripts Disponíveis

- `npm start` - Inicia o servidor de desenvolvimento
- `npm run build` - Gera build de produção
- `npm run watch` - Build com watch mode
- `npm test` - Executa os testes

## 🌐 Configuração da API

O sistema requer uma API backend. Configure a URL no arquivo:
```
src/environments/environment.ts
```

URL padrão: `http://localhost:8080/api`

## 📱 Estrutura do Projeto

```
src/
├── app/
│   ├── core/           # Serviços, guards, interceptors
│   ├── features/       # Módulos de funcionalidades
│   │   ├── analytics/  # Análises financeiras
│   │   ├── auth/       # Autenticação
│   │   ├── categories/ # Gestão de categorias
│   │   ├── dashboard/  # Dashboard principal
│   │   ├── expenses/   # Gestão de despesas
│   │   └── incomes/    # Gestão de receitas
│   └── shared/         # Componentes compartilhados
├── assets/             # Recursos estáticos
├── environments/       # Configurações de ambiente
└── styles/             # Estilos globais
```

## 🎨 Interface

- Design moderno e responsivo
- Tema dark personalizado
- Gráficos interativos
- Experiência de usuário intuitiva

## 📄 Licença

Este projeto é privado e de uso interno.

## 👥 Equipe

Desenvolvido por Caio Rodrigues


---

**Versão:** 1.0.0

