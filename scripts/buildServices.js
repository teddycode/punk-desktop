const fs = require('fs-extra');
const path = require('path');
const { spawn } = require('child_process');

const repoRoot = path.join(__dirname, '..');
const servicesRoot = path.join(repoRoot, 'services');
const outputRoot = path.join(repoRoot, 'dist', 'services-runtime');

function runCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const useShell =
      options.shell !== undefined
        ? Boolean(options.shell)
        : process.platform === 'win32' && /\.(cmd|bat)$/i.test(command);

    const child = spawn(command, args || [], {
      cwd: options.cwd || repoRoot,
      env: Object.assign({}, process.env, options.env || {}),
      shell: useShell,
      stdio: 'inherit',
    });

    child.on('exit', (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`${command} exited with code ${code}`));
    });

    child.on('error', reject);
  });
}

function copyPath(sourcePath, targetPath) {
  const sourceStat = fs.statSync(sourcePath);
  fs.ensureDirSync(path.dirname(targetPath));

  if (sourceStat.isDirectory()) {
    fs.removeSync(targetPath);
    fs.copySync(sourcePath, targetPath);
    return;
  }

  fs.copyFileSync(sourcePath, targetPath);
  fs.chmodSync(targetPath, sourceStat.mode);
}

async function buildService(serviceDirName) {
  const serviceDir = path.join(servicesRoot, serviceDirName);
  const definitionPath = path.join(serviceDir, 'service.js');

  if (!fs.existsSync(definitionPath)) {
    return null;
  }

  delete require.cache[require.resolve(definitionPath)];
  const serviceModule = require(definitionPath);
  if (!serviceModule || !serviceModule.meta || !serviceModule.meta.name) {
    throw new Error(`Invalid service definition: ${definitionPath}`);
  }

  const runtimeDir = path.join(outputRoot, serviceModule.meta.name);
  const ctx = {
    commandNames: {
      python: process.platform === 'win32' ? 'python' : 'python3',
      yarn: process.platform === 'win32' ? 'yarn.cmd' : 'yarn',
    },
    copyDirectory: async (fromPath, toPath) => {
      fs.removeSync(toPath);
      fs.copySync(fromPath, toPath);
    },
    isWindows: process.platform === 'win32',
    repoRoot,
    runCommand,
    runtimeOutputDir: runtimeDir,
    serviceDir,
    serviceName: serviceModule.meta.name,
  };

  console.log(`Building service: ${serviceModule.meta.name}`);
  const buildResult = (await serviceModule.build(ctx)) || {};

  fs.ensureDirSync(runtimeDir);
  fs.copyFileSync(definitionPath, path.join(runtimeDir, 'service.js'));
  fs.chmodSync(path.join(runtimeDir, 'service.js'), fs.statSync(definitionPath).mode);

  if (buildResult.frontendDir) {
    copyPath(buildResult.frontendDir, path.join(runtimeDir, 'frontend'));
  }

  (buildResult.runtimeFiles || []).forEach((item) => {
    const sourcePath = typeof item === 'string' ? item : item.from;
    const targetRelativePath =
      typeof item === 'string' ? path.basename(item) : item.to || path.basename(item.from);

    if (!sourcePath) {
      throw new Error(`Invalid runtime file manifest for ${serviceModule.meta.name}`);
    }

    copyPath(sourcePath, path.join(runtimeDir, targetRelativePath));
  });

  return serviceModule.meta.name;
}

async function main() {
  fs.removeSync(outputRoot);
  fs.ensureDirSync(outputRoot);

  if (!fs.existsSync(servicesRoot)) {
    console.log('No services directory found, skipping service build.');
    return;
  }

  const serviceDirs = fs
    .readdirSync(servicesRoot, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name);

  for (const serviceDirName of serviceDirs) {
    await buildService(serviceDirName);
  }

  console.log(`Service runtime assets written to ${outputRoot}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
