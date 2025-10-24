# Turnierplaner - Deployment Guide

## Lokale Entwicklung

### Backend Server starten:
```bash
cd server
npm install
npm start
```
Der Server läuft auf http://localhost:3001

### Frontend starten:
```bash
npm install
npm start
```
Die App läuft auf http://localhost:3000

## Deployment (Online)

### Option 1: Render.com (Kostenlos & Einfach)

#### Backend deployen:
1. Gehe zu https://render.com und erstelle einen Account
2. Klicke auf "New +" → "Web Service"
3. Verbinde dein GitHub Repository
4. Einstellungen:
   - **Root Directory**: `server`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Environment**: Node
5. Klicke "Create Web Service"
6. Notiere die URL (z.B. `https://turnierplaner-backend.onrender.com`)

#### Frontend deployen:
1. Erstelle eine `.env` Datei im Root-Verzeichnis:
   ```
   REACT_APP_API_URL=https://deine-backend-url.onrender.com
   ```
2. Bei Render.com: "New +" → "Static Site"
3. Verbinde das gleiche Repository
4. Einstellungen:
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `build`
   - **Environment Variables**: `REACT_APP_API_URL` = deine Backend-URL
5. Klicke "Create Static Site"

### Option 2: Vercel (Frontend) + Railway (Backend)

#### Backend auf Railway:
1. Gehe zu https://railway.app
2. "New Project" → "Deploy from GitHub repo"
3. Wähle dein Repository
4. **Root Directory**: `server`
5. Railway erkennt automatisch Node.js
6. Notiere die generierte URL

#### Frontend auf Vercel:
1. Gehe zu https://vercel.com
2. "Add New..." → "Project"
3. Importiere dein GitHub Repository
4. **Environment Variables**: 
   - Key: `REACT_APP_API_URL`
   - Value: Deine Railway Backend-URL
5. Deploy!

### Option 3: Alles auf einem Server (z.B. DigitalOcean/Hetzner)

1. Server mit Node.js aufsetzen
2. Backend und Frontend Code hochladen
3. Backend starten: `cd server && npm install && npm start`
4. Frontend bauen: `npm install && npm run build`
5. Nginx konfigurieren um `build/` zu servieren
6. PM2 verwenden um Backend am Laufen zu halten

## Wichtig nach Deployment

- Stelle sicher, dass die `REACT_APP_API_URL` in der `.env` auf deine echte Backend-URL zeigt
- Das Backend muss CORS für deine Frontend-Domain erlauben (ist bereits konfiguriert)
- Die Datei `tournament-data.json` wird automatisch auf dem Server erstellt

## Daten teilen

Nach dem Deployment:
- Alle Nutzer greifen auf dieselben Daten zu
- Änderungen werden automatisch gespeichert (mit 1 Sekunde Verzögerung)
- Seite neu laden zeigt die aktuellen Daten für alle
