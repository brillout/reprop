const Reprop = require('reprop/pure');
const assert = require('reassert');
const assert_test = assert;

const resolvers = {};
let counter = 0;

const resolutions = [];
Reprop.resolve({
    propsElement: Reprop.createPropsElement(ParentProps),
    onResolvedProps: props => {
        resolutions.push(props);
    },
 // {debug: true},
});

function ParentProps() {
    return {
        onBegin: ({resolve}) => {

            ++counter;
            assert(resolutions.length===0);

            resolve();
            assert(resolutions.length===0, resolutions);
            resolvers['A'].resolve();
            assert(resolutions.length===0, resolutions);
            resolvers['B'].resolve();
            assert(resolutions.length===1);
            assert(resolutions[0].counter===1);
            assert(resolutions[0].children.a.counter===1);
            assert(resolutions[0].children.b.counter===1);

            setTimeout(() => {
                ++counter;
                resolvers['A'].resolveSelfAndDescendantsOnly();
                assert(resolutions.length===2);
                assert(resolutions[1].children.a.counter===2);
                assert_test(resolutions[1].children.b.counter===1);
                assert_test(resolutions[1].counter===1);

                setTimeout(() => {
                    ++counter;
                    resolvers['B'].resolveSelfAndDescendantsOnly();
                    assert(resolutions.length===3);
                    assert(resolutions[2].children.a.counter===2);
                    assert(resolutions[2].children.b.counter===3);
                    assert(resolutions[2].counter===1);

                    ++counter;
                    resolvers['A'].resolve();
                    assert(resolutions.length===4);
                    assert(resolutions[3].children.a.counter===4);
                    assert(resolutions[3].children.b.counter===4);
                    assert(resolutions[3].counter===4);

                    console.log('All good.');
                }, 50);
            }, 50);
        },
        onResolve: () => {
            const childPropsElementA = Reprop.createPropsElement(ChildProps, {key: 'A'});
            const childPropsElementB = Reprop.createPropsElement(ChildProps, {key: 'B'});
            return {
                counter,
                children: {
                    'a': childPropsElementA,
                    'b': childPropsElementB,
                },
            };
        },
    };
}

function ChildProps() {
    let name;
    return {
        onBegin: ({resolve, resolveSelfAndDescendantsOnly, attrs: {key, timeout}}) => {
            name = key;
            resolvers[name] = {resolve, resolveSelfAndDescendantsOnly};
        },
        onUpdate: ({resolve, attrs: {key}}) => {
            assert(name===key);
            resolve();
        },
        onResolve: () => {
            return {
                counter,
                from: 'child '+name,
            };
        },
    };
}

