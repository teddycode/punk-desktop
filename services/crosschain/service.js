const fs = require('fs');
const path = require('path');

module.exports = {
  meta: {
    name: 'crosschain',
    displayName: 'Cross Chain Service',
    // 已退役自动启动：跨链前端已按决策改为直读链上（无索引库、无本机执行），
    // 本服务仅供需要时手工启动（如需只读证明帮助器）。
    // 如需恢复随应用启动，将 autostart 改回 true 并配置 DB_* / DEV_PRIVATE_KEY 环境变量。
    autostart: false,
    pageEntry: 'index.html', // This might not be used if it's purely an API service
    healthPath: '/api/health',
  },

  async build(ctx) {
    // For Node.js services, we might just need to run yarn install
    // But since we are in a restricted environment, we assume dependencies are there
    // or handled by the system's package manager.
    // In a real scenario, we might run:
    // await ctx.runCommand(ctx.commandNames.yarn, ['install'], { cwd: ctx.serviceDir });
    
    return {
      runtimeFiles: [
        { from: path.join(ctx.serviceDir, 'server.js'), to: 'server.js' },
        { from: path.join(ctx.serviceDir, 'data'), to: 'data' }
      ],
    };
  },

  async start(ctx) {
    const serverPath = path.join(ctx.serviceDir, 'server.js');
    
    // We pass the port to the server via environment variable
    return ctx.spawnProcess(
      'node',
      [serverPath],
      {
        cwd: ctx.serviceDir,
        env: Object.assign({}, process.env, {
          PORT: String(ctx.backendPort),
          NODE_ENV: 'production'
        }),
      }
    );
  },

  async health(ctx) {
    const url = `http://127.0.0.1:${ctx.backendPort}${this.meta.healthPath}`;
    try {
      const health = await ctx.httpGetJson(url);
      if (health && health.status === 'ok') {
        return { ok: true };
      }
    } catch (e) {
      // Ignore error and return failure below
    }
    return { ok: false };
  },

  async stop(ctx) {
    if (!ctx.processInfo || !ctx.processInfo.pid) {
      return;
    }
    await ctx.killProcessTree(ctx.processInfo.pid);
  },
};
