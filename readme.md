# Admin-Anleitung: CfB Gütersloh Vereinsmeisterschaft

## Inhaltsverzeichnis
1. [Anmeldung](#anmeldung)
2. [Admin-Funktionen](#admin-funktionen)
3. [Einzel](#einzel)
4. [Doppel](#doppel)
5. [Herausforderungen](#herausforderungen)
6. [Spiele](#spiele)
7. [Spieler](#spieler)
8. [Kontakt & Support](#kontakt--support)


## Anmeldung

Die Anmeldung erfolgt über Email und Passwort. Wenn du berechtigt bist dich anzumelden, solltest du bereits deine Zugangsdaten erhalten haben. Andernfalls melde dich bitte bei Daniel R. Im besten Fall änderst du dein Initialpasswort direkt beim ersten Einloggen über die Funktion "Passwort vergessen" im Anmeldescreen. Diesen erreichst du über den Button "Admin Login" oben rechts.  
Der Login ist erforderlich, um Ergebnisse eintragen zu können und die Verwaltung der Vereinsmeisterschaften vorzunehmen. (Mehr dazu unter [Admin-Funktionen](#admin-funktionen))

### Notwendigkeit
Damit schreibende Änderungen eingetragen werden können, muss man als Admin eingeloggt sein. Das liegt daran, dass die Tabellen und die Pyramide absichtlich öffentlich sind, damit sie jeder (auch ohne Login) einsehen kann. Damit aber nicht wahrlos oder von Dritten Ergebnisse eingetragen werden, ist der Login pflicht. Ist man nicht eingeloggt, die man die Bedienflächen zum Schreiben oder Exportieren garnicht.

Sollte sich dieses Konzept (dass immer ein Admin eingeloggt sein muss) als unpraktikabel oder kompliziert zum Eintragen in der Halle erweisen, können wir die Anwendung so umbauen, dass es auch einen "einfachen" Nutzer gibt. In der Halle könnte man sich dann immer über einen QR-Code einloggen und hätte nur die Berechtigung, Ergebnisse und Herausforderungen einzutragen, ohne das etwas an den Einstellungen kaputt gemacht werden kann.

## Admin-Funktionen

### Spielerverwaltung
Hier können Spieler zu den Vereinsmeisterschaften angemeldet und auch wieder gelöscht werden. Damit Spieler an einer Kategorie (Einzel oder Doppel) teilnehmen können, müssen sie zunächst angelegt werden. Anschließend kann über "Spieler bearbeiten" (Stift-Symbol) die Anmeldung zum Einzel und Doppel erfolgen. Dazu muss beim Einzel die Gruppe für die Gruppenphase gesetzt werden und beim Doppel muss eine Einordnung in die Pools A und B erfolgen. Die beiden Werte können unabhängig voneinander gesetzt werden, sodass man auch nur am Einzel oder nur am Doppel teilnehmen kann.  
Wird ein Spieler gelöscht (Papierkorb-Symbol) so wird dieser aus der Einzel-Gruppe direkt entfernt. Damit der Spieler aus der Doppel-Pyramide verschwindet, muss dies über [Doppel-Einstellungen](#doppel-einstellungen) manuell erfolgen. Ebenso bleiben die bereits eingetragenen Spiele erhalten. Hier erscheint dann "Gelöschter Spieler" als Name. Solche Spiele können auch manuell gelöscht werden.

### Einzel-Einstellungen
Die Einstellungen der Gruppen erfolgt über die Zuordnung von Spielern über die [Spielerverwaltung](#spielerverwaltung). Über die Einstellungen im Admin-Bereich kann die Zuordnung vorgenommen werden, welche Positionen am Ende der Gruppenphase in der K.O.-Phase gegeneinander spielen. (Beispiel: 4. Gruppe 1 spielt gegen 1. Gruppe 2 etc.) Ebenfalls kann hier die Gruppenphase für beendet erklärt werden und die K.O.-Phase wird eingeleitet. In diesem Fall werden die Gruppen-Tabellen eingefroren und die Viertelfinals starten.  
Es ist möglich, die K.O.-Phase wieder zu deaktivieren, allerdings gehen dadurch alle Ergebnisse der K.O.-Phase verloren. Sollte dies wegen Änderungen notwendig sein, sollten die Spielergebnisse der K.O.-Phase vorher gespeichert werden, um sie danach wieder einzutragen.

### Doppel-Einstellungen
Hier kann die Reihenfolge der Pyramide manuell beeinflusst werden. Da nachträgliche Änderungen an Spielen die Auswirkungen auf die Pyramide sehr kompliziert wären, wird die Pyramide nur beeinflusst, wenn ein Spiel initial eingetragen wird. Spätere Änderungen am Ergebnis (so sie nötig sein sollten) müssen manuell vom Admin in die Reihenfolge eingebracht werden. Durch die Buttons "rauf" und "runter" (Pfeil-Buttons) können einzelne Spieler in der Pyramide direkt nach oben oder unten verschoben werden.  
Es ist ebenfalls möglich, einzelne Spieler komplett aus der Pyramide zu löschen. Hier sollte zuvor der Doppel-Pool des Spielers entfernt werden, da er sonst möglicherweise wieder zur Pyramide hinzugefügt wird.


## Einzel
Hier können die Gruppentabellen eingesehen und neue Spiele eingetragen werden. Damit neue Spiele eingetragen werden können, muss man als Admin eingeloggt sein. (Siehe [Anmelde-Notwendigkeit](#notwendigkeit))  
Beim Eintragen werden die Gruppenzuordnungen geprüft. (Beispiel: Wenn man selbst in Gruppe 1 ist, kann man auch nur Ergebnisse gegen Spieler eintragen, die ebenfalls in Gruppe 1 sind.) Es sind pro Paarung 2 Spiele (Hin- und Rückspiel) für die Gruppenphase geplant. Nach dem zweiten Spiel wird gewarnt, wenn man ein drittes Spiel eintragen will. Die Spiele für Hin- und Rückrunde können unter [Herausforderungen](#herausforderungen) eingesehen werden.  
Sobald die K.O.-Phase beendet ist, werden nicht mehr die Tabellen sondern die einzelnen Spiele angezeigt. Hier muss jeweils direkt zum entsprechenden Spiel auf den Button "Ergebnis eintragen" gedrückt werden, damit die Punkte im Popup eingetragen werden können.  
Die Gruppentabelle wird anhand folgender Werte aufgebaut. Es kommt nur der nächste Wert zum Tragen, wenn zwei Spieler beim Vorherigen denselben Wert haben.
 - Punkte
 - Satz-Differenz (Gewonnene Sätze - verlorene Sätze)
 - Spiel-Punkte-Differenz (Gewonnene Spielpunkte - Verlorene Spielpunkte)  
  
Es werden Punkte nach folgendem Schema vergeben:
- Sieg in 2 Sätzen: 3 Punkte
- Sieg in 3 Sätzen: 2 Punkte
- Niederlage in 3 Sätzen: 1 Punkt
- Niederlage in 2 Sätzen: 0 Punkte

## Doppel
Hier kann die Pyramide eingesehen und neue Spiele eingetragen werden. Damit neue Spiele eingetragen werden können, muss man als Admin eingeloggt sein. (Siehe [Anmelde-Notwendigkeit](#notwendigkeit))  
Beim Eintragen von Ergebnissen werden die Pool-Zuordnungen geprüft. (Beispiel: Wenn man selbst in Pool A ist, kann man nur mit einem Spieler spielen, der in Pool B ist. Für den Gegner genauso.) Eine Doppelpaarung muss immer aus einem Spieler aus Pool A und einem Spieler aus Pool B bestehen. Im Gegensatz zum Einzel können im Doppel beliebig viele Spiele gespielt werden, die Rangefolge in der Pyramide verändert sich dynamisch.  
Beim Eintragen ist wichtig, dass ein Ergebniss in der Pyramide immer nur für die ersten beiden Spieler des Doppels gewertet wird. Die Spieler 2 jedes Teams sind immer nur Mitspieler und deren Rangfolge in der Pyramide wird durch das Ergebnis nicht beeinflusst.  
Man kann beliebige Spieler in der Pyramide zum Spiel herausfordern, die über einem stehen. Wenn der Spieler, der weiter unten in der Pyramide steht, das Spiel gewinnt, so nimmt er die Position des unterlegenen Spielers ein und alle anderen in der Rangfolge werden um eine Position nach hinten versetzt. Wie hoch das Ergebnis ausgeht, ist im Doppel egal.


## Herausforderungen

### Einzel
Herausforderungen in Einzel sind nur während der Gruppenphase möglich. Die werden automatisiert durch das System erstellt und bilden Hin- und Rückrunde jeder Spielerkombination aus jeder Gruppe ab. Es kann nach Spielernamen gesucht werden und auch das Eintragen von Ergebnissen für einzelne Spiele ist hier direkt möglich. Die ersten 2 Spiele pro Spielerkombination werden automatisch als Hin- und Rückspiel gewertet. Alle Spiele ab dem Dritten finden als Herausforderungen keine Beachtung mehr, wirken sich aber trotzdem auf die Gruppentabelle aus.

### Doppel
Im Doppel sind die Herausforderungen im Prinzip lediglich eine terminliche Erinnerung. Man kann eintragen, dass ein Spieler einen anderen herausgefordert hat und ein Ablaufdatum eintragen. Auf der Startseite der Anwendung wird man über anstehende und überfällige Doppel-Herausforderungen benachrichtigt. Mehr Funktion als diese Terminierung haben Doppel-herausforderungen nicht. Man könnte also in der Theorie die gesamten Vereinsmeisterschaften abwickeln, ohne auch nur eine Herausforderung eingetragen zu haben.  
Sind erstmal Herausforderungen eingetragen, so kann man diese als erledigt markieren (falls das Spiel bereits eingetragen ist, die Herausforderung aber systemisch noch steht) oder das Ergebnis direkt eintragen und damit auch die Herausforderung erledigen. 

## Spiele
Hier können alle vergangenen Spiele in Einzel & Doppel eingesehen werden. Ausgenommen sind die K.O.-Phasen-Spiele im Einzel, diese müssen über die Einzel-Seite direkt eingesehen werden. Es kann nach den Namen einzelner Spieler gefiltert werden.  
Admins können die angezeigten Spiele in Excel exportieren. Die Filter-Funktion schränkt dabei ebenfalls den Export ein.
Admins können hier ebenfalls Ergebnisse anpassen oder Spiele löschen. Es ist ebenfalls möglich, den Sieger eines Spiels zu ändern (über die Punktzahl). Beim Einzel stellt dies in der Gruppenphase kein Problem dar. Beim Doppel hingegen werden Änderungen an der Pyramide nachträglich nicht mehr vorgenommen, dies muss manuell durch einen Admin passieren. ([Admin-Funktionen](#admin-funktionen)). 

## Spieler
Hier können alle Spieler, die in der Anwendung registiert sind, angezeigt werden. Durck klicken die Kachel des jeweiligen Spielers können die Statistiken in Einzel und Doppel sowie alle Spiele abgerufen werden.


## Kontakt & Support

Bei technischen Problemen oder Fragen zur App wende dich am besten an Daniel R.   
Für die Registrierung neuer Accounts ebenfalls.