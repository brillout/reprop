<!---






    WARNING, READ THIS.
    This is a computed file. Do not edit.
    Edit `/docs/source-of-truth-rendering.template.md` instead.












    WARNING, READ THIS.
    This is a computed file. Do not edit.
    Edit `/docs/source-of-truth-rendering.template.md` instead.












    WARNING, READ THIS.
    This is a computed file. Do not edit.
    Edit `/docs/source-of-truth-rendering.template.md` instead.












    WARNING, READ THIS.
    This is a computed file. Do not edit.
    Edit `/docs/source-of-truth-rendering.template.md` instead.












    WARNING, READ THIS.
    This is a computed file. Do not edit.
    Edit `/docs/source-of-truth-rendering.template.md` instead.






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

## Source-of-Truth Rendering

With source-of-truth rendering (STR) we denote the paradigm of re-computing the entire UI from all source-of-truths on every UI update.
STR makes UI considerably more predictable and easier to reason about;
If your source-of-truths are correct and
your components correctly transform these source-of-truths to a view then
you know that your UI will correctly render.
Enabling STR is one of the strongest added value of React.

A widespread (but partial) use of STR is to;

 1. compute the entire props tree that represents the entire UI whenever data changes, and

 2. when rendering use stateless and side-effect free React components to transform that pops tree in a view.

Doing this gives us STR but only partially. Let's see why.

Let's imagine a todo app where the user can edit the text of todo items.
We need two states to make a todo item editable;
`text` holding the original text coming from the database and
`draftText` holding the new text the user is inputting.
Now let's compare partial STR with a full STR for such an app.

~~~js
// Partial STR with a (denormalized) single source-of-truth

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
    // Similar implementation to the one in the introduction
};

const TodoItemProps = {
    name: 'TodoItem',
    // Compute props from `attrs.id`, `context.itemStore`, and `state.draftText`
    onResolve: ({attrs: {id}, context: {itemStore}, state: {draftText}}) => {
        return {text: itemStore.getItem(id).text, draftText};
    },
    `staticProps` is called once and the returned props are added to the props returned by `onResolve`.
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

Now note how `text` and `draftText` are merged together into the resolved props **every time the UI is re-rendered** (namely when `onResolve` is called).

Every time the UI is re-rendered we re-compute the props whereas with a (denormalized) single source-of-truth the props are computed when the data is changed.

> Every time the UI re-renders everything is re-computed all the way from the source-of-truths.


<!---






    WARNING, READ THIS.
    This is a computed file. Do not edit.
    Edit `/docs/source-of-truth-rendering.template.md` instead.












    WARNING, READ THIS.
    This is a computed file. Do not edit.
    Edit `/docs/source-of-truth-rendering.template.md` instead.












    WARNING, READ THIS.
    This is a computed file. Do not edit.
    Edit `/docs/source-of-truth-rendering.template.md` instead.












    WARNING, READ THIS.
    This is a computed file. Do not edit.
    Edit `/docs/source-of-truth-rendering.template.md` instead.












    WARNING, READ THIS.
    This is a computed file. Do not edit.
    Edit `/docs/source-of-truth-rendering.template.md` instead.






-->
