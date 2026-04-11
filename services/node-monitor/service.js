const fs = require('fs');
const path = require('path');

function getBinaryName(isWindows) {
  return isWindows ? 'spug-api-windows.exe' : 'spug-api-linux';
}

function fileExists(targetPath) {
  try {
    return fs.existsSync(targetPath);
  } catch {
    return false;
  }
}

module.exports = {
  meta: {
    name: 'node-monitor',
    displayName: 'Node Monitor',
    autostart: true,
    pageEntry: 'index.html',
    healthPath: '/apis/health/',
  },

  async build(ctx) {
    const apiDir = path.join(__dirname, 'spug_api');
    const webDir = path.join(__dirname, 'spug_web');
    const frontendOutputDir = path.join(ctx.repoRoot, 'vite', 'html', this.meta.name);
    const binaryName = getBinaryName(ctx.isWindows);
    const binaryPath = path.join(apiDir, 'dist', binaryName);

    if (ctx.isWindows) {
      await ctx.runCommand(
        'powershell',
        [
          '-NoProfile',
          '-ExecutionPolicy',
          'Bypass',
          '-File',
          path.join(apiDir, 'tools', 'build-executable.ps1'),
        ],
        { cwd: apiDir },
      );
    } else {
      await ctx.runCommand('bash', [path.join(apiDir, 'tools', 'build-executable.sh')], {
        cwd: apiDir,
      });
    }

    await ctx.runCommand(ctx.commandNames.yarn, ['build'], {
      cwd: webDir,
      env: Object.assign({}, process.env, {
        CI: '',
        SKIP_PREFLIGHT_CHECK: 'true',
      }),
    });

    await ctx.copyDirectory(path.join(webDir, 'build'), frontendOutputDir);

    if (!fileExists(binaryPath)) {
      throw new Error(`Missing backend binary after build: ${binaryPath}`);
    }

    return {
      frontendDir: frontendOutputDir,
      runtimeFiles: [
        {
          from: binaryPath,
          to: path.join('backend', binaryName),
        },
      ],
    };
  },

  async start(ctx) {
    const binaryName = getBinaryName(ctx.isWindows);
    const runtimeBinary = path.join(ctx.serviceDir, 'backend', binaryName);
    const repoBinary = path.join(__dirname, 'spug_api', 'dist', binaryName);

    if (fileExists(runtimeBinary)) {
      return ctx.spawnProcess(runtimeBinary, ['--host', '127.0.0.1', '--port', String(ctx.backendPort)], {
        cwd: path.dirname(runtimeBinary),
      });
    }

    if (fileExists(repoBinary)) {
      return ctx.spawnProcess(repoBinary, ['--host', '127.0.0.1', '--port', String(ctx.backendPort)], {
        cwd: path.dirname(repoBinary),
      });
    }

    if (!ctx.isPackaged) {
      return ctx.spawnProcess(
        ctx.commandNames.python,
        ['server.py', '--host', '127.0.0.1', '--port', String(ctx.backendPort)],
        {
          cwd: path.join(__dirname, 'spug_api'),
          env: Object.assign({}, process.env, {
            PYTHONUNBUFFERED: '1',
          }),
        },
      );
    }

    throw new Error('No packaged backend binary found for node-monitor');
  },

  async health(ctx) {
    const health = await ctx.httpGetJson(`http://127.0.0.1:${ctx.backendPort}${this.meta.healthPath}`);
    if (!health || health.status !== 'ok') {
      throw new Error('node-monitor health check failed');
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
