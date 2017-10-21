process.on('unhandledRejection', err => {throw err});
require('babel-polyfill');
require("babel-register")({
    babelrc: false,
    presets: ['env', 'react'],
    plugins: ['transform-object-rest-spread'],
});
require('./app');
