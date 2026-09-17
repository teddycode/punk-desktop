#!/usr/bin/env node
/**
 * 跨链模块功能自测运行器
 *
 * 用法：node packages/table/page/core/CrossChain/__tests__/run.cjs
 *
 * 为什么需要这个运行器：
 *   - 模块使用 @page/@table 等 vite 别名，直接 node 运行无法解析；
 *   - 需要把 vue / element-plus / ant-design-vue 与浏览器全局（localStorage 等）替换为瘦身桩；
 *   - 需要在 Node 下跑真实 RPC（Node 18+ 自带 fetch）。
 *
 * 只读：不进行任何签名或写链操作。
 */
const path = require('path')
const fs = require('fs')
const { execFileSync } = require('child_process')

const HERE = __dirname
const VITE_ROOT = path.resolve(HERE, '../../../../../..') // .../vite
const TABLE = path.join(VITE_ROOT, 'packages/table')
const OUT_DIR = path.join(HERE, '.out')
const OUT_FILE = path.join(OUT_DIR, 'functional.cjs')

function loadEsbuild() {
  for (const p of [
    path.join(VITE_ROOT, 'node_modules/esbuild'),
    path.resolve(VITE_ROOT, '../node_modules/esbuild'),
  ]) {
    try {
      return require(p)
    } catch {
      /* 继续尝试 */
    }
  }
  throw new Error('未找到 esbuild，请先在 vite/ 下执行 yarn install')
}

const ALIAS = {
  '@package/': path.join(VITE_ROOT, 'packages') + '/',
  '@table/': TABLE + '/',
  '@page/': path.join(TABLE, 'page') + '/',
  '@store/': path.join(TABLE, 'store') + '/',
  '@route/': path.join(TABLE, 'route') + '/',
  '@apps/': path.join(TABLE, 'apps') + '/',
  '@components/': path.join(TABLE, 'components') + '/',
  '@assets/': path.join(TABLE, 'assets') + '/',
  '@js/': path.join(TABLE, 'js') + '/',
}

function resolveFile(base) {
  for (const candidate of [base, base + '.ts', base + '.js', base + '/index.ts']) {
    if (fs.existsSync(candidate)) return candidate
  }
  return null
}

/** 静态桩：只保留被测模块真正用到的导出 */
const STUBS = {
  '@table/services/crosschain': `
    export const getFinalRpcUrl = async () => process.env.CC_TEST_RPC || 'http://47.243.174.71:36054'
    export const getFinalManagerAddress = async () => process.env.CC_TEST_MANAGER || '0x25fC06937335578273ba0D63e591A9e695571486'
    export const getFinalContractAddress = async () => process.env.CC_TEST_TRANSPORT || '0x303754720fbb7481116B6987D7A7345795D4758b'
    export const getCurrentWalletAddress = async () => process.env.CC_TEST_ADDRESS || '0x040AB1Cce91AA43981CB430CE9eD5A48866c7deE'
    export const getSigner = async () => { throw new Error('自测不执行签名') }
    export const createTask = async () => { throw new Error('自测不执行签名') }
    export const finishTaskWithParams = async () => { throw new Error('自测不执行签名') }
    export const mapFinishTaskError = (message) => String(message)
  `,
  'element-plus': `export const ElMessage = { success(){}, error(){}, warning(){}, info(){} }`,
  'ant-design-vue': `export const theme = { darkAlgorithm:{}, defaultAlgorithm:{} };
    export const message = { success(){}, error(){}, warning(){} };
    export const Modal = { confirm(){} }`,
}

async function main() {
  const esbuild = loadEsbuild()
  fs.mkdirSync(OUT_DIR, { recursive: true })

  const plugin = {
    name: 'crosschain-test-resolver',
    setup(build) {
      build.onResolve({ filter: /^@(package|table|page|store|route|apps|components|assets|js)\// }, (args) => {
        for (const [prefix, target] of Object.entries(ALIAS)) {
          if (args.path.startsWith(prefix)) {
            const full = path.join(target, args.path.slice(prefix.length))
            return { path: resolveFile(full) || full }
          }
        }
        return null
      })
      build.onResolve({ filter: /^(@table\/services\/crosschain|element-plus|ant-design-vue)$/ }, (args) => ({
        path: args.path,
        namespace: 'stub',
      }))
      build.onLoad({ filter: /.*/, namespace: 'stub' }, (args) => ({
        loader: 'js',
        contents: STUBS[args.path] || 'export {}',
      }))
    },
  }

  await esbuild.build({
    entryPoints: [path.join(HERE, 'functional.ts')],
    bundle: true,
    platform: 'node',
    format: 'cjs',
    target: 'node18',
    outfile: OUT_FILE,
    absWorkingDir: VITE_ROOT,
    plugins: [plugin],
    logLevel: 'warning',
    banner: {
      js: `globalThis.localStorage = { __d:{}, getItem(k){ return this.__d[k] ?? null }, setItem(k,v){ this.__d[k]=String(v) }, removeItem(k){ delete this.__d[k] } };
globalThis.sessionStorage = globalThis.localStorage;
globalThis.navigator = globalThis.navigator || {};
globalThis.window = globalThis.window || globalThis;`,
    },
  })

  execFileSync(process.execPath, [OUT_FILE], { stdio: 'inherit' })
}

main().catch((error) => {
  console.error('自测运行失败: ' + (error?.message || error))
  process.exit(1)
})
