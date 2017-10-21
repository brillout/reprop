[<p align="center"><img src='https://github.com/brillout-test/reprop-test/blob/master/docs/logo/logo-title.svg' width=400 style="max-width:100%;" alt="Reprop"/></p>](https://github.com/brillout/reprop)
<br/>

!MENU_TITLE Introduction
!MENU_ORDER 0
!MENU_LINK /../../
!MENU

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
!INLINE ../examples/todo/reprop/app.js
~~~

~~~js
!INLINE ../examples/todo/reprop/components/TodoList.js
~~~

~~~js
!INLINE ../examples/todo/reprop/components/TodoItem.js
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
!INLINE ../examples/todo/editable/reprop/components/TodoItem.js
~~~
