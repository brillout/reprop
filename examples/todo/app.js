import Reprop from 'reprop' // npm install reprop
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import {TodoListPresentation, TodoListProps} from './TodoList';

Reprop.resolve({
    propsElement: Reprop.createPropsElement(TodoListProps, {}),
    onResolvedProps: props => {
        console.log(ReactDOMServer.renderToStaticMarkup(<TodoListPresentation {...props}/>));
    },
});
