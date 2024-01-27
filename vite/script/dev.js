let vite = require('vite');
let vue = require('@vitejs/plugin-vue');
const path = require('path');

let dev = {
  server: null,
  serverPort: 1600,
  async createServer() {
    let options = {
      configFile: false,
      root: process.cwd(),
      server: {
        port: this.serverPort,
      },
      plugins: [vue()],
      resolve: {
        // 与vite.config.ts相同
        alias: {
          '@package': path.resolve('./packages'),
          '@table': path.resolve('./packages/table'),
          '@page': path.resolve('./packages/table/page'),
          '@store': path.resolve('./packages/table/store'),
          '@route': path.resolve('./packages/table/route'),
          '@apps': path.resolve('./packages/table/apps'),
          '@components': path.resolve('./packages/table/components'),
          '@assets': path.resolve('./packages/table/assets'),
          '@js': path.resolve('./packages/table/js'),
        },
      },
      build: {
        //   target: 'es2020',
        sourcemap: true,
      },
    };
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
