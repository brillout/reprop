const path_module = require('path');
const spawn = require('child_process').spawn;
const env = {...process.env, NODE_PRESERVE_SYMLINKS: '1'};
const src = [
    "require('"+require.resolve('reprop/utils/babel_run')+"');",
    "require('"+path_module.join(__dirname, './app')+"');",
].join('');
const start = spawn('node', ['-e', src], {env});
start.stdout.pipe(process.stdout);
start.stderr.pipe(process.stderr);

