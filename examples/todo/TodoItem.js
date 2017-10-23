import React from 'react';

const TodoItemPresentation = ({text}) => (
    <div>{text}</div>
);

const TodoItemProps = {
    name: 'TodoItem',
    onResolve: ({props: {id}, context: {itemStore}}) => {
        const item = itemStore.getItem(id);
        const {text} = item;
        return {text, key: id};
    },
};

export {TodoItemPresentation, TodoItemProps};
