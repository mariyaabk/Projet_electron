
const path = require('path');
const fs   = require('fs');
const os   = require('os');
const exportService = require('../services/export');

let tmp;
beforeEach(() => { tmp = path.join(os.tmpdir(), `csv-${Date.now()}.csv`); });
afterEach(() => { if (fs.existsSync(tmp)) fs.unlinkSync(tmp); });

test('CSV : header + lignes', () => {
  exportService.toCSV([{ id:1, nom:'Pomme', prix:1.5 }], tmp);
  const c = fs.readFileSync(tmp, 'utf8');
  expect(c).toContain('id,nom,prix');
  expect(c).toContain('Pomme');
});

test('CSV : valeur avec virgule entre guillemets', () => {
  exportService.toCSV([{ nom:'Fromage, vieux' }], tmp);
  expect(fs.readFileSync(tmp,'utf8')).toContain('"Fromage, vieux"');
});

test('CSV : tableau vide', () => {
  exportService.toCSV([], tmp);
  expect(fs.readFileSync(tmp,'utf8')).toBe('');
});

test('CSV : guillemets doublés', () => {
  exportService.toCSV([{ nom:'Say "hello"' }], tmp);
  expect(fs.readFileSync(tmp,'utf8')).toContain('""hello""');
});
