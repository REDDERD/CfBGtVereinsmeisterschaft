// js/components/PartnerSlotMachine.js
// Slotmaschinen-Animation für die Partner-Auslosung im Doppel-K.O.
// Wird direkt an <body> gehängt (nicht in #app), damit ein render() durch
// Firestore-Updates die laufende Animation nicht ersetzt.

const SLOT_ITEM_HEIGHT = 64; // px, muss zu .slot-item in index.html passen
const SLOT_VISIBLE_ROWS = 3;

function _shuffleNames(names) {
  const result = [...names];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Walze von oben nach unten. Die Walze läuft nach unten, am Ende steht
 * Index 1 (der Gewinner) in der mittleren Zeile.
 */
function _buildSlotStrip(names, winnerName) {
  const loops = Math.max(4, Math.ceil(36 / names.length));
  const rest = [];
  for (let i = 0; i < loops; i++) rest.push(..._shuffleNames(names));

  const others = names.filter((n) => n !== winnerName);
  const neighbour = () =>
    others.length ? others[Math.floor(Math.random() * others.length)] : winnerName;

  return [neighbour(), winnerName, neighbour(), ...rest];
}

/**
 * Startet die Slotmaschine.
 * @param {Object} options
 * @param {string} options.title - z. B. "Partner für Max"
 * @param {string} options.subtitle - z. B. "VF A"
 * @param {string[]} options.names - alle möglichen Namen
 * @param {string} options.winnerName - der bereits ausgeloste Name
 * @param {Function} [options.onLanded] - wird beim Stillstand aufgerufen (darf async sein)
 */
function spinPartnerSlotMachine({ title, subtitle, names, winnerName, onLanded }) {
  document.getElementById("partnerSlotMachine")?.remove();

  const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  const duration = reduceMotion ? 800 : 5500;
  const strip = _buildSlotStrip(names, winnerName);

  const overlay = document.createElement("div");
  overlay.id = "partnerSlotMachine";
  overlay.className = "slot-overlay";
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-modal", "true");
  overlay.setAttribute("aria-label", title);
  overlay.innerHTML = `
    <div class="slot-machine">
      <div class="slot-subtitle"></div>
      <div class="slot-title"></div>
      <div class="slot-window">
        <div class="slot-strip"></div>
        <div class="slot-payline" aria-hidden="true"></div>
      </div>
      <div class="slot-result" aria-live="polite"></div>
      <button type="button" class="slot-close" hidden>Fertig</button>
    </div>`;

  // Namen per textContent setzen (kein HTML aus Spielernamen)
  overlay.querySelector(".slot-subtitle").textContent = subtitle || "";
  overlay.querySelector(".slot-title").textContent = title || "";
  const stripEl = overlay.querySelector(".slot-strip");
  strip.forEach((name) => {
    const item = document.createElement("div");
    item.className = "slot-item";
    item.textContent = name;
    stripEl.appendChild(item);
  });

  const resultEl = overlay.querySelector(".slot-result");
  const closeBtn = overlay.querySelector(".slot-close");

  let landed = false;
  const close = () => {
    if (!landed) return;
    document.removeEventListener("keydown", onKeydown);
    overlay.remove();
  };
  const onKeydown = (e) => {
    if (e.key === "Escape") close();
  };
  closeBtn.addEventListener("click", close);
  document.addEventListener("keydown", onKeydown);

  document.body.appendChild(overlay);

  // Startposition: unteres Ende der Walze, leicht verschwommen
  const startY = -(strip.length - SLOT_VISIBLE_ROWS) * SLOT_ITEM_HEIGHT;
  stripEl.style.transform = `translateY(${startY}px)`;
  stripEl.style.filter = reduceMotion ? "none" : "blur(2.5px)";
  stripEl.getBoundingClientRect(); // Reflow, damit die Startposition greift

  // Schnell anlaufen, lange auslaufen
  stripEl.style.transition = `transform ${duration}ms cubic-bezier(0.1, 0.7, 0.15, 1), filter ${Math.round(duration * 0.8)}ms ease-in`;
  stripEl.style.transform = "translateY(0)";
  stripEl.style.filter = "none";

  const land = async () => {
    if (landed) return;
    landed = true;

    stripEl.children[1]?.classList.add("is-winner");
    overlay.querySelector(".slot-machine").classList.add("is-landed");
    resultEl.textContent = winnerName;
    launchConfetti();

    try {
      await onLanded?.();
    } catch (error) {
      console.error("Fehler beim Speichern der Auslosung:", error);
      resultEl.textContent = `Fehler beim Speichern: ${error.message}`;
      resultEl.classList.add("is-error");
    }

    closeBtn.hidden = false;
    closeBtn.focus();
  };

  stripEl.addEventListener("transitionend", (e) => {
    if (e.propertyName === "transform") land();
  });
  setTimeout(land, duration + 300); // Fallback, falls transitionend ausbleibt
}
