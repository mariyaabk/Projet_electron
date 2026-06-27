

const fs = require('fs');

// CSV 

function toCSV(data, filePath) {
  if (!data || data.length === 0) {
    fs.writeFileSync(filePath, '', 'utf8');
    return;
  }
  const headers = Object.keys(data[0]);
  const esc = (v) => {
    if (v === null || v === undefined) return '';
    const s = String(v).replace(/"/g, '""');
    return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s}"` : s;
  };
  const lines = [
    headers.map(esc).join(','),
    ...data.map((row) => headers.map((h) => esc(row[h])).join(',')),
  ];
  // BOM UTF-8 → Excel ouvre correctement sans configuration
  fs.writeFileSync(filePath, '\uFEFF' + lines.join('\r\n'), 'utf8');
}

// PDF 

function ticketPDF(vente, filePath) {
  const lines = [
    '           TICKET DE CAISSE',
    '           ================',
    `Date    : ${new Date(vente.cree_le).toLocaleString('fr-FR')}`,
    `N° Vente: #${vente.id}`,
    '----------------------------------------',
    ...(vente.articles || []).map(
      (a) => `${(a.produit_nom || '').padEnd(22)} x${a.quantite}  ${Number(a.sous_total).toFixed(2)} EUR`
    ),
    '----------------------------------------',
    `TOTAL   : ${Number(vente.total).toFixed(2)} EUR`,
    `Paiement: ${vente.paiement === 'especes' ? 'Espèces' : 'Carte'}`,
    '',
    '        Merci de votre visite !',
  ];
  _writePDF(lines, filePath);
}

function rapportPDF(rapport, filePath) {
  const lines = [
    `RAPPORT JOURNALIER — ${rapport.date}`,
    '========================================',
    `Ventes          : ${rapport.nb_ventes || 0}`,
    `Chiffre affaires: ${Number(rapport.ca || 0).toFixed(2)} EUR`,
    `Panier moyen    : ${Number(rapport.panier_moyen || 0).toFixed(2)} EUR`,
    '',
    'TOP PRODUITS :',
    '----------------------------------------',
    ...(rapport.top_produits || []).map(
      (p) => `${(p.produit_nom || '').padEnd(26)} ${p.qte} ventes — ${Number(p.ca).toFixed(2)} EUR`
    ),
  ];
  _writePDF(lines, filePath);
}

function _writePDF(lines, filePath) {
  // PDF 1.4 minimal valide — lisible par tout lecteur PDF
  const ops = lines.map((line, i) => {
    const y = 800 - i * 14;
    const safe = line.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
    return `BT /F1 10 Tf 40 ${y} Td (${safe}) Tj ET`;
  }).join('\n');

  const stream = ops;
  const pdf = [
    '%PDF-1.4',
    '1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj',
    '2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj',
    `3 0 obj<</Type/Page/MediaBox[0 0 595 842]/Parent 2 0 R/Contents 4 0 R/Resources<</Font<</F1 5 0 R>>>>>>endobj`,
    `4 0 obj<</Length ${stream.length}>>`,
    'stream', stream, 'endstream endobj',
    '5 0 obj<</Type/Font/Subtype/Type1/BaseFont/Courier>>endobj',
    'xref\n0 6',
    '0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \n0000000274 00000 n \n0000000423 00000 n ',
    'trailer<</Size 6/Root 1 0 R>>',
    'startxref\n492',
    '%%EOF',
  ].join('\n');

  fs.writeFileSync(filePath, pdf, 'latin1');
}

module.exports = { toCSV, ticketPDF, rapportPDF };
