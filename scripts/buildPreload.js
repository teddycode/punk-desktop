const path = require('path');
const fs = require('fs');

const outFile = path.resolve(__dirname, '../dist/preload.js');
const walletPreloadOutFile = path.resolve(__dirname, '../dist/walletPreload.js');

const modules = [
  'js/preload/default.js',
  'js/preload/textExtractor.js',
  'js/preload/readerDetector.js',
  'js/preload/siteUnbreak.js',
  'js/preload/passwordFill.js',
  'js/preload/translate.js',
  'server-config.js',
  'js/preload/server.js',
  'js/preload/fav.js',
  'js/preload/webApi.js',
];

function buildPreload() {
  /* concatenate modules */
  let output = '';
  modules.forEach(function (script) {
    output += fs.readFileSync(path.resolve(__dirname, '../', script)) + ';\n';
  });

  fs.writeFileSync(outFile, output, 'utf-8');
  
  /* build wallet preload separately */
  const walletPreloadSource = path.resolve(__dirname, '../js/preload/walletPreload.js');
  if (fs.existsSync(walletPreloadSource)) {
    const walletPreloadContent = fs.readFileSync(walletPreloadSource, 'utf-8');
    fs.writeFileSync(walletPreloadOutFile, walletPreloadContent, 'utf-8');
    console.log('✅ Wallet preload built to:', walletPreloadOutFile);
  }
}

if (module.parent) {
  module.exports = buildPreload;
} else {
  buildPreload();
}
