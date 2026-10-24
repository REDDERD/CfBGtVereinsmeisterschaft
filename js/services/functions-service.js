// js/services/functions-service.js
// Aufruf der Firebase Functions (Callable) inkl. Bestätigungs-Flow
// Konzept: functions/KONZEPT.md

/**
 * Ruft eine Callable Function auf.
 *
 * Antwortet der Server mit { status: "needs-confirmation", warnings }, wurde noch
 * nichts gespeichert: Die Hinweise werden nacheinander per Modal.warn angezeigt
 * und die Function nach Zustimmung mit acknowledgeWarnings: true erneut aufgerufen.
 *
 * @returns {Promise<Object|null>} Antwortdaten ({ status: "ok", ... }) oder null bei Abbruch
 * @throws Fehler der Function – error.message ist eine deutsche Meldung für den Nutzer
 */
async function callFunction(name, data) {
  const callable = functions.httpsCallable(name);
  let result = (await callable(data)).data;

  if (result?.status === "needs-confirmation") {
    for (const warning of result.warnings) {
      const confirmed = await Modal.warn({
        title: warning.title,
        message: warning.message,
        confirmText: "Ja, eintragen",
        cancelText: "Abbrechen",
      });
      if (!confirmed) return null;
    }
    result = (await callable({ ...data, acknowledgeWarnings: true })).data;
  }

  return result;
}
