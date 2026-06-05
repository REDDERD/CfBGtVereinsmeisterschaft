# Manuelle Schritte für jede Dev-Session:

## Terminal 1 - Emulator starten (bleibt offen):
firebase emulators:start

## Terminal 2: warten bis Emulator bereit ist (Port 4000 erreichbar), dann Prod-Daten laden
cd scripts<br>
$env:FIREBASE_SERVICE_ACCOUNT = (Get-Content key.json -Raw)<br>
node clone-prod-to-emulator.js<br>
Danach: index.html per VS Code Live Server öffnen.