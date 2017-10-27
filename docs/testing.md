<!---






    WARNING, READ THIS.
    This is a computed file. Do not edit.
    Edit `/docs/testing.template.md` instead.












    WARNING, READ THIS.
    This is a computed file. Do not edit.
    Edit `/docs/testing.template.md` instead.












    WARNING, READ THIS.
    This is a computed file. Do not edit.
    Edit `/docs/testing.template.md` instead.












    WARNING, READ THIS.
    This is a computed file. Do not edit.
    Edit `/docs/testing.template.md` instead.












    WARNING, READ THIS.
    This is a computed file. Do not edit.
    Edit `/docs/testing.template.md` instead.






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

## Testing

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
you can test each data store, each view, each view logic, and each view presentation in isolation.

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


<!---






    WARNING, READ THIS.
    This is a computed file. Do not edit.
    Edit `/docs/testing.template.md` instead.












    WARNING, READ THIS.
    This is a computed file. Do not edit.
    Edit `/docs/testing.template.md` instead.












    WARNING, READ THIS.
    This is a computed file. Do not edit.
    Edit `/docs/testing.template.md` instead.












    WARNING, READ THIS.
    This is a computed file. Do not edit.
    Edit `/docs/testing.template.md` instead.












    WARNING, READ THIS.
    This is a computed file. Do not edit.
    Edit `/docs/testing.template.md` instead.






-->
