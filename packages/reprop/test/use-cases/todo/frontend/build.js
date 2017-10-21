const path_module = require('path');
const uniserve = require('uniserve');

uniserve(path_module.join(__dirname, './src'), {log_progress: true});
