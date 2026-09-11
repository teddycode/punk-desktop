const fs = require('fs');
const path = require('path');

function fileExists(targetPath) {
  try {
    return fs.existsSync(targetPath);
  } catch {
    return false;
  }
}

function getNpmCommand(isWindows) {
  return isWindows ? 'npm.cmd' : 'npm';
}

module.exports = {
  meta: {
    name: 'pot-mock',
    displayName: 'POT Mock',
    autostart: true,
    pageEntry: 'index.html',
    healthPath: '/health',
  },

  async build(ctx) {
    const apiServerPath = path.join(__dirname, 'pot-api', 'server.js');
    const webDir = path.join(__dirname, 'web');
    const frontendOutputDir = path.join(ctx.repoRoot, 'vite', 'html', this.meta.name);
    const npmCommand = getNpmCommand(ctx.isWindows);

    if (!fileExists(apiServerPath)) {
      throw new Error(`Missing pot-api server: ${apiServerPath}`);
    }

    if (!fileExists(path.join(webDir, 'node_modules', '.bin', ctx.isWindows ? 'vite.cmd' : 'vite'))) {
      await ctx.runCommand(npmCommand, ['install'], { cwd: webDir });
    }

    await ctx.runCommand(npmCommand, ['run', 'build'], { cwd: webDir });
    await ctx.copyDirectory(path.join(webDir, 'dist'), frontendOutputDir);

    return {
      frontendDir: frontendOutputDir,
      runtimeFiles: [
        {
          from: apiServerPath,
          to: path.join('pot-api', 'server.js'),
        },
      ],
    };
  },

  async start(ctx) {
    const serverPath = path.join(ctx.serviceDir, 'pot-api', 'server.js');

    if (!fileExists(serverPath)) {
      throw new Error(`Missing pot-api runtime server: ${serverPath}`);
    }

    return ctx.spawnProcess('node', [serverPath], {
      cwd: path.dirname(serverPath),
      env: Object.assign({}, process.env, {
        HOST: '127.0.0.1',
        PORT: String(ctx.backendPort),
        NODE_ENV: 'production',
        POT_NODE_COUNT: '4',
      }),
    });
  },

  async health(ctx) {
    const health = await ctx.httpGetJson(`http://127.0.0.1:${ctx.backendPort}${this.meta.healthPath}`);
    if (!health || health.status !== 'ok') {
      throw new Error('pot-mock health check failed');
    }
    return { ok: true };
  },

  async stop(ctx) {
    if (!ctx.processInfo || !ctx.processInfo.pid) {
      return;
    }

    await ctx.killProcessTree(ctx.processInfo.pid);
  },
};
