import {join} from "path";
import {defineConfig} from "vite";
import vuePlugin from "@vitejs/plugin-vue";
import vueJsx from "@vitejs/plugin-vue-jsx";
import viteIkarosTools from "./plugin/vite-ikaros-tools";
import {getConfig} from "./utils";
import Components from 'unplugin-vue-components/vite';
import {AntDesignVueResolver} from "unplugin-vue-components/resolvers";

function resolve(dir: string) {
    return join(__dirname, "..", dir);
}

const config = getConfig();

const root = resolve("src/renderer");

export default defineConfig({
    mode: config && config.NODE_ENV,
    root,
    define: {
        __CONFIG__: config,
        __ISWEB__: Number(config && config.target),
    },
    resolve: {
        alias: {
            timers: 'rollup-plugin-node-polyfills/polyfills/timers',
            "@renderer": root,
            "@pages": join(root, "/pages"),
            "@store": join(root, "/store"),
            "@components": join(root, "/components"),
        },
    },
    base: "./",
    build: {
        outDir:
            config && config.target
                ? resolve("dist/web")
                : resolve("dist/electron/renderer"),
        emptyOutDir: true,
        target: "esnext",
        cssCodeSplit: false,
    },
    server: {},
    plugins: [
        vueJsx(),
        vuePlugin(),
        viteIkarosTools(),
        Components({
            resolvers: [
                AntDesignVueResolver({
                    importStyle: false, // css in js
                }),
            ],
        }),],
    optimizeDeps: {},
});
