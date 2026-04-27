# PharmaStock WMS - Client Interface

This is the production-ready Single Page Application (SPA) for the **PharmaStock Warehouse Management System**, designed to communicate seamlessly via RESTful protocols to our decoupled PHP backend.

## Tech Stack
- **Framework**: React 18
- **Build Tool**: Vite targetting hyper-fast HMR and optimized minified rolling.
- **Routing**: React Router v6 (`BrowserRouter`)
- **Styling**: Pure CSS (`index.css`) built atop custom defined CSS-variables for deep-brand continuity.
- **Iconography**: Lucide React
- **State Management**: React Native Context API (`AuthContext`)

## Architecture Flow
Since this is a deeply-functional WMS, we strictly abstracted our communication models into the `/src/api` layer:
```
src/
├── api/          # Network layer (Axios wrappers) to decoupled Backend PHP.
├── components/   # Universal building blocks (DataTables, Confirm Dialogs, Modals)
├── context/      # Global state arrays (Authentication locks, Permissions)
├── pages/        # Segmented Route specific views (Orders, Inventory, Dashboard)
└── utils/        # Extracted formatting scripts (Dates, Currency)
```

## Quick Start
To compile and instantiate the GUI locally on your development machine:

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Hydrate Configs**
   Create a `.env` file referencing your local PHP Apache deployment.
   ```env
   VITE_API_URL=http://localhost/pharma-stock/backend
   ```

3. **Deploy Instance**
   ```bash
   npm run dev
   ```

## Key Features & Custom Behaviors
- **Distraction-Free Workspace**: The Sidebar natively observes DOM events, allowing it to mathematically squash to exactly `0px` horizontally when toggled so you can focus entirely on your DataTables.
- **Smart Notification Hub**: A custom polling mechanism queries the backend every 30 seconds pulling intelligent "Urgent Expiry" signals into your local Bell icon.
- **Omni-Recovery Loop**: Integrated URL token-scanning seamlessly flips the standard `/login` interface into security-override "Password Reset" contexts by natively scanning React-Router `useLocation` queries!
- **Resilient Route Execution**: A globally mounted Wildcard boundary `(<Route path="*" />)` cohesively intercepts any broken HTTP parameters or corrupted internal navigation and routes entirely broken pages seamlessly into a unified 404 interface completely contained within the persistent AppShell boundaries.
