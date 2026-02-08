// js/pages/admin/AdminExportTab.js
// Export-Tab mit Checkboxen für verschiedene Datenexporte

function AdminExportTab() {
  return `
    <div class="space-y-6">
  
      <div class="bg-gray-50 p-6 rounded-lg">
        <p class="text-gray-600 mb-4">Wähle die Daten aus, die du exportieren möchtest. Alle ausgewählten Daten werden in separate Tabellenblätter einer Excel-Datei exportiert.</p>
        
        <!-- Alle auswählen/abwählen -->
        <div class="mb-6 pb-4 border-b border-gray-300">
          <label class="flex items-center space-x-3 cursor-pointer">
            <input 
              type="checkbox" 
              id="export-select-all"
              onchange="toggleAllExportOptions()"
              class="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
            >
            <span class="text-lg font-semibold text-gray-800">Alle</span>
          </label>
        </div>
        
        <!-- Export-Optionen -->
        <div class="space-y-3 mb-6">
          <label class="flex items-center space-x-3 cursor-pointer hover:bg-gray-100 p-2 rounded">
            <input 
              type="checkbox" 
              id="export-singles-group"
              class="export-option w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
            >
            <span class="text-gray-700">Einzel Gruppentabellen</span>
          </label>
          
          <label class="flex items-center space-x-3 cursor-pointer hover:bg-gray-100 p-2 rounded opacity-50">
            <input 
              type="checkbox" 
              id="export-singles-knockout"
              class="export-option w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
              disabled
            >
            <span class="text-gray-500">Einzel K.O.-Phase (noch nicht implementiert)</span>
          </label>
          
          <label class="flex items-center space-x-3 cursor-pointer hover:bg-gray-100 p-2 rounded">
            <input 
              type="checkbox" 
              id="export-doubles-pyramid"
              class="export-option w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
            >
            <span class="text-gray-700">Doppel-Rangfolge</span>
          </label>
          
          <label class="flex items-center space-x-3 cursor-pointer hover:bg-gray-100 p-2 rounded">
            <input 
              type="checkbox" 
              id="export-singles-matches"
              class="export-option w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
            >
            <span class="text-gray-700">Einzel-Spiele</span>
          </label>
          
          <label class="flex items-center space-x-3 cursor-pointer hover:bg-gray-100 p-2 rounded">
            <input 
              type="checkbox" 
              id="export-doubles-matches"
              class="export-option w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
            >
            <span class="text-gray-700">Doppel-Spiele</span>
          </label>
          
          <label class="flex items-center space-x-3 cursor-pointer hover:bg-gray-100 p-2 rounded opacity-50">
            <input 
              type="checkbox" 
              id="export-player-stats"
              class="export-option w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
              disabled
            >
            <span class="text-gray-500">Spielerstatistiken (noch nicht implementiert)</span>
          </label>
          
          <label class="flex items-center space-x-3 cursor-pointer hover:bg-gray-100 p-2 rounded">
            <input 
              type="checkbox" 
              id="export-settings"
              class="export-option w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
            >
            <span class="text-gray-700">App-Einstellungen</span>
          </label>
        </div>
        
        <!-- Export-Button -->
        <div class="flex justify-end">
            <button onclick="performExport()" class="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold shadow-md hover:shadow-lg">
                ${icons.download} <span>Excel-Datei herunterladen</span>
            </button>
        </div>
      </div>
    </div>
  `;
}

// Toggle alle Export-Optionen
function toggleAllExportOptions() {
  const selectAllCheckbox = document.getElementById("export-select-all");
  const exportOptions = document.querySelectorAll(
    ".export-option:not([disabled])",
  );

  exportOptions.forEach((checkbox) => {
    checkbox.checked = selectAllCheckbox.checked;
  });
}

// Führt den Export basierend auf den ausgewählten Optionen durch
function performExport() {
  const exportOptions = {
    singlesGroup:
      document.getElementById("export-singles-group")?.checked || false,
    singlesKnockout:
      document.getElementById("export-singles-knockout")?.checked || false,
    doublesPyramid:
      document.getElementById("export-doubles-pyramid")?.checked || false,
    singlesMatches:
      document.getElementById("export-singles-matches")?.checked || false,
    doublesMatches:
      document.getElementById("export-doubles-matches")?.checked || false,
    settings: document.getElementById("export-settings")?.checked || false,
  };

  // Prüfe, ob mindestens eine Option ausgewählt ist
  const hasSelection = Object.values(exportOptions).some((v) => v === true);

  if (!hasSelection) {
    Toast.error("Bitte wähle mindestens eine Export-Option aus");
    return;
  }

  try {
    const workbook = XLSX.utils.book_new();

    // Einzel Gruppenphase
    if (exportOptions.singlesGroup) {
      const sheetsData = buildSinglesGroupSheetData();
      Object.entries(sheetsData).forEach(([name, data]) => {
        addSheetFromData(workbook, data, name);
      });
    }

    // Einzel K.O.-Phase
    if (exportOptions.singlesKnockout) {
      const sheetsData = buildKnockoutSheetData();
      Object.entries(sheetsData).forEach(([name, data]) => {
        addSheetFromData(workbook, data, name);
      });
    }

    // Doppel-Pyramide
    if (exportOptions.doublesPyramid) {
      const sheetsData = buildDoublesPyramidSheetData();
      Object.entries(sheetsData).forEach(([name, data]) => {
        addSheetFromData(workbook, data, name);
      });
    }

    // Einzel-Spiele (inkl. K.O.)
    if (exportOptions.singlesMatches) {
      const sheetsData = buildSinglesMatchesSheetData();
      Object.entries(sheetsData).forEach(([name, data]) => {
        addSheetFromData(workbook, data, name);
      });
    }

    // Doppel-Spiele
    if (exportOptions.doublesMatches) {
      const sheetsData = buildDoublesMatchesSheetData();
      Object.entries(sheetsData).forEach(([name, data]) => {
        addSheetFromData(workbook, data, name);
      });
    }

    // Einstellungen
    if (exportOptions.settings) {
      const sheetsData = buildSettingsSheetData();
      Object.entries(sheetsData).forEach(([name, data]) => {
        addSheetFromData(workbook, data, name);
      });
    }

    // Datei mit Zeitstempel erstellen
    const timestamp = new Date().toISOString().split("T")[0];
    const filename = `Vereinsmeisterschaft_Export_${timestamp}.xlsx`;

    XLSX.writeFile(workbook, filename);
    Toast.success("Export erfolgreich!");
  } catch (error) {
    console.error("Export error:", error);
    Toast.error("Fehler beim Export");
  }
}
