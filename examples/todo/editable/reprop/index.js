// Don't symlink this to preserve symlinks.
// Following doesn't seem to have an effect on a symlinked entry.
// - Flag `--preserve-symlinks`
// - Env var `NODE_PRESERVE_SYMLINKS=1`
process.on('unhandledRejection', err => {throw err});
require('babel-polyfill');
require("babel-register")({
    babelrc: false,
    presets: ['env', 'react'],
    plugins: ['transform-object-rest-spread'],
});
require('./app');
