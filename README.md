<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/e1ab6e44-88df-4b41-850c-43dfccd06f5d

## Run Locally

**Prerequisites:** Node.js 22+, PostgreSQL 16+, and IfcOpenShell's `IfcConvert` for IFC conversion.


1. Install dependencies:
   `npm install`
2. Copy `.env.example` to `.env.local` and set a least-privilege `DATABASE_URL`.
3. Apply the SQL schema:
   `npm run db:migrate`
4. Set `GEMINI_API_KEY` only if AI features are enabled.
5. Run the app:
   `npm run dev`

## Production requirements

Run the application behind TLS with a managed PostgreSQL database, apply migrations before deployment, and run `IfcConvert` in a sandboxed worker rather than on the web process. The API uses HTTP-only session cookies and requires authentication for project, AI, image-proxy, and IFC routes. Configure `NODE_ENV=production` and use a restricted database account that only has access to this application's schema.
