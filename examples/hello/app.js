import Reprop from 'reprop' // npm install reprop
import React from 'react';
import ReactDOMServer from 'react-dom/server';

const HelloPresentation = ({name, elapsedSeconds}) => (
    <div>{'Hello '+name+' (after '+elapsedSeconds+'s)'}</div>
);

const HelloProps = {
    name: 'Hello',
    onResolve: ({state: {name, startDate}}) => {
        return {
            name,
            elapsedSeconds: Math.floor((new Date() - startDate)/1000),
        };
    },
    onBegin: ({resolve, state}) => {
        state.startDate = new Date();
        state.name = 'Jon';
        resolve();
        setTimeout(() => {state.name = 'Cersei'; resolve()}, 1000);
        setTimeout(() => {state.name = 'Tyrion'; resolve()}, 2000);
    },
};

Reprop.resolve({
    propsElement: Reprop.createPropsElement(HelloProps, {}),
    onResolvedProps: props => {
        console.log(ReactDOMServer.renderToStaticMarkup(<HelloPresentation {...props}/>));
    },
});
