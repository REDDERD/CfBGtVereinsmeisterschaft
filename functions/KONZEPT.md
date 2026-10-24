# Konzept: Firestore-Schreibzugriffe über Firebase Functions

Stand: 24.10.2026 · Branch `firebase-functions`

## 1. Ausgangslage

Die App (Vanilla-JS, Firebase compat SDK 10.7.1, Hosting über GitHub Pages) schreibt heute **alle** Daten direkt aus dem Browser nach Firestore. Die Geschäftslogik läuft nur im Client: Satzvalidierung, Pyramiden-Regeln, Tageslimit, Validierungsmodi, Standard-Status, K.O.-Bracket und Auslosung. `firestore/firestore.rules` prüft nur Formate.

Daraus ergeben sich konkrete Probleme:

| # | Problem | Fundstelle |
|---|---|---|
| 1 | **Pyramiden-Update scheitert für Nicht-Admins.** QR-Login-Nutzer dürfen Doppel eintragen. Ist `doublesUserDefault = confirmed` eingestellt, wird das Spiel gespeichert, die Pyramide aber nicht (die Rules erlauben `pyramid/current` nur Admins). | `updatePyramidAfterChallenge` in `js/services/match-service.js` |
| 2 | **`loadPyramid()` schreibt aus jedem Browser.** Fehlende Doppelspieler werden angehängt. Bei Nicht-Admins scheitert das still, bei mehreren Admins entsteht ein Race. | `js/services/firebase-listeners.js` |
| 3 | **Read-Modify-Write ohne Transaktion** auf `pyramid/current`: Zwei fast gleichzeitige Bestätigungen führen zu einem Lost Update. | match-, ranking-, challenge-service |
| 4 | **Client-Regeln lassen sich umgehen.** Den Status wählt der Client, und jeder eingeloggte Nutzer darf `confirmed` und kampflose Siege schreiben. Paarungslimit, `block`/`admin_only`, Pyramiden-Regeln, Tageslimit und Pool-Kombination werden nur im Browser geprüft. | match-service, Rules |
| 5 | **Nicht-atomare Mehrschritt-Operationen:** K.O.-Spiele werden in einer Schleife gelöscht, Spieler einzeln kopiert, Spiel und Challenge-Abschluss getrennt geschrieben. | knockout-, season-, match-service |
| 6 | **Auslosung per `Math.random()` im Browser.** Sie ist weder manipulationssicher noch nachvollziehbar. | `startDoublesKnockoutPartnerDraw` |
| 7 | **Eingefrorene Tabellen** werden im Client berechnet und so übernommen. | `activateKnockoutPhase` |

**Ziel:** Alle Schreibvorgänge mit Regel- oder Konsistenzbezug laufen über Callable Functions (Admin SDK, Transaktionen und Batches, Validierung auf dem Server). Einfache Admin-Stammdaten sowie alle Lesezugriffe und Realtime-Listener bleiben im Client.

---

## 2. Einordnung aller Schreibzugriffe

### A. Callable Functions: Spielbetrieb (P1, umgesetzt)

| Function | Ersetzt | Rolle | Logik auf dem Server |
|---|---|---|---|
| `submitSinglesMatch` | `addSinglesMatch`, `submitChallengeMatch` | auth | Sätze, Spieler, Hinweis bei unterschiedlichen Gruppen, Paarungslimit × `singlesValidation.mode`, Status aus `defaultMatchStatus` + Rolle, `round` aus Gruppe |
| `submitDoublesMatch` | `addDoublesMatch` | auth | 4 verschiedene Spieler, Pool A+B, Pyramiden-Regeln + Tageslimit × `doublesValidation.mode`. **Eine Transaktion** für Spiel, optionalen Challenge-Abschluss und Pyramide (bei `confirmed`). Gesperrt, solange die Doppel-K.O.-Phase aktiv ist |
| `submitWalkover` | `addSinglesWalkover`, `addDoublesWalkover` | admin | wie oben, 21:0/21:0 erzeugt der Server, Doppel → Pyramide in derselben Transaktion |
| `setMatchStatus` | `updateMatchStatus` | admin | Hinweis bei älterem offenen Spiel. Bestätigt der Admin ein Pyramiden-Doppel, wird es genau einmal angewendet (Flag `pyramidApplied`) |
| `editMatch` / `deleteMatch` | `save*MatchEdit`, `delete*Match` | admin | Sätze validieren, Hinweis bei Gewinnerwechsel (die Pyramide wird weiterhin manuell angepasst) |
| `createChallenge` | `addChallenge` | auth | Datum ≥ heute (Europe/Berlin), Pyramiden-Regeln + Tageslimit × Modus |
| `completeChallenge` | `markChallengeCompleted` | auth | nur `pending` → `completed` |

### B. Callable Functions: Pyramide & K.O.-Phasen (P2, Stubs)

| Function | Ersetzt | Logik auf dem Server |
|---|---|---|
| `initPyramid` | `initPyramid` | Doppelspieler mit Server-Zufall mischen |
| `saveDoublesRanking` | `saveDoublesRanking`, `removePlayerFromRanking` | Rangliste prüfen (bekannte IDs, keine Duplikate) und speichern |
| `activateKnockout` / `deactivateKnockout` | knockout-service | Tabellen **auf dem Server** berechnen und einfrieren. Deaktivieren als **ein Batch** |
| `saveKnockoutConfig`, `saveKnockoutMatch` | knockout-service | Paarungen und Spieler gegen das Bracket prüfen |
| `activateDoublesKnockout` / `deactivateDoublesKnockout` | doubles-knockout-service | ≥ 8 Spieler, Pyramide einfrieren. Deaktivieren (Spiele + `draws`) als ein Batch |
| `drawDoublesKnockoutPartner` | `startDoublesKnockoutPartnerDraw` | **Zufall auf dem Server**, Rückgabe `{ winnerId, candidateIds }`. Der Client spielt nur noch die Slotmaschine ab |
| `assignDoublesKnockoutPartner`, `setDoublesKnockoutDrawRule` | manuelle Zuordnung, Regel-Toggle | Partner-Regeln prüfen |
| `saveDoublesKnockoutMatch` | `saveDoublesKnockoutMatch`, `saveDoublesKnockoutWalkover` | Teams gegen Bracket und Auslosung prüfen |

### C. Callable Functions: Saisonverwaltung (P3, Stubs)

| Function | Ersetzt | Logik auf dem Server |
|---|---|---|
| `createSeason` | `createNewSeason` | Existenzprüfung, Saison-Dokument und Spielerkopie in **einem Batch** |
| `setActiveSeason` | `changeActiveSeason` | Saison muss existieren |

### D. Firestore-Trigger

| Trigger | Ersetzt | Zweck | Stand |
|---|---|---|---|
| `onSeasonPlayerWritten` (`seasons/{year}/players/{id}`) | Schreibteil von `loadPyramid()` | Spieler bekommt einen Doppel-Pool → unten anhängen. Pool entfernt oder Spieler gelöscht → aus der Pyramide entfernen. Transaktion, idempotent | umgesetzt |
| `onUserWritten` (`users/{uid}`) | `get()` auf `users` bei jeder Rule-Auswertung | Custom Claims `admin`/`qrLogin` setzen | optional, Stub, **nicht exportiert** |

### E. Bleibt bewusst im Client

- **Alle Lesezugriffe und `onSnapshot`-Listener.** Die Realtime-Aktualisierung bleibt erhalten, ohne zusätzliche Latenz.
- **Auth:** Login, QR-Login, Passwort-Reset.
- **Admin-Stammdaten ohne Querbezüge**, die die Rules schon vollständig prüfen: Ankündigungen, `defaultMatchStatus`, `matchesDisplay`, `singles/doublesValidation`, Archiv-Sichtbarkeit sowie Spieler anlegen, bearbeiten und löschen. Die Folgen für die Pyramide übernimmt der Trigger.
- **Nutzungsstatistik** (`stats/{day}`): Die Rules sind bereits strikt. Eine Function pro Seitenaufruf kostet Aufrufe und Cold-Starts, ohne etwas zu verbessern.
- **Backup:** bleibt eine GitHub Action, weil das Ziel ein Git-Repo ist.

---

## 3. Querschnittskonzepte

### Bestätigungs-Flow statt Client-Modals
Die Modi `allow | warn | block | admin_only` wertet der Server aus (`domain/validationPolicy.ts`). Callables mit Hinweisen nehmen `acknowledgeWarnings?: boolean` an:

| Situation | Antwort |
|---|---|
| Verstoß + `block` (oder `admin_only` als Nicht-Admin) | `HttpsError("failed-precondition", "<deutscher Grund>")` |
| Verstoß + `warn` (oder `admin_only` als Admin), Hinweise noch nicht bestätigt | `{ status: "needs-confirmation", warnings: [{ code, title, message }] }`, **nichts gespeichert** |
| sonst | `{ status: "ok", ... }` |

Der Client zeigt `Modal.warn(title, message)` und ruft die Function bei Zustimmung erneut mit `acknowledgeWarnings: true` auf. Reine Hinweise laufen über denselben Weg (`GROUP_MISMATCH`, `OLDER_UNCONFIRMED`, `WINNER_CHANGED`).

Warn-Codes: `GROUP_MISMATCH`, `PAIRING_LIMIT`, `CHALLENGE_RULES`, `OLDER_UNCONFIRMED`, `WINNER_CHANGED`.

### Weitere Regeln
- **Aktive Saison auf dem Server:** Die Functions lesen `settings/activeSeason` selbst, der Client übergibt keine Saison. So sind Schreibzugriffe in archivierte Saisons ausgeschlossen.
- **Rollen:** `requireAuth` und `requireAdmin` lesen `users/{uid}.isAdmin`. Der Admin-Status kommt nie aus dem Payload.
- **Transaktionen:** Die Pyramide wird immer per `db.runTransaction` gelesen und geschrieben, Reads vor Writes (`pyramid/pyramidRepository.ts`).
- **Zeitzone:** „Heute“ (Tageslimit, Challenge-Datum) bezieht sich auf `Europe/Berlin` (`lib/time.ts`), die Functions selbst laufen in UTC.
- **Region:** `europe-west3`, also derselbe Standort wie die Firestore-Datenbank. Dazu `maxInstances: 10`.
- **Fehler:** einheitlich `HttpsError` mit deutschen Texten. Der Client zeigt `error.message` per `Toast.error`.
- **Keine Composite-Indizes nötig:** Abfragen nutzen nur Single-Field-Indizes. Kleine Ergebnismengen, etwa unbestätigte Spiele, werden im Speicher gefiltert.
- **Audit:** Neue Dokumente aus Functions tragen `createdBy: uid`.

### Domänenlogik einmal portiert
Die reinen Funktionen aus `js/` liegen als TypeScript in `src/domain/`, ohne Firestore-Abhängigkeit. Der Client behält seine Kopie für Live-Vorschau und UX, maßgeblich ist aber die Prüfung auf dem Server.

| Domain-Modul | Quelle im Client |
|---|---|
| `sets.ts` | `js/utils/validation.js` |
| `pyramid.ts` | `js/utils/pyramid.js`, `js/services/ranking-service.js`, `findPlayerInPyramid` |
| `challengeRules.ts` | `js/services/doubles-challenge-validation.js` |
| `matchStatus.ts` | `_getDefaultMatchStatus` (match-service) |
| `standings.ts` | `js/utils/calculations.js` |
| `doublesKnockout.ts` | reine Logik aus `js/services/doubles-knockout-service.js` (statt `state` ein `DoublesKnockoutContext`) |

---

## 4. Dateistruktur `functions/src`

```
functions/src/
├── index.ts                     setGlobalOptions + Re-Export aller Functions (flache Namen)
├── config.ts                    Region, Zeitzone, Collection-/Settings-Namen, Regel-Konstanten
│
├── lib/                         Infrastruktur – keine Fachregeln
│   ├── firebase.ts              initializeApp(), db, FieldValue, Timestamp
│   ├── auth.ts                  requireAuth(), requireAdmin() → { uid, isAdmin }
│   ├── errors.ts                fail(), ok(), needsConfirmation(), collectOutcome(), notImplemented()
│   ├── input.ts                 Payload-Prüfung: requireId, requireEnum, parseSinglesSets, parseDoublesSets, …
│   ├── season.ts                getActiveSeason(), seasonCol(), pyramidRef(), settingsRef()
│   ├── settings.ts              loadSettings(): Status-Defaults, Validierungsmodi, K.O.-Flags
│   ├── data.ts                  Firestore → Domain-Objekte, loadPlayers(), loadSinglesPairing(), loadTodaysDoublesMatches()
│   └── time.ts                  dayKey() in Europe/Berlin
│
├── domain/                      reine Logik, unit-testbar (siehe Tabelle oben)
│   ├── types.ts
│   ├── sets.ts
│   ├── pyramid.ts
│   ├── challengeRules.ts
│   ├── validationPolicy.ts
│   ├── matchStatus.ts
│   ├── standings.ts
│   └── doublesKnockout.ts
│
├── matches/                     P1 ✔
│   ├── shared.ts                checkSinglesRules, teamPoolViolation, checkDoublesChallengeRules, checkChallengeRules
│   ├── submitSinglesMatch.ts
│   ├── submitDoublesMatch.ts
│   ├── submitWalkover.ts
│   ├── setMatchStatus.ts
│   ├── editMatch.ts             editMatch + deleteMatch
│   └── index.ts
├── challenges/                  P1 ✔
│   ├── createChallenge.ts
│   ├── completeChallenge.ts
│   └── index.ts
├── pyramid/
│   ├── pyramidRepository.ts     readPyramid, writePyramid, applyDoublesResult   ✔
│   ├── triggers.ts              onSeasonPlayerWritten                          ✔
│   ├── adminPyramid.ts          initPyramid, saveDoublesRanking                (Stub, P2)
│   └── index.ts
├── knockout/                    P2 (Stubs)
│   ├── singlesKnockout.ts       activate/deactivate/saveConfig/saveMatch
│   ├── doublesKnockout.ts       activate/deactivate/saveMatch (inkl. Walkover)
│   ├── doublesDraw.ts           drawPartner, assignPartner, setDrawRule
│   └── index.ts
├── seasons/                     P3 (Stubs)
│   ├── seasons.ts               createSeason, setActiveSeason
│   └── index.ts
└── users/                       P3 optional (Stub, nicht exportiert)
    ├── claims.ts                onUserWritten
    └── index.ts
```

**Schichtung:** `domain/` kennt kein Firestore, `lib/` kennt keine Fachregeln. Die Feature-Ordner verbinden beides nach demselben Ablauf: Payload prüfen → Rolle prüfen → Saison, Settings und Daten laden → Domain-Funktion aufrufen → per Transaktion oder Batch schreiben.

Die Stubs enthalten bereits Payload-Typen, die Admin-Prüfung und eine Schritt-für-Schritt-Beschreibung der Umsetzung. Sie antworten mit `unimplemented`.

---

## 5. API der umgesetzten Functions (P1)

| Function | Payload | Antwort (`status: "ok"`) |
|---|---|---|
| `submitSinglesMatch` | `{ player1Id, player2Id, sets: [{p1,p2}], acknowledgeWarnings? }` | `{ matchId, matchStatus }` |
| `submitDoublesMatch` | `{ team1: {player1Id, player2Id}, team2: {…}, sets: [{t1,t2}], challengeId?, acknowledgeWarnings? }` | `{ matchId, matchStatus, pyramidChanged }` |
| `submitWalkover` | `{ matchType: "singles"\|"doubles", winnerId, loserId, acknowledgeWarnings? }` | `{ matchId, pyramidChanged }` |
| `setMatchStatus` | `{ matchType: "singles"\|"knockout"\|"doubles", matchId, status, acknowledgeWarnings? }` | `{ pyramidChanged }` |
| `editMatch` | `{ matchType: "singles"\|"doubles", matchId, sets, acknowledgeWarnings? }` | `{}` |
| `deleteMatch` | `{ matchType, matchId }` | `{}` |
| `createChallenge` | `{ challengerId, challengedId, date: "YYYY-MM-DD", acknowledgeWarnings? }` | `{ challengeId }` |
| `completeChallenge` | `{ challengeId }` | `{}` |

Mit `challengeId` schließt `submitDoublesMatch` die Herausforderung in derselben Transaktion ab. Den Dialog „Offene Herausforderung gefunden – als erledigt markieren?“ zeigt weiterhin der Client.

### Bewusste Verhaltensänderungen gegenüber dem Client

- **Einzel aus Herausforderungen** (`submitChallengeMatch`) bekommen jetzt `round` und `status` nach den Einstellungen. Bisher fehlte der Status, und das Spiel galt dadurch automatisch als bestätigt.
- **Pyramiden-Update genau einmal:** Wird ein Doppel bestätigt, zurückgesetzt und erneut bestätigt, verschiebt sich die Pyramide nicht ein zweites Mal (`pyramidApplied`). Alte Spiele ohne Status gelten wie überall als bestätigt.
- **Dritter Satz:** Ein unnötiger 3. Satz (bei 2:0) wird jetzt auch bei neuen Doppeln abgelehnt. Bisher geschah das nur beim Bearbeiten.
- **Negative Punktzahlen** werden abgelehnt.
- **Tageslimit:** Es zählen nur Pyramiden-Doppel, keine K.O.-Spiele, und „heute“ bezieht sich auf Europe/Berlin.
- **Neue Pyramiden-Doppel sind gesperrt,** solange die Doppel-K.O.-Phase läuft. Die Aktivierung hatte das bereits angekündigt, erzwungen wurde es bisher nicht.
- **Entfernen aus der Rangliste** bleibt bestehen (P2). Bisher hängte `loadPyramid()` den Spieler beim nächsten Laden wieder an, wenn er noch einen Pool hatte.

---

## 6. Roadmap

| Schritt | Inhalt | Stand |
|---|---|---|
| 1 | Grundgerüst: `config`, `lib/`, `domain/` | ✔ |
| 2 | P1: `matches/`, `challenges/`, Pyramiden-Repository und Trigger | ✔ |
| 3 | P2/P3 als typisierte Stubs | ✔ |
| 4 | **Client anbinden** (je Feature) | `submitSinglesMatch` ✔ (Gruppenspiel + Einzel-Herausforderung), Rest offen |
| 5 | **Rules verschärfen** | offen |
| 6 | **`firebase.json`**: Functions-Emulator auf Port 5001 eintragen | ✔ |

`src/index.ts` exportiert nur die Functions, die der Client bereits nutzt (derzeit nur `submitSinglesMatch`). Die übrigen Exporte sind dort auskommentiert und werden erst mit ihrer Client-Anbindung freigeschaltet. Das gilt besonders für den Trigger `onSeasonPlayerWritten`, der sonst sofort nach dem Deploy parallel zu `loadPyramid()` die Pyramide verändern würde.
| 7 | P2 umsetzen: `knockout/`, `adminPyramid.ts` | offen |
| 8 | P3 umsetzen: `seasons/`, optional `users/claims.ts` | offen |

### Schritt 4: Client anbinden
Die Grundlage steht bereits:
- `index.html` lädt `firebase-functions-compat.js` (10.7.1).
- `js/config/firebase.js` stellt `functions` bereit (Region `europe-west3`, lokal mit dem Emulator auf Port 5001).
- `js/services/functions-service.js` enthält `callFunction(name, data)` mit dem Bestätigungs-Flow (`needs-confirmation` → `Modal.warn` → erneuter Aufruf mit `acknowledgeWarnings: true`). Bei Abbruch gibt die Funktion `null` zurück.

Für jede weitere Function:
1. In den Services den direkten Write durch `callFunction(...)` ersetzen. Formular- und DOM-Logik bleibt, Fehler zeigt `Toast.error(error.message)`. Clientseitige Regelprüfungen, die jetzt der Server übernimmt, entfallen. Vorbild ist `_submitSinglesMatch` in `js/services/match-service.js`.
2. Den Export in `src/index.ts` freischalten.
3. Mit der Pyramiden-Anbindung `loadPyramid()` nur noch lesend machen und `onSeasonPlayerWritten` exportieren.

**Lokal testen:** `firebase emulators:start` startet jetzt auch den Functions-Emulator (vorher `npm --prefix functions run build`). Bricht das Laden mit „Timeout after 10000“ ab, hilft `FUNCTIONS_DISCOVERY_TIMEOUT=60` als Umgebungsvariable (PowerShell: `$env:FUNCTIONS_DISCOVERY_TIMEOUT = "60"`).

### Schritt 5: Rules verschärfen (erst nach Schritt 4)
Für `singlesMatches`, `doublesMatches`, `challenges`, `pyramid` und für `settings/{activeSeason, knockout, knockoutConfig, doublesKnockout, doublesKnockoutConfig}` gilt dann `allow write: if false` (das Admin SDK umgeht die Rules), außerdem für `seasons` beim Anlegen. Die Lese-Regeln bleiben unverändert.

---

## 7. Verifikation

**Bereits erledigt:**
- `npm --prefix functions run build` (tsc strict) läuft ohne Fehler durch.
- Die Discovery liefert 22 Callables und 1 Firestore-Trigger, alle in `europe-west3`.
- Die Domain-Logik wurde gegen den Original-Client-Code geprüft:
  - Herausforderungsregeln: identisch in 7.714 Kombinationen (Pyramiden mit 1 bis 28 Spielern)
  - Doppel-K.O. (Teams, aktive Spieler, Partner-Regeln, Kandidaten): identisch in 86.400 Prüfungen über 300 zufällige Bracket-Verläufe
  - Smoke-Tests für Sätze, Pyramide, Validierungsmodi, Status-Defaults und Tabelle
- `submitSinglesMatch` wurde Ende-zu-Ende im Emulator getestet (Demo-Projekt, Aufrufe über das echte Callable-Protokoll mit Auth-Token), 16 Prüfungen:
  - Login-Pflicht und ungültige Eingaben
  - Status und Runde nach Einstellung und Rolle
  - Gruppen-Hinweis und Paarungslimit in den Modi `warn`, `block` und `admin_only`
  - abgelehnte Spiele zählen nicht zum Paarungslimit

**Nach Schritt 4 und 5** (`firebase emulators:start` plus `scripts/clone-prod-to-emulator.js`):
- Als QR-Nutzer mit `doublesUserDefault = confirmed` ein Doppel eintragen → die Pyramide wird aktualisiert.
- Die Modi `warn`, `block` und `admin_only` durchspielen → Bestätigungs-Modal bzw. Fehler-Toast erscheinen.
- Zwei Bestätigungen parallel auslösen → beide Pyramidenbewegungen sind wirksam.
- Einen Spieler mit Doppel-Pool anlegen und löschen → der Trigger passt die Pyramide an.
- Einen direkten Write auf `doublesMatches` aus der Browser-Konsole versuchen → er wird abgelehnt.
