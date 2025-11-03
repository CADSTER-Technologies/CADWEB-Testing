# Cadster Technologies - CAD/PLM Automation Platform

## Overview

Cadster Technologies is a modern web application showcasing CAD/PLM automation services, featuring an immersive 3D experience. The platform serves as a marketing and portfolio website for an engineering design automation company, highlighting services in CAD customization, 3D visualization, AR/VR solutions, and PLM integration.

The application uses a full-stack TypeScript architecture with React for interactive 3D visualizations and Express for backend services.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**React SPA with 3D Graphics**
- **Framework**: React 18 with TypeScript, built using Vite for fast development and optimized production builds
- **3D Rendering**: React Three Fiber (@react-three/fiber) provides a React interface to Three.js for WebGL-based 3D graphics
- **3D Utilities**: @react-three/drei for common 3D helpers, @react-three/postprocessing for visual effects
- **Animation**: Framer Motion for smooth UI animations and transitions
- **Styling**: Tailwind CSS with custom theme configuration for dark navy/cyan/purple color scheme
- **Component Library**: Radix UI primitives for accessible, unstyled base components (dialogs, accordions, menus, etc.)
- **Fonts**: Custom fonts (Orbitron, Poppins, Inter) loaded via Google Fonts for brand consistency

**State Management**
- **Client State**: Zustand for lightweight state management (game phases, audio controls)
- **Server State**: TanStack Query (React Query) for API data fetching, caching, and synchronization
- **Form Handling**: React Hook Form with Zod schema validation

**Component Structure**
- Sections: HeroSection, AboutSection, ServicesSection, PortfolioSection, TechnologySection, TestimonialsSection, ContactSection
- Each section incorporates interactive 3D elements (wireframes, particles, holograms) using Three.js
- Shared UI components in `/client/src/components/ui` following shadcn/ui patterns

### Backend Architecture

**Express.js Server**
- **Runtime**: Node.js with TypeScript, using ES modules
- **Framework**: Express.js for HTTP server and routing
- **Development Mode**: Vite middleware integration for HMR (Hot Module Replacement)
- **Production Mode**: Pre-built static assets served from Express
- **Build Process**: esbuild bundles server code, Vite builds client assets

**API Design**
- RESTful API endpoints prefixed with `/api`
- Request/response logging middleware for development debugging
- Error handling middleware for consistent error responses

**Storage Layer**
- **Interface**: IStorage interface defines CRUD operations for data persistence
- **Default Implementation**: MemStorage provides in-memory storage for development
- **Schema**: Shared schema definitions in `/shared/schema.ts` using Drizzle ORM types
- **Database Ready**: Configured for PostgreSQL via Drizzle ORM (schema defines users table)

### Data Storage Solutions

**Drizzle ORM Configuration**
- **Database**: PostgreSQL (via Neon serverless driver)
- **Schema Definition**: Type-safe schema in `/shared/schema.ts`
- **Migrations**: Auto-generated migrations stored in `/migrations` directory
- **Schema Push**: `npm run db:push` command for schema synchronization
- **Type Safety**: Zod integration for runtime validation, TypeScript inference for compile-time safety

**Current Schema**
- Users table with id (serial primary key), username (unique text), password (text)
- InsertUser and User types derived from schema for type-safe operations

**Storage Abstraction**
- IStorage interface allows swapping between in-memory and database implementations
- Currently using MemStorage for rapid prototyping
- Database implementation ready to replace MemStorage when needed

### Authentication and Authorization

**Planned Authentication**
- Session-based authentication using express-session
- Session store configured for PostgreSQL (connect-pg-simple dependency present)
- User schema includes username/password fields for credential storage
- Authorization mechanisms not yet implemented but infrastructure present

### External Dependencies

**CAD/PLM Technologies** (referenced in UI, not integrated)
- SolidWorks, PTC Windchill (mentioned in portfolio/services sections)
- Unity, Unreal Engine (for 3D visualization/AR/VR)
- WebGL for browser-based 3D rendering

**Database Service**
- Neon serverless PostgreSQL (@neondatabase/serverless)
- Requires DATABASE_URL environment variable for connection

**Development Tools**
- Vite plugin for runtime error overlay (@replit/vite-plugin-runtime-error-modal)
- GLSL shader support (vite-plugin-glsl) for custom 3D shaders
- TypeScript for type safety across the stack

**UI Component Libraries**
- Radix UI for accessible component primitives (30+ components)
- Lucide React for icons
- React Icons for additional icon sets (FiMail, FaLinkedin, etc.)

**3D Graphics Stack**
- Three.js (via React Three Fiber) for WebGL rendering
- GLSL shaders for custom visual effects
- Post-processing effects for bloom, depth-of-field, etc.

**Build and Development**
- Vite for frontend tooling and dev server
- esbuild for server bundling
- tsx for running TypeScript directly in development
- PostCSS with Tailwind for CSS processing

**Utilities**
- date-fns for date manipulation
- nanoid for unique ID generation
- clsx and tailwind-merge for className utilities
- class-variance-authority for variant-based component styling