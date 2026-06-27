
const off = require('../services/openfoodfacts');

test('rejette barcode null',     async () => { await expect(off.lookup(null)).rejects.toThrow('invalide'); });
test('rejette barcode trop court', async () => { await expect(off.lookup('123')).rejects.toThrow('invalide'); });
test('rejette barcode trop long',  async () => { await expect(off.lookup('123456789012345')).rejects.toThrow('invalide'); });
test('rejette barcode non-numérique', async () => { await expect(off.lookup('ABCDEFGH')).rejects.toThrow('invalide'); });
