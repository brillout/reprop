<!---






    WARNING, READ THIS.
    This is a computed file. Do not edit.
    Edit `/docs/lifting-state-up.template.md` instead.












    WARNING, READ THIS.
    This is a computed file. Do not edit.
    Edit `/docs/lifting-state-up.template.md` instead.












    WARNING, READ THIS.
    This is a computed file. Do not edit.
    Edit `/docs/lifting-state-up.template.md` instead.












    WARNING, READ THIS.
    This is a computed file. Do not edit.
    Edit `/docs/lifting-state-up.template.md` instead.












    WARNING, READ THIS.
    This is a computed file. Do not edit.
    Edit `/docs/lifting-state-up.template.md` instead.






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

## Lifting state up

We will show how we lift state app with the todo app shown in the introduction [here]('/../../#a-todo-list-app-with-reprop).

The rest of this document assumes that you have read the introduction including the todo app implementation.

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

We don't need any higher-order/provider/container component, instead we simply move the data store up the context tree.

> We "lift state up" by moving things up in the context tree.


<!---






    WARNING, READ THIS.
    This is a computed file. Do not edit.
    Edit `/docs/lifting-state-up.template.md` instead.












    WARNING, READ THIS.
    This is a computed file. Do not edit.
    Edit `/docs/lifting-state-up.template.md` instead.












    WARNING, READ THIS.
    This is a computed file. Do not edit.
    Edit `/docs/lifting-state-up.template.md` instead.












    WARNING, READ THIS.
    This is a computed file. Do not edit.
    Edit `/docs/lifting-state-up.template.md` instead.












    WARNING, READ THIS.
    This is a computed file. Do not edit.
    Edit `/docs/lifting-state-up.template.md` instead.






-->
