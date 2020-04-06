const path = require('path');

module.exports = {
    output: {
        filename: '[name].js',
        chunkFilename: 'dist/js/chunks/[name].js',
        publicPath: '/',
    },
    resolve: {
        alias: {
            "@component":   path.resolve(__dirname, "./resources/js/components"),
            "@layout":      path.resolve(__dirname, "./resources/js/layouts"),
            "@page":        path.resolve(__dirname, "./resources/js/pages"),
            "@plugin":      path.resolve(__dirname, "./resources/js/plugins"),
        },
    },
};
