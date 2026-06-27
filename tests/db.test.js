
const os   = require('os');
const path = require('path');
const fs   = require('fs');
const db   = require('../services/db');

const tmpDir = os.tmpdir();

beforeAll(async () => {
  await db.init(tmpDir);
});

afterAll(() => {
  db.close();
  const dbFile = path.join(tmpDir, 'epicerie.db');
  if (fs.existsSync(dbFile)) fs.unlinkSync(dbFile);
});

//Poduits
describe('db — Produits', () => {

  test('addProduit retourne un objet avec id', () => {
    const p = db.addProduit({ nom: 'Tomates', prix: 2.5 });
    expect(p.id).toBeGreaterThan(0);
    expect(p.nom).toBe('Tomates');
  });

  test('getAllProduits retourne un tableau', () => {
    const list = db.getAllProduits();
    expect(Array.isArray(list)).toBe(true);
    expect(list.length).toBeGreaterThan(0);
  });

  test('searchProduits filtre par nom partiel', () => {
    db.addProduit({ nom: 'Pomme Granny', prix: 1.5 });
    const res = db.searchProduits('Pomme');
    expect(res.length).toBeGreaterThanOrEqual(1);
    expect(res.every((p) => p.nom.includes('Pomme'))).toBe(true);
  });

  test('searchProduits retourne vide si rien trouvé', () => {
    const res = db.searchProduits('xyz_introuvable_xyz');
    expect(res.length).toBe(0);
  });

  test('updateProduit modifie le prix', () => {
    const added = db.addProduit({ nom: 'Beurre', prix: 3.0 });
    db.updateProduit(added.id, { nom: 'Beurre', prix: 3.5, unite: 'unité' });
    const updated = db.getAllProduits().find((p) => p.id === added.id);
    expect(updated.prix).toBe(3.5);
  });

  test('deleteProduit le retire', () => {
    const added = db.addProduit({ nom: 'Sel', prix: 0.5 });
    db.deleteProduit(added.id);
    expect(db.getAllProduits().find((p) => p.id === added.id)).toBeUndefined();
  });

  test('getProduitByBarcode trouve par code-barres', () => {
    db.addProduit({ nom: 'Nutella', barcode: '3017620422003', prix: 4.5 });
    const found = db.getProduitByBarcode('3017620422003');
    expect(found?.nom).toBe('Nutella');
  });

  test('getProduitByBarcode retourne null si inconnu', () => {
    const found = db.getProduitByBarcode('0000000000000');
    expect(found).toBeNull();
  });
});

// Ventes

describe('db — Ventes', () => {

  test('createVente crée vente + articles', () => {
    const p = db.addProduit({ nom: 'Pain', prix: 1.2 });
    const v = db.createVente({
      total: 2.4, paiement: 'especes',
      articles: [{ produit_id: p.id, produit_nom: 'Pain', produit_prix: 1.2, quantite: 2, sous_total: 2.4 }],
    });
    expect(v.id).toBeGreaterThan(0);
    expect(v.articles.length).toBe(1);
    expect(v.articles[0].quantite).toBe(2);
  });

  test('getVenteById retourne la vente avec articles', () => {
    const p = db.addProduit({ nom: 'Café', prix: 3.0 });
    const created = db.createVente({
      total: 3.0, paiement: 'carte',
      articles: [{ produit_id: p.id, produit_nom: 'Café', produit_prix: 3.0, quantite: 1, sous_total: 3.0 }],
    });
    const found = db.getVenteById(created.id);
    expect(found.total).toBe(3.0);
    expect(found.articles.length).toBe(1);
  });

  test('getDailySummary calcule le total', () => {
    const p = db.addProduit({ nom: 'Lait', prix: 1.5 });
    db.createVente({ total: 3.0, paiement: 'especes', articles: [{ produit_id: p.id, produit_nom: 'Lait', produit_prix: 1.5, quantite: 2, sous_total: 3.0 }] });
    db.createVente({ total: 1.5, paiement: 'carte',   articles: [{ produit_id: p.id, produit_nom: 'Lait', produit_prix: 1.5, quantite: 1, sous_total: 1.5 }] });
    const today = new Date().toISOString().slice(0, 10);
    const s = db.getDailySummary(today);
    expect(s.nb_ventes).toBeGreaterThanOrEqual(2);
    expect(s.ca).toBeGreaterThan(0);
  });
});

// Paramètres

describe('db — Paramètres', () => {

  test('get/set fonctionne', () => {
    db.setParametre('langue', 'en');
    expect(db.getParametres().langue).toBe('en');
  });

  test('set écrase la valeur existante', () => {
    db.setParametre('theme', 'light');
    db.setParametre('theme', 'dark');
    expect(db.getParametres().theme).toBe('dark');
  });
});
