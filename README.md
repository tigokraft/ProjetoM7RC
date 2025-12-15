# 📚 ProjetoM7RC - Sistema de Gestão de Turmas

Sistema completo de gestão de turmas e atividades académicas, desenvolvido com Next.js 16, React 19, TypeScript e PostgreSQL.

![Next.js](https://img.shields.io/badge/Next.js-16.0.7-black?style=flat&logo=next.js)
![React](https://img.shields.io/badge/React-19.2.0-blue?style=flat&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat&logo=typescript)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-blue?style=flat&logo=postgresql)
![Prisma](https://img.shields.io/badge/Prisma-7.1.0-2D3748?style=flat&logo=prisma)

---

## 📋 Índice

- [Funcionalidades](#-funcionalidades)
- [API e Endpoints](#-api-e-endpoints)
- [Tecnologias Utilizadas](#-tecnologias-utilizadas)
- [Modelo de Dados](#-modelo-de-dados)
- [Como Executar](#-como-executar)
- [Persistência e Base de Dados](#-persistência-e-base-de-dados)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Contribuir](#-contribuir)

---

## ✨ Funcionalidades

### 🔐 Autenticação
- Registo e login de utilizadores
- Autenticação JWT com cookies HTTP-only
- Sistema de recuperação de password
- Hash de passwords com bcrypt

### 🏢 Workspaces (Turmas)
- Criar workspaces do tipo `CLASS` (turma) ou `PERSONAL` (pessoal)
- Gestão de membros com roles (`ADMIN`/`USER`)
- Sistema de votações opcional por workspace

### 👥 Grupos
- Criação manual de grupos
- **Geração automática aleatória** de grupos
- Gestão de membros dos grupos

### 🗳️ Sistema de Votações
- Criar votações com múltiplas opções (2-10)
- Data de expiração opcional
- Visualização de resultados em tempo real
- Alterar voto antes da expiração

### 📅 Eventos e Calendário
- Criação de eventos com data, descrição e localização
- Sistema de presenças: `PRESENT`, `ABSENT`, `EXCUSED`, `PENDING`
- Marcação individual ou em massa (admin)
- Vista de calendário unificada (eventos + tarefas)

### 📚 Disciplinas e Tarefas
- Criar disciplinas com cores personalizadas
- Tarefas categorizadas: `TRABALHO`, `TESTE`, `PROJETO`, `TAREFA`
- Associar tarefas a disciplinas
- Sistema de conclusão individual de tarefas
- Filtros por tipo, disciplina, data e estado

### 🔔 Notificações
- Lembretes automáticos de eventos e deadlines
- Preferências personalizáveis (email/SMS/push)
- Configurar dias de antecedência para lembretes
- Marcar como lidas ou eliminar

---

## 🌐 API e Endpoints

### API Interna (Next.js App Router)

Este projeto utiliza uma **API REST própria** desenvolvida com Next.js App Router. Toda a documentação completa está disponível em:

📖 **[API.md](./API.md)** - Documentação completa da API

**Base URL:**
```
http://localhost:3000/api
```

### Principais Endpoints

#### Autenticação
- `POST /api/auth/register` - Registar novo utilizador
- `POST /api/auth/login` - Fazer login
- `POST /api/auth/forgotPassword` - Solicitar reset de password
- `POST /api/auth/forgotPassword/{id}` - Confirmar reset de password

#### Workspaces
- `GET /api/workspaces` - Listar workspaces do utilizador
- `POST /api/workspaces` - Criar novo workspace
- `GET /api/workspaces/{id}` - Obter detalhes de workspace
- `PUT /api/workspaces/{id}` - Atualizar workspace (admin)
- `DELETE /api/workspaces/{id}` - Eliminar workspace (owner)

#### Membros
- `GET /api/workspaces/{id}/members` - Listar membros
- `POST /api/workspaces/{id}/members` - Adicionar membro (admin)
- `PUT /api/workspaces/{id}/members/{memberId}` - Alterar role (admin)
- `DELETE /api/workspaces/{id}/members/{memberId}` - Remover membro

#### Grupos
- `GET /api/workspaces/{id}/groups` - Listar grupos
- `POST /api/workspaces/{id}/groups` - Criar grupo (admin)
- `POST /api/workspaces/{id}/groups/auto` - Gerar grupos automaticamente (admin)

#### Votações
- `GET /api/workspaces/{id}/votes` - Listar votações
- `POST /api/workspaces/{id}/votes` - Criar votação (admin)
- `GET /api/workspaces/{id}/votes/{voteId}` - Ver resultados
- `POST /api/workspaces/{id}/votes/{voteId}/respond` - Votar

#### Eventos & Calendário
- `GET /api/workspaces/{id}/events` - Listar eventos
- `POST /api/workspaces/{id}/events` - Criar evento (admin)
- `GET /api/workspaces/{id}/calendar` - Vista de calendário unificada

#### Presenças
- `GET /api/workspaces/{id}/events/{eventId}/attendance` - Listar presenças
- `POST /api/workspaces/{id}/events/{eventId}/attendance` - Marcar presença

#### Tarefas
- `GET /api/workspaces/{id}/tasks` - Listar tarefas (com filtros)
- `POST /api/workspaces/{id}/tasks` - Criar tarefa (admin)
- `POST /api/workspaces/{id}/tasks/{taskId}/complete` - Toggle conclusão

#### Disciplinas
- `GET /api/workspaces/{id}/disciplines` - Listar disciplinas
- `POST /api/workspaces/{id}/disciplines` - Criar disciplina (admin)

#### Notificações
- `GET /api/notifications` - Listar notificações do utilizador
- `POST /api/notifications` - Marcar todas como lidas
- `PUT /api/notifications/{id}` - Marcar uma como lida

#### Configurações
- `GET /api/user/settings` - Obter preferências de notificações
- `PUT /api/user/settings` - Atualizar preferências

### Campos Extraídos do JSON

#### Workspace
```json
{
  "id": "string",
  "name": "string",
  "description": "string | null",
  "type": "CLASS | PERSONAL",
  "votingEnabled": "boolean",
  "owner": { "id": "string", "name": "string", "email": "string" },
  "_count": { "members": 0, "tasks": 0, "events": 0 }
}
```

#### Task
```json
{
  "id": "string",
  "title": "string",
  "description": "string | null",
  "type": "TRABALHO | TESTE | PROJETO | TAREFA",
  "dueDate": "datetime",
  "discipline": { "id": "string", "name": "string", "color": "string" },
  "isCompleted": "boolean",
  "completedAt": "datetime | null"
}
```

#### Event
```json
{
  "id": "string",
  "title": "string",
  "description": "string | null",
  "startDate": "datetime",
  "endDate": "datetime | null",
  "location": "string | null",
  "attendances": [...]
}
```

---

## 🛠️ Tecnologias Utilizadas

### Frontend
- **[Next.js 16](https://nextjs.org/)** - Framework React com App Router
- **[React 19](https://react.dev/)** - Biblioteca UI
- **[TypeScript 5](https://www.typescriptlang.org/)** - Superset tipado de JavaScript
- **[TailwindCSS 4](https://tailwindcss.com/)** - Framework CSS utility-first
- **[Radix UI](https://www.radix-ui.com/)** - Componentes UI acessíveis
- **[Lucide React](https://lucide.dev/)** - Ícones

### Backend & Database
- **[PostgreSQL](https://www.postgresql.org/)** - Base de dados relacional
- **[Prisma 7](https://www.prisma.io/)** - ORM TypeScript
- **[Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)** - Serverless API

### Autenticação & Segurança
- **[jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken)** - JWT tokens
- **[bcrypt](https://www.npmjs.com/package/bcrypt)** - Hash de passwords
- **[Zod](https://zod.dev/)** - Validação de schemas

### Utilidades
- **[date-fns](https://date-fns.org/)** - Manipulação de datas
- **[cookie](https://www.npmjs.com/package/cookie)** - Gestão de cookies

---

## 📊 Modelo de Dados

O projeto utiliza **PostgreSQL** com **Prisma ORM**. O schema completo está em [`prisma/schema.prisma`](./prisma/schema.prisma).

### Principais Entidades

```mermaid
erDiagram
    User ||--o{ Workspace : "owns"
    User ||--o{ WorkspaceMember : "member of"
    Workspace ||--o{ WorkspaceMember : "has"
    Workspace ||--o{ Group : "has"
    Workspace ||--o{ Event : "has"
    Workspace ||--o{ Task : "has"
    Workspace ||--o{ Discipline : "has"
    Workspace ||--o{ Vote : "has"
    Group ||--o{ GroupMember : "has"
    Event ||--o{ Attendance : "has"
    Task ||--o{ TaskCompletion : "has"
    Vote ||--o{ VoteOption : "has"
    VoteOption ||--o{ VoteResponse : "has"
```

### Tabelas Principais
- **User** - Utilizadores do sistema
- **Workspace** - Turmas/espaços de trabalho
- **WorkspaceMember** - Relação utilizador-workspace com role
- **Group** - Grupos dentro de workspaces
- **Event** - Eventos/aulas
- **Attendance** - Presenças em eventos
- **Task** - Trabalhos/testes/projetos
- **Discipline** - Disciplinas/cadeiras
- **Vote** - Votações
- **Notification** - Notificações do sistema

---

## 🚀 Como Executar

### Pré-requisitos
- **Node.js** 20+ ou **Bun** 1.0+
- **PostgreSQL** 14+
- **Git**

### 1. Clonar o Repositório
```bash
git clone https://github.com/tigokraft/ProjetoM7RC.git
cd ProjetoM7RC
```

### 2. Instalar Dependências
```bash
npm install
# ou
bun install
```

### 3. Configurar Variáveis de Ambiente

Criar ficheiro `.env` na raiz do projeto:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/m7rc?schema=public"

# JWT Secret (gerar com: openssl rand -base64 32)
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"

# App URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 4. Configurar Base de Dados

```bash
# Gerar Prisma Client
npx prisma generate

# Criar/atualizar schema na BD
npx prisma db push

# (Opcional) Abrir Prisma Studio para visualizar dados
npx prisma studio
```

### 5. Executar em Modo de Desenvolvimento

```bash
npm run dev
# ou
bun run dev
```

A aplicação estará disponível em **http://localhost:3000**

### 6. Build para Produção

```bash
npm run build
npm start
```

---

## 💾 Persistência e Base de Dados

### Base de Dados: PostgreSQL

Este projeto utiliza **PostgreSQL** como sistema de persistência. Toda a gestão é feita através do **Prisma ORM**.

#### Como Testar a Base de Dados

**1. Prisma Studio (Interface Visual)**
```bash
npx prisma studio
```
Abre em `http://localhost:5555` - permite visualizar e editar dados diretamente.

**2. Migrations**
```bash
# Criar migração após alterações no schema
npx prisma migrate dev --name nome_da_migracao

# Aplicar migrations em produção
npx prisma migrate deploy
```

**3. Reset da Base de Dados**
```bash
# ATENÇÃO: Apaga TODOS os dados!
npx prisma migrate reset
```

**4. Seed (Popular BD com dados de teste)**
```bash
# Se configurado em package.json
npx prisma db seed
```

### Estrutura de Dados

- **Autenticação:** Tokens JWT armazenados em cookies HTTP-only
- **Passwords:** Hash com bcrypt (10 salt rounds)
- **Datas:** Formato ISO 8601 / UTC
- **IDs:** CUID (Collision-resistant Unique Identifiers)

### Backups

```bash
# Exportar dados
pg_dump -U user -d m7rc > backup.sql

# Restaurar dados
psql -U user -d m7rc < backup.sql
```

---

## 📁 Estrutura do Projeto

```
ProjetoM7RC/
├── prisma/
│   ├── schema.prisma          # Schema do Prisma (modelo de dados)
│   └── migrations/            # Histórico de migrations
├── src/
│   ├── app/
│   │   ├── api/               # API Routes (Next.js)
│   │   │   ├── auth/          # Autenticação
│   │   │   ├── workspaces/    # Workspaces e sub-rotas
│   │   │   ├── notifications/ # Notificações
│   │   │   └── user/          # Configurações do utilizador
│   │   ├── account/           # Páginas de autenticação (UI)
│   │   ├── dashboard/         # Dashboard principal
│   │   ├── layout.tsx         # Layout global
│   │   └── page.tsx           # Página inicial
│   ├── components/            # Componentes React reutilizáveis
│   ├── lib/
│   │   ├── prisma.ts          # Cliente Prisma
│   │   ├── Hasher.ts          # Funções de hash (bcrypt)
│   │   └── Jwt.ts             # Funções JWT
│   └── ...
├── public/                    # Assets estáticos
├── API.md                     # Documentação completa da API
├── README.md                  # Este ficheiro
├── package.json               # Dependências e scripts
├── tsconfig.json              # Configuração TypeScript
├── next.config.ts             # Configuração Next.js
└── .env                       # Variáveis de ambiente (não commitado)
```

---

## 🔒 Segurança

- ✅ Passwords com hash bcrypt
- ✅ JWT com expiração configurável
- ✅ HTTP-only cookies para tokens
- ✅ Validação de inputs com Zod
- ✅ CORS configurado
- ✅ Proteção contra SQL injection (Prisma ORM)
- ✅ Rate limiting (recomendado adicionar em produção)

---

## 🤝 Contribuir

1. Fork o projeto
2. Criar branch de feature (`git checkout -b feature/NovaFuncionalidade`)
3. Commit das alterações (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/NovaFuncionalidade`)
5. Abrir Pull Request

---

## 📝 Licença

Este projeto foi desenvolvido para fins académicos.

---

## 👥 Autores

Desenvolvido como projeto académico M7RC.

---

## 📞 Contacto

Para questões ou sugestões, abrir uma issue no repositório.

---

## 🔗 Links Úteis

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [React Documentation](https://react.dev)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)
- [API Documentation](./API.md)
