# 💅 Agenda Cílios

Sistema de agendamento online para estúdios de beleza e profissionais autônomos (ex: alongamento de cílios, estética, tatuagem).  
Permite gerenciar clientes, agendamentos e manutenções automáticas.

---

## 🚀 Tecnologias

- [Next.js 15](https://nextjs.org/) — frontend e backend (rotas App Router)
- [TypeScript](https://www.typescriptlang.org/) — tipagem estática
- [Prisma](https://www.prisma.io/) — ORM para banco de dados
- [MongoDB Atlas](https://www.mongodb.com/atlas) — banco de dados na nuvem
- [Zod](https://zod.dev/) — validação de dados
- [date-fns](https://date-fns.org/) — manipulação de datas
- [Thunder Client](https://www.thunderclient.com/) — testes de API no VSCode
- [Resend](https://resend.com/) *(opcional)* — envio de emails de lembrete

---

## 📂 Estrutura de Pastas

```bash
src/
 ├── app/
 │   └── api/
 │       ├── appointments/
 │       │   └── route.ts        # POST e GET de agendamentos
 │       ├── appointments/[id]/
 │       │   └── route.ts        # PATCH de status do agendamento
 │       └── jobs/due-maintenance/
 │           └── route.ts        # Job diário de manutenção
 │
 ├── lib/
 │   ├── db.ts                   # Conexão Prisma + MongoDB
 │   └── mailer.ts               # Simulador de envio de email
 │
 └── prisma/
     └── schema.prisma           # Definição do modelo de dados
```

---

## 🗄️ Modelos no Prisma

```prisma
model Client {
  id        String   @id @default(auto()) @map("_id") @db.ObjectId
  name      String
  phoneE164 String   @unique
  email     String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  appointments Appointment[]
}

model Appointment {
  id              String   @id @default(auto()) @map("_id") @db.ObjectId
  clientId        String   @db.ObjectId
  service         String
  startsAt        DateTime
  maintenanceDueAt DateTime
  status          String   @default("SCHEDULED")
  createdAt       DateTime @default(now())

  client Client @relation(fields: [clientId], references: [id])
}
```

---


## ⚙️ Rotas da API

### ➕ Criar Agendamento
`POST /api/appointments`

```json
{
  "name": "Maria Alves",
  "phone": "(11) 99999-9999",
  "email": "maria@email.com",
  "service": "Cílios fio a fio",
  "startsAt": "2025-09-01T14:00"
}
```

---

### 📋 Listar Agendamentos
`GET /api/appointments?page=1&perPage=10`

---

### ✏️ Atualizar Status
`PATCH /api/appointments/:id`

```json
{
  "status": "DONE"
}
```

Status possíveis:  
- `SCHEDULED`  
- `REMINDER_SENT`  
- `DONE`  
- `CANCELLED`

---

### 🔔 Job de Manutenção
`GET /api/jobs/due-maintenance?secret=CRON_SECRET`

Verifica agendamentos com **manutenção de 20 dias** e envia lembrete.

---

## 🛠️ Como rodar localmente

```bash
# 1. Instale as dependências
npm install

# 2. Configure o .env
cp .env.example .env

# 3. Gere o cliente Prisma
npx prisma db push

# 4. Rode o servidor
npm run dev
```

API disponível em:  
👉 http://localhost:3000/api/appointments  

---

## 📌 Próximos Passos

- [ ] Criar painel admin simples no Next.js para visualizar agendamentos.  
- [ ] Deploy na **Vercel** com cron configurado.  
- [ ] Ativar envio real de e-mails com **Resend**.  
- [ ] Integração com botão **Agendar via WhatsApp**.  

---

## ✨ Créditos

Desenvolvido por **Lidiane** 