const React = require('react');
const ReactReprop = require('../attempt');
const ReactDOMServer = require('react-dom/server');

const TestComp = ReactReprop(
    props => (
        <div>{
            'hello '+props.counter
        }</div>
    )
, {
    onBegin: ({state, resolve}) => {
        state.counter = 0;
        //*
        setInterval(() => {
            state.counter++;
            resolve();
        }, 1000);
        /*/
        setTimeout(() => {
            state.counter = Math.random();
            resolve();
        }, 1000);
        //*/
    },
    onResolve: ({state, props}) => {
        return state;
    },
});

ReactReprop.resolve(() => <TestComp />, render);

function render(element) {
    console.log(
        require('pretty')(
            ReactDOMServer.renderToStaticMarkup(element)
        )
    );
}
