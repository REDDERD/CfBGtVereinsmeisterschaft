# Badminton Vereinsmeisterschaft - Projektstruktur

## Übersicht

Die ursprüngliche `index.html` (3765 Zeilen) wurde in folgende modulare Struktur aufgeteilt:

```
badminton-app/
├── index.html                    # Haupt-HTML (lädt alle Scripts)
└── js/
    ├── config/
    │   └── firebase.js           # Firebase Konfiguration & Init
    │
    ├── state.js                  # Zentrales State-Objekt
    │
    ├── utils/                    # Hilfsfunktionen
    │   ├── icons.js              # SVG Icons
    │   ├── helpers.js            # getPlayerName, updateMatchEntry etc.
    │   ├── validation.js         # Satz-Validierung
    │   ├── calculations.js       # Tabellen-Berechnungen
    │   └── pyramid.js            # Pyramiden-Hilfsfunktionen
    │
    ├── services/                 # Firebase & Business Logic
    │   ├── firebase-listeners.js # Realtime Listeners, loadPyramid
    │   ├── player-service.js     # Spieler CRUD
    │   ├── match-service.js      # Einzel & Doppel Spiele
    │   ├── challenge-service.js  # Herausforderungen
    │   ├── knockout-service.js   # K.O.-Phase Logik
    │   └── export-service.js     # Excel Export
    │
    ├── components/               # Wiederverwendbare UI-Komponenten
    │   ├── Navigation.js         # Haupt-Navigation
    │   ├── GroupTable.js         # Gruppen-Tabellen
    │   ├── KnockoutBracket.js    # K.O.-Bracket & Modal
    │   └── MatchEntry.js         # Spieleingabe-Formulare
    │
    ├── pages/                    # Seiten-Komponenten
    │   ├── HomePage.js           # Startseite
    │   ├── SinglesPage.js        # Einzel-Turnier
    │   ├── DoublesPage.js        # Doppel-Pyramide
    │   ├── ChallengesPage.js     # Herausforderungen
    │   ├── PlayersPage.js        # Spieler-Übersicht
    │   ├── PlayerProfilePage.js  # Spieler-Profil
    │   └── AdminPage.js          # Admin mit allen Tabs
    │
    ├── events.js                 # Event Handler (Navigation, Search etc.)
    ├── render.js                 # Haupt-Render-Funktion
    └── app.js                    # App-Initialisierung
```

## Lade-Reihenfolge (wichtig!)

Die Scripts müssen in dieser Reihenfolge geladen werden:

1. **config/firebase.js** - Firebase zuerst initialisieren
2. **state.js** - State-Objekt global verfügbar machen
3. **utils/** - Hilfsfunktionen (werden von Services und Komponenten benötigt)
4. **services/** - Firebase-Interaktion und Business Logic
5. **components/** - UI-Komponenten
6. **pages/** - Seiten (nutzen Komponenten)
7. **events.js** - Event Handler
8. **render.js** - Render-Funktion
9. **app.js** - Initialisierung (startet alles)

## Vorteile dieser Struktur

- **Übersichtlichkeit**: Jede Datei hat eine klare Verantwortung
- **Wartbarkeit**: Änderungen an einer Komponente betreffen nur eine Datei
- **Entwicklung**: Einfacher parallel zu arbeiten
- **Debugging**: Fehler lassen sich schneller lokalisieren

## Was in welche Datei gehört

| Kategorie | Dateien | Inhalt |
|-----------|---------|--------|
| **Config** | `firebase.js` | API Keys, Firebase Init |
| **State** | `state.js` | Globaler App-Zustand |
| **Utils** | `helpers.js`, `validation.js` etc. | Pure Functions ohne Side Effects |
| **Services** | `*-service.js` | Firebase-Operationen, Business Logic |
| **Components** | `Navigation.js` etc. | Wiederverwendbare UI-Teile |
| **Pages** | `*Page.js` | Ganze Seiten (kombinieren Components) |
| **Events** | `events.js` | Navigation, User-Interaktionen |

## Verwendung

Einfach die `index.html` öffnen - alle Module werden automatisch geladen. Keine Build-Tools nötig, da CDN-basiert.