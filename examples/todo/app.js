import Reprop from 'reprop';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import {TodoListPresentation, TodoListProps} from './TodoList';

const TodoListPropsElement = Reprop.createPropsElement(TodoListProps, {});
Reprop.resolve({
    propsElement: TodoListPropsElement,
    onResolvedProps: props => {
        const reactElement = <TodoListPresentation {...props}/>;
        console.log(ReactDOMServer.renderToStaticMarkup(reactElement));
    },
});
