const React = require('react');
const Reprop = require('reprop/pure');
const ItemStore = require('reprop/test/use-cases/todo/stores/Items');
const {TodoItemPresentation, TodoItemProps} = require('./TodoItem');

module.exports = {TodoListPresentation, TodoListProps};

function TodoListPresentation({items, isLoading}) {
    return (
        isLoading ? (
            <div>Loading...</div>
        ) : (
            <div>{items.map(props => <TodoItemPresentation {...props}/>)}</div>
        )
    );
};

function TodoListProps() {
    // Everything defined here is encapsulated and only the view logic of TodoList can write/read it.
    // Only source-of-truths should reside here.

    // Only TodoList needs to know about the loading status
    const state = {
        isLoading: null,
    };

    return {
        onResolve,
        addContext,
        onBegin,
        onUpdate,
     // onEnd,
     // staticProps,
    };

    function onResolve({context, /*attrs, state*/}) {
        const items =
            context.itemStore
            .getItems()
            .map(({id}) =>
                Reprop.createPropsElement(TodoItemProps, {id})
            );
        return {
            items,
            ...state,
        };
    }

    function addContext({/*attrs, context*/}) {
        const itemStore = new ItemStore();
        return {itemStore};
    }

    async function onBegin({resolve, context, /*attrs, endParams*/}) {
        state.isLoading = true;
        resolve();

        await context.itemStore.loadItems();

        state.isLoading = false;
        resolve();
    }

    // `onUpdate` is called every time `createPropsElement` is called for a *Props object that
    // has already been instantiated.
    function onUpdate({resolve, /*attrs,*/ context}) {
        resolve();
    }

    /*
    function onEnd({endParams, attrs, state, context}) {
    }
    function staticProps({resolve, state, context, attrs}) {
        return {};
    }
    */
};
