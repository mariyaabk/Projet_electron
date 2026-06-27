
// TRADUCTIONS


const T = {
  fr: {
    nav: { caisse: 'Caisse', produits: 'Produits', ventes: 'Ventes', parametres: 'Paramètres' },
    caisse: {
      titre: 'Encaissement', recherche: 'Rechercher un produit…', panier: 'Panier',
      total: 'Total', valider: 'Valider la vente', vider: 'Vider le panier',
      especes: 'Espèces', carte: 'Carte', panier_vide: 'Le panier est vide',
      vente_ok: 'Vente enregistrée', vente_msg: 'La vente a été enregistrée.',
    },
    produits: {
      titre: 'Catalogue', ajouter: 'Ajouter', modifier: 'Modifier', supprimer: 'Supprimer',
      recherche: 'Rechercher…', barcode: 'Code-barres', nom: 'Nom', marque: 'Marque',
      categorie: 'Catégorie', prix: 'Prix (€)', unite: 'Unité',
      lookup: 'Chercher sur OpenFoodFacts', lookup_chargement: 'Recherche…',
      lookup_ok: 'Produit trouvé !', lookup_offline: 'Hors-ligne — saisie manuelle',
      lookup_nok: 'Introuvable — saisie manuelle',
      enregistrer: 'Enregistrer', annuler: 'Annuler',
      confirmer_suppr: 'Supprimer ce produit ?', aucun: 'Aucun produit.',
    },
    ventes: {
      titre: 'Historique', aujourd_hui: "Aujourd'hui", date: 'Date', total: 'Total',
      paiement: 'Paiement', detail: 'Détail', export_csv: 'CSV', export_pdf: 'Rapport PDF',
      aucune: 'Aucune vente.', nb_ventes: 'Ventes', ca: "Chiffre d'affaires", panier_moyen: 'Panier moyen',
    },
    parametres: {
      titre: 'Paramètres', langue: 'Langue', theme: 'Thème', sombre: 'Sombre', clair: 'Clair',
      nom_boutique: 'Nom de la boutique', enregistrer: 'Enregistrer', sauvegarde: 'Paramètres sauvegardés',
    },
    commun: { chargement: 'Chargement…', erreur: 'Erreur', fermer: 'Fermer', especes: 'Espèces', carte: 'Carte' },
  },
  en: {
    nav: { caisse: 'Cashier', produits: 'Products', ventes: 'Sales', parametres: 'Settings' },
    caisse: {
      titre: 'Checkout', recherche: 'Search a product…', panier: 'Cart',
      total: 'Total', valider: 'Confirm sale', vider: 'Clear cart',
      especes: 'Cash', carte: 'Card', panier_vide: 'Cart is empty',
      vente_ok: 'Sale recorded', vente_msg: 'The sale has been recorded.',
    },
    produits: {
      titre: 'Catalog', ajouter: 'Add', modifier: 'Edit', supprimer: 'Delete',
      recherche: 'Search…', barcode: 'Barcode', nom: 'Name', marque: 'Brand',
      categorie: 'Category', prix: 'Price (€)', unite: 'Unit',
      lookup: 'Look up OpenFoodFacts', lookup_chargement: 'Searching…',
      lookup_ok: 'Product found!', lookup_offline: 'Offline — manual entry',
      lookup_nok: 'Not found — manual entry',
      enregistrer: 'Save', annuler: 'Cancel',
      confirmer_suppr: 'Delete this product?', aucun: 'No products.',
    },
    ventes: {
      titre: 'History', aujourd_hui: 'Today', date: 'Date', total: 'Total',
      paiement: 'Payment', detail: 'Detail', export_csv: 'CSV', export_pdf: 'PDF Report',
      aucune: 'No sales.', nb_ventes: 'Sales', ca: 'Revenue', panier_moyen: 'Avg basket',
    },
    parametres: {
      titre: 'Settings', langue: 'Language', theme: 'Theme', sombre: 'Dark', clair: 'Light',
      nom_boutique: 'Shop name', enregistrer: 'Save', sauvegarde: 'Settings saved',
    },
    commun: { chargement: 'Loading…', erreur: 'Error', fermer: 'Close', especes: 'Cash', carte: 'Card' },
  },
};

let langue = 'fr';
function t(key) {
  const parts = key.split('.');
  let v = T[langue];
  for (const p of parts) v = v?.[p];
  return v || key;
}
function applyTranslations() {
  document.querySelectorAll('[data-t]').forEach((el) => (el.textContent = t(el.dataset.t)));
}

// INIT

async function init() {
  const params = await window.api.parametres.get();
  langue = params.langue || 'fr';
  applyTheme(params.theme || 'dark');
  applyTranslations();
  document.getElementById('shopName').textContent = params.nom_boutique || 'Épicerie';

  updateOnline();
  window.addEventListener('online', updateOnline);
  window.addEventListener('offline', updateOnline);

  document.querySelectorAll('.nav-btn').forEach((btn) =>
    btn.addEventListener('click', () => goTo(btn.dataset.page))
  );

  document.getElementById('modalClose').addEventListener('click', closeModal);
  document.getElementById('modalOverlay').addEventListener('click', (e) => {
    if (e.target.id === 'modalOverlay') closeModal();
  });

  goTo('caisse');
}

function goTo(page) {
  document.querySelectorAll('.nav-btn').forEach((b) =>
    b.classList.toggle('active', b.dataset.page === page)
  );
  const main = document.getElementById('mainContent');
  const pages = { caisse: pageCaisse, produits: pageProduits, ventes: pageVentes, parametres: pageParametres };
  (pages[page] || pageCaisse)(main);
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme === 'light' ? 'light' : '');
}

function updateOnline() {
  const online = navigator.onLine;
  document.getElementById('statusDot').className = 'status-dot' + (online ? '' : ' offline');
  document.getElementById('statusText').textContent = online
    ? (langue === 'fr' ? 'En ligne' : 'Online')
    : (langue === 'fr' ? 'Hors-ligne' : 'Offline');
}

// UTILS


function esc(s) {
  if (!s) return '';
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
function prix(n) {
  return new Intl.NumberFormat(langue === 'fr' ? 'fr-FR' : 'en-US', { style:'currency', currency:'EUR' }).format(n||0);
}
function dateStr(s) {
  return new Date(s).toLocaleString(langue === 'fr' ? 'fr-FR' : 'en-US', {
    day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit'
  });
}
function debounce(fn, ms) {
  let timer;
  return (...a) => { clearTimeout(timer); timer = setTimeout(() => fn(...a), ms); };
}

function toast(msg, type = 'info', dur = 3500) {
  const c = document.getElementById('toastContainer');
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.innerHTML = `<span>${{success:'✓',error:'✕',info:'ℹ'}[type]||''}</span><span>${msg}</span>`;
  c.appendChild(el);
  setTimeout(() => {
    el.style.animation = 'slideOut .3s ease forwards';
    setTimeout(() => el.remove(), 300);
  }, dur);
}

function openModal(title, html) {
  document.getElementById('modalContent').innerHTML = `<h2 class="modal-title">${title}</h2>${html}`;
  document.getElementById('modalOverlay').classList.remove('hidden');
}
function closeModal() {
  document.getElementById('modalOverlay').classList.add('hidden');
}


// PAGE CAISSE


let panier = [];

async function pageCaisse(c) {
  panier = [];
  c.innerHTML = `
    <div class="page-header">
      <h1 class="page-title">${t('caisse.titre')}</h1>
    </div>
    <div class="caisse-layout">
      <div class="produit-zone">
        <div class="search-row">
          <input id="caisseSearch" type="text" placeholder="${t('caisse.recherche')}" />
        </div>
        <div class="produits-grille" id="caisseGrille"></div>
      </div>
      <div class="panier-panel">
        <div class="card-title">🛒 ${t('caisse.panier')}</div>
        <div class="panier-items" id="panierItems"></div>
        <div class="panier-total-row">
          <span>${t('caisse.total')}</span>
          <span class="panier-total" id="panierTotal">0,00 €</span>
        </div>
        <div class="paiement-btns">
          <button class="btn btn-success btn-lg" id="btnEspeces">💵 ${t('caisse.especes')}</button>
          <button class="btn btn-primary btn-lg" id="btnCarte">💳 ${t('caisse.carte')}</button>
        </div>
        <button class="btn btn-ghost btn-full" id="btnVider">🗑 ${t('caisse.vider')}</button>
      </div>
    </div>`;

  await chargerGrille();

  document.getElementById('caisseSearch').addEventListener('input', debounce(async (e) => chargerGrille(e.target.value), 250));
  document.getElementById('btnEspeces').addEventListener('click', () => validerVente('especes'));
  document.getElementById('btnCarte').addEventListener('click', () => validerVente('carte'));
  document.getElementById('btnVider').addEventListener('click', () => { panier = []; renderPanier(); });
}

async function chargerGrille(query = '') {
  const g = document.getElementById('caisseGrille');
  if (!g) return;
  const prods = query ? await window.api.produits.search(query) : await window.api.produits.getAll();
  if (!prods?.length) {
    g.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><span class="icon">📦</span><p>${t('produits.aucun')}</p></div>`;
    return;
  }
  g.innerHTML = prods.map((p) => `
    <div class="produit-tile" data-id="${p.id}" data-nom="${esc(p.nom)}" data-prix="${p.prix}">
      <div class="tile-nom">${esc(p.nom)}</div>
      ${p.marque ? `<div class="tile-marque">${esc(p.marque)}</div>` : ''}
      <div class="tile-prix">${prix(p.prix)}</div>
    </div>`).join('');

  // Event delegation sur la grille
  g.addEventListener('click', (e) => {
    const tile = e.target.closest('.produit-tile');
    if (tile) ajouterAuPanier({ id: +tile.dataset.id, nom: tile.dataset.nom, prix: +tile.dataset.prix });
  });
}

function ajouterAuPanier(produit) {
  const existing = panier.find((i) => i.produit.id === produit.id);
  existing ? existing.qte++ : panier.push({ produit, qte: 1 });
  renderPanier();
}

function renderPanier() {
  const c = document.getElementById('panierItems');
  if (!c) return;
  if (!panier.length) {
    c.innerHTML = `<div class="empty-cart"><span class="icon">🛒</span>${t('caisse.panier_vide')}</div>`;
  } else {
    c.innerHTML = panier.map((item, i) => `
      <div class="panier-item">
        <div class="panier-nom">${esc(item.produit.nom)}</div>
        <div class="qty-ctrl">
          <button class="qty-btn" data-action="dec" data-i="${i}">−</button>
          <span>${item.qte}</span>
          <button class="qty-btn" data-action="inc" data-i="${i}">+</button>
        </div>
        <div class="panier-sous-total">${prix(item.produit.prix * item.qte)}</div>
        <button class="rm-btn" data-action="rm" data-i="${i}">✕</button>
      </div>`).join('');


    c.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-action]');
      if (!btn) return;
      const i = +btn.dataset.i;
      const action = btn.dataset.action;
      if (action === 'inc') panier[i].qte++;
      else if (action === 'dec') { panier[i].qte--; if (panier[i].qte <= 0) panier.splice(i, 1); }
      else if (action === 'rm') panier.splice(i, 1);
      renderPanier();
    });
  }
  const total = panier.reduce((s, i) => s + i.produit.prix * i.qte, 0);
  const el = document.getElementById('panierTotal');
  if (el) el.textContent = prix(total);
}

async function validerVente(paiement) {
  if (!panier.length) { toast(t('caisse.panier_vide'), 'error'); return; }
  const total = panier.reduce((s, i) => s + i.produit.prix * i.qte, 0);
  try {
    await window.api.ventes.create({
      total, paiement,
      articles: panier.map((i) => ({
        produit_id: i.produit.id, produit_nom: i.produit.nom,
        produit_prix: i.produit.prix, quantite: i.qte, sous_total: i.produit.prix * i.qte,
      })),
    });
    await window.api.systeme.notify(t('caisse.vente_ok'), t('caisse.vente_msg'));
    toast(`${t('caisse.vente_ok')} — ${prix(total)}`, 'success');
    panier = []; renderPanier();
  } catch (err) { toast(`${t('commun.erreur')} : ${err.message}`, 'error'); }
}

// PAGE PRODUITS


async function pageProduits(c) {
  c.innerHTML = `
    <div class="page-header">
      <h1 class="page-title">${t('produits.titre')}</h1>
      <button class="btn btn-primary" id="btnAjouter">+ ${t('produits.ajouter')}</button>
    </div>
    <input type="text" id="prodSearch" placeholder="${t('produits.recherche')}" style="max-width:360px;margin-bottom:16px;" />
    <div class="produits-liste" id="produitsList"></div>`;

  await renderProduits();

  document.getElementById('btnAjouter').addEventListener('click', () => formulaireProduit(null));

  document.getElementById('prodSearch').addEventListener('input', debounce(async (e) => {
    const q = e.target.value.trim();
    const list = q ? await window.api.produits.search(q) : await window.api.produits.getAll();
    renderProduitsList(list);
  }, 250));

  // Event delegation sur la liste — FIX boutons modifier/supprimer
  document.getElementById('produitsList').addEventListener('click', async (e) => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const id = +btn.dataset.id;
    const nom = btn.dataset.nom || '';
    if (btn.dataset.action === 'modifier') {
      await formulaireProduit(id);
    } else if (btn.dataset.action === 'supprimer') {
      if (!confirm(`${t('produits.confirmer_suppr')}\n"${nom}"`)) return;
      await window.api.produits.delete(id);
      toast(`"${nom}" supprimé`, 'success');
      await renderProduits();
    }
  });
}

async function renderProduits() {
  const list = document.getElementById('produitsList');
  if (!list) return;
  renderProduitsList(await window.api.produits.getAll());
}

function renderProduitsList(prods) {
  const c = document.getElementById('produitsList');
  if (!c) return;
  if (!prods?.length) {
    c.innerHTML = `<div class="empty-state"><span class="icon">📦</span><p>${t('produits.aucun')}</p></div>`;
    return;
  }
  c.innerHTML = prods.map((p) => `
    <div class="produit-row">
      <div class="pr-info">
        <div class="pr-nom">${esc(p.nom)}</div>
        <div class="pr-meta">${[p.marque, p.categorie, p.barcode ? '📷 '+p.barcode : ''].filter(Boolean).join(' · ')}</div>
      </div>
      <div class="pr-prix">${prix(p.prix)} / ${esc(p.unite||'unité')}</div>
      <div class="pr-actions">
        <button class="btn btn-ghost" data-action="modifier" data-id="${p.id}">✏️ ${t('produits.modifier')}</button>
        <button class="btn btn-danger" data-action="supprimer" data-id="${p.id}" data-nom="${esc(p.nom)}">🗑</button>
      </div>
    </div>`).join('');
}

async function formulaireProduit(id) {
  let p = null;
  if (id) {
    const all = await window.api.produits.getAll();
    p = all.find((x) => x.id === id);
  }

  openModal(id ? t('produits.modifier') : t('produits.ajouter'), `
    <div class="form-grid">
      <div class="form-group full-width">
        <label>${t('produits.barcode')}</label>
        <div class="off-row">
          <input id="fBarcode" type="text" value="${esc(p?.barcode||'')}" placeholder="Ex: 3017620422003" />
          <button class="btn btn-ghost" id="btnOFF">🔍 ${t('produits.lookup')}</button>
        </div>
        <div id="offStatus" class="off-status"></div>
      </div>
      <div class="form-group full-width">
        <label>${t('produits.nom')} *</label>
        <input id="fNom" type="text" value="${esc(p?.nom||'')}" />
      </div>
      <div class="form-group">
        <label>${t('produits.marque')}</label>
        <input id="fMarque" type="text" value="${esc(p?.marque||'')}" />
      </div>
      <div class="form-group">
        <label>${t('produits.categorie')}</label>
        <input id="fCat" type="text" value="${esc(p?.categorie||'')}" />
      </div>
      <div class="form-group">
        <label>${t('produits.prix')} *</label>
        <input id="fPrix" type="number" value="${p?.prix||''}" min="0" step="0.01" />
      </div>
      <div class="form-group">
        <label>${t('produits.unite')}</label>
        <select id="fUnite">
          ${['unité','kg','g','L','mL','paquet','lot'].map((u)=>`<option value="${u}"${p?.unite===u?' selected':''}>${u}</option>`).join('')}
        </select>
      </div>
    </div>
    <div style="display:flex;gap:10px;justify-content:flex-end;margin-top:20px;">
      <button class="btn btn-ghost" id="btnAnnuler">${t('produits.annuler')}</button>
      <button class="btn btn-primary" id="btnSave">💾 ${t('produits.enregistrer')}</button>
    </div>`);

  document.getElementById('btnAnnuler').addEventListener('click', closeModal);
  document.getElementById('btnOFF').addEventListener('click', lookupOFF);
  document.getElementById('fBarcode').addEventListener('keydown', (e) => e.key === 'Enter' && lookupOFF());
  document.getElementById('btnSave').addEventListener('click', () => sauvegarderProduit(id));
}

async function lookupOFF() {
  const bc = document.getElementById('fBarcode').value.trim();
  if (!bc) return;
  const st = document.getElementById('offStatus');
  const btn = document.getElementById('btnOFF');
  st.className = 'off-status loading';
  st.textContent = t('produits.lookup_chargement');
  btn.disabled = true;

  const res = await window.api.produits.lookupOFF(bc);
  btn.disabled = false;

  if (res.ok) {
    document.getElementById('fNom').value    = res.data.nom    || '';
    document.getElementById('fMarque').value = res.data.marque || '';
    document.getElementById('fCat').value    = res.data.categorie || '';
    st.className = 'off-status found';
    st.textContent = '✓ ' + t('produits.lookup_ok');
  } else {
    st.className = 'off-status error';
    st.textContent = res.offline ? '⚡ ' + t('produits.lookup_offline') : '✗ ' + t('produits.lookup_nok');
  }
}

async function sauvegarderProduit(id) {
  const nom   = document.getElementById('fNom').value.trim();
  const prixV = parseFloat(document.getElementById('fPrix').value);
  if (!nom)               { toast(t('produits.nom') + ' requis', 'error'); return; }
  if (isNaN(prixV) || prixV < 0) { toast(t('produits.prix') + ' invalide', 'error'); return; }

  const data = {
    barcode:   document.getElementById('fBarcode').value.trim() || null,
    nom, prix: prixV,
    marque:    document.getElementById('fMarque').value.trim() || null,
    categorie: document.getElementById('fCat').value.trim()    || null,
    unite:     document.getElementById('fUnite').value,
  };
  try {
    if (id) {
      await window.api.produits.update(id, data);
    } else {
      await window.api.produits.add(data);
    }
    closeModal();
    toast(t('produits.enregistrer'), 'success');
    await renderProduits();
  } catch (err) {
    toast(`${t('commun.erreur')} : ${err.message}`, 'error');
  }
}


//VENTES


async function pageVentes(c) {
  const today = new Date().toISOString().slice(0, 10);
  c.innerHTML = `
    <div class="page-header"><h1 class="page-title">${t('ventes.titre')}</h1></div>
    <div class="summary-cards" id="summaryCards"></div>
    <div class="filter-row">
      <input type="date" id="filterDate" value="${today}" />
      <button class="btn btn-ghost" id="btnAujourdHui">${t('ventes.aujourd_hui')}</button>
    </div>
    <div class="export-row">
      <button class="btn btn-ghost" id="btnCSV">${t('ventes.export_csv')}</button>
      <button class="btn btn-ghost" id="btnPDF"> ${t('ventes.export_pdf')}</button>
    </div>
    <div class="card" id="ventesTable"></div>`;

  await loadSummary(today);
  await loadVentesTable(today);

  document.getElementById('filterDate').addEventListener('change', async (e) => {
    await loadSummary(e.target.value);
    await loadVentesTable(e.target.value);
  });

  document.getElementById('btnAujourdHui').addEventListener('click', async () => {
    document.getElementById('filterDate').value = today;
    await loadSummary(today);
    await loadVentesTable(today);
  });

  document.getElementById('btnCSV').addEventListener('click', exportCSV);
  document.getElementById('btnPDF').addEventListener('click', exportPDF);

  // Event delegation sur le tableau — FIX boutons détail et ticket
  document.getElementById('ventesTable').addEventListener('click', async (e) => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const id = +btn.dataset.id;
    if (btn.dataset.action === 'detail') await detailVente(id);
    if (btn.dataset.action === 'ticket') await exportTicket(id);
  });
}

async function loadSummary(date) {
  const s = await window.api.ventes.getDailySummary(date);
  const c = document.getElementById('summaryCards');
  if (!c) return;
  c.innerHTML = `
    <div class="summary-card"><div class="s-label">${t('ventes.nb_ventes')}</div><div class="s-val">${s.nb_ventes||0}</div></div>
    <div class="summary-card"><div class="s-label">${t('ventes.ca')}</div><div class="s-val">${prix(s.ca||0)}</div></div>
    <div class="summary-card"><div class="s-label">${t('ventes.panier_moyen')}</div><div class="s-val">${prix(s.panier_moyen||0)}</div></div>`;
}

async function loadVentesTable(date) {
  const c = document.getElementById('ventesTable');
  if (!c) return;
  const ventes = await window.api.ventes.getAll({ date });
  if (!ventes?.length) {
    c.innerHTML = `<div class="empty-state"><span class="icon"></span><p>${t('ventes.aucune')}</p></div>`;
    return;
  }
  c.innerHTML = `
    <table class="ventes-table">
      <thead><tr>
        <th>#</th>
        <th>${t('ventes.date')}</th>
        <th>${t('ventes.total')}</th>
        <th>${t('ventes.paiement')}</th>
        <th>${t('ventes.detail')}</th>
      </tr></thead>
      <tbody>
        ${ventes.map((v) => `
          <tr>
            <td style="color:var(--text-m)">#${v.id}</td>
            <td>${dateStr(v.cree_le)}</td>
            <td style="font-weight:700;color:var(--accent)">${prix(v.total)}</td>
            <td><span class="badge badge-${v.paiement}">${v.paiement==='especes'?'💵 '+t('commun.especes'):'💳 '+t('commun.carte')}</span></td>
            <td style="display:flex;gap:6px">
              <button class="btn btn-ghost" style="padding:4px 10px" data-action="detail" data-id="${v.id}">Détail</button>
              <button class="btn btn-ghost" style="padding:4px 10px" data-action="ticket" data-id="${v.id}">PDF</button>
            </td>
          </tr>`).join('')}
      </tbody>
    </table>`;
}

async function detailVente(id) {
  const v = await window.api.ventes.getById(id);
  if (!v) return;
  openModal(`Ticket #${v.id}`, `
    <p style="color:var(--text-2);margin-bottom:16px">${dateStr(v.cree_le)}</p>
    <table class="ventes-table" style="margin-bottom:16px">
      <thead><tr><th>Produit</th><th>Qté</th><th>P.U.</th><th>Sous-total</th></tr></thead>
      <tbody>
        ${(v.articles||[]).map((a) => `
          <tr>
            <td>${esc(a.produit_nom)}</td>
            <td>${a.quantite}</td>
            <td>${prix(a.produit_prix)}</td>
            <td>${prix(a.sous_total)}</td>
          </tr>`).join('')}
      </tbody>
    </table>
    <div style="display:flex;justify-content:space-between;padding:14px;background:var(--bg-input);border-radius:var(--r)">
      <span style="font-weight:600">${t('caisse.total')}</span>
      <span style="font-size:22px;font-weight:800;color:var(--accent)">${prix(v.total)}</span>
    </div>`);
}

async function exportTicket(id) {
  const r = await window.api.export.pdf({ type: 'ticket', id, filename: `ticket-${id}.pdf` });
  if (r?.ok) toast('Ticket PDF exporté', 'success');
  else if (!r?.cancelled) toast('Export annulé', 'info');
}

async function exportCSV() {
  const date = document.getElementById('filterDate')?.value;
  
  const ventes = await window.api.ventes.getAll({});
  const rows = [];
  for (const v of ventes) {
    for (const a of (v.articles || [])) {
      rows.push({
        vente_id:      v.id,
        date:          v.cree_le,
        produit:       a.produit_nom,
        quantite:      a.quantite,
        prix_unitaire: a.produit_prix,
        sous_total:    a.sous_total,
        total_vente:   v.total,
        paiement:      v.paiement,
      });
    }
  }
  if (!rows.length) { toast('Aucune vente à exporter', 'info'); return; }
  const filename = `ventes-${date || 'export'}.csv`;
  const r = await window.api.export.csv({ data: rows, filename });
  if (r?.ok) toast('CSV exporté', 'success');
  else if (!r?.cancelled) toast('Export annulé', 'info');
}

async function exportPDF() {
  const date = document.getElementById('filterDate')?.value;
  const r = await window.api.export.pdf({ type: 'rapport', date, filename: `rapport-${date}.pdf` });
  if (r?.ok) toast('PDF exporté', 'success');
  else if (!r?.cancelled) toast('Export annulé', 'info');
}

//Paramètres

async function pageParametres(c) {
  const p = await window.api.parametres.get();
  let selLangue = p.langue || 'fr';
  let selTheme  = p.theme  || 'dark';

  c.innerHTML = `
    <div class="page-header"><h1 class="page-title">${t('parametres.titre')}</h1></div>
    <div class="settings-section">
      <div class="settings-row">
        <label>${t('parametres.nom_boutique')}</label>
        <input id="sNom" type="text" value="${esc(p.nom_boutique||'Mon Épicerie')}" style="max-width:320px" />
      </div>
      <div class="settings-row">
        <label>${t('parametres.langue')}</label>
        <div class="theme-btns">
          <button class="theme-btn ${selLangue!=='en'?'active':''}" data-lang="fr">🇫🇷 Français</button>
          <button class="theme-btn ${selLangue==='en'?'active':''}" data-lang="en">🇬🇧 English</button>
        </div>
      </div>
      <div class="settings-row">
        <label>${t('parametres.theme')}</label>
        <div class="theme-btns">
          <button class="theme-btn ${selTheme!=='light'?'active':''}" data-theme="dark">${t('parametres.sombre')}</button>
          <button class="theme-btn ${selTheme==='light'?'active':''}" data-theme="light">${t('parametres.clair')}</button>
        </div>
      </div>
      <button class="btn btn-primary" id="btnSaveParams" style="align-self:flex-start">
        ${t('parametres.enregistrer')}
      </button>
    </div>`;

  c.querySelectorAll('[data-lang]').forEach((btn) => btn.addEventListener('click', () => {
    selLangue = btn.dataset.lang;
    c.querySelectorAll('[data-lang]').forEach((b) => b.classList.toggle('active', b.dataset.lang === selLangue));
  }));

  c.querySelectorAll('[data-theme]').forEach((btn) => btn.addEventListener('click', () => {
    selTheme = btn.dataset.theme;
    c.querySelectorAll('[data-theme]').forEach((b) => b.classList.toggle('active', b.dataset.theme === selTheme));
    applyTheme(selTheme);
  }));

  document.getElementById('btnSaveParams').addEventListener('click', async () => {
    const nom = document.getElementById('sNom').value.trim() || 'Mon Épicerie';
    await window.api.parametres.set('langue', selLangue);
    await window.api.parametres.set('theme', selTheme);
    await window.api.parametres.set('nom_boutique', nom);
    langue = selLangue;
    applyTheme(selTheme);
    applyTranslations();
    document.getElementById('shopName').textContent = nom;
    toast(t('parametres.sauvegarde'), 'success');
  });
}

//Start the app
document.addEventListener('DOMContentLoaded', init);
