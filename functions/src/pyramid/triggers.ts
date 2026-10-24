// functions/src/pyramid/triggers.ts
// Hält die Pyramide synchron zu den Doppel-Pools der Spieler.
// Ersetzt den schreibenden Teil von loadPyramid() (js/services/firebase-listeners.js),
// der bisher in jedem Browser lief und für Nicht-Admins an den Rules scheiterte.

import {onDocumentWritten} from "firebase-functions/firestore";
import * as logger from "firebase-functions/logger";
import {appendPlayers, removePlayers} from "../domain/pyramid.js";
import {db} from "../lib/firebase.js";
import {readPyramid, writePyramid} from "./pyramidRepository.js";

/**
 * Spieler bekommt einen Doppel-Pool (oder wird mit Pool angelegt) → unten anhängen.
 * Pool entfernt oder Spieler gelöscht → aus der Pyramide entfernen.
 * Ohne initialisierte Pyramide passiert nichts (initPyramid nimmt alle Pool-Spieler auf).
 * Idempotent: mehrfache Zustellung desselben Events ändert nichts.
 */
export const onSeasonPlayerWritten = onDocumentWritten(
  "seasons/{year}/players/{playerId}",
  async (event) => {
    const year = Number(event.params.year);
    const playerId = event.params.playerId;
    const wasInPool = !!event.data?.before.get("doublesPool");
    const isInPool = !!event.data?.after.get("doublesPool");

    if (wasInPool === isInPool || !Number.isInteger(year)) return;

    await db.runTransaction(async (tx) => {
      const pyramid = await readPyramid(tx, year);
      if (!pyramid.exists) return;

      const positions = isInPool ?
        appendPlayers(pyramid.positions, [playerId]) :
        removePlayers(pyramid.positions, [playerId]);

      if (positions.length === pyramid.positions.length) return;
      writePyramid(tx, year, positions);
    });

    logger.info("Pyramide synchronisiert", {year, playerId, added: isInPool});
  },
);
