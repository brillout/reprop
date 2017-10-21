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

assert_test(resolutions.length===2, resolutions);
assert(resolutions[1].counter===2);


function ParentProps() {
    const child = Reprop.createPropsElement(ChildProps);

    return {
        onBegin: ({resolve}) => {
            assert(resolutions.length===0);

            resolve();
            assert(resolutions.length===1, resolutions);
            assert(resolutions[0].counter===1);

            resolve();
            assert(resolutions.length===2, resolutions);
            assert_test(resolutions[1].counter===2, resolutions);

            console.log('All good.');
        },
        onResolve: () => child,
    };
}

function ChildProps() {
    let counter = 0;
    return {
        onBegin: onProp,
        onUpdate: onProp,
        onResolve: () => ({counter}),
    };

    function onProp({resolve}) {
        ++counter;
        resolve();
    }
}

