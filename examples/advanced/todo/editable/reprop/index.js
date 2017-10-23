const spawn = require('child_process').spawn;
const env = {...process.env, NODE_PRESERVE_SYMLINKS: '1'};
const src = [
    "require('reprop/utils/babel_run');",
    "require('./app');",
].join('');
const start = spawn('node', ['-e', src], {env});
start.stdout.pipe(process.stdout);

