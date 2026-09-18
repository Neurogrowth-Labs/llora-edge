# LORA Edge - Feature Roadmap

> Essential features needed to make LORA Edge a usable BIM/CAD platform, organized from easiest to most challenging.

---

## Phase 0: CAD/BIM Drawing Core (Critical)

### 0.1 2D Drawing Tools ✅ (Existing)
- [x] Wall drawing tool with snapping
- [x] Room/space creation
- [x] Door placement on walls
- [x] Window placement on walls
- [x] Furniture placement from library
- [x] Grid snapping system
- [x] Dimension display
- [x] Level/floor management

### 0.2 2D Drawing Enhancements
- [ ] Polyline/polygon drawing tool
- [ ] Arc/curve wall support
- [ ] Freeform shape drawing
- [ ] Text annotations on drawings
- [ ] Dimension lines (manual)
- [ ] Leader lines and callouts
- [ ] Hatch patterns for materials
- [ ] Layer management (visibility, lock, color)
- [ ] Drawing templates/blocks
- [ ] Copy/paste between levels

### 0.3 3D Modeling ✅ (Existing)
- [x] Auto-generate 3D from 2D floor plan
- [x] Wall extrusion with height
- [x] Door/window openings in walls
- [x] Floor slab generation
- [x] Roof generation (basic)
- [x] Furniture 3D placement
- [x] Tree/landscape elements
- [x] Camera controls (orbit, pan, zoom)

### 0.4 3D Enhancements
- [ ] Custom wall heights per segment
- [ ] Sloped roofs with pitch control
- [ ] Curved walls in 3D
- [ ] Stairs and ramps
- [ ] Railings and balustrades
- [ ] Column/beam structural elements
- [ ] Custom 3D object import (GLTF/GLB)
- [ ] Material assignment per surface
- [ ] Section cuts and elevations
- [ ] 3D annotation/markup

### 0.5 Site & Context
- [x] Site boundary definition
- [x] North orientation
- [x] Sun path visualization
- [ ] Topography/terrain modeling
- [ ] Neighboring buildings context
- [ ] Street/road layout
- [ ] Landscape elements (trees, shrubs)
- [ ] Water features
- [ ] Parking layout tools

### 0.6 BIM Data & Properties
- [x] Room properties (name, type, area)
- [x] Wall properties (type, thickness, material)
- [x] Door/window properties (size, type)
- [ ] Custom property fields
- [ ] Property templates per element type
- [ ] Room schedules/tables
- [ ] Door/window schedules
- [ ] Area calculations by type
- [ ] Cost estimation integration
- [ ] Specification linking

### 0.7 Drawing Standards
- [ ] Line weights/styles configuration
- [ ] Scale settings (1:50, 1:100, etc.)
- [ ] Drawing sheet layouts
- [ ] Title block templates
- [ ] Viewport management
- [ ] Print/plot styles
- [ ] CAD standards checker

---

## Phase 1: Core User Management (Easy) ✅ COMPLETED

### 1.1 User Profile ✅
- [x] Add user profile page (ProfileSettingsModal)
- [x] Allow updating display name and studio name
- [ ] Add avatar upload functionality (UI ready, storage pending)
- [x] Show account creation date and last login

### 1.2 Email Verification
- [ ] Send verification email on registration
- [x] Add `/api/auth/verify/:token` endpoint (backend ready)
- [ ] Show "verify your email" banner until verified
- [x] Resend verification email option (backend ready)

### 1.3 Password Management ✅
- [x] Add "Forgot password" link on login page (shows feature toast)
- [x] Backend: password reset email with secure token (1hr expiry)
- [x] Add "Change password" in settings (ProfileSettingsModal > Account)
- [ ] Show password strength indicator on forms

### 1.4 Session Management ✅
- [x] Show list of active sessions in settings
- [x] Allow revoking other sessions ("Sign out all other sessions")
- [x] Show device/browser info for each session
- [x] Auto-expire inactive sessions (backend)

---

## Phase 2: Project Management (Easy) ✅ BACKEND COMPLETED

### 2.1 Project Organization ✅
- [x] Add project folders/categories (database + API)
- [ ] Implement project search by name (UI pending)
- [ ] Add project sorting (name, date created, last modified) (UI pending)
- [ ] Show project thumbnails/previews
- [x] Add "Favorite/Star" projects (backend ready)

### 2.2 Project Actions ✅
- [x] Duplicate project functionality (backend ready)
- [x] Move project to folder (backend ready)
- [x] Project archive (hide without deleting) (backend ready)
- [x] Restore deleted projects (backend ready)
- [ ] Bulk actions (delete multiple, move multiple)

### 2.3 Project Metadata ✅
- [x] Add project description field (database ready)
- [x] Add project tags/labels (database ready)
- [ ] Show project statistics (rooms, area, last edit)
- [x] Add project cover image field (database ready)

---

## Phase 3: File Storage & Export (Easy-Medium)

### 3.1 File Storage
- [ ] Set up cloud storage (S3/Cloudflare R2/Supabase Storage)
- [x] Database schema for project files ready
- [ ] Implement storage quota per user (e.g., 1GB free)
- [ ] Show storage usage in settings

### 3.2 Project Files
- [ ] Attach reference files to projects (images, PDFs)
- [ ] File browser within project
- [ ] Download attached files
- [ ] Delete/replace attached files

### 3.3 Export Options
- [ ] Export project as JSON (backup)
- [ ] Export project as IFC (complete geometry)
- [ ] Export 2D drawings as DXF/DWG
- [ ] Export screenshots as PNG/PDF
- [ ] Export all project data as ZIP

### 3.4 Import
- [ ] Import project from JSON backup
- [x] Import IFC files into new project (conversion ready)
- [ ] Import DXF as reference underlay

---

## Phase 4: Sharing & Visibility (Medium)

### 4.1 Project Visibility ✅ (Schema Ready)
- [x] Add visibility setting: Private (default) / Public / Unlisted (database)
- [ ] Public projects viewable without login (read-only)
- [ ] Public project gallery/explore page
- [ ] SEO-friendly URLs for public projects (`/p/:slug`)

### 4.2 Share Links ✅ (Schema Ready)
- [x] Database schema for shareable links
- [x] Link settings: view-only or edit access (permission field)
- [x] Optional password protection for links (password_hash field)
- [x] Link expiration date option (expires_at field)
- [ ] API endpoints for share link management
- [ ] UI for generating/managing share links

### 4.3 Direct Sharing ✅ (Schema Ready)
- [x] Share project with specific users (project_shares table)
- [x] Permission levels: Viewer, Editor, Admin
- [ ] Show collaborators list on project (UI)
- [ ] Remove collaborator access (UI)
- [ ] Transfer project ownership

### 4.4 Sharing UI
- [ ] "Share" button in project header
- [ ] Share modal with all options
- [ ] Copy link to clipboard
- [ ] Email invitation sending

---

## Phase 5: Collaboration (Medium-Hard)

### 5.1 Comments & Annotations ✅ (Schema Ready)
- [x] Database schema for comments with 3D positions
- [x] Comment threads with replies (parent_id)
- [x] Resolve/unresolve comments (is_resolved field)
- [ ] @mention users in comments
- [ ] Comment notifications

### 5.2 Activity Feed
- [x] Audit events table for tracking changes
- [ ] Show recent changes per project
- [ ] "Who edited what and when"
- [ ] Filter activity by user or action type
- [ ] Activity notifications

### 5.3 Version History ✅ (Schema Ready)
- [x] Database schema for project versions
- [ ] Auto-save project versions (every N minutes)
- [ ] Manual "Save version" with description
- [ ] View list of past versions
- [ ] Preview previous version
- [ ] Restore previous version

### 5.4 Real-time Collaboration (Advanced)
- [ ] See who's currently viewing the project
- [ ] Real-time cursor positions
- [ ] Live updates when others make changes
- [ ] Conflict resolution for simultaneous edits

---

## Phase 6: Notifications & Communication (Medium) ✅ (Schema Ready)

### 6.1 In-App Notifications
- [x] Database schema for notifications
- [ ] Notification bell icon in header
- [ ] Notification list/dropdown
- [ ] Mark as read/unread
- [ ] Clear all notifications

### 6.2 Email Notifications
- [ ] Email when someone shares a project with you
- [ ] Email when someone comments on your project
- [ ] Email for @mentions
- [ ] Weekly digest of activity (optional)

### 6.3 Notification Settings
- [x] UI for notification preferences (ProfileSettingsModal)
- [ ] Per-notification-type email preferences (backend)
- [ ] Mute specific projects
- [ ] Do not disturb hours

---

## Phase 7: Teams & Organizations (Hard)

### 7.1 Team Management
- [ ] Create team/organization
- [ ] Invite members by email
- [ ] Team roles: Owner, Admin, Member
- [ ] Remove team members
- [ ] Team settings page

### 7.2 Team Projects
- [ ] Create projects under team
- [ ] Team project visibility (all members can see)
- [ ] Team folders/organization
- [ ] Team storage quota (shared)

### 7.3 Team Billing (if applicable)
- [ ] Team subscription plans
- [ ] Add/remove seats
- [ ] Billing history
- [ ] Invoice generation

---

## Phase 8: Admin & Moderation (Hard)

### 8.1 User Management (for public platform)
- [ ] Admin dashboard
- [ ] View all users
- [ ] Suspend/ban users
- [ ] Reset user passwords
- [ ] View user activity

### 8.2 Content Moderation
- [ ] Report inappropriate content
- [ ] Review reported projects
- [ ] Take down violating content
- [ ] Send warnings to users

### 8.3 Analytics
- [ ] User signup/activity metrics
- [ ] Project creation stats
- [ ] Storage usage overview
- [ ] API usage tracking

---

## Implementation Status

| Component | Status | Notes |
|-----------|--------|-------|
| **Database Schema** | ✅ Complete | Prisma + PostgreSQL (Supabase) |
| **User Profile API** | ✅ Complete | GET/PUT /api/user/profile |
| **Password Change API** | ✅ Complete | PUT /api/user/password |
| **Session Management API** | ✅ Complete | GET/DELETE /api/auth/sessions |
| **Folders API** | ✅ Complete | Full CRUD |
| **Project Actions API** | ✅ Complete | duplicate, archive, restore, favorite |
| **Profile Settings UI** | ✅ Complete | ProfileSettingsModal component |
| **Toast Notifications** | ✅ Complete | ToastProvider + useToast hook |
| **Email Verification** | ⏳ Backend Only | Frontend banner pending |
| **Password Reset** | ⏳ Backend Only | Email sending pending |
| **Sharing APIs** | 📋 Schema Only | API endpoints pending |
| **Comments APIs** | 📋 Schema Only | API endpoints pending |
| **File Storage** | 📋 Schema Only | Storage provider pending |

---

## Priority Matrix

| Priority | Feature | Impact | Effort | Status |
|----------|---------|--------|--------|--------|
| **P0** | User profile page | High | Low | ✅ Done |
| **P0** | Session management | High | Low | ✅ Done |
| **P0** | Password change | High | Low | ✅ Done |
| **P0** | Email verification | High | Low | ⏳ Backend only |
| **P0** | Password reset | High | Low | ⏳ Backend only |
| **P1** | Project folders & search | High | Low | ✅ Backend done |
| **P1** | Project duplicate/archive | Medium | Low | ✅ Backend done |
| **P1** | File storage setup | High | Medium | 📋 Pending |
| **P2** | Public/Private visibility | High | Medium | ✅ Schema done |
| **P2** | Shareable links | High | Medium | ✅ Schema done |
| **P2** | Direct user sharing | High | Medium | ✅ Schema done |
| **P3** | Comments & annotations | Medium | Medium | ✅ Schema done |
| **P3** | Version history | High | Medium | ✅ Schema done |
| **P3** | Activity feed | Medium | Medium | ✅ Schema done |
| **P4** | Real-time collaboration | High | Hard | 📋 Pending |
| **P4** | Teams/Organizations | Medium | Hard | 📋 Pending |

---

## Phase 9: IFC & Interoperability (Medium-Hard)

### 9.1 IFC Import ✅ (Partial)
- [x] IFC file upload
- [x] IFC to GLB conversion (web-ifc)
- [ ] Parse IFC geometry to editable elements
- [ ] Extract IFC properties/attributes
- [ ] Map IFC types to internal types
- [ ] Preserve IFC hierarchy (IfcBuilding, IfcStorey)
- [ ] Handle large IFC files (streaming)

### 9.2 IFC Export
- [ ] Export project as IFC 2x3
- [ ] Export project as IFC 4
- [ ] Include all geometry (walls, doors, windows)
- [ ] Include BIM properties
- [ ] Include room/space data
- [ ] Valid IFC schema compliance
- [ ] MVD (Model View Definition) support

### 9.3 Other Formats
- [ ] DXF/DWG export (2D drawings)
- [ ] DXF import as underlay
- [ ] PDF export (drawings)
- [ ] GLTF/GLB export (3D model)
- [ ] FBX export (for rendering software)
- [ ] Revit (.rvt) import (via IFC)
- [ ] SketchUp (.skp) import

### 9.4 BIM Collaboration
- [ ] BCF (BIM Collaboration Format) support
- [ ] Issue tracking with BCF
- [ ] Clash detection (basic)
- [ ] Model comparison (diff)
- [ ] Federated model viewing

---

## Phase 10: AI & Intelligence Features (Medium-Hard)

### 10.1 AI Copilot ✅ (Existing)
- [x] Natural language commands
- [x] AI-assisted design suggestions
- [x] Spatial analysis queries
- [x] Design DNA preferences

### 10.2 AI Enhancements
- [ ] Auto-generate floor plans from brief
- [ ] Room layout optimization
- [ ] Furniture auto-placement
- [ ] Circulation analysis
- [ ] Accessibility compliance check
- [ ] Energy performance prediction
- [ ] Cost estimation from AI
- [ ] Design style transfer

### 10.3 Sustainability Analysis ✅ (Partial)
- [x] Building intelligence score
- [x] Sun path/solar analysis
- [x] Weather simulation
- [ ] Energy modeling (EnergyPlus integration)
- [ ] Daylight analysis (Radiance)
- [ ] Thermal comfort prediction
- [ ] Carbon footprint calculation
- [ ] LEED/BREEAM checklist

### 10.4 Visualization & Rendering
- [x] Real-time 3D preview
- [x] Material preview
- [x] Time-of-day lighting
- [ ] Path-traced rendering
- [ ] VR/AR export
- [ ] 360° panorama export
- [ ] Video walkthrough generation
- [ ] AI upscaling for renders

---

## Database Schema ✅ IMPLEMENTED

All tables have been created via Prisma migrations:

```
✅ users              - User accounts with soft delete
✅ sessions           - Session management with device info
✅ password_reset_tokens - Secure password reset
✅ email_verify_tokens   - Email verification
✅ folders            - Project organization
✅ projects           - Core projects with metadata
✅ project_versions   - Version history
✅ project_shares     - Sharing with users/links
✅ project_files      - File attachments
✅ comments           - 3D positioned comments
✅ notifications      - In-app notifications
✅ audit_events       - Activity tracking
```

---

## API Endpoints ✅ IMPLEMENTED

### User Management
```
✅ GET    /api/user/profile
✅ PUT    /api/user/profile
✅ PUT    /api/user/password
📋 POST   /api/user/avatar (pending file storage)
```

### Authentication
```
✅ POST   /api/auth/register
✅ POST   /api/auth/login
✅ POST   /api/auth/logout
✅ GET    /api/auth/me
✅ POST   /api/auth/forgot-password
✅ POST   /api/auth/reset-password
✅ GET    /api/auth/verify-email
✅ POST   /api/auth/resend-verification
✅ GET    /api/auth/sessions
✅ DELETE /api/auth/sessions/:id
✅ POST   /api/auth/sessions/revoke-all
```

### Project Management
```
✅ GET    /api/projects
✅ GET    /api/projects/:id
✅ POST   /api/projects
✅ PUT    /api/projects/:id
✅ DELETE /api/projects/:id
✅ POST   /api/projects/:id/duplicate
✅ POST   /api/projects/:id/archive
✅ POST   /api/projects/:id/restore
✅ POST   /api/projects/:id/favorite
```

### Folders
```
✅ GET    /api/folders
✅ POST   /api/folders
✅ PUT    /api/folders/:id
✅ DELETE /api/folders/:id
```

### Pending APIs
```
📋 GET    /api/projects/:id/shares
📋 POST   /api/projects/:id/shares
📋 DELETE /api/projects/:id/shares/:shareId
📋 GET    /api/projects/:id/comments
📋 POST   /api/projects/:id/comments
📋 GET    /api/projects/:id/versions
📋 POST   /api/projects/:id/versions
📋 GET    /api/notifications
📋 PUT    /api/notifications/:id/read
```

---

## Quick Start: MVP Features

For a minimum viable product:

1. [x] Basic auth (login/register)
2. [x] User profile management
3. [x] Session management
4. [x] Password change
5. [x] Project CRUD with metadata
6. [x] Project folders
7. [x] Project actions (duplicate, archive, favorite)
8. [ ] Email verification (frontend banner)
9. [ ] Password reset (email sending)
10. [ ] Public/Private toggle (UI)
11. [ ] Shareable view-only links (UI)
12. [ ] Basic file storage (project exports)

---

*Last updated: September 2026*
