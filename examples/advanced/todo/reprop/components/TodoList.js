const React = require('react');
const Reprop = require('reprop');
// ItemStore simulates a communication with a Backend and provides objects like the following.
// {
//     id: 0,
//     text: 'Buy milk',
//     createdAt: new Date('2017-10-31'),
// }
const ItemStore = require('reprop/test/use-cases/todo/stores/Items');
const {TodoItemPresentation, TodoItemProps} = require('./TodoItem');

// TodoList's presentation which is a React component.
// It's a functional React component and it's `TodoListProps`'s job to handle the view logic.
// When using React with Reprop, all React components should be stateless and have no side-effects.
const TodoListPresentation = ({items, isLoading}) => {
    if( isLoading ) {
        return <div>Loading...</div>;
    }

    return (
        <div>{ items.map(props =>
            // We pass down <TodoItemPresentation />'s props
            <TodoItemPresentation {...props}/>
        )}</div>
    );
};

// This "*Props object" specifies how the props are computed.
// In other words, it defines TodoList's view logic.
const TodoListProps = {
    name: 'TodoList',
    // `onResolve` returns the props that `TodoListPresentation` requires.
    // The `onResolve` needs two source-of-truths: The data store `context.itemStore` and
    // the UI state `state.isLoading`.
    // Note that `onResolve` is required to be synchronous and Reprop will throw
    // if using an async function or if returning a Promise.
    onResolve: ({state: {isLoading}, context: {itemStore}}) => {
        const items =
            itemStore
            // Every time the view is re-rendered, we ask `itemStore` for the list of items.
            // We are essentially doing Source-of-Truth Rendering here.
            .getItems()
            .map(({id}) =>
                // We are using TodoItem as a black box with TodoItem's only interface being `id`.
                // This shows that we have effectively isolated TodoItem's view logic
                // away from TodoList.
                Reprop.createPropsElement(TodoItemProps, {id})
            );

        return {
            items,
            isLoading,
        };
    },
    // TodoList is responsible for creating `itemStore`. But TodoItem needs `itemStore` as well.
    // We add `itemStore` to the context to make it accessible to TodoItem.
    addContext: () => {
        const itemStore = new ItemStore();
        // Adding something to the context makes it available to all children and all descendants.
        // The context is mostly used to pass down data stores and contextual information.
        // (For example whether the code is being run on the server or in the browser, the URL, etc.)
        return {itemStore};
    },
    // `onBegin` is called only once. Initial data should load here.
    onBegin: async ({resolve, state, context: {itemStore}}) => {
        state.isLoading = true;
        // Calling `resolve` is basically telling Reprop that the props should be
        // (re)computed. Reprop then calls all `onResolve` to get all latest props. Note that Reprop
        // recomputes the props of all elements in order to respect Source-of-Truth Rendering.
        resolve();

        await itemStore.loadItems();

        state.isLoading = false;
        // Tell Reprop that something changed.
        resolve();
    },
};

module.exports = {TodoListPresentation, TodoListProps};
