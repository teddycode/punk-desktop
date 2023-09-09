const path = require("path");
module.exports = {
    resolve: {
        alias: {
            '@': path.join(__dirname, "src/renderer"),
            '@a': path.join(__dirname, "src/renderer/assets"),
        }
    }
};