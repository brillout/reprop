import Reprop from 'reprop';
import React from 'react';
import ItemStore from 'reprop/test/use-cases/todo/stores/Items';
import {TodoItemPresentation, TodoItemProps} from './TodoItem';

const TodoListPresentation = ({items}) => (
    <div>{items.map(itemProps =>
        // TodoList doesn't know what props TodoItemPresentation expects which is ok because we simply
        // pass down all `itemProps` (`itemProps` comes from `TodoItemProps`'s `onResolve`)
        <TodoItemPresentation {...itemProps}/>)
    }</div>
);

const TodoListProps = {
    name: 'TodoList',
    onResolve({context}) {
        const items =
            context.itemStore.getItems()
            .map(({id}) => {
                // The only attr of TodoItemProps is `id`
                // (see ./TodoItem for infos about what attr means)
                const attrs = {id};
                const propsElement = Reprop.createPropsElement(TodoItemProps, attrs);
                // Reprop will resolve `propsElement` to props (using `TodoItemProps`'s `onResolve`)
                return propsElement;
            });
        return {items};
    },
    addContext() {
        const itemStore = new ItemStore();
        // Adding itemStore to the context makes it available to all descendants
        return {itemStore};
    },
    onBegin: async ({resolve, context}) => {
        await context.itemStore.loadItems();
        resolve();
    },
};

export {TodoListPresentation, TodoListProps};
