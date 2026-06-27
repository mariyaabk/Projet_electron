/**
 * services/openfoodfacts.js — Enrichissement produit via l'API publique
 * Ne connaît PAS Electron. Gère : timeout, hors-ligne, produit introuvable.
 */

const OFF_URL = 'https://world.openfoodfacts.org/api/v2/product';
const TIMEOUT = 8000;

async function lookup(barcode) {
  if (!barcode || typeof barcode !== 'string') {
    throw new Error('Barcode invalide');
  }

  const clean = barcode.replace(/\D/g, '');
  if (clean.length < 8 || clean.length > 14) {
    const err = new Error('Format code-barres invalide (8–14 chiffres)');
    err.validation = true;
    throw err;
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT);

  let response;
  try {
    response = await fetch(`${OFF_URL}/${clean}.json`, {
      signal: controller.signal,
      headers: { 'User-Agent': 'EpicerieCaisse/1.0 (student project)' },
    });
  } catch (_) {
    const err = new Error('Pas de connexion — saisie manuelle requise');
    err.offline = true;
    throw err;
  } finally {
    clearTimeout(timer);
  }

  if (!response.ok) throw new Error(`Erreur serveur OFF (${response.status})`);

  const json = await response.json();
  if (json.status === 0 || !json.product) {
    throw new Error('Produit introuvable sur OpenFoodFacts');
  }

  const p = json.product;
  return {
    nom:       p.product_name_fr || p.product_name || p.generic_name || 'Produit sans nom',
    marque:    p.brands || null,
    categorie: p.categories_tags?.[0]?.replace('en:', '') || null,
    image_url: p.image_front_url || null,
    off_data: {
      nutriscore: p.nutriscore_grade || null,
      ecoscore:   p.ecoscore_grade   || null,
      quantite:   p.quantity         || null,
    },
  };
}

module.exports = { lookup };
