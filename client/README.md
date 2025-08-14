# Microfinance MIS Client

A modern React frontend for the Microfinance Management Information System, built with Vite, Tailwind CSS, and shadcn/ui. It provides dashboards, members, groups, loans, savings, transactions, meetings, reports, chat, and user management.

## Features

- 🎨 Unified blue/purple gradient UI across buttons, inputs, cards, and tables
- 🔐 Auth with JWT and role-based access (admin/officer/leader/member)
- 👥 Members and Groups management
- 💰 Loans and 💳 Savings workflows
- 🔄 Transactions and 📅 Meetings
- 💬 Real-time Chat with optimistic updates
- 📊 Dashboard and Reports
- 👤 Users management (CRUD, role/status)
- 🌙 Dark/light theme support

## Tech Stack

- React 19, Vite, Tailwind CSS, shadcn/ui
- React Router, Axios, Sonner (toasts)
- Socket.io-client for realtime chat

## Getting Started

### Prerequisites

- Node.js (v18 or higher)

### Installation

```bash
npm install
```

### Environment

Create `.env` in `client/`:

```env
VITE_API_URL=http://localhost:5000/api
```

### Development

```bash
npm run dev
```

PowerShell tip: use `;` rather than `&&` to chain commands.

### Build

```bash
npm run build
npm run preview
```

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/              # shadcn/ui components
│   ├── modals/          # Dialog-based modals
│   └── chat/            # Chat interface components
├── context/             # Auth, Socket providers
├── pages/               # App pages (Dashboard, Users, Members, ...)
├── services/            # API services (axios)
├── store/               # State (if applicable)
├── lib/                 # Utilities
├── routes/              # Routing
└── main.jsx             # Entry
```

## API Integration

- Base URL: `VITE_API_URL` (defaults to `http://localhost:5000`)
- Central endpoints: `src/services/api/endpoints.js`
- Shared axios client with interceptors: `src/services/api/client.js`

Key services:

- `userService`: list/create/update role/status/delete users
- `memberService`: members CRUD + stats
- `chatService`: channels/messages/send/read
- `loanService`, `savingsService`, `transactionService`, etc.

## Styling

- Tailwind CSS with a blue/purple gradient theme
- Inputs have blue borders and purple focus rings
- Tables have gradient headers and row hovers

## Notes

- Chat uses optimistic UI: messages appear instantly; socket events unify state
- If members stats 400 occurs, ensure backend route order has `/members/stats` before `/:id`

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
