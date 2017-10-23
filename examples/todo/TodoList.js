import Reprop from 'reprop';
import React from 'react';
import ItemStore from 'reprop/test/use-cases/todo/stores/Items';
import {TodoItemPresentation, TodoItemProps} from './TodoItem';

const TodoListPresentation = ({items}) => (
    <div>{items.map(itemProps =>
        // We pass down all "presentation props" of TodoItem (!= "logic props", see bellow)
        <TodoItemPresentation {...itemProps}/>)
    }</div>
);

const TodoListProps = {
    name: 'TodoList',
    onResolve: ({context: {itemStore}}) => {
        const items =
            itemStore.getItems()
            .map(({id}) =>
                // The only "logic prop" of TodoItem is `id`
                Reprop.createPropsElement(TodoItemProps, {id})
            );
        return {items};
    },
    addContext: () => {
        return {itemStore: new ItemStore()};
    },
    onBegin: async ({resolve, context: {itemStore}}) => {
        await itemStore.loadItems();
        // The initial and first `resolve` call is done asynchronously after loading the items.
        resolve();
    },
};

export {TodoListPresentation, TodoListProps};
