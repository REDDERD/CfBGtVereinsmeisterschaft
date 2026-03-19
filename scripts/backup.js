// backup.js
import fetch from 'node-fetch';
import * as XLSX from 'xlsx';
import fs from 'fs';

// Service Account Token holen
const sa = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

// Firestore abfragen
const res = await fetch(
  `https://firestore.googleapis.com/v1/projects/${process.env.FIREBASE_PROJECT_ID}/databases/(default)/documents/DEINE_COLLECTION`,
  { headers: { Authorization: `Bearer ${await getAccessToken(sa)}` } }
);

const { documents } = await res.json();

const rows = documents.map(doc => flattenFields(doc.fields));

// xlsx genau wie du es kennst
const ws = XLSX.utils.json_to_sheet(rows);
const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, ws, 'Daten');

const filename = `backup-${new Date().toISOString().split('T')[0]}.xlsx`;
XLSX.writeFile(wb, filename);
console.log(`Gespeichert: ${filename}`);
