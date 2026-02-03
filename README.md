# Admin-Anleitung: Badminton Vereinsmeisterschaft

## Inhaltsverzeichnis
1. [Anmeldung](#anmeldung)
2. [Spielerverwaltung](#spielerverwaltung)
3. [Einzel-Verwaltung](#einzel-verwaltung)
4. [Doppel-Verwaltung](#doppel-verwaltung)
5. [Herausforderungen verwalten](#herausforderungen-verwalten)
6. [Datenexport](#datenexport)
7. [Passwort zurücksetzen](#passwort-zurücksetzen)

---

## Anmeldung

### Erstmalige Anmeldung
1. Navigiere zur **Admin**-Seite über die Navigation
2. Gib deine Admin-Email-Adresse und das Passwort ein
3. Optional: Setze das Häkchen bei "Angemeldet bleiben", um dauerhaft angemeldet zu bleiben
4. Klicke auf **Anmelden**

### Passwort-Sichtbarkeit
- Klicke auf das Augen-Symbol rechts im Passwort-Feld, um das Passwort sichtbar zu machen

### Abmelden
- Klicke auf den **Logout**-Button oben rechts in der Navigation

---

## Spielerverwaltung

### Neuen Spieler hinzufügen
1. Wechsle zum Tab **Spieler verwalten**
2. Gib den Namen des Spielers in das Eingabefeld ein
3. Klicke auf **Spieler hinzufügen**
4. Der neue Spieler erscheint in der Liste

**Hinweis:** Neu hinzugefügte Spieler nehmen zunächst weder am Einzel noch am Doppel teil. Dies muss durch Bearbeiten konfiguriert werden.

### Spieler bearbeiten
1. Klicke auf das **Stift-Symbol** (🖊️) neben dem Spieler
2. Du kannst folgende Daten ändern:
   - **Name** des Spielers
   - **Einzel-Gruppe** (1 oder 2, oder "Nicht dabei")
   - **Doppel-Pool** (A für stark, B für schwach, oder "Nicht dabei")
3. Klicke auf **Speichern** um die Änderungen zu übernehmen
4. Oder auf **Abbrechen** um die Änderungen zu verwerfen

### Spieler löschen
1. Klicke auf das **Papierkorb-Symbol** (🗑️) neben dem Spieler
2. Bestätige die Sicherheitsabfrage mit **Löschen**
3. Der Spieler wird dauerhaft aus der Datenbank entfernt

**⚠️ Wichtig:** Das Löschen eines Spielers kann nicht rückgängig gemacht werden. Alle Spiele mit diesem Spieler bleiben aber erhalten.

---

## Einzel-Verwaltung

### Gruppeneinteilung
Die Einzel-Meisterschaft besteht aus zwei Gruppen:
- **Gruppe 1**: Normalerweise die stärkeren Spieler
- **Gruppe 2**: Normalerweise die schwächeren Spieler

Weise jedem Spieler über **Spieler verwalten** → Bearbeiten eine Gruppe zu.

### Einzel-Tabellen ansehen
1. Wechsle zum Tab **Einzel-Tabellen**
2. Du siehst beide Gruppentabellen mit:
   - Platzierung
   - Spielername
   - Anzahl Spiele
   - Siege / Niederlagen
   - Gewonnene/verlorene Sätze
   - Satz-Differenz
   - Punkte

Die Tabellen werden automatisch nach Punkten, Satz-Differenz und direktem Vergleich sortiert.

### K.O.-Phase konfigurieren

#### Vorbereitung
Bevor die K.O.-Phase gestartet wird:
1. Stelle sicher, dass die Gruppenphase vollständig gespielt wurde
2. Überprüfe die Platzierungen in beiden Gruppen

#### K.O.-Phase einrichten
1. Wechsle zum Tab **Einzel-Tabellen**
2. Scrolle runter zum Bereich **K.O.-Phase konfigurieren**
3. Für jedes der 4 Viertelfinale-Spiele:
   - Wähle aus, welche Position gegen welche antritt
   - Beispiel: "1. Platz Gruppe 1" gegen "4. Platz Gruppe 2"
4. Klicke auf **Paarungen speichern**

**Standard-Setup (empfohlen):**
- VF1: 1. Platz G1 vs. 4. Platz G2
- VF2: 2. Platz G1 vs. 3. Platz G2
- VF3: 1. Platz G2 vs. 4. Platz G1
- VF4: 2. Platz G2 vs. 3. Platz G1

#### K.O.-Phase aktivieren
1. Nach dem Speichern der Paarungen klicke auf **K.O.-Phase starten**
2. Die Gruppenphase wird "eingefroren" - keine weiteren Gruppen-Ergebnisse können mehr eingetragen werden
3. Die K.O.-Spiele werden nun mit den aktuellen Platzierungen befüllt

**⚠️ Wichtig:** 
- Nach Aktivierung können die Paarungen nicht mehr geändert werden
- Stelle sicher, dass alle Gruppenspiele eingetragen sind!
- Die Spieler können noch am Einzel-Tab sehen, wie die Gruppenphase ausgegangen ist

#### K.O.-Phase deaktivieren
Falls etwas schiefgelaufen ist:
1. Klicke auf **K.O.-Phase deaktivieren**
2. Die Gruppenphase wird wieder bearbeitbar
3. Alle K.O.-Ergebnisse bleiben erhalten, werden aber ignoriert
4. Du kannst die K.O.-Phase neu konfigurieren und erneut starten

### Tabellen exportieren
1. Klicke auf **Tabellen exportieren** (oben rechts bei den Einzel-Tabellen)
2. Eine Excel-Datei wird heruntergeladen mit:
   - Tabelle Gruppe 1
   - Tabelle Gruppe 2
   - Alle Einzel-Spiele

---

## Doppel-Verwaltung

### Doppel-Pools
Das Doppel-System funktioniert über Pools:
- **Pool A**: Stärkere Spieler
- **Pool B**: Schwächere Spieler

Weise jedem Spieler über **Spieler verwalten** einen Pool zu.

### Pyramiden-System

#### Was ist die Pyramide?
Die Pyramide ist eine Rangfolge aller Doppel-Spieler:
- Spieler können nur Spieler herausfordern, die maximal **2 Positionen** über ihnen stehen
- Nach einem gewonnenen Herausforderungsspiel tauschen die Spieler ihre Positionen
- Die Pyramide zeigt die aktuelle Stärke-Hierarchie

#### Pyramide initialisieren
**Nur beim ersten Mal nötig:**
1. Wechsle zum Tab **Doppel-Rangfolge**
2. Klicke auf **Pyramide initialisieren**
3. Alle Spieler mit Doppel-Pool werden zufällig verteilt

#### Rangfolge bearbeiten
1. Wechsle zum Tab **Doppel-Rangfolge**
2. Nutze die **Pfeil-Buttons** um Spieler nach oben/unten zu verschieben
3. Nutze das **Papierkorb-Symbol** um einen Spieler komplett aus der Rangfolge zu entfernen
4. Klicke auf **Rangfolge speichern** um die Änderungen zu übernehmen

**Anwendungsfälle:**
- Neue Spieler in die Rangfolge einfügen
- Rangfolge anpassen basierend auf Spielstärke
- Spieler aus der Rangfolge nehmen (z.B. bei Verletzung)

#### Pyramide zurücksetzen
Falls du komplett neu anfangen willst:
1. Lösche alle Spieler aus der Rangfolge einzeln (Papierkorb-Symbol)
2. Wenn die Rangfolge leer ist, kannst du auf **Pyramide initialisieren** klicken
3. Die Spieler werden neu und zufällig verteilt

---

## Herausforderungen verwalten

### Was sind Herausforderungen?
Herausforderungen sind geplante Doppel-Spiele zwischen zwei Spielern, die noch ausgetragen werden müssen.

### Neue Herausforderung eintragen
1. Navigiere zur Seite **Herausforderungen**
2. Wähle den **Herausforderer** (der Spieler, der herausfordert)
3. Wähle den **Herausgeforderten** (der Gegner)
4. Wähle ein **Datum** für das geplante Spiel
   - Das Datum darf nicht in der Vergangenheit liegen
5. Klicke auf **Herausforderung eintragen**

**Validierungen:**
- Herausforderer und Herausgeforderter müssen unterschiedlich sein
- Datum muss heute oder in der Zukunft liegen

### Herausforderungen ansehen
Auf der **Herausforderungen**-Seite siehst du:
- **Offene Herausforderungen** (noch nicht gespielt)
  - Spieler-Namen
  - Geplantes Datum
  - Differenz-Symbol zeigt die Position in der Pyramide (z.B. "+2" = 2 Plätze Unterschied)
- **Erledigte Herausforderungen** (bereits gespielt)
  - Ausgegraut dargestellt
  - Sieger ist hervorgehoben

### Ergebnis eintragen
1. Klicke bei einer offenen Herausforderung auf **Ergebnis eintragen**
2. Du wirst zur Doppel-Seite weitergeleitet
3. Das Formular ist bereits mit den beiden Spielern vorausgefüllt
4. Wähle die jeweiligen Partner aus
5. Trage das Ergebnis ein wie gewohnt
6. Nach dem Speichern wird die Herausforderung automatisch als "erledigt" markiert

### Herausforderung als erledigt markieren
Falls ein Spiel nicht ausgetragen werden kann (z.B. Absage, Verletzung):
1. Klicke auf **Als erledigt markieren**
2. Bestätige die Aktion
3. Die Herausforderung wandert zu den erledigten, ohne dass ein Ergebnis eingetragen wurde

---

## Datenexport

### Einzel-Spiele exportieren
1. Navigiere zur Seite **Spiele** → **Einzel**
2. Optional: Nutze die Suchfunktion um nach bestimmten Spielern zu filtern
3. Klicke auf **Einzel-Ergebnisse exportieren**
4. Eine Excel-Datei wird heruntergeladen mit allen (gefilterten) Spielen

**Export enthält:**
- Datum des Spiels
- Spieler 1 Name
- Spieler 2 Name
- Gesamtergebnis (z.B. 2:1)
- Detaillierte Sätze (z.B. "21:19, 18:21, 21:15")

### Doppel-Spiele exportieren
1. Navigiere zur Seite **Spiele** → **Doppel**
2. Optional: Nutze die Suchfunktion
3. Klicke auf **Doppel-Ergebnisse exportieren**
4. Eine Excel-Datei wird heruntergeladen

**Export enthält:**
- Datum des Spiels
- Team 1 Spieler (beide Namen)
- Team 2 Spieler (beide Namen)
- Gesamtergebnis
- Detaillierte Sätze
- Herausforderungs-Status (falls zutreffend)

### Einzel-Tabellen exportieren
1. Admin-Bereich → Tab **Einzel-Tabellen**
2. Klicke auf **Tabellen exportieren**
3. Excel-Datei wird heruntergeladen mit:
   - Sheet 1: Tabelle Gruppe 1
   - Sheet 2: Tabelle Gruppe 2
   - Sheet 3: Alle Einzel-Spiele

---

## Passwort zurücksetzen

### Als angemeldeter Admin
1. Klicke auf **Logout** oben rechts
2. Auf der Login-Seite klicke auf **Passwort vergessen?**
3. Gib deine Email-Adresse ein
4. Klicke auf **Link senden**
5. Du erhältst eine Email mit einem Link zum Zurücksetzen
6. Folge den Anweisungen in der Email

### Als nicht angemeldeter Admin
1. Navigiere zur **Admin**-Seite
2. Klicke auf **Passwort vergessen?**
3. Gib deine Email-Adresse ein
4. Klicke auf **Link senden**
5. Du erhältst eine Email mit einem Link zum Zurücksetzen
6. Folge den Anweisungen in der Email

**Hinweis:** Der Link zum Zurücksetzen ist nur begrenzt gültig. Falls der Link abgelaufen ist, fordere einen neuen an.

---

## Tipps & Best Practices

### Spielerverwaltung
- ✅ Füge alle Spieler gleich zu Beginn hinzu
- ✅ Teile die Spieler fair auf die Gruppen und Pools auf
- ✅ Überprüfe regelmäßig, ob neue Spieler hinzugekommen sind

### Gruppenphase
- ✅ Trage Ergebnisse zeitnah ein
- ✅ Nutze die Validierungen, um Fehler zu vermeiden
- ✅ Exportiere regelmäßig Zwischenstände als Backup
- ⚠️ Starte die K.O.-Phase erst, wenn ALLE Gruppenspiele gespielt sind

### K.O.-Phase
- ✅ Überprüfe die Platzierungen vor dem Start
- ✅ Konfiguriere die Paarungen logisch (1. vs. 4., 2. vs. 3.)
- ⚠️ Nach der Aktivierung können keine Gruppen-Ergebnisse mehr geändert werden

### Doppel & Pyramide
- ✅ Initialisiere die Pyramide nur einmal zu Beginn
- ✅ Passe die Rangfolge an, wenn neue Spieler dazukommen
- ✅ Ermutige Spieler, Herausforderungen einzutragen
- ✅ Überprüfe regelmäßig offene Herausforderungen

### Datenexport
- ✅ Exportiere regelmäßig Daten als Backup
- ✅ Nutze die Excel-Dateien für Analysen und Statistiken
- ✅ Teile Zwischenstände mit den Spielern

### Sicherheit
- ✅ Logge dich aus, wenn du den Computer verlässt
- ✅ Teile dein Admin-Passwort mit niemandem
- ✅ Ändere das Passwort regelmäßig

---

## Fehlerbehebung

### "Spieler nicht gefunden"
- Stelle sicher, dass alle beteiligten Spieler noch in der Datenbank existieren
- Prüfe, ob der Spieler versehentlich gelöscht wurde

### "Ungültige Satz-Ergebnisse"
- Jeder Satz muss einen klaren Gewinner haben (21:19 ist ok, 20:20 nicht)
- Der dritte Satz ist nur bei 1:1-Spielstand nach zwei Sätzen erlaubt

### K.O.-Phase lässt sich nicht aktivieren
- Stelle sicher, dass alle Viertelfinale-Paarungen konfiguriert sind
- Jede Position darf nur einmal verwendet werden

### Pyramide kann nicht initialisiert werden
- Prüfe, ob mindestens ein Spieler einem Doppel-Pool zugewiesen ist
- Stelle sicher, dass du im Admin-Bereich angemeldet bist

### Herausforderung kann nicht eingetragen werden
- Das Datum darf nicht in der Vergangenheit liegen
- Herausforderer und Herausgeforderter müssen unterschiedlich sein

---

## Kontakt & Support

Bei technischen Problemen oder Fragen zur App wende dich an den Entwickler oder das Vereinsmanagement.

**Viel Erfolg bei der Verwaltung eurer Vereinsmeisterschaft! 🏸**
