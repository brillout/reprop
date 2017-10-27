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
[API](/docs/api.md)<br/>
[Full-Blown Example](/docs/full-blown-example.md)<br/>
[Lifting State Up](/docs/lifting-state-up.md)<br/>
[Source-of-Truth Rendering](/docs/source-of-truth-rendering.md)<br/>
[Testing](/docs/testing.md)<br/>
[Debugging](/docs/debugging.md)<br/>
[Performance](/docs/performance.md)<br/>
[Server-Side Rendering](/docs/server-side-rendering.md)



## Introduction

Reprop is a small JavaScript library to help you manage the logics of your views.

It has no dependencies and
is entirely independent
but targets one-way data flow UI libraries such as React.

Reprop has been designed with following in mind

 - Flexibility (being able to easily change the code to implement new requirements)
 - Ease of Reasoning (being able to understand how the code works)
 - Testing
 - Debuging
 - Server-Side Rendering


#### Hello World

~~~js
// /examples/hello-world/app.js

// === View presentation ===
const HelloPresentation = (
    // This could as well be a React component / Vue component / etc.
    props => "<div style='color: green'>"+props.message+"</div>"
);

// === View logic ===
const HelloProps = {
    name: 'Hello',
    onResolve() { // `onResolve` returns the `props` for `HelloPresentation`
        const props = {message: 'Hello World'};
        return props;
    },
};

// === Rendering ===
const Reprop = require('reprop'); // npm install reprop
const HelloPropsElement = Reprop.createPropsElement(HelloProps);
Reprop.resolve({
    propsElement: HelloPropsElement,
    onResolvedProps(props) { // `onResolvedProps` is called every time `HelloPropsElement` resolves
        const viewElement = HelloPresentation(props);
        console.log(viewElement); // or alternatively: `document.body.innerHTML = viewElement`;
    },
});

~~~

which prints

~~~
<div style='color: green'>Hello World</div>
~~~

In general, a view written with Reprop consists of two parts;

 - **View presentation**,
with responsibility to turn "props" into a "view element".
With "view element" we denote a description of how the view should look like,
in our case an HTML string.
(The "Rendering" section will turn the view element in an actual view.)
And with "props",
short for properties, we denote the arguments of the view presentation,
in this example the object `{message: 'Hello World'}`.

 - **View logic**,
with responsibility to compute the props for the view presentation. (I.e. to compute the arguments of the view presentation.)

And an app contains one

 - **Rendering**,
    with responsibility to stitch things together;
   <span>1.</span> To listen for new props returned by the (root) view logic (with `onResolvedProps`),
   <span>2.</span> to pass the received props to the (root) view presentation, and
   <span>3.</span> to render the view element returned by the (root) view presentation, in our case `console.log(viewElement)`.
   (A more realistic rendering would be `document.body.innerHTML = viewElement` instead of `console.log(viewElement)`.)

Note that the view logic `HelloProps` is entirely independent of the view presentation `HelloPresentation`.
This is a general pattern with Reprop.

> With Reprop, the view logic is independent of the view presentation.

We will later discuss how this separation is beneficial but let's first focus on how Reprop works.

Let's move on to more interesting examples.

#### A Dynamic Example

~~~js
// /examples/hello/app.js

import Reprop from 'reprop'; // npm install reprop

// === View Presentation ===
const HelloPresentation = props => (
    '<div>'+'Hello '+props.name+' (after '+props.elapsedSeconds+'s)</div>'
);

// === View Logic ===
const HelloProps = {
    name: 'Hello',
    onResolve({state}) {
        // We compute the `props` for `HelloPresentation` from
        // source-of-truths `state.name` and `state.startDate`
        return {
            name: state.name,
            elapsedSeconds: Math.floor((new Date() - state.startDate)/1000),
        };
    },
    onBegin({resolve, state}) { // `onBegin` is called once when the view is created
        state.startDate = new Date();
        state.name = 'Jon';
        // Initial resolve. Calling `resolve` makes Reprop retrieve props by calling `onResolve`.
        resolve();
        // We call `resolve` every time we want to update the UI.
        setTimeout(() => {state.name = 'Cersei'; resolve()}, 1000);
        setTimeout(() => {state.name = 'Tyrion'; resolve()}, 2000);
    },
};

// === Rendering ===
Reprop.resolve({
    propsElement: Reprop.createPropsElement(HelloProps),
    onResolvedProps(props) {
        // For every new computed props, `onResolvedProps` is called with the newly computed props.
        const viewElement = HelloPresentation(props);
        console.log(viewElement);
    },
});
~~~

which prints

~~~
<div>Hello Jon (after 0s)</div>
<div>Hello Cersei (after 1s)</div>
<div>Hello Tyrion (after 2s)</div>
~~~

In the `onBegin` hook we call `resolve` every time we want to update `props`.
Calling `resolve` more than once makes the view dynamic.

And again, the view logic `HelloProps` is entirely independent of the view presentation `HelloPresentation`.

Let's now look at a parent view - child view interaction.



#### A todo list app with Reprop

This time, the view presentations are implemented as pure functional React components.
Let's start with the TodoItem implementation.

~~~js
// /examples/todo/TodoItem.js

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
~~~

A central aspect of this code snippet
is that instead of receiving `text` from the parent,
we get `text` from the data store `context.itemStore`
which is unusal for idiomatic React code.

In idiomatic React code, a child expects to receive its required information from its parent,
i.e. the maximum amount of information.
But instead TodoItem only receives `id` from its parent,
i.e. the minimal amount of information.

We break this idiomaticity to have a cleaner seperation between parent and child.
In other words, we increase the isolation of TodoItem from TodoList.

Let's for example modify TodoItem to display the creation date:

~~~js
const TodoItemPresentation = props => (
    <div>{props.text}<small>{props.createdAt.toString()}</small></div>
);

const TodoItemProps = {
    name: 'TodoItem',
    onResolve: ({attrs, context}) => {
        const id = attrs.id;
        const item = context.itemStore.getItem(id);
        return {text: item.text, createdAt: item.createdAt, key: id};
    },
};
~~~

That's it; Neither the parent view or any other file need to be changed.
We can modify TodoItem in isolation and
the parent doesn't need to care about TodoItem's view logic.

Now this example is artificially simple and our isolation gain may seem little but the gain can become substanial in more complex real-world apps.

In general

> We decouple views from each other by passing down a minimal amount of information from parent to child (instead of passing down a maximum amount of information)

Now let's look at TodoList's implementation.

~~~js
// /examples/todo/TodoList.js

import Reprop from 'reprop';
import React from 'react';
import ItemStore from '../stores/Items';
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
~~~

Note how TodoList uses TodoItem as a black box with `attrs.id` as only interface.

Let's look at the rendering.
This time we use `react-dom/server`;

~~~js
// /examples/todo/app.js

import Reprop from 'reprop';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import {TodoListPresentation, TodoListProps} from './TodoList';

const TodoListPropsElement = Reprop.createPropsElement(TodoListProps, {});
Reprop.resolve({
    propsElement: TodoListPropsElement,
    onResolvedProps: props => {
        const reactElement = <TodoListPresentation {...props}/>;
        console.log(ReactDOMServer.renderToStaticMarkup(reactElement));
    },
});
~~~


Reprop has been designed to achieve following benefits.

#### Reprop Benefits

> Reason about, modify, and test your data stores in isolation and independently of any view

Reprop allows you to have independent data stores
that are made available to views over the `context` object and
that are created and encapsulated within a `addContext` function of a view
(to avoid having data stores saved in a global variable
which is important
for testing, re-usability, and server-side rendering)

> Reason about, modify, and test your views in isolation and independently of each other

Instead of passing down a maximum amount of information from parent to child,
we pass down a minimum amount of information,
increasing the isolation of views between each other.

> Reason about your UI in terms of simple transformations from source-of-truths to views

A commonly used paradigm to make reasoning easier is to
re-compute the whole UI every time the UI updates.
We call this Source-of-Truth Rendering (STR).

A specificity of Reprop is that we apply STR all the way from the source-of-truths (whereas STR is often only applied starting from the props tree).

More at [Source-of-Truth Rendering]('/docs/source-of-truth-rendering').

> No more higher-order/container/provider components

More at [Lifting State Up]('/docs/lifting-state-up').

> Server-side rendering capability is included for "free"

With Reprop, making your app server-side render-able is a matter of two things;
<span>1.</span> make sure to not call `resolve` before initial data is retrieved (on the server), and
<span>2.</span> make sure that data stores are created in a `addContext` function of a view

More at [Server-Side Rendering]('/docs/server-side-rendering').

> Track the entire history of your UI

More at [Debugging]('/docs/debugging').




#### Demo

To run the aforementioned examples;

1. Get code & install dependencies;

```shell
git clone git@github.com:brillout/reprop && cd reprop && npm i && ./node_modules/.bin/lerna bootstrap
```

2. Run the examples;

```shell
node examples/hello-world
```
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
