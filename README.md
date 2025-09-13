# Multi-Tenant SaaS Notes Application

## Overview
A full-stack notes app supporting multiple tenants (Acme, Globex) with strict data isolation, role-based access, and subscription gating. Built for Vercel deployment using MongoDB, Node.js (Express), and React.

## Multi-Tenancy Approach
- **Shared schema**: All collections include a `tenantId` field.
- All queries filter by `tenantId` to enforce isolation.

## Backend
- Node.js (Express), MongoDB
- JWT authentication
- Roles: Admin (invite/upgrade), Member (CRUD notes)
- Subscription plans: Free (max 3 notes), Pro (unlimited)
- Endpoints:
  - `POST /notes`, `GET /notes`, `GET /notes/:id`, `PUT /notes/:id`, `DELETE /notes/:id`
  - `POST /tenants/:slug/upgrade` (Admin only)
  - `GET /health` (returns `{ "status": "ok" }`)
- CORS enabled
- Seeded test accounts (password: `password`):
  - admin@acme.test (Admin, Acme)
  - user@acme.test (Member, Acme)
  - admin@globex.test (Admin, Globex)
  - user@globex.test (Member, Globex)

## Frontend
- React app
- Login, list/create/delete notes
- Shows "Upgrade to Pro" when Free plan limit reached

## Deployment
- Ready for Vercel (frontend & backend)

## Setup
1. Configure MongoDB connection in backend.
2. Deploy backend and frontend to Vercel.
3. Use seeded accounts for testing.

## File Structure
- `/backend` - Express API
- `/frontend` - React app
- `/README.md` - Project documentation
