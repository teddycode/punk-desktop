const fs = require('fs');
const path = require('path');

function fileExists(targetPath) {
  try {
    return fs.existsSync(targetPath);
  } catch {
    return false;
  }
}

module.exports = {
  meta: {
    name: 'storage-market',
    displayName: 'Storage Market',
    autostart: true,
    staticOnly: true,
    pageEntry: 'index.html',
    pageBasePath: '/group-storage',
    healthPath: '/',
    pageRootCandidates: ['.'],
    requiredStaticPaths: ['index.html'],
  },

  async build(ctx) {
    const frontendDir = ctx.serviceDir;
    if (!fileExists(path.join(frontendDir, this.meta.pageEntry))) {
      throw new Error(`Missing storage market frontend: ${frontendDir}`);
    }

    return {
      frontendDir,
      runtimeFiles: [],
    };
  },

  async start() {
    return null;
  },

  async health() {
    return { ok: true };
  },

  async stop() {},
};
