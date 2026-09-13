const fs = require('fs');
const path = require('path');

function fileExists(targetPath) {
  try {
    return fs.existsSync(targetPath);
  } catch {
    return false;
  }
}

function isFrontendDir(targetPath) {
  return (
    fileExists(path.join(targetPath, 'index.html')) &&
    fileExists(path.join(targetPath, 'assets'))
  );
}

function resolveFrontendDir(serviceDir) {
  const candidates = [
    serviceDir,
    path.join(serviceDir, 'dist'),
    path.join(serviceDir, 'frontend'),
  ];

  return candidates.find(isFrontendDir) || null;
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
    pageRootCandidates: ['dist', 'frontend', '.'],
    requiredStaticPaths: ['index.html'],
  },

  async build(ctx) {
    const frontendDir = resolveFrontendDir(ctx.serviceDir);
    if (!frontendDir) {
      throw new Error(
        `Missing storage market frontend: expected index.html and assets under ${ctx.serviceDir}`,
      );
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
