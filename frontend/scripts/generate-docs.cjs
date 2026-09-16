const fs = require('fs');
const path = require('path');
const manifest = require('./docs-manifest.json');
const root = path.resolve(__dirname, '../..');
// Publish only reviewed documentation; never scan environment files or runtime data.
const documents = manifest.map(doc => ({
  ...doc,
  content: fs.readFileSync(path.join(root, doc.path), 'utf8'),
}));
fs.writeFileSync(path.join(__dirname, '../src/pages/DocsPage/documents.generated.json'), JSON.stringify(documents));
console.log(`Prepared ${documents.length} project documents.`);
