# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
This is an admin dashboard for the Immpression platform, built with React 19 and Vite. It provides administrative functionality for managing artworks, users, and orders.

## Development Commands
- `npm run dev` - Start development server on port 5173
- `npm run build` - Build for production
- `npm run lint` - Run ESLint to check code quality
- `npm run preview` - Preview production build

## Architecture

### Tech Stack
- **Frontend**: React 19, React Router DOM 7.3.0
- **Build Tool**: Vite 6.2.0 with @vitejs/plugin-react
- **HTTP Client**: Axios for API calls
- **State Management**: React Context (AuthContext) for authentication
- **Styling**: CSS modules with component-specific stylesheets
- **Code Quality**: ESLint with React hooks and refresh plugins

### Core Structure
```
src/
├── api/API.js              # Central API service layer
├── components/             # React components organized by feature
├── context/authContext.jsx # Global authentication state
├── hooks/                  # Custom React hooks (useDebounce, useIdleTimer)
└── styles/                 # Component-specific CSS files
```

### Key Components
- **App.jsx**: Main router with authentication-protected routes
- **Login.jsx**: Admin authentication 
- **Home.jsx**: Dashboard overview
- **ReviewArt.jsx**: Artwork approval/rejection interface
- **UserBase.jsx**: User management
- **Orders.jsx**: Order management
- **ArtDetails.jsx**: Individual artwork details with admin actions
- **UserDetails.jsx**: Individual user profile management

### Authentication System
Uses JWT tokens stored in localStorage with:
- Token-based route protection via PrivateRoute wrapper
- AuthContext for global auth state
- Automatic token renewal functionality
- Logout with token cleanup

### API Integration
All API calls centralized in `src/api/API.js` with:
- Base URL from `VITE_API_URL` environment variable
- Bearer token authentication
- Error handling with user-friendly messages
- Functions for artwork, user, and order management

### Environment Configuration
- Uses Vite path aliases: `@` (src), `@styles` (src/styles), `@assets` (src/assets)
- Server configured for host `0.0.0.0:5173` with history API fallback
- Environment variables prefixed with `VITE_`

### Development Notes
- No test framework currently configured
- Husky pre-commit hooks enabled
- ESLint configured with React-specific rules
- Uses React 19's new features including StrictMode
- Deployment ready for Vercel (vercel.json present)