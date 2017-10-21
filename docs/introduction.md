<!---






    WARNING, READ THIS.
    This is a computed file. Do not edit.
    Edit `/docs/introduction.template.md` instead.












    WARNING, READ THIS.
    This is a computed file. Do not edit.
    Edit `/docs/introduction.template.md` instead.












    WARNING, READ THIS.
    This is a computed file. Do not edit.
    Edit `/docs/introduction.template.md` instead.












    WARNING, READ THIS.
    This is a computed file. Do not edit.
    Edit `/docs/introduction.template.md` instead.












    WARNING, READ THIS.
    This is a computed file. Do not edit.
    Edit `/docs/introduction.template.md` instead.






-->
[<p align="center"><img src='https://github.com/brillout-test/reprop-test/blob/master/docs/logo/logo-title.svg' width=400 style="max-width:100%;" alt="Reprop"/></p>](https://github.com/brillout/reprop)
<br/>

[Introduction](/../../)<br/>
[About Performance](/docs/performance.md)<br/>
[Usage with `reprop/pure`](/packages/reprop/pure)<br/>
[Usage with `react-reprop`](/packages/react-reprop)<br/>
[Usage with `reprop`](/packages/reprop)

## Introduction

Reprop is a small JavaScript library that makes view logic easier to implement and easier to reason about.

Reprop's most significant added value is to allow you to encapsulate your view components.
With encapsulation you can reason about and modify a component in isolation.
It also allows easy reusability of components, component-level tests, and a new "Fiber Pruning" performance-tuning technique.

Reprop has no dependencies and is view-library agnostic.
But it works best with one-way data flow libraries such as React.
Reprop has been developed in the context of React and the docs assume a Reprop & React usage.

While it is easy to encapsulate presentational components, it is currently challenging to do so for components with non-trivial view logic.
And more critically, the default outcome with our current React paradigms is a set of intricated components.
Reprop makes encapsulated components the default outcome.

With Reprop you can get

> one component = one file = one black box with minimal interface

Reprop aims to be able to encapsulate all kinds of components including those that need to load initial data, that have different behavior between server and browser, that need access to several data stores, etc.

Beyond encapsulation, Reprop is designed with following in mind.

 - Source-of-Truth Rendering
   <br/>
   Every time the UI updates, the entire UI is re-computed from all source-of-truths.
   This makes UI changes more predictable and easier to reason about;
   If your source-of-truths are correct and
   your components correctly transform these source-of-truths to a view then
   you know that the UI will correctly render.

 - Performance
   <br/>
   Note that if you use a view library based on something like a virtual DOM such as React then chances are that you will not need any performance-tuning.
   That said, Reprop allows you to fine-tune performance and introduces a new performance-tuning technique called "Fiber Pruning".

 - Testing
   <br/>
   Because your components are encapsulated you can test them individually and independently of each other.
   Also, the logic of a component and the entire UI logic can be tested independently of your React components.
   So that
   you can write tests that focus on the logics of your UI.
   (Instead of focusing on the less error-prone presentational part of your UI.)

 - Debugging
   <br/>
   Reprop is independent of your data stores and
   you can use a predictable state management library like Redux to manage your data stores.
   In case you want to track UI states as well,
   you can use `reprop/pure` instead of `reprop` to manage the `state` and `props` objects yourself.

 - Server-Side Rendering
   <br/>
   Not only does Reprop encapsulate components but it also allows you to encapsulate all your source-of-truths which is critical for server-side rendering;
   For every new incoming HTTP request the server needs a new fresh set of source-of-truths.
   Also, Reprop makes it easy to "wait" until all initial data are loaded before rendering the HTML.

<br/>


API / Usage Example.
<br/>

The following example acts as API description as it displays (almost) the whole API.
After comprehending this example you will be able to use Reprop.
Thoroughly going over this example will make sure that you have a good understanding of Reprop.

~~~js
// /examples/todo/reprop/app.js

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
    // `props` represents the entire props tree. It holds all presentation props for
    // all presentations (which in this example are React components).

    const element = <TodoListPresentation {...props}/>;

    console.log(
        require('pretty')(
            require('react-dom/server').renderToStaticMarkup(element)
        )
    );
}
~~~

~~~js
// /examples/todo/reprop/components/TodoList.js

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
            // We pass down <TodoItemPresentation />'s "presentation props"
            <TodoItemPresentation {...props}/>
        )}</div>
    );
};

// This "*Props object" specifies how the presentation props are (dynamically) computed.
// In other words, it defines TodoList's view logic.
const TodoListProps = {
    name: 'TodoList',
    // `onResolve` returns the "presentation props" that `TodoListPresentation` requires.
    // The `onResolve` needs two source-of-truths: The data store `context.itemStore` and
    // the UI state `state.isLoading`.
    // Note that `onResolve` is required to be synchronous and Reprop will throw
    // if using an async function or if returning a Promise.
    onResolve: ({state: {isLoading}, /*props,*/ context: {itemStore}}) => {
        const items =
            itemStore
            // Every time the view is re-rendered, we ask `itemStore` for the list of items.
            // We are essentially doing Source-of-Truth Rendering here.
            .getItems()
            .map(({id}) =>
                // We are using TodoItem as a black box with TodoItem's only interface being `id`.
                // This shows that we have effectively encaspulated TodoItem's view logic
                // away from TodoList.
                Reprop.createPropsElement(TodoItemProps, {id})
            );

        // Note that the "presentation props" returned by `onResolve` are not the same than the
        // "logic props" `props`. TodoList doesn't have any logic props (that's why `props` is
        // commented away) but does require presentation props which are returned by
        // this `onResolve` function. Basically;
        // Logic props -> props for the view logic, i.e. a "*Props object"
        // Presentation props -> props for the presentation, i.e. a React component in this example
        return {
            items,
            isLoading,
        };
    },
    // TodoList is responsible for creating `itemStore`. But TodoItem needs `itemStore` as well.
    // We add `itemStore` to the context to make it accessible for TodoItem.
    addContext: ({/*props*/}) => {
        const itemStore = new ItemStore();
        // Adding something to the context makes it available to all children and all descendants.
        // The context is mostly used to pass down data stores and contextual information.
        // (For example whether the code is being run on the server or in the browser, the URL, etc.)
        return {itemStore};
    },
    // `onBegin` is called only once. Initial data should load here.
    onBegin: async ({resolve, state, /*props,*/ context: {itemStore}, /*endParams*/}) => {
        state.isLoading = true;
        // Calling `resolve` is basically telling Reprop that the presentation props should be
        // (re)computed. Reprop then calls all `onResolve` to get all latest props. Note that Reprop
        // recomputes the props of all elements in order to respect Source-of-Truth Rendering.
        resolve();

        await itemStore.loadItems();

        state.isLoading = false;
        // Tell Reprop that something changed.
        resolve();
    },
    // Reprop calls `onEnd` when the element is not used anymore. It is typically used to do cleanup and
    // `endParams` can be mutated in `onBegin` in order to pass necessary cleanup information to `onEnd`.
    // onEnd: ({endParams, context, props, state}) => {},
};

module.exports = {TodoListPresentation, TodoListProps};
~~~

~~~js
// /examples/todo/reprop/components/TodoItem.js

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
    // This `onResolve` computes and returns the "presentation props" that `TodoItemPresentation` needs.
    // It assembles the "presentation props" from the "logic props" `props.id` and
    // the source-of-truth `context.itemStore`.
    onResolve: ({props: {id}, context: {itemStore}}) => {
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
~~~js
cd /tmp && git clone git@github.com:brillout/reprop && cd reprop && npm i && ./node_modules/.bin/lerna bootstrap && node ./examples/todo/reprop
~~~

Because `TodoItem` is encapsulated we can modify it in isolation.
The following re-implementation of `TodoItem`
removes the creation date from the presentation
and makes the todo items editable.
Note that we do all that without touching `TodoList.js` or `app.js`.

~~~js
// /examples/todo/editable/reprop/components/TodoItem.js

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
    // Note that you can't mutate `state` in `onResolve` and you can never mutate `props`.
    onResolve: ({state: {draftText}, props: {id}, context: {itemStore}}) => {
        // We assemble the presentation props from source-of-truths `state.draftText`
        // and `context.itemStore`.
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
    // As we don't have access to `resolve` in `onResolve` we add the event listeners to `staticProps`.
    // Reprop will run `staticProps` once and add the returned props to the presentation props on every
    // resolve.
    staticProps: ({resolve, state, context: {itemStore}, props: {id}}) => {
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

<!---






    WARNING, READ THIS.
    This is a computed file. Do not edit.
    Edit `/docs/introduction.template.md` instead.












    WARNING, READ THIS.
    This is a computed file. Do not edit.
    Edit `/docs/introduction.template.md` instead.












    WARNING, READ THIS.
    This is a computed file. Do not edit.
    Edit `/docs/introduction.template.md` instead.












    WARNING, READ THIS.
    This is a computed file. Do not edit.
    Edit `/docs/introduction.template.md` instead.












    WARNING, READ THIS.
    This is a computed file. Do not edit.
    Edit `/docs/introduction.template.md` instead.






-->
