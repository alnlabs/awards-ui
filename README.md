# Employee Awards UI

A mobile-first Progressive Web App (PWA) for managing employee awards, built with React, Redux Toolkit, Bootstrap, and styled-components.

## Features

- 🎨 **Modern UI/UX** - Beautiful, responsive dashboard design
- 📱 **Mobile-First** - Optimized for mobile devices
- 🔐 **Authentication** - JWT-based authentication with role-based access
- 📊 **Dashboard** - Role-specific dashboards (HR, Manager, Employee, Panel)
- 🏆 **Awards Management** - Complete lifecycle from nomination to finalization
- 💾 **Offline Support** - PWA capabilities for offline access
- 🎯 **Redux Toolkit** - Centralized state management
- 🎨 **Styled Components** - Component-based styling (no raw CSS)

## Tech Stack

- **React** - UI library
- **Redux Toolkit** - State management
- **React Router** - Routing
- **Bootstrap 5** - Responsive UI framework
- **styled-components** - CSS-in-JS styling
- **React Hot Toast** - Notifications
- **Axios** - HTTP client
- **Vite** - Build tool

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Employee Awards API running on http://localhost:4100

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file (optional, defaults to localhost:4100):
```env
VITE_API_BASE_URL=http://localhost:4100/api/v1
```

3. Start the development server:
```bash
npm run dev
```

4. Open http://localhost:3000 in your browser

### Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
src/
├── components/       # Reusable components
│   ├── common/      # Common components (Loading, Card, etc.)
│   └── layout/      # Layout components (DashboardLayout)
├── pages/           # Page components
│   ├── auth/        # Authentication pages (Login, Register)
│   └── Dashboard.jsx
├── store/           # Redux store
│   ├── slices/      # Redux slices
│   └── store.js     # Store configuration
├── services/        # API services
├── utils/           # Utility functions and constants
└── config/          # Configuration files
```

## User Roles

- **HR** - Full system access (cycles, nominations, awards, users)
- **Manager** - Create and view nominations
- **Employee** - View awards and results
- **Panel** - Review nominations

## API Integration

The UI connects to the Employee Awards API. Make sure the API is running and accessible.

Default API URL: `http://localhost:4100/api/v1`

## PWA Features

The app is configured as a Progressive Web App with:
- Service worker for offline support
- Installable on mobile devices
- App manifest for home screen icons

## Development

- Hot module replacement is enabled
- API proxy configured for development
- Source maps available for debugging

## License

MIT
