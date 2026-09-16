# Lora Edge

**Lora Edge** is an integrated architectural design, BIM intelligence, and building-performance platform. It brings conceptual planning, 2D drafting, 3D model exploration, sustainability analysis, documentation, and client-ready visualization into one professional workspace.

The platform is designed for architects, developers, engineers, and project teams who need to move from early spatial ideas to informed design decisions without losing the context of the building model.

## Platform capabilities

### Design and documentation

- **2D CAD workspace** for architectural plans, walls, rooms, doors, windows, dimensions, annotations, furniture, and lightweight drafting geometry.
- **Native drafting tools** for lines, polylines, circles, arcs, rectangles, polygons, ellipses, splines, points, hatches, rays, and construction lines.
- **CAD-style productivity controls** including command input, snapping, grid control, selection, move, copy, duplicate, delete, undo/redo, levels, and layer-oriented workflows.
- **Documentation studio** for construction-oriented drawing sheets and presentation outputs.

### BIM and 3D visualization

- **Interactive Three.js BIM viewer** with orbit, walkthrough, axonometric, top, interior, and exterior camera views.
- **3D modeling palette** for conceptual BOX, CYLINDER, CONE, SPHERE, TORUS, WEDGE, and PYRAMID primitives.
- **Visual inspection modes** including realistic, conceptual, wireframe, and X-ray views.
- **Spatial analysis controls** for storey isolation, section cuts, exploded BIM views, furniture/site visibility, and IFC import.
- **Visualization workflows** with real-time weather, sun and shadow studies, lighting scenarios, high-resolution snapshots, and AI-assisted rendering.

### Building intelligence and performance

- **Building Intelligence Studio** for live project insights and design review.
- **Sustainability Studio** for carbon- and performance-oriented design workflows.
- **Daylight and solar analysis** to support early environmental decisions.
- **Living Digital Twin Studio** for operational context, material passports, risk-oriented information, and connected building data.
- **Developer Intelligence Studio** for feasibility and development-oriented decision support.

### Collaboration and project operations

- Project creation, sample-project workflows, client presentation mode, design alternatives, and review tooling.
- Authenticated project APIs backed by PostgreSQL, with versioned project persistence and audit events.
- IFC-to-GLB conversion endpoint for server-side BIM ingestion when IfcOpenShell is configured.

## Workspace map

| Workspace | Primary purpose |
| --- | --- |
| **2D CAD** | Plan creation, drafting, annotation, dimensions, and spatial editing. |
| **3D BIM** | Model exploration, sectioning, sun studies, conceptual solids, and IFC viewing. |
| **Building Intelligence** | Design evaluation, project metrics, and decision support. |
| **Developer Intelligence** | Development and feasibility-focused insights. |
| **Sustainability** | Environmental performance and sustainability workflows. |
| **Render** | AI-assisted architectural visualization. |
| **Documents** | Drawing sheets and construction documentation. |
| **Digital Twin** | Operational, material, and connected-building information. |

## Technology

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS, Motion, Lucide.
- **3D:** Three.js.
- **Backend:** Express and TypeScript.
- **Data:** PostgreSQL with SQL migrations.
- **AI integrations:** Google GenAI, configured only when an API key is supplied.
- **BIM interchange:** IFC conversion through IfcOpenShell's `IfcConvert`.

## Getting started

### Prerequisites

- Node.js 22 or later
- PostgreSQL 16 or later
- `IfcConvert` from IfcOpenShell for IFC conversion features

### Local setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a local environment file from the template:

   ```bash
   cp .env.example .env
   ```

3. Set a least-privilege PostgreSQL connection string in `DATABASE_URL`.

4. Apply database migrations:

   ```bash
   npm run db:migrate
   ```

5. Optionally configure `GEMINI_API_KEY` to enable server-side AI capabilities.

6. Start the development server:

   ```bash
   npm run dev
   ```

The application listens on `http://localhost:3000` by default.

## Available scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the development server. |
| `npm run build` | Create the production frontend bundle and server bundle. |
| `npm run start` | Run the production server bundle. |
| `npm run lint` | Run the TypeScript type check. |
| `npm run db:migrate` | Apply PostgreSQL migrations. |
| `npm run clean` | Remove generated build artifacts. |

## Configuration

| Variable | Required | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | Yes for database-backed server features | PostgreSQL connection string. |
| `NODE_ENV` | Recommended | Set to `production` for production deployment safeguards. |
| `SESSION_COOKIE_NAME` | No | Overrides the default `lora_session` cookie name. |
| `SESSION_TTL_DAYS` | No | Overrides the default 14-day session lifetime. |
| `GEMINI_API_KEY` | No | Enables Google GenAI-backed capabilities. |

## Production considerations

Deploy Lora Edge behind TLS and use a managed PostgreSQL instance with a restricted application database role. Apply migrations before serving traffic. Configure IFC conversion in an isolated worker or service rather than the web process, and retain the existing authenticated API boundary for project, AI, image-proxy, and IFC operations.

## Repository structure

```text
src/            React application, workspaces, services, and design data
src/components/  2D CAD, 3D viewer, studios, dialogs, and user interfaces
src/services/    Analysis, BIM import, AI, export, and simulation services
server/          Express configuration, database, authentication, and IFC support
db/              Migration runner and PostgreSQL schema migrations
public/          Static public assets
```

## License and status

This repository is an active product codebase. Before deploying, review authentication, database, IFC worker isolation, AI-provider configuration, and your organization’s security and compliance requirements.
