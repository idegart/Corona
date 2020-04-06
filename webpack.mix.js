const mix = require('laravel-mix');

mix
    .webpackConfig(require('./webpack.config'))
    .js('resources/js/app.js', 'public/dist/js')
    .sass('resources/sass/app.scss', 'public/dist/css');
