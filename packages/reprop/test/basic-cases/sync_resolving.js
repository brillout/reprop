const Reprop = require('reprop/pure');
const assert = require('reassert');
const assert_test = assert;

const resolutions = [];
Reprop.resolve({
    propsElement: Reprop.createPropsElement(ParentProps),
    onResolvedProps: props => {
        resolutions.push(props);
    },
 // {debug: true},
});

assert_test(resolutions.length===1, resolutions);
assert(resolutions[0].hello==='from child');


function ParentProps() {
    return {
        onBegin: ({resolve}) => {
            assert(resolutions.length===0);

            resolve();
            assert_test(resolutions.length===1, resolutions);
            assert(resolutions[0].hello==='from child');

            console.log('All good.');
        },
        onResolve: () => {
            const childProps = Reprop.createPropsElement(ChildProps);
            return childProps;
        },
    };
}

function ChildProps() {
    return {
        onBegin: ({resolve}) => {resolve()},
        onUpdate: ({resolve}) => {resolve()},
        onResolve: () => {
            return {hello: 'from child'};
        },
    };
}
