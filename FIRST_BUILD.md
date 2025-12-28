# First Build Documentation

## Project Overview

**PulseMine** (also known as PulsePoint Ideas) is a web application designed to help entrepreneurs and founders discover validated business opportunities by analyzing Reddit discussions. The platform extracts recurring pain points from Reddit communities, clusters them by theme and urgency, and generates actionable micro-SaaS ideas with MVP specifications.

---

## Technology Stack

### Core Technologies
- **React 18.3.1** - UI framework
- **TypeScript 5.8.3** - Type-safe development
- **Vite 5.4.19** - Build tool and dev server
- **React Router DOM 6.30.1** - Client-side routing

### UI Framework & Styling
- **shadcn/ui** - Component library (built on Radix UI)
- **Tailwind CSS 3.4.17** - Utility-first CSS framework
- **Framer Motion 12.23.26** - Animation library
- **Lucide React** - Icon library
- **next-themes** - Theme management (dark mode support)

### State Management & Data
- **TanStack Query (React Query) 5.83.0** - Server state management
- **React Context API** - Global application state
- **Mock Data** - Development data structure

### Form Handling & Validation
- **React Hook Form 7.61.1** - Form management
- **Zod 3.25.76** - Schema validation
- **@hookform/resolvers** - Zod integration

### Charts & Visualization
- **Recharts 2.15.4** - Charting library

### Additional Libraries
- **date-fns** - Date formatting
- **cmdk** - Command palette component
- **sonner** - Toast notifications

---

## Application Structure

### Routing Architecture

The application uses React Router with the following route structure:

#### Public Routes
- `/` - Landing page
- `/signin` - Sign in page
- `/signup` - Sign up page

#### Protected Routes (under `/app`)
- `/app` - Dashboard (main overview)
- `/app/subreddits` - Subreddit management
- `/app/new` - Create new analysis
- `/app/analyses` - List of all analyses
- `/app/analyses/:id` - Analysis detail view
- `/app/ideas` - Generated ideas list
- `/app/alerts` - Alert rules management
- `/app/settings` - User settings
- `*` - 404 Not Found page

---

## Key Features Implemented

### 1. Landing Page
- **Hero Section**: Value proposition and CTAs
- **How It Works**: 3-step process explanation
- **Features**: Privacy-first, smart clustering, actionable ideas, evidence-based insights
- **Call-to-Action**: Sign up prompts
- **Navigation**: Header with sign in/sign up buttons

### 2. Authentication System
- Sign in page
- Sign up page
- Mock authentication system (currently uses mock user data)
- User context management

### 3. Dashboard (`/app`)
- **Overview Statistics**:
  - Posts analyzed count
  - Problems extracted count
  - Clusters found count
  - High urgency items count
  - Trend indicators (percentage changes)

- **Quick Actions**:
  - Run new analysis panel with collection and timeframe selection
  - Advanced options link

- **Visualizations**:
  - Problems over time chart (area chart using Recharts)
  - Timeframe selector (24h, 7d, 30d)

- **Recent Analyses**:
  - List of recent analyses with status badges
  - Quick navigation to analysis details
  - Subreddit tags

### 4. Subreddit Management (`/app/subreddits`)
- Manage subreddit collections
- View subreddit details (members, activity scores)
- Organize subreddits into collections

### 5. Analysis System
- **Create Analysis** (`/app/new`):
  - Configure analysis parameters
  - Select collections/subreddits
  - Set timeframe

- **Analyses List** (`/app/analyses`):
  - View all analyses
  - Filter and search
  - Status tracking

- **Analysis Detail** (`/app/analyses/:id`):
  - Detailed view of analysis results
  - Problems extracted
  - Clusters identified
  - Source references

### 6. Ideas Management (`/app/ideas`)
- View generated business ideas
- Idea statuses: backlog, researching, building, launched
- Idea details including:
  - One-liner description
  - Target user
  - MVP specifications
  - Pricing suggestions
  - Moat/competitive advantage
  - Validation steps
  - Risk assessment

### 7. Alerts System (`/app/alerts`)
- Create alert rules for specific keywords/themes
- Set cadence (daily, weekly, realtime)
- Monitor collections for specific patterns

### 8. Settings (`/app/settings`)
- User preferences
- Account settings
- Integration management (Reddit connection)

---

## Component Architecture

### Layout Components (`src/components/layout/`)
- **AppShell**: Main application shell wrapper
- **Sidebar**: Collapsible navigation sidebar
  - Desktop: Fixed sidebar with collapse/expand
  - Mobile: Sheet/drawer overlay
- **TopBar**: Top navigation bar with breadcrumbs
- **CommandPalette**: Keyboard command interface

### UI Components (`src/components/ui/`)
Comprehensive shadcn/ui component library including:
- Accordion, Alert, Alert Dialog, Avatar
- Badge, Breadcrumb, Button, Calendar
- Card, Carousel, Chart, Checkbox
- Collapsible, Command, Context Menu, Dialog
- Drawer, Dropdown Menu, Form, Hover Card
- Input, Input OTP, Label, Menubar
- Navigation Menu, Pagination, Popover
- Progress, Radio Group, Resizable, Scroll Area
- Select, Separator, Sheet, Skeleton
- Slider, Sonner (toast), Switch, Table
- Tabs, Textarea, Toast, Toggle, Tooltip

### Pages (`src/pages/`)
All major application pages with full implementations

---

## Data Models (TypeScript Interfaces)

### Core Entities

**Subreddit**
- Name, member count, activity score, description

**Collection**
- ID, name, subreddits array, creation timestamp

**Analysis**
- ID, name, creation date, timeframe
- Collections and subreddits involved
- Status: pending, fetching, cleaning, extracting, clustering, generating, completed, failed
- Counts: posts, problems, clusters, high urgency items

**Problem**
- ID, text, category, confidence score
- Subreddit source, number of sources, creation date

**Cluster**
- ID, title, urgency level (low/medium/high)
- Frequency, keywords, "why it matters" explanation
- Excerpts, associated subreddits

**Idea**
- ID, name, one-liner, target user
- Associated cluster IDs
- MVP features array, pricing suggestion
- Moat/advantage description
- Validation steps, risks
- Status: backlog, researching, building, launched
- Notes field

**AlertRule**
- ID, collection ID, keywords array
- Optional theme, cadence (daily/weekly/realtime)
- Enabled status, creation timestamp

**User**
- ID, email, name
- Reddit connection status
- Onboarding completion status
- Preferences (default timeframe, language, goals)

---

## State Management

### AppContext (`src/context/AppContext.tsx`)
Global state management using React Context API:

**State:**
- User authentication state
- Collections array
- Analyses array
- Ideas array
- Sidebar open/closed state
- Global timeframe preference

**Methods:**
- `useApp()` - Access global state
- `useMockLogin()` - Mock authentication helper

### Mock Data (`src/data/mockData.ts`)
Comprehensive mock data for development:
- 10 mock subreddits
- 3 mock collections
- 3 mock analyses with different statuses
- 5 mock problems
- 5 mock clusters (high, medium urgency)
- 3 mock ideas with detailed specifications
- 3 mock sources (Reddit posts)
- 2 mock alert rules
- 1 mock user profile

---

## Styling & Theming

- **Tailwind CSS** with custom configuration
- **CSS Variables** for theming (supports light/dark mode)
- **Custom utility classes** for common patterns
- **Responsive design** with mobile-first approach
- **Animation support** via Tailwind Animate and Framer Motion

### Key Design Patterns
- Card-based layouts
- Consistent spacing system
- Status badges with semantic colors
- Gradient accents
- Hover states and transitions
- Loading states and skeletons

---

## Development Setup

### Prerequisites
- Node.js 20 LTS (specified in `.node-version`)
- npm package manager

### Installation
```bash
npm install
```

### Development
```bash
npm run dev
```
Starts Vite dev server with hot module replacement

### Build
```bash
npm run build
```
Production build output to `dist/` directory

### Preview
```bash
npm run preview
```
Preview production build locally

### Linting
```bash
npm run lint
```
ESLint code quality checks

---

## Deployment Configuration

### Cloudflare Pages Ready
The project is configured for deployment to Cloudflare Pages:

**Build Settings:**
- Build command: `npm run build`
- Output directory: `dist`
- Node version: 20 LTS

**Configuration Files:**
- `wrangler.toml` - Cloudflare Pages config
- `public/_redirects` - SPA routing fallback
- `.npmrc` - npm configuration for Cloudflare compatibility

---

## Current Implementation Status

### ✅ Fully Implemented
- Landing page with full marketing content
- Authentication UI (Sign In/Sign Up pages)
- Dashboard with statistics and charts
- Analysis creation and viewing interface
- Ideas management interface
- Subreddit/collection management UI
- Alerts management UI
- Settings page structure
- Responsive navigation (sidebar + mobile)
- Mock data structure
- TypeScript type definitions
- Routing structure
- UI component library (shadcn/ui)

### ⚠️ Mock/Placeholder (Not Connected to Backend)
- Authentication (currently mock login)
- Data persistence (uses mock data)
- Reddit API integration
- Analysis processing pipeline
- Idea generation logic
- Alert monitoring system
- User preferences persistence

---

## Project Structure

```
pulsepoint-ideas/
├── public/
│   ├── _redirects          # SPA routing
│   ├── favicon.ico
│   └── robots.txt
├── src/
│   ├── components/
│   │   ├── layout/         # AppShell, Sidebar, TopBar, CommandPalette
│   │   ├── ui/             # shadcn/ui component library
│   │   └── NavLink.tsx
│   ├── context/
│   │   └── AppContext.tsx  # Global state management
│   ├── data/
│   │   └── mockData.ts     # Development mock data
│   ├── hooks/
│   │   ├── use-mobile.tsx
│   │   └── use-toast.ts
│   ├── lib/
│   │   └── utils.ts        # Utility functions (cn, etc.)
│   ├── pages/              # All route pages
│   ├── types/
│   │   └── index.ts        # TypeScript type definitions
│   ├── App.tsx             # Root component + routing
│   ├── App.css
│   ├── index.css           # Global styles
│   └── main.tsx            # Entry point
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── vite.config.ts
├── wrangler.toml
└── CLOUDFLARE_DEPLOY.md
```

---

## Key Design Decisions

1. **Mock-First Development**: Extensive mock data structure allows for full UI development without backend dependencies

2. **Type Safety**: Comprehensive TypeScript interfaces ensure type safety across the application

3. **Component Library**: shadcn/ui provides a solid foundation with accessible, customizable components

4. **State Management**: React Context for global state, TanStack Query ready for API integration

5. **Responsive Design**: Mobile-first approach with collapsible sidebar and mobile drawer navigation

6. **Status Tracking**: Multi-stage analysis status system (pending → fetching → cleaning → extracting → clustering → generating → completed)

7. **Urgency Classification**: Three-tier urgency system (low/medium/high) for prioritization

8. **Idea Lifecycle**: Four-stage idea status (backlog → researching → building → launched)

---

## Next Steps for Full Implementation

1. **Backend API Integration**
   - Replace mock data with API calls
   - Implement authentication flow
   - Connect to Reddit API

2. **Analysis Pipeline**
   - Implement data fetching from Reddit
   - Build problem extraction logic
   - Develop clustering algorithm
   - Create idea generation engine

3. **Data Persistence**
   - Database schema design
   - User data storage
   - Analysis results storage
   - Ideas tracking

4. **Real-time Features**
   - WebSocket connection for analysis progress
   - Real-time alert notifications

5. **Enhanced Features**
   - Search and filtering
   - Export functionality
   - Collaboration features
   - Advanced analytics

---

## Notes

- The project name appears as "PulseMine" in the UI but is stored in "pulsepoint-ideas" directory
- Current implementation is frontend-focused with a complete UI
- All data structures are well-defined and ready for backend integration
- The application is production-ready from a UI/UX perspective
- Mock authentication allows for full navigation and feature exploration

---

**Documentation Date**: First Build  
**Version**: 0.0.0  
**Build Type**: Frontend MVP with Mock Data

