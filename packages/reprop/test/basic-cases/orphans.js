const Reprop = require('reprop/pure');
const assert = require('reassert');
const assert_test = assert;

const child_resolvers = {};

const resolutions = [];

Reprop.resolve({
    propsElement: Reprop.createPropsElement(ParentProps),
    onResolvedProps: props => {
        resolutions.push(props);
    },
 // {debug: true},
});


function ParentProps() {
    let childPropsElement;

    return {
        onBegin,
        onResolve: () => {
            return childPropsElement;
        },
    };

    function onBegin({resolve}) {
        const childPropsElementA = Reprop.createPropsElement(ChildProps, {key: 'A'});
        const childPropsElementB = Reprop.createPropsElement(ChildProps, {key: 'B'});

        childPropsElement = childPropsElementA;
        resolve();
        assert(Object.values(child_resolvers).length===1);
        assert(resolutions.length===0);

        childPropsElement = childPropsElementB;
        resolve();
        assert(resolutions.length===0);

        // Child A has no effect on parentElement anymore
        // as it has been orphaned by child B
        child_resolvers['A']();
        assert_test(resolutions.length===0);

        child_resolvers['B']();
        assert(resolutions.length>=1, resolutions);
        assert_test(resolutions.length===1, resolutions);
        assert_test(resolutions[0].hello==='From child B');

        console.log('All good.');
    }
}

function ChildProps() {
    let name;

    return {
        onBegin: ({props: {key}, resolve}) => {
            name = key;
            child_resolvers[name] = () => resolve();
        },
        onUpdate: ({resolve, props: {key}}) => {
            assert(name===key);
            resolve();
        },
        onResolve: () => {
            return {hello: 'From child '+name};
        },
    };
}
