[<p align="center"><img src='https://github.com/brillout-test/reprop-test/blob/master/docs/logo/logo-title.svg' width=400 style="max-width:100%;" alt="Reprop"/></p>](https://github.com/brillout/reprop)
<br/>

!MENU_TITLE Introduction
!MENU_ORDER 10
!MENU_LINK /../../
!MENU



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
!INLINE ../examples/hello-world/app.js
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
!INLINE ../examples/hello/app.js
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
!INLINE ../examples/todo/TodoItem.js
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
!INLINE ../examples/todo/TodoList.js
~~~

Note how TodoList uses TodoItem as a black box with `attrs.id` as only interface.

Let's look at the rendering.
This time we use `react-dom/server`;

~~~js
!INLINE ../examples/todo/app.js
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

