// functions/src/users/claims.ts
// Custom Claims aus users/{uid} – Roadmap P3, optional, noch Stub
//
// Heute liest jede Rule-Auswertung mit isAdmin() zusätzlich users/{uid}.
// Mit Claims könnten die Rules request.auth.token.admin nutzen.
// Wird bewusst NICHT aus index.ts exportiert, solange es ein Stub ist.

import {onDocumentWritten} from "firebase-functions/firestore";
import * as logger from "firebase-functions/logger";

/**
 * Umsetzung:
 * 1. getAuth().setCustomUserClaims(uid, { admin: isAdmin === true, qrLogin: isQrLogin === true })
 *    bzw. Claims entfernen, wenn das Dokument gelöscht wurde
 * 2. Client: nach Änderung Token erneuern (user.getIdToken(true))
 * 3. Rules: isAdmin() → request.auth.token.admin == true
 */
export const onUserWritten = onDocumentWritten("users/{uid}", (event) => {
  logger.warn("onUserWritten ist noch nicht umgesetzt", {uid: event.params.uid});
});
