const { defineConfig } = require('@vue/cli-service')
const path = require("path");

module.exports = defineConfig({
  transpileDependencies: true,
  lintOnSave:false,
  // 构建时开启多进程处理 babel 编译
  parallel: require('os').cpus().length > 1,
  // webpack的相关配置
  configureWebpack: {
    entry: "./src/renderer/main.js",
    resolve: {
      fallback: {
        path: false,
        fs: false,
      },
      extensions: [".js", ".vue", ".json", ".ts", ".less"],
      alias: {
        // @ 指代路径的重定向
        "@": path.join(__dirname, "src/renderer"),
        "@a": path.join(__dirname, 'src/renderer/assets')
      },
    },
    // 公共资源合并
    optimization: {
      splitChunks: {
        cacheGroups: {
          vendor: {
            chunks: "all",
            test: /node_modules/,
            name: "vendor",
            minChunks: 1,
            maxInitialRequests: 5,
            minSize: 0,
            priority: 100,
          },
          common: {
            chunks: "all",
            test: /[\\/]src[\\/]js[\\/]/,
            name: "common",
            minChunks: 2,
            maxInitialRequests: 5,
            minSize: 0,
            priority: 60,
          },
          styles: {
            name: "styles",
            test: /\.(sa|sc|le|c)ss$/,
            chunks: "all",
            enforce: true,
          },
          runtimeChunk: {
            name: "manifest",
          },
        },
      },
    },
    // 性能警告修改
    performance: {
      hints: "warning",
      // 入口起点的最大体积 整数类型（以字节为单位）
      maxEntrypointSize: 50000000,
      // 生成文件的最大体积 整数类型（以字节为单位 300k）
      maxAssetSize: 30000000,
      // 只给出 js 文件的性能提示
      assetFilter: function (assetFilename) {
        return assetFilename.endsWith(".js");
      },
    },
  },
  // 第三方插件配置
  pluginOptions: {
  },

  devServer: {
    host: "localhost",
    port: "8080",
    proxy: {
      '/api': {
        target: 'http://10.130.157.227:3400',
        changeOrigin: true,
        pathRewrite: {
          '^/api': ''
        }
      }
    }
  }
})