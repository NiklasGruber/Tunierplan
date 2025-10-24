# 🎉 Turnierplaner - Jetzt mit Shared Data!

## Was wurde geändert?

Ihre Turnierplaner-App wurde erweitert, damit **alle Nutzer die gleichen Daten sehen** können, wenn Sie die App online deployen.

### Neue Struktur:

```
turnierplaner/
├── src/                    # React Frontend (wie vorher)
│   └── App.js             # Jetzt mit API-Anbindung
├── server/                # Neuer Backend Server
│   ├── server.js          # Express API Server
│   ├── package.json       # Backend Dependencies
│   └── start-server.bat   # Einfacher Server-Start
└── .env                   # Konfiguration (API URL)
```

## 🚀 Lokale Entwicklung

### Server starten (Terminal 1):
```bash
cd server
start-server.bat
```
✅ Server läuft auf http://localhost:3001

### React App starten (Terminal 2):
```bash
npm start
```
✅ App läuft auf http://localhost:3000

## 📱 Funktionen

- **Automatisches Speichern**: Änderungen werden nach 1 Sekunde automatisch gespeichert
- **Shared Data**: Alle Nutzer sehen die gleichen Daten
- **Live Updates**: Nach Reload sehen alle die aktuellsten Daten
- **Status-Anzeige**: Grünes Häkchen zeigt erfolgreiche Speicherung

## 🌐 Online Deployment

Siehe `DEPLOYMENT.md` für detaillierte Anweisungen.

### Schnellanleitung:

1. **Backend deployen** (z.B. auf Render.com):
   - Kostenloser Account erstellen
   - GitHub Repository verbinden
   - Root Directory: `server`
   - Deploy → Sie bekommen eine URL (z.B. `https://ihr-backend.onrender.com`)

2. **Frontend deployen** (z.B. auf Vercel):
   - Environment Variable setzen: `REACT_APP_API_URL=https://ihr-backend.onrender.com`
   - Deploy → Fertig!

## 💾 Datenspeicherung

- **Lokal**: Daten werden in `server/tournament-data.json` gespeichert
- **Online**: Bleibt auf dem Server bestehen (automatisch erstellt)
- **Backup**: Die JSON-Datei kann gesichert werden

## 🔧 API Endpunkte

- `GET /api/tournament` - Lade alle Turnierdaten
- `POST /api/tournament` - Speichere alle Turnierdaten
- `PATCH /api/tournament/scores` - Update nur Spielergebnisse

## ⚠️ Wichtig

- `.env` Datei ist bereits erstellt und im `.gitignore`
- Für Production: `.env` anpassen mit echter Backend-URL
- Backend muss laufen, damit die App funktioniert

## 🎯 Nächste Schritte

1. Testen Sie die App lokal (beide Server müssen laufen)
2. Wenn alles funktioniert, deployen Sie nach `DEPLOYMENT.md`
3. Teilen Sie die URL mit allen Teilnehmern!

Jetzt kann jeder von seinem Gerät aus:
- Teams sehen
- Spielplan einsehen
- Ergebnisse eintragen
- Und alle sehen die gleichen Daten! ⚽
