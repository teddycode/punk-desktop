import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

const path = require('path');
// https://vitejs.dev/config/
const pkg: string = __dirname;

function getPath(name: string) {
  return path.resolve(pkg, 'html', name + '.html');
}

const htmls = [
  'icon', //图标选择器
  'extension', //扩展插件
  'task', //选择任务，暂存任务
  'settings', //设置页面
  'tray', //托盘
  'frame', //应用外框
  'app', //应用管理
  'kee', //密码弹窗
  'table', //工作台
  'search', //全局搜索
  'toolbox', //工具箱
  'auth/index', // 添加 auth 页面
];
let inputs = {};
htmls.forEach((html) => {
  inputs[html] = getPath(html);
});

export const config = {
  plugins: [vue(), require('tailwindcss'), require('autoprefixer')],
  base: './',
  resolve: {
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
      // 添加以下别名解析
      '#alloc': path.resolve('./node_modules/uint8arrays/dist/src/alloc.js'),
      '#util/as-uint8array': path.resolve('./node_modules/uint8arrays/dist/src/util/as-uint8array.js'),
      // 添加 web3modal 本地包的别名解析
      '@web3modal/scaffold-utils': path.resolve('../packages/web3modal/packages/scaffold-utils/dist/esm/exports'),
      '@web3modal/scaffold': path.resolve('../packages/web3modal/packages/scaffold/dist/esm'),
      '@web3modal/core': path.resolve('../packages/web3modal/packages/core/dist/esm'),
      '@web3modal/ui': path.resolve('../packages/web3modal/packages/ui/dist/esm'),
      '@web3modal/common': path.resolve('../packages/web3modal/packages/common/dist/esm'),
      '@web3modal/polyfills': path.resolve('../packages/web3modal/packages/polyfills/dist/esm'),
      '@web3modal/wallet': path.resolve('../packages/web3modal/packages/wallet/dist/esm'),
    },
  },
  build: {
    sourcemap: true, //不打包sourcemap
    target: 'es2020',
    rollupOptions: {
      // Packaged Electron loads these pages from local files, so runtime
      // dependencies must be bundled instead of left as bare module imports.
      external: [],
      input: inputs,
      output: {
        manualChunks: {
          vandor: ['vue', 'ant-design-vue', 'perfect-scrollbar', '@ant-design/icons-vue', 'vue-router', 'vuex'], //提取公共部分的插件，防止部分插件无法加载
        },
      },
    },
  },
};
export default defineConfig(config);
