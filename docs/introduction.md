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
[API / Full-blown Usage Example](/docs/usage_example.md)<br/>
[About Performance](/docs/performance.md)



## Introduction

Reprop is a small JavaScript library to manage view logics. Reprop's focus is on

 - Separation of Concerns
 - Source-of-Truth Rendering (every time the UI updates, the entire UI is re-computed from all source-of-truths.)

and is about giving benefits in

 - Flexibility (being able to easily change the code to implement new requirements)
 - Ease of Reasoning (being able to understand how the code works)
 - Testing
 - Debuging
 - Server-Side Rendering

It does not manage your data stores (you can use Redux or MobX for that).
Reprop is only about view logic.

It works with any view library but the docs assume a Reprop & React usage.




#### Hello world

~~~js
// /examples/hello/app.js

import Reprop from 'reprop' // npm install reprop
import React from 'react';
import ReactDOMServer from 'react-dom/server';

const HelloPresentation = ({name, elapsedSeconds}) => (
    <div>{'Hello '+name+' (after '+elapsedSeconds+'s)'}</div>
);

const HelloProps = {
    name: 'Hello',
    onResolve: ({state: {name, startDate}}) => {
        return {
            name,
            elapsedSeconds: Math.floor((new Date() - startDate)/1000),
        };
    },
    onBegin: ({resolve, state}) => {
        state.startDate = new Date();
        state.name = 'Jon';
        resolve();
        setTimeout(() => {state.name = 'Cersei'; resolve()}, 1000);
        setTimeout(() => {state.name = 'Tyrion'; resolve()}, 2000);
    },
};

Reprop.resolve({
    propsElement: Reprop.createPropsElement(HelloProps, {}),
    onResolvedProps: props => {
        console.log(ReactDOMServer.renderToStaticMarkup(<HelloPresentation {...props}/>));
    },
});
~~~

resulting in

~~~
<div>Hello Jon (after 0s)</div>
<div>Hello Cersei (after 1s)</div>
<div>Hello Tyrion (after 2s)</div>
~~~

`onResolve`'s job is to compute `HelloPresentation`'s props from the two source-of-truths `state.name` and `state.startDate`.
The `onResolve` function plays a central role in source-of-truth rendering and we will talk more about that later.

When using Reprop with React, view presentations are pure functional React components, in our case `HelloPresentation`.
(But you can use Reprop with class/stateful components as well if needed.)
And the view logic is handled by a *Reprop object*, in this example `HelloProps`.

Note that we could change `onResolvedProps` to

~~~js
Reprop.resolve({
    propsElement: Reprop.createPropsElement(HelloProps, {}),
    onResolvedProps: props => {
        console.log(props);
    },
});
~~~

to get

~~~js
{ name: 'Jon', elapsedSeconds: 0 }
{ name: 'Cersei', elapsedSeconds: 1 }
{ name: 'Tyrion', elapsedSeconds: 2 }
~~~

This shows that the view logic is entirely independent of `HelloPresentation` and of React.

In general

> With Reprop, the logic of a view is independent of the view's presentation.

This clean cut increases flexibility and allows us test the entire UI independently of the view presentations (thus independently of React and without a browser).

As this example shows, Reprop's sole goal is to
(dynamically) compute the props required by view presentations.

The management of data stores is up to you and you can use any library to do so (Redux, MobX, etc.).

This example is too simple to show the "full benefit" of using Reprop,
let's move to a more interesting example.




#### A todo list app with Reprop

Let's start with its TodoItem implementation.

~~~js
// /examples/todo/TodoItem.js

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
~~~

A central aspect of this code snippet
is that instead of receiving `text` from the parent,
we get `text` from the data store `context.itemStore`
which is unusal for idiomatic React code.
(We will talk more about the `context` object later.)

In idiomatic React code, a component's props acts as an interface that expects all required information, i.e. the maximum amount of information. But instead we only pass down `id`, i.e. the minimal amount of information.

We break this idiomaticity to have a cleaner seperation between parent and child component.

Let's for example modify TodoItem to display the creation date:

~~~js
const TodoItemPresentation = ({text, createdAt}) => (
    <div>{text}<small>{createdAt.toString()}</small></div>
);

const TodoItemProps = {
    name: 'TodoItem',
    onResolve: ({props: {id}, context: {itemStore}}) => {
        const item = itemStore.getItem(id);
        const {text, createdAt} = item;
        return {text, createdAt, key: id};
    },
};
~~~

That's it; Neither the parent component or any other file need to be changed.
We can modify TodoItem in isolation and
the parent component doesn't need to care about TodoItem's view logic.

Now this example is artificially simple and our isolation gain may seem little but in real-world isolation is paramount.

In general

> We decouple components from each other by passing down the minimal amount of information from parent to child (instead of passing down a maxiumum amount of information)

Let's now look at TodoList's implementation.

~~~js
// /examples/todo/TodoList.js

import Reprop from 'reprop';
import React from 'react';
import ItemStore from '../stores/Items';
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
~~~

Before resuming our analysis, we need to clarify that there are two different types of props:
 - **Presentation props** which are the props that the view presentation requires. When using React they are the `props` object when calling <code>React.createElement(ComponentPresentation, **props**)</code>.
 - **Logic props** which are props that the view logic requires, i.e. the `props` object when calling <code>Reprop.createPropsElement(ComponentProps, **props**)</code>.

A Reprop object is essentially about turning logic props into presentation props.

> Logic props in, presentation props out. (We "re-prop".)





Let's now resume our analysis.

#### Lifting state up

Let's imagine we need to display the number of todo items at the root like in the following.

~~~js
<App>
    <Header>
        <Left>My ToDo App</Left>
        <Right>13 ToDos Left</Right>
    </Header>
    <TodoList />
</App>
~~~

But we want `13` to be the actual number of items.
In other words we want the component `Right` to have access to `context.itemStore`
and `Right`'s `onResolve` would be

~~~js
onResolve: ({context: {itemStore}}) => {
    const numberOfItems = itemStore.getItems().length;
    return {
        numberOfItems,
    };
},
~~~

But because `itemStore` is created in TodoList and because `<Right>` is not a descendant of `<TodoList>` it doesn't have access to `itemStore`.
(A context can only be accessed if it has been added by a parent/ancestor.)
We remedy to that situation by moving `itemStore` up the "context tree".
I.e. we move
~~~js
addContext: () => {
    return {itemStore: new ItemStore()};
},
~~~
from TodoList to App. That's it.

We don't need any HOC / provider component / container component, instead we simply move the data store up the context tree.

> We "lift state up" by moving things up in the context tree.




#### "Full" Source-of-Truth Rendering

With source-of-truth rendering (STR) we denote the paradigm of re-computing the entire UI from all source-of-truths on every UI update.
STR makes UI considerably more predictable and easier to reason about;
If your source-of-truths are correct and
your components correctly transform these source-of-truths to a view then
you know that your UI will correctly render.
Enabling STR is one of the strongest added value of React.

A widespread (but partial) use of STR is to compute the entire props tree that represents the entire UI and then use stateless and side-effect free React components to transform that pops tree in a view.
Doing this gives us STR but only partially. Let's see why.

Let's imagine a todo app where the user can edit the text of todo items.
We need two states to make a todo item editable;
`text` holding the original text coming from the database and
`draftText` holding the new text the user is inputting.
Now let's compare partial STR with a full STR for such an app.

~~~js
// Partial STR with a single source-of-truth

// `state` represents the whole UI
let state = {
    items: {
        '0': {text: 'Buy Milk', draftText: null},
        '1': {text: 'Buy Chocolate', draftText: null},
    },
};

function handleDraftChange(id, newText) {
    state = {
        items: {
            ...state.items,
            [id]: {text: state.items[id].text, draftText: newText},
        },
    };
}
~~~

The states `text` and `draftText` are merged together into `state.items[id]` **when data changes** (namely when `handleDraftChange` is called).

~~~js
// Full STR with Reprop

const itemStore = (() => {
    const items = {
        // `draftText` is not saved in `itemStore`
        '0': {text: 'Buy Milk'},
        '1': {text: 'Buy Chocolate'},
    };
    return {
        getItems: () => Object.values(items),
        getItem: id => items[id],
    };
})();

const TodoListProps = {
    // Similar implementation than the previous example
};

const TodoItemProps = {
    name: 'TodoItem',
    // Compute presentation props from `props.id`, `context.itemStore`, and `state.draftText`
    onResolve: ({props: {id}, context: {itemStore}, state: {draftText}}) => {
        return {text: itemStore.getItem(id).text, draftText};
    },
    // All props returned in `staticProps` are added to the presentation props
    staticProps: ({resolve, state}) => {
        return {
            handleDraftChange(newText) {
                state.draftText = newText;
                resolve();
            }
        };
    },
};
~~~

Now note how `text` and `draftText` are merged together into the presentation props **everytime the UI is re-rendered** (namely when `onResolve` is called).

Everytime the UI is re-rendered we re-compute the presentation props whereas with a single source-of-truth the presentation props are computed when the data is changed.

> Everytime the UI re-renders everything is re-computed all the way from the source-of-truths.

Also note that we use `staticProps` here because `resolve` is not available in `onResolve`.
(Calling `resolve` in `onResolve` would result in an infinite loop.)
Reprop calls `staticProps` once and always adds the returned props to the props returned by `onResolve`.

(As a side note: Such single source-of-truth also makes it hard to isolate TodoItem from TodoList and in general to decouple components from each other.)

#### Testing

Reprop's has been designed to allow you to isolate everything that can live independently.

The view logic of a component can live independently of its presentation
=> View logic is isolated from view presentation.

A data store can live independently of any views
=> The data stores are isolated from any view logic and any view presentation.
The `addContext` function is then used to make these independent data stores available to views.

> Data stores are completely independent of any view

Not only does this make reasoning about your applicaton easier but it also allows to test parts of your app in isolation.

> Parts of your app can be tested individually and independently of each other

In other words,
you can test each data store, each component, each view logic, and each view presentation in isolation.

Note that it is crucial that you make data stores available over the `context` object instead of doing
~~~js
import ItemStore from '../stores/Item';

// Don't do this
const itemStore = new ItemStore();

const TodoListProps = {
    onResolve: () => {
        return {
            items: itemStore.getItems(),
        };
    },
};
~~~

Because every new test should start with a pristine state and having `itemStore` defined outside of `TodoListProps` makes it cumbersome to reset `itemStore` (and hence cumbersome to test `TodoListProps`).

Use the `context` object instead like in the following.
~~~js
import ItemStore from '../stores/Item';

const TodoListProps = {
    onResolve: ({context: {itemStore}}) => {
        return {
            items: itemStore.getItems(),
        };
    },
    addContext: () => {
        return {itemStore: new ItemStore()};
    },
};
~~~





#### Server-Side Rendering

Reprop makes server-side rendering (SSR) easier.
Let's see why.

First, let's look at following snippet.

~~~js
onBegin: async ({resolve, context: {itemStore}}) => {
    await itemStore.loadItems();
    // The initial and first `resolve` call is done asynchronously after loading the items.
    resolve();
},
~~~

Delaying the first `resolve` call is blocking; Reprop calls `onResolvedProps` only after all elements have resolved their initial presentation props. This is exactly what we want on the server.

On the server we want to render the entire HTML after all initial data is loaded. So to achieve that we simply don't call `resolve` until initial data is retrieved.

On the other hand, when running in a browser, we want to show a loading indication instead of blocking the initial resolve.
We can fix that with following modifications

~~~js
onBegin: async ({resolve, context: {itemStore, isServerSideRendering}}) => {
    state.isLoading = true;
    if( ! isServerSideRendering ) {
        resolve();
    }
    await itemStore.loadItems();
    state.isLoading = false;
    resolve();
},
~~~

and

~~~js
Reprop.resolve({
    propsElement,
    onResolvedProps,
    initialContext: {isServerSideRendering: typeof window === "undefined"},
});
~~~

With our newest modification the initial resolve will only be delayed on the server.

Another thing to watch out for SSR is that for every new incoming HTTP request the server needs to start with a pristine state.
This forbids us to create global variables holding state because it would persist between two HTTP requests.
Instead we can use the `context` object to make things globally available.

So:

> Server-Side Rendering is included "for free".

As long as you
  1. don't use any global variable holding state, and
  2. make sure to not call `resolve` before initial data is loaded (on the server)

(In case you are wondering; React warns against its own context feature because of `shouldComponentUpdate`'s short-circuiting nature which doesn't apply to Reprop.)





#### Debuging

By using
<pre>
Reprop.resolve({
    propsElement,
    onResolvedProps: (props<b>, {propsHistory}</b>) => {
        console.log(props, propsHistory);
    },
    <b>debug: true,</b>
});
</pre>
the history of your props tree is recorded and made available.
Make sure that what your `onResolve` functions return is JSON serializable
when enabling `debug: true`.
(Reprop records a copy of previous props by doing `JSON.parse(JSON.stringify(props))`. Functions are not a problem and are simply skipped.)

Also, how data stores are managed is up to you and you can use a library like Redux to track them.
And you can use `reprop/pure` instead of `reprop` if you want to manage the `state` and `props` objects yourself.
Docs of `reprop/pure`: [/packages/reprop/pure](/packages/reprop/pure).





#### Demo

To run the aforementioned examples;

1. Get Reprop code & install dependencies;

```shell
cd /tmp && git clone git@github.com:brillout/reprop && cd reprop && npm i && ./node_modules/.bin/lerna bootstrap
```

2. Run the examples;

```shell
node examples/hello
```

```shell
node examples/todo
```

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
