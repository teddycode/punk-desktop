const path = require('path');
const fs = require('fs');

const outFile = path.resolve(__dirname, '../dist/bundle.css');
const dragulaFallbackStyles = `
.gu-mirror {
  position: fixed !important;
  margin: 0 !important;
  z-index: 9999 !important;
  opacity: 0.8;
}

.gu-hide {
  display: none !important;
}

.gu-unselectable {
  -webkit-user-select: none !important;
  -moz-user-select: none !important;
  -ms-user-select: none !important;
  user-select: none !important;
}

.gu-transit {
  opacity: 0.2;
}
`.trim();

const modules = [
  'css/base.css',
  'css/windowControls.css',
  'css/modal.css',
  'css/tabBar.css',
  'css/tabEditor.css',
  'css/taskOverlay.css',
  'css/webviews.css',
  'css/newTabPage.css',
  'css/searchbar.css',
  'css/listItem.css',
  'css/bookmarkManager.css',
  'css/findinpage.css',
  'css/downloadManager.css',
  'css/passwordManager.css',
  'css/passwordCapture.css',
  'css/passwordViewer.css',
  {
    path: 'node_modules/dragula/dist/dragula.min.css',
    // Our vendored dragula package only ships source files, not dist assets.
    fallback: dragulaFallbackStyles,
  },
  'css/toolbar.css',
];

function readModule(moduleRef) {
  const definition =
    typeof moduleRef === 'string' ? { path: moduleRef, fallback: '' } : moduleRef;
  const filePath = path.resolve(__dirname, '../', definition.path);

  if (fs.existsSync(filePath)) {
    return fs.readFileSync(filePath, 'utf-8');
  }

  if (definition.fallback) {
    return definition.fallback;
  }

  throw new Error(`Missing stylesheet: ${filePath}`);
}

function buildBrowserStyles() {
  /* concatenate modules */
  let output = '';
  modules.forEach(function (moduleRef) {
    output += readModule(moduleRef) + '\n';
  });

  fs.writeFileSync(outFile, output, 'utf-8');
}

if (module.parent) {
  module.exports = buildBrowserStyles;
} else {
  buildBrowserStyles();
}
