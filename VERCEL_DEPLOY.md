# Vercel Deployment Guide

## Schritt 1: Backend auf Render.com deployen

**Warum erst Backend?** Sie brauchen die Backend-URL für das Frontend.

### 1.1 Account erstellen
- Gehe zu https://render.com
- Klicke "Get Started" und erstelle einen Account (GitHub-Login empfohlen)

### 1.2 Repository vorbereiten
Stelle sicher, dass dein Code auf GitHub gepusht ist:
```bash
git add .
git commit -m "Add backend server for shared data"
git push origin master
```

### 1.3 Backend deployen
1. Bei Render.com: Klicke **"New +"** → **"Web Service"**
2. **Connect Repository**: Wähle dein GitHub Repository `Tunierplan`
3. **Konfiguration**:
   - **Name**: `turnierplaner-backend` (oder beliebig)
   - **Root Directory**: `server`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free` (ausreichend für kleine Turniere)
4. Klicke **"Create Web Service"**
5. ⏳ Warte 2-3 Minuten auf Deployment
6. 📋 **WICHTIG**: Kopiere die URL (z.B. `https://turnierplaner-backend.onrender.com`)

---

## Schritt 2: Frontend auf Vercel deployen

### 2.1 Vercel CLI installieren (optional)
```bash
npm install -g vercel
```

### 2.2 Option A: Deploy via Vercel Website (Empfohlen)

1. **Gehe zu https://vercel.com**
2. Klicke **"Sign Up"** (mit GitHub-Account)
3. Nach Login: Klicke **"Add New..."** → **"Project"**
4. **Import Git Repository**:
   - Wähle `NiklasGruber/Tunierplan`
   - Klicke "Import"
5. **Configure Project**:
   - **Framework Preset**: `Create React App` (automatisch erkannt)
   - **Root Directory**: `./` (default)
   - **Build Command**: `npm run build` (automatisch)
   - **Output Directory**: `build` (automatisch)
6. **Environment Variables** (WICHTIG!):
   - Klicke auf **"Environment Variables"**
   - Füge hinzu:
     ```
     Name:  REACT_APP_API_URL
     Value: https://turnierplaner-backend.onrender.com
     ```
     (Ersetze mit DEINER Backend-URL von Schritt 1.6)
7. Klicke **"Deploy"**
8. ⏳ Warte 2-3 Minuten
9. 🎉 **Fertig!** Du bekommst eine URL wie `https://tunierplan.vercel.app`

### 2.3 Option B: Deploy via CLI

```bash
# Im Hauptverzeichnis (turnierplaner/)
vercel

# Folge den Prompts:
# - Set up and deploy? Yes
# - Which scope? (dein Account)
# - Link to existing project? No
# - What's your project's name? turnierplaner
# - In which directory is your code located? ./
# - Want to override settings? No

# Setze Environment Variable:
vercel env add REACT_APP_API_URL production
# Gib ein: https://turnierplaner-backend.onrender.com

# Neues Deployment mit Environment Variable:
vercel --prod
```

---

## Schritt 3: Testen

1. Öffne deine Vercel-URL (z.B. `https://tunierplan.vercel.app`)
2. Füge Teams hinzu
3. Öffne die URL in einem anderen Browser/Incognito-Tab
4. ✅ Beide sollten die gleichen Daten sehen!

---

## Schritt 4: Domain konfigurieren (Optional)

### Bei Vercel:
1. Gehe zu deinem Project → **"Settings"** → **"Domains"**
2. Füge deine eigene Domain hinzu (z.B. `turnier.meinedomain.de`)
3. Folge den DNS-Anweisungen

---

## Troubleshooting

### Problem: "Failed to fetch" Fehler
**Lösung**: 
- Überprüfe, ob Backend läuft: Öffne `https://dein-backend.onrender.com/api/tournament`
- Sollte JSON zurückgeben
- Überprüfe `REACT_APP_API_URL` in Vercel Einstellungen

### Problem: Backend antwortet nicht
**Lösung**: 
- Render Free Tier schläft nach 15 Minuten Inaktivität
- Erster Request weckt es auf (dauert ~30 Sekunden)
- Upgrade auf Paid Tier ($7/Monat) verhindert Sleep

### Problem: Änderungen nicht sichtbar
**Lösung**:
1. Pushe Code zu GitHub:
   ```bash
   git add .
   git commit -m "Update"
   git push
   ```
2. Vercel deployed automatisch bei jedem Push!

### Problem: Environment Variable ändern
**Lösung**:
1. Vercel Dashboard → dein Project → **"Settings"** → **"Environment Variables"**
2. Ändere `REACT_APP_API_URL`
3. Gehe zu **"Deployments"** → neuestes Deployment → **"..."** → **"Redeploy"**

---

## Kosten

- ✅ **Vercel**: Komplett kostenlos (100 GB Bandbreite/Monat)
- ✅ **Render**: Kostenlos mit Einschränkungen (schläft nach 15 Min)
- 💰 **Render Paid**: $7/Monat für 24/7 Betrieb

---

## Nächste Schritte

1. ✅ Teile deine Vercel-URL mit allen Teilnehmern
2. 📱 URL funktioniert auf jedem Gerät (Handy, Tablet, PC)
3. ⚽ Alle können Ergebnisse live eintragen!

**Deine App ist jetzt live! 🎉**
