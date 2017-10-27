import React from 'react';

// === View presentation ===
const TodoItemPresentation = props => (
    <div>{props.text}</div>
);

// === View logic ===
const TodoItemProps = {
    name: 'TodoItem',
    onResolve({
        // `attrs` (short for attributes) are parameters set by the parent
        // `props` are parameters for the view presentation (here TodoItemPresentation)
        // `attrs` are parameters for the view logic (here TodoItemProps)
        // `props` => second arg in `React.createElement(ViewPresentation, props)` when using React
        // `attrs` => second arg in `Reprop.createPropsElement(ViewProps, attrs)`
        attrs,
        // `context` (typically) holds data stores and contextual information
        context,
    }) {
        const id = attrs.id;
        const item = context.itemStore.getItem(id);
        const {text} = item;
        return {text, key: id};
    },
};

export {TodoItemPresentation, TodoItemProps};
