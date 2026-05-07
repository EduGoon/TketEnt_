Frontend readme · MD
Copy

# Eventify Frontend
 
React + TypeScript frontend for Eventify — a full-stack events ticketing platform built for Kenya's event scene. Live at [Eventify.vercel.app](https://Eventify.vercel.app).
 
## Tech Stack
 
- **React 18 + TypeScript** — UI and type safety
- **React Router DOM** — client-side routing
- **Tailwind CSS** — utility-first styling
- **Vite** — build tool and dev server
- **React Context API** — auth state management
 
## Prerequisites
 
- Node.js 18+
- npm
 
## Getting Started
 
```bash
# Install dependencies
npm install
 
# Start development server
npm run dev
```
 
The app runs at `http://localhost:5173` by default.
 
## Environment Variables
 
Create a `.env` file in the root:
 
```env
VITE_API_URL=http://localhost:4000/api/v1
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```
 
For production this points to the Cloud Run backend URL. On Vercel, add `VITE_GOOGLE_CLIENT_ID` to your project environment variables so the client ID is available during build and runtime.
 
## Available Scripts
 
```bash
npm run dev       # Start dev server
npm run build     # Build for production
npm run preview   # Preview production build
npm run lint      # Run ESLint
```
 
## Project Structure
 
```
src/
├── pages/                  # Route-level page components
│   ├── admin/              # Admin-only pages (EventManagement, etc.)
│   ├── AdminDashboard.tsx
│   ├── EventDetailsPage.tsx
│   ├── EventsPage.tsx
│   ├── LandingPage.tsx
│   ├── OrganizerDashboard.tsx
│   ├── ApplyOrganizerPage.tsx
│   ├── TermsPage.tsx
│   └── ...
├── services/               # API call functions (one file per domain)
│   ├── api.ts              # Base fetch wrapper with auth headers
│   ├── adminService.ts
│   ├── ticketService.ts
│   ├── organizerService.ts
│   └── ...
├── utilities/              # Shared logic and types
│   ├── AuthContext.tsx     # JWT auth context and hooks
│   ├── PrivateRoute.tsx    # Route guards by role
│   └── types.ts            # TypeScript interfaces
└── App.tsx                 # Route definitions
```
 
## Authentication
 
Auth is JWT-based. On sign-in the token is stored in `localStorage` and attached to every API request via the `Authorization: Bearer <token>` header. The `AuthContext` exposes the current user, `login`, `logout`, and `refreshSession` functions.
 
Protected routes use `<PrivateRoute>` with optional `adminOnly` or `organizerOnly` props.
 
## User Roles
 
| Role | Access |
|------|--------|
| `USER` | Browse events, buy tickets, reviews, account management |
| `ORGANIZER` | Everything above + organizer dashboard, create events, request payouts |
| `ADMIN` | Full platform access including admin dashboard |
 
## Ticket Purchasing Flow
 
1. User selects ticket type and quantity on the event page
2. User enters their M-Pesa phone number
3. Frontend calls `POST /user/tickets/purchase` — backend initiates an STK push to the phone
4. Frontend shows a "Check your phone" waiting state and polls `GET /user/tickets/poll/:checkoutRequestId` every 3 seconds
5. Once Safaricom sends the payment callback to the backend and confirms success, the poll returns `COMPLETED`
6. Frontend shows the success screen and the ticket appears in the user's account
 
## Deployment
 
The frontend is deployed to Vercel. Every push to the main branch triggers a production deployment automatically.
 
```bash
npm run build   # Vite outputs to /dist
```
 
Vercel serves the `/dist` folder. The `VITE_API_URL` environment variable is set in the Vercel project settings.
 