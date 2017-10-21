const parent_module = require('parent-module');
const path_module = require('path');

const queue = [];
module.exports = filenames => {
    const parent_path = parent_module()
    const runners = filenames.map(filename => {
        const file_path = path_module.resolve(parent_path, '..', filename);
        const fn = () => require(file_path);
        Object.defineProperty(fn, "name", {value: "["+file_path+']'});
        return fn;
    });
    queue.push(...runners);
};

addExitListener();

function addExitListener() {
    process.once('beforeExit', () => {
        if( queue.length===0 ) {
            return;
        }
        addExitListener();
        setImmediate(() => {
            const runner = queue.shift();
            runner();
        });
    });
}
