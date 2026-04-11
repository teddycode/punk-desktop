(() => {
const fs = require('fs-extra');
const path = require('path');
const serviceHttp = require('http');
const serviceNet = require('net');
const { app, ipcMain: ipc, Menu } = require('electron');
const { spawn: serviceSpawn, spawnSync: serviceSpawnSync } = require('child_process');

const SERVICE_BACKEND_PORT_RANGE = { start: 37100, end: 37999 };
const SERVICE_GATEWAY_PORT_RANGE = { start: 38100, end: 38999 };
const SERVICE_HEALTH_RETRIES = 30;
const SERVICE_HEALTH_RETRY_DELAY = 1000;
const SERVICE_STOP_TIMEOUT = 5000;

const serviceMimeTypes = {
  '.css': 'text/css; charset=utf-8',
  '.gif': 'image/gif',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
};

function waitForService(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function formatServiceError(error) {
  if (!error) {
    return 'Unknown service error';
  }

  if (typeof error === 'string') {
    return error;
  }

  return error.stack || error.message || String(error);
}

function serviceExists(targetPath) {
  try {
    return fs.existsSync(targetPath);
  } catch {
    return false;
  }
}

function cloneServiceHeaders(headers) {
  return Object.assign({}, headers || {});
}

function decodeServicePath(pathname) {
  try {
    return decodeURIComponent(pathname);
  } catch {
    return pathname;
  }
}

function getServiceMimeType(filePath) {
  return serviceMimeTypes[path.extname(filePath).toLowerCase()] || 'application/octet-stream';
}

async function isPortAvailable(port) {
  return new Promise((resolve) => {
    const tester = serviceNet
      .createServer()
      .once('error', () => {
        resolve(false);
      })
      .once('listening', () => {
        tester.close(() => resolve(true));
      })
      .listen(port, '127.0.0.1');
  });
}

class ServiceManager {
  constructor() {
    this.repoRoot = __dirname;
    this.servicesRoot = this.resolveServicesRoot();
    this.runtimeRoot = path.join(app.getPath('userData'), 'services');
    this.stateFile = path.join(this.runtimeRoot, 'state.json');
    this.services = new Map();
    this.state = { version: 1, ports: {} };
    this.stopAllPromise = null;
    this.hasStoppedAll = false;
    this.ipcRegistered = false;
    this.exitHookRegistered = false;
  }

  resolveServicesRoot() {
    if (!app.isPackaged) {
      return path.join(__dirname, 'services');
    }

    const packagedCandidates = [
      path.join(process.resourcesPath, 'services'),
      path.join(app.getAppPath(), 'dist', 'services-runtime'),
    ];

    return packagedCandidates.find((candidate) => serviceExists(candidate)) || packagedCandidates[0];
  }

  async init() {
    fs.ensureDirSync(this.runtimeRoot);
    this.loadState();
    await this.scanServices();
    this.registerIpcHandlers();
    this.registerExitFallback();
    await this.startAutostartServices();
    this.refreshMenus();
  }

  registerIpcHandlers() {
    if (this.ipcRegistered) {
      return;
    }

    this.ipcRegistered = true;

    ipc.handle('services.list', async () => {
      return this.listServices();
    });

    ipc.handle('services.get', async (...args) => {
      const serviceName = args[1];
      return this.getServiceInfo(serviceName);
    });

    ipc.handle('services.resolvePage', async (...args) => {
      const serviceName = args[1];
      const pageUrl = await this.ensureServicePageUrl(serviceName);
      const entry = this.findService(serviceName);
      return Object.assign({}, this.serializeService(entry), { pageUrl });
    });

    ipc.handle('services.openPage', async (...args) => {
      const serviceName = args[1];
      const entry = await this.openServicePage(serviceName);
      return this.serializeService(entry);
    });
  }

  registerExitFallback() {
    if (this.exitHookRegistered) {
      return;
    }

    this.exitHookRegistered = true;

    process.once('exit', () => {
      this.forceStopChildrenSync();
    });
  }

  loadState() {
    if (!serviceExists(this.stateFile)) {
      return;
    }

    try {
      const savedState = fs.readJsonSync(this.stateFile);
      if (savedState && typeof savedState === 'object') {
        this.state = Object.assign({ version: 1, ports: {} }, savedState);
      }
    } catch (error) {
      console.error('加载服务状态失败:', error);
    }
  }

  saveState() {
    try {
      fs.outputJsonSync(this.stateFile, this.state, { spaces: 2 });
    } catch (error) {
      console.error('保存服务状态失败:', error);
    }
  }

  async scanServices() {
    this.services.clear();

    if (!serviceExists(this.servicesRoot)) {
      console.warn('服务目录不存在:', this.servicesRoot);
      return;
    }

    const dirents = fs
      .readdirSync(this.servicesRoot, { withFileTypes: true })
      .filter((dirent) => dirent.isDirectory());

    for (const dirent of dirents) {
      const serviceDir = path.join(this.servicesRoot, dirent.name);
      const definitionPath = path.join(serviceDir, 'service.js');
      const entry = {
        id: dirent.name,
        name: dirent.name,
        sourceDir: app.isPackaged ? path.join(this.repoRoot, 'services', dirent.name) : serviceDir,
        serviceDir,
        definitionPath,
        status: 'discovered',
        error: null,
        meta: null,
        module: null,
        backendPort: null,
        gatewayPort: null,
        pageUrl: null,
        processInfo: null,
        gatewayServer: null,
        startPromise: null,
        stopPromise: null,
        startedAt: null,
        stopping: false,
      };

      this.services.set(entry.id, entry);

      if (!serviceExists(definitionPath)) {
        entry.status = 'error';
        entry.error = 'Missing service.js';
        continue;
      }

      try {
        delete require.cache[require.resolve(definitionPath)];
        entry.module = require(definitionPath);
        this.validateServiceDefinition(entry);
        const ports = await this.assignPorts(entry.name);
        entry.backendPort = ports.backendPort;
        entry.gatewayPort = ports.gatewayPort;
        entry.pageUrl = this.buildPageUrl(entry);
      } catch (error) {
        entry.status = 'error';
        entry.error = formatServiceError(error);
      }
    }

    this.markDuplicateServices();
    this.saveState();
  }

  validateServiceDefinition(entry) {
    const serviceModule = entry.module;

    if (!serviceModule || typeof serviceModule !== 'object') {
      throw new Error('service.js must export an object');
    }

    const meta = serviceModule.meta || {};
    const requiredFields = ['name', 'displayName', 'pageEntry', 'healthPath'];

    requiredFields.forEach((field) => {
      if (!meta[field] || typeof meta[field] !== 'string') {
        throw new Error(`meta.${field} is required`);
      }
    });

    if (typeof meta.autostart !== 'boolean') {
      throw new Error('meta.autostart must be a boolean');
    }

    ['build', 'start', 'health', 'stop'].forEach((methodName) => {
      if (typeof serviceModule[methodName] !== 'function') {
        throw new Error(`${methodName}() must be exported`);
      }
    });

    entry.name = meta.name;
    entry.meta = meta;
  }

  markDuplicateServices() {
    const nameBuckets = {};

    this.services.forEach((entry) => {
      if (!entry.meta || entry.status === 'error') {
        return;
      }

      if (!nameBuckets[entry.name]) {
        nameBuckets[entry.name] = [];
      }

      nameBuckets[entry.name].push(entry);
    });

    Object.keys(nameBuckets).forEach((serviceName) => {
      if (nameBuckets[serviceName].length < 2) {
        return;
      }

      nameBuckets[serviceName].forEach((entry) => {
        entry.status = 'error';
        entry.error = `Duplicate service name: ${serviceName}`;
      });
    });
  }

  async assignPorts(serviceName) {
    const existingPorts = this.state.ports[serviceName] || {};
    const backendPort = await this.pickPort(
      SERVICE_BACKEND_PORT_RANGE,
      existingPorts.backendPort,
      'backendPort',
      serviceName,
    );
    const gatewayPort = await this.pickPort(
      SERVICE_GATEWAY_PORT_RANGE,
      existingPorts.gatewayPort,
      'gatewayPort',
      serviceName,
    );

    this.state.ports[serviceName] = { backendPort, gatewayPort };
    return this.state.ports[serviceName];
  }

  async pickPort(range, preferredPort, portKey, currentServiceName) {
    if (
      preferredPort &&
      this.isPortReserved(currentServiceName, preferredPort, portKey) &&
      (await isPortAvailable(preferredPort))
    ) {
      return preferredPort;
    }

    for (let port = range.start; port <= range.end; port += 1) {
      if (
        this.isPortReserved(currentServiceName, port, portKey) &&
        (await isPortAvailable(port))
      ) {
        return port;
      }
    }

    throw new Error(`No available port for ${currentServiceName}`);
  }

  isPortReserved(currentServiceName, port, portKey) {
    return !Object.keys(this.state.ports).some((serviceName) => {
      if (serviceName === currentServiceName) {
        return false;
      }

      return this.state.ports[serviceName][portKey] === port;
    });
  }

  async startAutostartServices() {
    const services = Array.from(this.services.values()).filter((entry) => {
      return entry.meta && entry.meta.autostart && entry.status !== 'error';
    });

    for (const entry of services) {
      try {
        await this.startService(entry);
      } catch (error) {
        console.error(`服务启动失败 [${entry.name}]:`, error);
      }
    }
  }

  listServices() {
    return Array.from(this.services.values()).map((entry) => this.serializeService(entry));
  }

  getServiceInfo(serviceName) {
    const entry = this.findService(serviceName);
    if (!entry) {
      throw new Error(`Unknown service: ${serviceName}`);
    }

    return this.serializeService(entry);
  }

  async ensureServicePageUrl(serviceName) {
    const entry = this.findService(serviceName);
    if (!entry) {
      throw new Error(`Unknown service: ${serviceName}`);
    }

    await this.startService(entry);
    entry.pageUrl = this.buildPageUrl(entry);
    return entry.pageUrl;
  }

  findService(serviceName) {
    if (!serviceName) {
      return null;
    }

    return (
      this.services.get(serviceName) ||
      Array.from(this.services.values()).find((entry) => entry.name === serviceName)
    );
  }

  serializeService(entry) {
    return {
      id: entry.id,
      name: entry.name,
      displayName: entry.meta ? entry.meta.displayName : entry.id,
      autostart: Boolean(entry.meta && entry.meta.autostart),
      pageEntry: entry.meta ? entry.meta.pageEntry : null,
      healthPath: entry.meta ? entry.meta.healthPath : null,
      status: entry.status,
      error: entry.error,
      backendPort: entry.backendPort,
      gatewayPort: entry.gatewayPort,
      pageUrl: entry.pageUrl,
      startedAt: entry.startedAt,
    };
  }

  async openServicePage(serviceName) {
    const entry = this.findService(serviceName);
    if (!entry) {
      throw new Error(`Unknown service: ${serviceName}`);
    }

    const serviceUrl = await this.ensureServicePageUrl(serviceName);

    if (!mainWindow || mainWindow.isDestroyed()) {
      sendIPCToWindow(mainWindow, 'addTab', { url: serviceUrl });
      return entry;
    }

    if (mainWindow.isMinimized()) {
      mainWindow.restore();
    }

    if (!mainWindow.isVisible()) {
      mainWindow.show();
    }

    mainWindow.focus();
    sendIPCToWindow(mainWindow, 'addTab', { url: serviceUrl });

    return entry;
  }

  async startService(entry) {
    if (!entry.meta) {
      throw new Error(entry.error || `Service ${entry.id} is not valid`);
    }

    if (entry.status === 'running') {
      return entry;
    }

    if (entry.startPromise) {
      return entry.startPromise;
    }

    entry.startPromise = this.doStartService(entry)
      .catch(async (error) => {
        entry.status = 'error';
        entry.error = formatServiceError(error);
        await this.stopService(entry, { preserveError: true });
        throw error;
      })
      .finally(() => {
        entry.startPromise = null;
      });

    return entry.startPromise;
  }

  async doStartService(entry) {
    entry.status = 'starting';
    entry.error = null;
    entry.stopping = false;

    const startContext = this.createContext(entry);
    const processInfo = await Promise.resolve(entry.module.start(startContext));

    if (!processInfo || !processInfo.child || !processInfo.child.pid) {
      throw new Error(`Service ${entry.name} did not return a child process`);
    }

    entry.processInfo = processInfo;
    this.attachProcessListeners(entry);

    await this.waitForHealth(entry);
    entry.gatewayServer = await this.startGateway(entry);
    entry.status = 'running';
    entry.startedAt = new Date().toISOString();
    entry.pageUrl = this.buildPageUrl(entry);
    this.refreshMenus();

    console.log(`服务启动成功 [${entry.name}]`, entry.backendPort, entry.gatewayPort);
    return entry;
  }

  attachProcessListeners(entry) {
    if (!entry.processInfo || !entry.processInfo.child || entry.processInfo.boundExitListener) {
      return;
    }

    const child = entry.processInfo.child;
    entry.processInfo.boundExitListener = true;

    if (child.stdout) {
      child.stdout.on('data', (chunk) => {
        console.log(`[service:${entry.name}] ${String(chunk).trim()}`);
      });
    }

    if (child.stderr) {
      child.stderr.on('data', (chunk) => {
        console.error(`[service:${entry.name}] ${String(chunk).trim()}`);
      });
    }

    child.on('exit', (code, signal) => {
      if (entry.stopping || this.hasStoppedAll) {
        return;
      }

      entry.status = 'error';
      entry.error = `Service exited unexpectedly (code=${code}, signal=${signal})`;
      entry.processInfo = null;
      entry.startedAt = null;
      this.closeGateway(entry).catch((error) => {
        console.error(`关闭服务网关失败 [${entry.name}]:`, error);
      });
      this.refreshMenus();
    });
  }

  async waitForHealth(entry) {
    let lastError = null;

    for (let attempt = 0; attempt < SERVICE_HEALTH_RETRIES; attempt += 1) {
      try {
        const healthContext = this.createContext(entry);
        const healthResult = await Promise.resolve(entry.module.health(healthContext));

        if (healthResult && healthResult.ok === false) {
          throw new Error(healthResult.message || 'Health check failed');
        }

        if (healthResult === false) {
          throw new Error('Health check failed');
        }

        return;
      } catch (error) {
        lastError = error;
        await waitForService(SERVICE_HEALTH_RETRY_DELAY);
      }
    }

    throw new Error(`Health check failed: ${formatServiceError(lastError)}`);
  }

  async startGateway(entry) {
    const server = serviceHttp.createServer((request, response) => {
      this.handleGatewayRequest(entry, request, response);
    });

    server.on('upgrade', (request, socket, head) => {
      this.handleGatewayUpgrade(entry, request, socket, head);
    });

    server.on('clientError', (error, socket) => {
      socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
      console.error(`服务网关客户端错误 [${entry.name}]:`, error);
    });

    return new Promise((resolve, reject) => {
      server.once('error', reject);
      server.listen(entry.gatewayPort, '127.0.0.1', () => {
        server.removeListener('error', reject);
        resolve(server);
      });
    });
  }

  async handleGatewayRequest(entry, request, response) {
    const requestUrl = new URL(request.url, 'http://127.0.0.1');

    if (requestUrl.pathname === '/api' || requestUrl.pathname.startsWith('/api/')) {
      return this.proxyHttpRequest(entry, request, response, requestUrl);
    }

    return this.serveStaticAsset(entry, requestUrl, response);
  }

  async serveStaticAsset(entry, requestUrl, response) {
    const pageRoot = this.resolvePageRoot(entry);

    if (!pageRoot || !serviceExists(pageRoot)) {
      response.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
      response.end(`Static assets not found for ${entry.name}`);
      return;
    }

    const resolvedPageRoot = path.resolve(pageRoot);
    const relativePath = requestUrl.pathname === '/' ? entry.meta.pageEntry : requestUrl.pathname.slice(1);
    const decodedPath = decodeServicePath(relativePath);
    const safePath = path.normalize(decodedPath).replace(/^(\.\.(\/|\\|$))+/, '');
    let assetPath = path.resolve(resolvedPageRoot, safePath);

    if (serviceExists(assetPath) && fs.statSync(assetPath).isDirectory()) {
      assetPath = path.resolve(assetPath, 'index.html');
    }

    if (!serviceExists(assetPath) || !fs.statSync(assetPath).isFile()) {
      assetPath = path.resolve(resolvedPageRoot, entry.meta.pageEntry);
    }

    if (!assetPath.startsWith(resolvedPageRoot)) {
      response.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
      response.end('Forbidden');
      return;
    }

    if (!serviceExists(assetPath) || !fs.statSync(assetPath).isFile()) {
      response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      response.end('Not Found');
      return;
    }

    response.writeHead(200, { 'Content-Type': getServiceMimeType(assetPath) });
    fs.createReadStream(assetPath).pipe(response);
  }

  proxyHttpRequest(entry, request, response, requestUrl) {
    const targetPath = `${requestUrl.pathname.replace(/^\/api/, '') || '/'}${requestUrl.search}`;
    const headers = cloneServiceHeaders(request.headers);
    headers.host = `127.0.0.1:${entry.backendPort}`;

    const proxyRequest = serviceHttp.request(
      {
        hostname: '127.0.0.1',
        port: entry.backendPort,
        method: request.method,
        path: targetPath,
        headers,
      },
      (proxyResponse) => {
        response.writeHead(proxyResponse.statusCode || 500, proxyResponse.headers);
        proxyResponse.pipe(response);
      },
    );

    proxyRequest.on('error', (error) => {
      response.writeHead(502, { 'Content-Type': 'text/plain; charset=utf-8' });
      response.end(`Proxy error: ${error.message}`);
    });

    request.pipe(proxyRequest);
  }

  handleGatewayUpgrade(entry, request, socket, head) {
    const requestUrl = new URL(request.url, 'http://127.0.0.1');
    if (!(requestUrl.pathname === '/api' || requestUrl.pathname.startsWith('/api/'))) {
      socket.destroy();
      return;
    }

    const targetSocket = serviceNet.connect(entry.backendPort, '127.0.0.1', () => {
      const targetPath = `${requestUrl.pathname.replace(/^\/api/, '') || '/'}${requestUrl.search}`;
      const headers = cloneServiceHeaders(request.headers);
      headers.host = `127.0.0.1:${entry.backendPort}`;

      let headerString = `${request.method} ${targetPath} HTTP/${request.httpVersion}\r\n`;
      Object.keys(headers).forEach((headerName) => {
        headerString += `${headerName}: ${headers[headerName]}\r\n`;
      });
      headerString += '\r\n';

      targetSocket.write(headerString);
      if (head && head.length) {
        targetSocket.write(head);
      }

      socket.pipe(targetSocket).pipe(socket);
    });

    targetSocket.on('error', () => {
      socket.destroy();
    });

    socket.on('error', () => {
      targetSocket.destroy();
    });
  }

  resolvePageRoot(entry) {
    const candidates = [
      path.join(entry.serviceDir, 'frontend'),
      path.join(this.repoRoot, 'vite', 'html', entry.name),
      path.join(entry.sourceDir, 'spug_web', 'build'),
    ];

    return candidates.find((candidate) => serviceExists(candidate)) || candidates[0];
  }

  buildPageUrl(entry) {
    const pageEntry = entry.meta && entry.meta.pageEntry && entry.meta.pageEntry !== 'index.html' ? entry.meta.pageEntry : '';
    const pathname = pageEntry ? `/${pageEntry.replace(/^\/+/, '')}` : '/';
    return `http://127.0.0.1:${entry.gatewayPort}${pathname}`;
  }

  createContext(entry) {
    return {
      appUserDataPath: app.getPath('userData'),
      backendPort: entry.backendPort,
      commandNames: {
        python: process.platform === 'win32' ? 'python' : 'python3',
        yarn: process.platform === 'win32' ? 'yarn.cmd' : 'yarn',
      },
      gatewayPort: entry.gatewayPort,
      httpGetJson: (url) => this.httpGetJson(url),
      isLinux: process.platform === 'linux',
      isPackaged: app.isPackaged,
      isWindows: process.platform === 'win32',
      killProcessTree: (pid) => this.killProcessTree(pid),
      meta: entry.meta,
      pageRoot: this.resolvePageRoot(entry),
      platform: process.platform,
      processInfo: entry.processInfo,
      repoRoot: this.repoRoot,
      runtimeRoot: this.runtimeRoot,
      serviceDir: entry.serviceDir,
      serviceName: entry.name,
      serviceSourceDir: entry.sourceDir,
      spawnProcess: (command, args, options) => this.spawnManagedProcess(entry, command, args, options),
    };
  }

  async httpGetJson(url) {
    const protocol = url.startsWith('https:') ? require('https') : serviceHttp;

    return new Promise((resolve, reject) => {
      const request = protocol.get(url, (response) => {
        const chunks = [];
        response.on('data', (chunk) => chunks.push(chunk));
        response.on('end', () => {
          const body = Buffer.concat(chunks).toString('utf-8');
          if (response.statusCode < 200 || response.statusCode >= 400) {
            reject(new Error(`HTTP ${response.statusCode}: ${body}`));
            return;
          }

          try {
            resolve(JSON.parse(body));
          } catch (error) {
            reject(error);
          }
        });
      });

      request.on('error', reject);
    });
  }

  spawnManagedProcess(entry, command, args, options = {}) {
    const spawnOptions = Object.assign(
      {
        cwd: options.cwd || entry.serviceDir,
        detached: process.platform !== 'win32',
        env: Object.assign({}, process.env, options.env || {}),
        shell: Boolean(options.shell),
        stdio: ['ignore', 'pipe', 'pipe'],
      },
      options,
    );

    const child = serviceSpawn(command, args || [], spawnOptions);
    return {
      child,
      command,
      args: args || [],
      pid: child.pid,
      startedAt: Date.now(),
    };
  }

  async stopService(entry, options = {}) {
    if (entry.stopPromise) {
      return entry.stopPromise;
    }

    entry.stopPromise = this.doStopService(entry, options).finally(() => {
      entry.stopPromise = null;
    });

    return entry.stopPromise;
  }

  async doStopService(entry, options = {}) {
    entry.stopping = true;

    try {
      await this.closeGateway(entry);

      if (entry.processInfo && entry.processInfo.pid) {
        const stopContext = this.createContext(entry);
        await Promise.resolve(entry.module.stop(stopContext));
        await this.waitForProcessExit(entry.processInfo.child, SERVICE_STOP_TIMEOUT);

        if (this.isProcessAlive(entry.processInfo.pid)) {
          await this.killProcessTree(entry.processInfo.pid);
        }
      }
    } catch (error) {
      if (!options.preserveError) {
        entry.error = formatServiceError(error);
      }
    } finally {
      entry.processInfo = null;
      entry.startedAt = null;
      entry.stopping = false;

      if (!options.preserveError) {
        entry.status = 'stopped';
        entry.error = null;
      }
    }
  }

  async closeGateway(entry) {
    if (!entry.gatewayServer) {
      return;
    }

    const gatewayServer = entry.gatewayServer;
    entry.gatewayServer = null;

    await new Promise((resolve) => {
      gatewayServer.close(() => resolve());
    });
  }

  async waitForProcessExit(child, timeoutMs) {
    if (!child || child.exitCode !== null) {
      return;
    }

    await Promise.race([
      new Promise((resolve) => child.once('exit', resolve)),
      waitForService(timeoutMs),
    ]);
  }

  isProcessAlive(pid) {
    if (!pid) {
      return false;
    }

    try {
      process.kill(pid, 0);
      return true;
    } catch {
      return false;
    }
  }

  async killProcessTree(pid) {
    if (!pid) {
      return;
    }

    if (process.platform === 'win32') {
      await new Promise((resolve) => {
        const killer = serviceSpawn('taskkill', ['/pid', String(pid), '/t', '/f'], {
          windowsHide: true,
          stdio: 'ignore',
        });

        killer.on('exit', () => resolve());
        killer.on('error', () => resolve());
      });
      return;
    }

    try {
      process.kill(-pid, 'SIGTERM');
    } catch {
      try {
        process.kill(pid, 'SIGTERM');
      } catch {
        return;
      }
    }

    await waitForService(1000);

    if (!this.isProcessAlive(pid)) {
      return;
    }

    try {
      process.kill(-pid, 'SIGKILL');
    } catch {
      try {
        process.kill(pid, 'SIGKILL');
      } catch {}
    }
  }

  forceStopChildrenSync() {
    this.services.forEach((entry) => {
      if (!entry.processInfo || !entry.processInfo.pid) {
        return;
      }

      if (process.platform === 'win32') {
        serviceSpawnSync('taskkill', ['/pid', String(entry.processInfo.pid), '/t', '/f'], {
          stdio: 'ignore',
          windowsHide: true,
        });
        return;
      }

      try {
        process.kill(-entry.processInfo.pid, 'SIGKILL');
      } catch {
        try {
          process.kill(entry.processInfo.pid, 'SIGKILL');
        } catch {}
      }
    });
  }

  async stopAll() {
    if (this.stopAllPromise) {
      return this.stopAllPromise;
    }

    this.stopAllPromise = (async () => {
      const services = Array.from(this.services.values());
      for (const entry of services) {
        await this.stopService(entry, { preserveError: entry.status === 'error' });
      }
      this.hasStoppedAll = true;
    })();

    return this.stopAllPromise;
  }

  refreshMenus() {
    if (typeof buildAppMenu !== 'function') {
      return;
    }

    try {
      mainMenu = buildAppMenu();
      Menu.setApplicationMenu(mainMenu);
      if (secondaryMenu) {
        secondaryMenu = buildAppMenu({ secondary: true });
      }
    } catch (error) {
      console.error('刷新应用菜单失败:', error);
    }
  }
}

global.ServiceManager = ServiceManager;
})();
