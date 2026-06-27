

const path = require('path');
const fs   = require('fs');

let SQL = null;
let db  = null;
let dbFilePath = null;

async function init(userDataPath) {
  const initSqlJs = require('sql.js');
  SQL = await initSqlJs();
  dbFilePath = path.join(userDataPath, 'epicerie.db');
  if (fs.existsSync(dbFilePath)) {
    db = new SQL.Database(fs.readFileSync(dbFilePath));
  } else {
    db = new SQL.Database();
  }
  migrate();
  save();
  console.log('[db] initialisée ->', dbFilePath);
}

function save() {
  if (!db || !dbFilePath) return;
  fs.writeFileSync(dbFilePath, Buffer.from(db.export()));
}

function close() {
  save();
  if (db) db.close();
}

function migrate() {
  db.run(`
    CREATE TABLE IF NOT EXISTS produits (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      barcode    TEXT UNIQUE,
      nom        TEXT NOT NULL,
      marque     TEXT,
      categorie  TEXT,
      prix       REAL NOT NULL DEFAULT 0,
      unite      TEXT DEFAULT 'unité',
      image_url  TEXT,
      off_data   TEXT,
      cree_le    TEXT DEFAULT (datetime('now')),
      modifie_le TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS ventes (
      id       INTEGER PRIMARY KEY AUTOINCREMENT,
      total    REAL NOT NULL,
      paiement TEXT NOT NULL DEFAULT 'especes',
      note     TEXT,
      cree_le  TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS vente_articles (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      vente_id     INTEGER NOT NULL,
      produit_id   INTEGER,
      produit_nom  TEXT NOT NULL,
      produit_prix REAL NOT NULL,
      quantite     REAL NOT NULL DEFAULT 1,
      sous_total   REAL NOT NULL
    );
    CREATE TABLE IF NOT EXISTS parametres (
      cle    TEXT PRIMARY KEY,
      valeur TEXT NOT NULL
    );
    INSERT OR IGNORE INTO parametres (cle, valeur) VALUES
      ('langue',       'fr'),
      ('theme',        'dark'),
      ('nom_boutique', 'Mon Épicerie');
  `);
}

function query(sql, params = []) {
  if (!db) { console.error('[db] pas initialisée'); return []; }
  try {
    const stmt = db.prepare(sql);
    stmt.bind(params);
    const rows = [];
    while (stmt.step()) rows.push(stmt.getAsObject());
    stmt.free();
    return rows;
  } catch(e) {
    console.error('[db] query error:', e.message, sql);
    return [];
  }
}

function run(sql, params = []) {
  if (!db) { console.error('[db] pas initialisée'); return; }
  try {
    db.run(sql, params);
    save();
  } catch(e) {
    console.error('[db] run error:', e.message, sql);
    throw e;
  }
}

function lastId() {
  return query('SELECT last_insert_rowid() as id')[0]?.id || 0;
}

function getAllProduits() {
  return query('SELECT * FROM produits ORDER BY nom ASC');
}

function searchProduits(q) {
  const p = `%${q}%`;
  return query('SELECT * FROM produits WHERE nom LIKE ? OR barcode LIKE ? OR marque LIKE ? OR categorie LIKE ? ORDER BY nom ASC LIMIT 50', [p,p,p,p]);
}

function getProduitByBarcode(barcode) {
  return query('SELECT * FROM produits WHERE barcode = ?', [barcode])[0] || null;
}

function addProduit(data) {
  db.run('INSERT INTO produits (barcode,nom,marque,categorie,prix,unite,image_url,off_data) VALUES (?,?,?,?,?,?,?,?)', [
    data.barcode||null, data.nom, data.marque||null, data.categorie||null,
    parseFloat(data.prix)||0, data.unite||'unité', data.image_url||null,
    data.off_data ? JSON.stringify(data.off_data) : null,
  ]);
  const id = db.exec('SELECT last_insert_rowid()')[0].values[0][0];
  save();
  return query('SELECT * FROM produits WHERE id = ?', [id])[0];
}

function updateProduit(id, data) {
  run("UPDATE produits SET nom=?,marque=?,categorie=?,prix=?,unite=?,barcode=?,modifie_le=datetime('now') WHERE id=?",
    [data.nom, data.marque||null, data.categorie||null, parseFloat(data.prix)||0, data.unite||'unité', data.barcode||null, id]);
  return query('SELECT * FROM produits WHERE id = ?', [id])[0];
}

function deleteProduit(id) {
  run('DELETE FROM produits WHERE id = ?', [id]);
  return { ok: true };
}

function createVente(data) {
  if (!db) throw new Error('DB non initialisée');
  db.run('INSERT INTO ventes (total,paiement,note) VALUES (?,?,?)',
    [data.total, data.paiement||'especes', data.note||null]);
  const venteId = db.exec('SELECT last_insert_rowid()')[0].values[0][0];
  console.log('[db] vente créée id=', venteId, 'articles=', data.articles?.length);
  for (const a of (data.articles || [])) {
    db.run('INSERT INTO vente_articles (vente_id,produit_id,produit_nom,produit_prix,quantite,sous_total) VALUES (?,?,?,?,?,?)',
      [venteId, a.produit_id||null, a.produit_nom, a.produit_prix, a.quantite, a.sous_total]);
  }
  save();
  return getVenteById(venteId);
}

function getVenteById(id) {
  const vente = query('SELECT * FROM ventes WHERE id = ?', [id])[0];
  if (!vente) return null;
  vente.articles = query('SELECT * FROM vente_articles WHERE vente_id = ?', [id]);
  return vente;
}

function getAllVentes(filters = {}) {
  let sql = 'SELECT * FROM ventes WHERE 1=1';
  const params = [];
  if (filters.date) { sql += ' AND date(cree_le) = date(?)'; params.push(filters.date); }
  if (filters.from) { sql += ' AND cree_le >= ?'; params.push(filters.from); }
  if (filters.to)   { sql += ' AND cree_le <= ?'; params.push(filters.to); }
  sql += ' ORDER BY cree_le DESC LIMIT 500';
  const ventes = query(sql, params);
  for (const v of ventes) {
    v.articles = query('SELECT * FROM vente_articles WHERE vente_id = ?', [v.id]);
  }
  return ventes;
}

function getTodayVentes() {
  const ventes = query("SELECT * FROM ventes WHERE date(cree_le) = date('now') ORDER BY cree_le DESC");
  for (const v of ventes) {
    v.articles = query('SELECT * FROM vente_articles WHERE vente_id = ?', [v.id]);
  }
  return ventes;
}

function getDailySummary(date) {
  const d = date || new Date().toISOString().slice(0, 10);
  const s = query('SELECT COUNT(*) as nb_ventes, SUM(total) as ca, AVG(total) as panier_moyen FROM ventes WHERE date(cree_le) = date(?)', [d])[0];
  const top = query(`
    SELECT va.produit_nom, SUM(va.quantite) as qte, SUM(va.sous_total) as ca
    FROM vente_articles va JOIN ventes v ON v.id = va.vente_id
    WHERE date(v.cree_le) = date(?)
    GROUP BY va.produit_nom ORDER BY ca DESC LIMIT 10`, [d]);
  return { date: d, ...s, top_produits: top };
}

function getParametres() {
  return Object.fromEntries(query('SELECT cle,valeur FROM parametres').map(r => [r.cle, r.valeur]));
}

function setParametre(cle, valeur) {
  run('INSERT INTO parametres (cle,valeur) VALUES (?,?) ON CONFLICT(cle) DO UPDATE SET valeur=excluded.valeur', [cle, String(valeur)]);
  return { cle, valeur };
}

module.exports = {
  init, close, save,
  getAllProduits, searchProduits, getProduitByBarcode, addProduit, updateProduit, deleteProduit,
  createVente, getVenteById, getAllVentes, getTodayVentes, getDailySummary,
  getParametres, setParametre,
};