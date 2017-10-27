<!---






    WARNING, READ THIS.
    This is a computed file. Do not edit.
    Edit `/docs/full-blown-example.template.md` instead.












    WARNING, READ THIS.
    This is a computed file. Do not edit.
    Edit `/docs/full-blown-example.template.md` instead.












    WARNING, READ THIS.
    This is a computed file. Do not edit.
    Edit `/docs/full-blown-example.template.md` instead.












    WARNING, READ THIS.
    This is a computed file. Do not edit.
    Edit `/docs/full-blown-example.template.md` instead.












    WARNING, READ THIS.
    This is a computed file. Do not edit.
    Edit `/docs/full-blown-example.template.md` instead.






-->
[Introduction](/../../)<br/>
[API](/docs/api.md)<br/>
[Full-Blown Example](/docs/full-blown-example.md)<br/>
[Lifting State Up](/docs/lifting-state-up.md)<br/>
[Source-of-Truth Rendering](/docs/source-of-truth-rendering.md)<br/>
[Testing](/docs/testing.md)<br/>
[Debugging](/docs/debugging.md)<br/>
[Performance](/docs/performance.md)<br/>
[Server-Side Rendering](/docs/server-side-rendering.md)

**Read the introduction before reading this.**

## Full-blown usage example

This is a commented full Todo Item implementation.

~~~js
// /examples/advanced/todo/reprop/app.js

const React = require('react');
const Reprop = require('reprop'); // npm install reprop
const {TodoListProps, TodoListPresentation} = require('./components/TodoList');

Reprop.resolve({
    propsElement: Reprop.createPropsElement(TodoListProps, {}),
    // Reprop calls `onResolvedProps` once the entire props tree is resolved
    // and subsequently every time new props are resolved.
    onResolvedProps,
});

// Note that what happens above is entirely React agnostic and
// what happens bellow is entirely Reprop agnostic.
// Reprop takes care of view logic whereas React takes care of rendering presentations

function onResolvedProps(props) {
    // `props` represents the entire props tree. It holds all props for
    // all presentations (which in this example are pure functional React components).

    const element = <TodoListPresentation {...props}/>;

    console.log(
        require('pretty')(
            require('react-dom/server').renderToStaticMarkup(element)
        )
    );
}
~~~

~~~js
// /examples/advanced/todo/reprop/components/TodoList.js

const React = require('react');
const Reprop = require('reprop');
// ItemStore simulates a communication with a Backend and provides objects like the following.
// {
//     id: 0,
//     text: 'Buy milk',
//     createdAt: new Date('2017-10-31'),
// }
const ItemStore = require('../stores/Items');
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
~~~

~~~js
// /examples/advanced/todo/reprop/components/TodoItem.js

const React = require('react');
const Reprop = require('reprop');

const TodoItemPresentation = ({text, createdAt}) => (
    <div>
        {text}
        <br/>
        <small>{createdAt.toLocaleString()}</small>
    </div>
);

const TodoItemProps = {
    name: 'TodoItem',
    // This `onResolve` computes and returns the props that `TodoItemPresentation` needs.
    // It assembles the props from the attr `attrs.id` and
    // the source-of-truth `context.itemStore`.
    onResolve: ({attrs: {id}, context: {itemStore}}) => {
        const item = itemStore.getItem(id);
        const {text, createdAt} = item;
        return {
            text,
            createdAt,
            key: id,
        };
    },
};

module.exports = {TodoItemPresentation, TodoItemProps};
~~~

To run the example;

Get code & install dependencies;
~~~shell
git clone git@github.com:brillout/reprop && cd reprop && npm i && ./node_modules/.bin/lerna bootstrap
~~~

Run the example;
~~~shell
node examples/advanced/todo/reprop
~~~

Because `TodoItem` is isolated from `TodoList` we can modify it in isolation.
The following is a re-implementation of `TodoItem`
that removes the creation date from the presentation
and makes todo items editable.
Note that we do all that without touching `TodoList.js` or `app.js`.

~~~js
// /examples/advanced/todo/editable/reprop/components/TodoItem.js

const React = require('react');
const Reprop = require('reprop');

const TodoItemPresentation = ({text, draftText, onTextChange, onEdit, onSave}) => (
    draftText === null ? (
        <div onClick={onEdit}>{text}</div>
    ) : (
        <form onSubmit={onSave}>
            <input type='text' value={draftText} onChange={ev => onTextChange(ev.target.value)} />
            <button type='submit'>Save</button>
        </form>
    )
);

const TodoItemProps = {
    name: 'TodoItem',
    // Note that you can't mutate `state` in `onResolve` and you can never mutate `attrs`
    onResolve: ({state: {draftText}, attrs: {id}, context: {itemStore}}) => {
        // We assemble the props from source-of-truths `state.draftText` and `context.itemStore`
        const {text} = itemStore.getItem(id);
        return {
            text,
            draftText,
            key: id,
        };
    },
    onBegin: ({resolve, state}) => {
        state.draftText = null;
        resolve();
    },
    // As we don't have access to `resolve` in `onResolve` we add the event listeners to `staticProps`,
    // `staticProps` is run once and the returned props are added to the props returned by `onResolve`
    staticProps: ({resolve, state, context: {itemStore}, attrs: {id}}) => {
        return {
            onTextChange,
            onEdit,
            onSave,
        };
        function onTextChange(newText) {
            state.draftText = newText;
            resolve();
        }
        function onEdit() {
            const {text} = itemStore.getItem(id);
            state.draftText = text;
            resolve();
        }
        async function onSave() {
            await itemStore.updateItem(
                id,
                {text: state.draftText}
            );
            state.draftText = null;
            resolve();
        }
    },
};

module.exports = {TodoItemPresentation, TodoItemProps};
~~~

Run it;
~~~shell
node examples/advanced/todo/editable/reprop
~~~


<!---






    WARNING, READ THIS.
    This is a computed file. Do not edit.
    Edit `/docs/full-blown-example.template.md` instead.












    WARNING, READ THIS.
    This is a computed file. Do not edit.
    Edit `/docs/full-blown-example.template.md` instead.












    WARNING, READ THIS.
    This is a computed file. Do not edit.
    Edit `/docs/full-blown-example.template.md` instead.












    WARNING, READ THIS.
    This is a computed file. Do not edit.
    Edit `/docs/full-blown-example.template.md` instead.












    WARNING, READ THIS.
    This is a computed file. Do not edit.
    Edit `/docs/full-blown-example.template.md` instead.






-->
