const React = require('react');
const ReactReprop = require('react-reprop');
const ItemStore = require('reprop/test/use-cases/todo/stores/Items');
const TodoItem = require('./TodoItem');

module.exports = TodoList;

const TodoList = ReactReprop(
    // Presentation part
    ({itemIds, isLoading}) => (
        isLoading ? (
            <div>Loading...</div>
        ) : (
            // Note how the only argument we give to TodoItem is `id`.
            // That we only have to pass the `id` means that we have successfully
            // encapsulated the entire TodoItem view logic away from TodoList.
            <div>{itemIds.map(id => <TodoItem id={id} />)}</div>
        )
    ),{

    // View logic part
    name: 'TodoList',
    onResolve: ({state, context/*, props*/}) => {
        return {
            itemIds: context.itemStore.getItems().map(({id}) => id),
            isLoading: state.isLoading,
        };
    },
    addContext: ({/*props, context*/}) {
        const itemStore = new ItemStore();
        return {itemStore};
    },
    onBegin: async ({resolve, /*props,*/ state, context/*, endParams*/}) => {
        state.isLoading = true;
        // We don't want the temporary loading state to be resolved in the case of
        // server-side rendering
        if( ! context.isServerSideRendering ) {
            resolve();
        }

        await context.itemStore.loadItems();

        state.isLoading = false;
        resolve();
    },
 // onEnd: ({endParams, props, state, context}) => {},
});
