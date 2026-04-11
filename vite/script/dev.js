let vite = require('vite');
const path = require('path');

let dev = {
  server: null,
  serverPort: 1600,
  async getServerOptions() {
    const root = process.cwd();
    const configFile = path.resolve(root, 'vite.config.ts');
    const configEnv = {
      command: 'serve',
      mode: process.env.NODE_ENV || 'development',
    };
    const loadedConfig = await vite.loadConfigFromFile(configEnv, configFile, root);
    const inlineConfig = {
      configFile: false,
      root,
      server: {
        host: '0.0.0.0',
        port: this.serverPort,
      },
    };

    if (!loadedConfig || !loadedConfig.config) {
      return inlineConfig;
    }

    return vite.mergeConfig(loadedConfig.config, inlineConfig);
  },
  async createServer() {
    let options = await this.getServerOptions();
    this.server = await vite.createServer(options);
    await this.server.listen();
    this.server.printUrls();
  },

  getEnvScript() {
    let env = require('./dev/env.js');
    env.WEB_PORT = this.serverPort;
    env.RES_DIR = path.join(process.cwd(), 'resource/release');
    let script = '';
    for (let v in env) {
      script += 'process.env.${v}="${env[v]}";';
    }
    return script;
  },

  async start() {
    await this.createServer();
  },
};

dev.start();
