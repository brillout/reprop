const Reprop = require('reprop');
const assert = require('reassert');
const assert_test = assert;

const TimerProps = {
    name: 'Timer',
    onResolve: ({state: {counter}}) => ({counter}),
    onBegin: ({resolve, state, props: {step}}) => {
        assert(resolutions.length===0);

        state.counter = 0;

        assert_test(resolutions.length===0);
        resolve();
        assert_test(resolutions.length===1);

        setTimeout(() => {
            state.counter += step;
            assert(resolutions.length===1, resolutions);
            resolve();
            assert(resolutions.length===2);
        },10);

        setTimeout(() => {
            state.counter += step;
            assert(resolutions.length===2);
            resolve();
            assert(resolutions.length===3);
            assert_test(resolutions[0].counter===0);
            assert(resolutions[1].counter===1);
            assert(resolutions[2].counter===2);
            console.log('All good.');
        },20);
    },
};

const resolutions = [];
Reprop.resolve({
    propsElement: Reprop.createPropsElement(TimerProps, {step: 1}),
    onResolvedProps: props => {
        resolutions.push(props);
    },
 // {debug: true},
});
