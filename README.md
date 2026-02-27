# ShopStore Frontend

Modern React frontend application with Material-UI, Apollo Client, and Redux Toolkit.

## Tech Stack

- React 18
- TypeScript
- Vite
- Material-UI (MUI)
- Apollo Client (GraphQL)
- Redux Toolkit
- React Router

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Setup

Create a `.env` file in the root directory:

```bash
VITE_API_URL=http://localhost:4000/graphql
```

### 3. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## Project Structure

```
src/
├── components/         # Reusable UI components
├── pages/             # Page components
├── store/             # Redux store configuration
├── graphql/           # GraphQL queries and mutations
├── utils/             # Utility functions
├── types/             # TypeScript type definitions
└── App.tsx            # Main application component
```

## Features

- User authentication (login, register, password reset)
- Email verification
- Protected routes
- Responsive design with Material-UI
- State management with Redux Toolkit
- GraphQL integration with Apollo Client

## Development

The frontend communicates with the backend via GraphQL. Make sure the backend server is running before starting the frontend development server.

## Building for Production

```bash
npm run build
```

The built files will be in the `dist/` directory, ready to be deployed to any static hosting service.
