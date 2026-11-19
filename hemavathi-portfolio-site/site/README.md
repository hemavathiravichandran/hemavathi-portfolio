# Hemavathi R – Portfolio (frontend + backend)
Run: `node server.js` (Node 18+), open http://localhost:3000
- Frontend: public/index.html (3D viewer, projects, contact form)
- Backend: server.js (no packages needed)
  - GET /api/content – projects and achievements from data.json
  - POST /api/contact – saves messages to messages.json
  - GET /api/messages?key=YOUR_KEY – read messages (set ADMIN_KEY env var first)
- Edit projects/achievements in data.json. Put your real 3D files (GLB) in public/.


## Deploy (Render)
Push this folder to GitHub, then Render > New Web Service > connect repo. Build command: leave empty. Start command: node server.js. Set ADMIN_KEY in Environment.
