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
Damit schreibende Änderungen eingetragen werden können, muss man als Admin eingeloggt sein. Das liegt daran, dass die Tabellen und die Pyramide absichtlich öffentlich sind, damit sie jeder (auch ohne Login) einsehen kann. Damit aber nicht wahrlos oder von Dritten Ergebnisse eingetragen werden, ist der Login pflicht. Ist man nicht eingeloggt, die man die Bedienflächen zum Eintragen.

Es gibt einen Standard-Nutzer, der zum Eintragen verwendet werden kann. Dieser kann sich über einen Link anmelden und hat nur die Berechtigungen Spiele einzutragen. Den Link können wir bspw. in der Halle als QR-Code auslegen. Die App kann so eigestellt werden, dass Spiele von diesem Nutzer erst von einem Admin bestätigt werden müssen, bevor sie in die Wertung eingehen. Mehr dazu unter [Spiele verwalten](#spiele-verwalten)

## Admin-Funktionen

### Spielerverwaltung
Hier können Spieler zu den Vereinsmeisterschaften angemeldet und auch wieder gelöscht werden. Damit Spieler an einer Kategorie (Einzel oder Doppel) teilnehmen können, müssen sie zunächst angelegt werden. Anschließend kann über "Spieler bearbeiten" (Stift-Symbol) die Anmeldung zum Einzel und Doppel erfolgen. Dazu muss beim Einzel die Gruppe für die Gruppenphase gesetzt werden und beim Doppel muss eine Einordnung in die Pools A und B erfolgen. Die beiden Werte können unabhängig voneinander gesetzt werden, sodass man auch nur am Einzel oder nur am Doppel teilnehmen kann.  
Über die Option "Für die Doppel-Finalrunde als Partner zulosbar" kann festgelegt werden, ob ein Spieler in der [K.O.-Phase im Doppel](#ko-phase-im-doppel) als Partner zugelost werden darf (z. B. abwählen, wenn jemand nicht mehr spielt). Standardmäßig ist jeder Spieler zugelassen. Nicht zugelassene Spieler sind in der Liste mit "nicht in Finalrunde" markiert.  
Wird ein Spieler gelöscht (Papierkorb-Symbol) so wird dieser aus der Einzel-Gruppe direkt entfernt. Damit der Spieler aus der Doppel-Pyramide verschwindet, muss dies über [Doppel-Einstellungen](#doppel-verwalten) manuell erfolgen. Ebenso bleiben die bereits eingetragenen Spiele erhalten. Hier erscheint dann "Gelöschter Spieler" als Name. Solche Spiele können auch manuell gelöscht werden.

### Einzel verwalten
Die Einstellungen der Gruppen erfolgt über die Zuordnung von Spielern über die [Spielerverwaltung](#spielerverwaltung). Über die Einstellungen im Admin-Bereich kann die Zuordnung vorgenommen werden, welche Positionen am Ende der Gruppenphase in der K.O.-Phase gegeneinander spielen. (Beispiel: 4. Gruppe 1 spielt gegen 1. Gruppe 2 etc.) Ebenfalls kann hier die Gruppenphase für beendet erklärt werden und die K.O.-Phase wird eingeleitet. In diesem Fall werden die Gruppen-Tabellen eingefroren und die Viertelfinals starten.  
Es ist möglich, die K.O.-Phase wieder zu deaktivieren, allerdings gehen dadurch alle Ergebnisse der K.O.-Phase verloren. Sollte dies wegen Änderungen notwendig sein, sollten die Spielergebnisse der K.O.-Phase vorher exportiert werden, um sie danach wieder einzutragen.

### Doppel verwalten
Hier kann die Reihenfolge der Pyramide manuell beeinflusst werden. Da nachträgliche Änderungen an Spielen die Auswirkungen auf die Pyramide sehr kompliziert wären, wird die Pyramide nur beeinflusst, wenn ein Spiel initial eingetragen (oder bestätigt) wird. Spätere Änderungen am Ergebnis (so sie nötig sein sollten) müssen manuell vom Admin in die Reihenfolge eingebracht werden. Durch die Buttons "rauf" und "runter" (Pfeil-Buttons) können einzelne Spieler in der Pyramide direkt nach oben oder unten verschoben werden.  
Es ist ebenfalls möglich, einzelne Spieler komplett aus der Pyramide zu löschen. Hier sollte zuvor der Doppel-Pool des Spielers entfernt werden, da er sonst möglicherweise wieder zur Pyramide hinzugefügt wird.

#### K.O.-Phase im Doppel
Analog zum Einzel kann auch im Doppel von der Pyramidenphase in eine K.O.-Phase gewechselt werden. Die **Top 8** der Pyramide qualifizieren sich und spielen nach fester Setzliste:
- Viertelfinale: **Viertelfinale A** 1 vs 8, **Viertelfinale B** 2 vs 7, **Viertelfinale C** 3 vs 6, **Viertelfinale D** 4 vs 5
- Halbfinale: Gewinner A vs Gewinner D und Gewinner B vs Gewinner C
- danach das Finale (Gewinner der Halbfinals) und das Spiel um Platz 3 (Verlierer der Halbfinals)

Zu jedem Spieler wird **je Spiel ein Partner zugeordnet**. Sobald ein Spieler im K.O.-Baum feststeht, erscheint neben seinem Namen der Button "Partner zuordnen". Darüber kann gewählt werden:
- **Auslosen**: Eine Slotmaschine lässt alle möglichen Partner mehrfach durchlaufen, wird langsamer und bleibt beim ausgelosten Partner stehen – mit Konfetti. Gespeichert wird, sobald die Walze steht.
- **Eintragen**: Der Partner wird direkt ausgewählt, z. B. wenn analog gelost wurde.

Solange noch kein Ergebnis eingetragen ist, kann der Partner über den Stift-Button neben seinem Namen geändert werden (neu auslosen oder anderen Partner eintragen). Beim Eintragen des Ergebnisses sind die zugeordneten Partner vorausgewählt und können ebenfalls noch geändert werden. In die nächste Runde kommt nur der gesetzte Spieler (Spieler 1) – dort wird wieder neu ausgelost. Das passt zur Pyramiden-Logik, in der ebenfalls nur Spieler 1 gewertet wird.

Für die Auslosung und die Partner-Auswahl beim Eintragen gelten zwei Regeln, die unter "Auslosungsregeln" einzeln abgeschaltet werden können – auch während der laufenden K.O.-Phase (Änderungen werden sofort gespeichert):
- **Pool-Regel**: Der Partner muss aus dem anderen Pool kommen (A + B), wie in der Pyramidenphase.
- **K.O.-Spieler gesperrt**: Die 8 Spieler der K.O.-Phase können erst als Partner zugelost werden, wenn sie in der K.O.-Phase ausgeschieden sind. Die Verlierer der Halbfinals gelten bis zu ihrem Spiel um Platz 3 noch als aktiv.

Spieler, die in der [Spielerverwaltung](#spielerverwaltung) nicht für die Finalrunde zugelassen sind, werden nie zugelost – unabhängig von diesen Regeln. Zusätzlich wird ein Partner nicht doppelt in derselben Runde gezogen. Gibt es nicht genug passende Spieler, erscheint ein Hinweis – dann ggf. eine Regel abschalten.

Über "K.O.-Phase starten" wird die aktuelle Pyramiden-Rangfolge eingefroren; sie ist ab dann die Grundlage für die Setzliste. Während der K.O.-Phase können keine neuen Pyramiden-Spiele (auch keine kampflosen) und keine Doppel-Herausforderungen mehr eingetragen werden. Ergebnisse der K.O.-Phase verändern die Pyramide **nicht**.  
Die K.O.-Phase kann wieder deaktiviert werden – dabei gehen alle K.O.-Spiele und Auslosungen verloren, die Pyramide bleibt erhalten. Vorher am besten exportieren.

### Spiele verwalten
Hier können alle eingetragenen Spiele eingesehen werden. Diese haben jeweils einen von 3 Status (Unbestätigt, Bestätigt, Abgelehnt). Admins können über die Buttons rechts den Status jedes Spiels verändern. Nur bestätigte Spiele gehen in die Wertung ein. Ein bestätigtes Spiel kann auch wieder zurückgenommen werden. Beim Einzel wird dieses dann aus der Wertung entfernt. Beim Doppel ist das nicht möglich, sodass der Admin die Reihenfolge manuell ändern muss.  
Admins können hier ebenfalls Ergebnisse anpassen oder Spiele löschen. Es ist ebenfalls möglich, den Sieger eines Spiels zu ändern (über die Punktzahl). Beim Einzel stellt dies in der Gruppenphase kein Problem dar. Beim Doppel hingegen werden Änderungen an der Pyramide nachträglich nicht mehr vorgenommen, dies muss manuell durch einen Admin passieren. ([Admin-Funktionen](#admin-funktionen)).  
Die angezeigen Spiele können über die Buttons und die Suchleiste gefiltert werden.

### Einstellungen
Hier können verschiedene Verhaltensweisen der App gesteuert werden, die Auswirkungen auf die Spieleintragung und -anzeige haben.

#### Standardstatus für neue Spiele
Hier kann festgelegt werden, welchen Status neu eingetragene Spiele standardmäßig erhalten sollen. Es gibt folgende Einstellmöglichkeiten:
- **Einzel - Admin**: Wenn ein Admin ein Einzel-Spiel einträgt
- **Einzel - Nutzer**: Wenn ein normaler Nutzer (z.B. über QR-Code-Login) ein Einzel-Spiel einträgt
- **Doppel - Admin**: Wenn ein Admin ein Doppel-Spiel einträgt
- **Doppel - Nutzer**: Wenn ein normaler Nutzer ein Doppel-Spiel einträgt

Für jede dieser Optionen kann gewählt werden:
- **Bestätigt**: Das Spiel geht sofort in die Wertung ein
- **Unbestätigt**: Das Spiel muss erst von einem Admin unter [Spiele verwalten](#spiele-verwalten) bestätigt werden, bevor es in die Wertung eingeht

**Empfehlung**: Admin-Eintragungen sollten auf "Bestätigt" stehen, während Nutzer-Eintragungen auf "Unbestätigt" gesetzt werden können, um Missbrauch zu vermeiden.

#### Anzeige unbestätigter Spiele
Hier kann gesteuert werden, ob unbestätigte Spiele auf der öffentlichen Spiele-Seite angezeigt werden sollen. Dies kann getrennt für Einzel und Doppel eingestellt werden. Unbestätigte Spiele erscheinen mit einem entsprechenden Hinweis, gehen aber nicht in die Wertung ein. Diese Einstellung hat keinen Einfluss auf die Admin-Ansicht unter [Spiele verwalten](#spiele-verwalten), dort werden immer alle Spiele angezeigt.

#### Herausforderungs-Validierung
Hier kann für Einzel und Doppel separat eingestellt werden, wie die App reagieren soll, wenn eine Herausforderung/ Spiel eingetragen wird, das gegen die Regeln verstößt.

**Hinweis**: Diese Einstellung beeinflusst nur das Eintragen neuer Spiele, bereits eingetragene Spiele bleiben unverändert.

#### Anzeige unbestätiger Spiele
Hier kann je Spielmodus eingestellt werden, ob unbestätige Spiele Nutzern angezeigt werden sollen, die kein Admin sind. Falls ja, wird auch angezeigt, dass das Spiel unbestätigt ist.


### Export
Hier können alle gespeicherten Daten der App exportiert werden. Durch das setzen der Haken kann entschieden werden, welche Daten in die Excel-Datei exportiert werden.

### Statistik
Hier ist eine einfache Nutzungsstatistik der App zu sehen (Zeitraum 7, 30 oder 90 Tage): App-Starts pro Tag als Diagramm sowie die Aufrufe je Seite.
- **App-Starts**: einmal pro Laden der App. **Seitenaufrufe**: jeder Wechsel auf eine Seite.
- Aufrufe von eingeloggten Admins werden getrennt gezählt (Spalte "Admins"), damit die eigene Pflege die Zahlen nicht verfälscht.
- Gespeichert werden ausschließlich Summen je Tag und Seite (Firestore-Sammlung `stats`, ein Dokument pro Tag). Es gibt keine Cookies, keinen Eintrag im Browser-Speicher, keine Nutzer-IDs und keine Zeitpunkte einzelner Aufrufe. Eindeutige Besucher lassen sich deshalb bewusst nicht ermitteln.

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

Sobald die K.O.-Phase gestartet wurde (siehe [Doppel verwalten](#doppel-verwalten)), kann über die Buttons oben zwischen der eingefrorenen Pyramide und dem K.O.-Baum umgeschaltet werden. Im K.O.-Baum wird jeweils direkt am entsprechenden Spiel auf "Ergebnis eintragen" gedrückt. Ergebnisse der K.O.-Phase können nur von Admins eingetragen werden und wirken sich nicht auf die Pyramide aus.  
Vor dem Spiel werden über "Partner zuordnen" die Partner beider Teams ausgelost oder eingetragen. Im Eintrage-Fenster sind sie vorausgewählt und können bei Bedarf noch geändert werden, danach wird das Ergebnis eingetragen.  
Im selben Fenster kann ein Spiel unten auch **kampflos** gewertet werden – je ein Button pro Team, das Ergebnis wird als 21:0, 21:0 gespeichert. Der Partner ist dabei optional, weil er bei einem Nichtantreten oft gar nicht feststeht. Kampflose Spiele sind im K.O.-Baum und in der Spiele-Liste mit "Kampflos" gekennzeichnet.


## Herausforderungen

### Einzel
Herausforderungen in Einzel sind nur während der Gruppenphase möglich. Die werden automatisiert durch das System erstellt und bilden Hin- und Rückrunde jeder Spielerkombination aus jeder Gruppe ab. Es kann nach Spielernamen gesucht werden und auch das Eintragen von Ergebnissen für einzelne Spiele ist hier direkt möglich. Die ersten 2 Spiele pro Spielerkombination werden automatisch als Hin- und Rückspiel gewertet. Alle Spiele ab dem Dritten finden als Herausforderungen keine Beachtung mehr, wirken sich aber trotzdem auf die Gruppentabelle aus.

### Doppel
Im Doppel sind die Herausforderungen im Prinzip lediglich eine terminliche Erinnerung. Man kann eintragen, dass ein Spieler einen anderen herausgefordert hat und ein Ablaufdatum eintragen. Auf der Startseite der Anwendung wird man über anstehende und überfällige Doppel-Herausforderungen benachrichtigt. Mehr Funktion als diese Terminierung haben Doppel-herausforderungen nicht. Man könnte also in der Theorie die gesamten Vereinsmeisterschaften abwickeln, ohne auch nur eine Herausforderung eingetragen zu haben.  
Sind erstmal Herausforderungen eingetragen, so kann man diese als erledigt markieren (falls das Spiel bereits eingetragen ist, die Herausforderung aber systemisch noch steht) oder das Ergebnis direkt eintragen und damit auch die Herausforderung erledigen. 

## Spiele
Hier können alle vergangenen Spiele in Einzel & Doppel eingesehen werden, inklusive der Spiele aus den K.O.-Phasen. Diese sind mit der jeweiligen Runde gekennzeichnet (VF, HF, Pl.3, Finale). Der K.O.-Baum selbst ist weiterhin über die Einzel- bzw. Doppel-Seite einsehbar. Es kann nach den Namen einzelner Spieler gefiltert werden.
In den Einstellungen kann durch den Admin festgelegt werden, ob hier auch unbestätige Spiele angezeigt werden sollen. Abgelehnte Spiele werden hier nie angezeigt.


## Spieler
Hier können alle Spieler, die in der Anwendung registiert sind, angezeigt werden. Durck klicken die Kachel des jeweiligen Spielers können die Statistiken in Einzel und Doppel sowie alle Spiele abgerufen werden.


## Kontakt & Support

Bei technischen Problemen oder Fragen zur App wende dich am besten an Daniel R.   
Für die Registrierung neuer Accounts ebenfalls.