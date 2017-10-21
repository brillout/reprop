const Reprop = require('reprop/pure');
const assert = require('reassert');
const assert_test = assert;

let counter = 0;
const resolutions = [];
Reprop.resolve({
    propsElement: Reprop.createPropsElement(ParentProps),
    onResolvedProps: props => {
        resolutions.push(props);
    },
 // {debug: true},
});

assert(resolutions.length===0, resolutions);

function ParentProps() {
    return {
        onBegin: ({resolve}) => {
            resolve();
            assert(resolutions.length===0);
        },
        onResolve: () => {
            const childProps = Reprop.createPropsElement(ChildProps);
            return {
                counterFromParent: counter,
                childProps,
            }
        },
    };
}

function ChildProps() {
    return {
        onBegin: ({resolve}) => {
            ++counter;
            setTimeout(() => {
                assert_test(resolutions.length===0, resolutions);
                ++counter;
                assert(counter===2);
                resolve();
                ++counter;
                assert(counter===3);
                assert(resolutions.length===1, resolutions);
                assert_test(resolutions[0].childProps.counterFromChild===2, resolutions);
                assert_test(resolutions[0].counterFromParent===2, resolutions);
                console.log('All good.');
            }, 100);
        },
        onResolve: () => {
            return {
                counterFromChild: counter
            };
        },
    };
}

