<!---






    WARNING, READ THIS.
    This is a computed file. Do not edit.
    Edit `/docs/usage_reprop_pure.template.md` instead.












    WARNING, READ THIS.
    This is a computed file. Do not edit.
    Edit `/docs/usage_reprop_pure.template.md` instead.












    WARNING, READ THIS.
    This is a computed file. Do not edit.
    Edit `/docs/usage_reprop_pure.template.md` instead.












    WARNING, READ THIS.
    This is a computed file. Do not edit.
    Edit `/docs/usage_reprop_pure.template.md` instead.












    WARNING, READ THIS.
    This is a computed file. Do not edit.
    Edit `/docs/usage_reprop_pure.template.md` instead.






-->
[Introduction](/)<br/>
[About Performance](/docs/performance.md)<br/>
[Usage with `reprop/pure`](/packages/reprop/pure)<br/>
[Usage with `react-reprop`](/packages/react-reprop)<br/>
[Usage with `reprop`](/packages/reprop)

## `reprop/pure`

`reprop` is based on `reprop/pure`.

Using `reprop/pure` is less easy than using `reprop` but it gives you more control.

It is recommended to use `reprop` instead of `reprop/pure`.

<!---
In general it is expected that a vast majority of people will use `react-reprop` instead of `reprop/pure` directly.

If you don't know what the following bullet points are about then just ignore `reprop/pure` and use `react-reprop` instead.
-->

Using `reprop/pure` over `reprop` means;

Cons:
 - More boilerplate
 - More possibilities to "wrongly use" Reprop

Pros:
 - The management of the the `props` and `state` objects is left to you.
   - That gives you the opportunity to use a state management library like `Redux` to have more control and insights over what's going on.
 - More minimalistic API
   - "More" Pure. In the FP sense.
 - More insights about how Reprop works.


Using `reprop` or `reprop/pure` over `reprop-react` means;

Cons:
 - More boilerplate
 - More possibilities to "wrongly use" Reprop

Pros:
 - No dependencies and entirely view agnostic
   - Including no dependencies to React and entirely agnostic to React
   - Build an entire UI on Node.js by only implementing the view logic and without any presentational component, any view library, and any rendering engine.
 - Clean cut (codebase-wise) between view logic and presentational component
   - Swiping out React to something else is trivial. (Of course still lots of work to rewrite every presentational component.)



### API / Usage Example

The following example acts as API description as it displays (almost) the whole API.

To run the example;
~~~js
cd /tmp && git clone git@github.com:brillout/reprop && cd reprop && npm i && ./node_modules/.bin/lerna bootstrap && node ./examples/todo/reprop-pure
~~~

~~~js
// /examples/todo/reprop-pure/app.js

const React = require('react');
const Reprop = require('reprop/pure');

const {TodoListProps, TodoListPresentation} = require('./components/TodoList');

Reprop.resolve({
    propsElement: Reprop.createPropsElement(
        TodoListProps,
        // logic props for TodoListProps
        {}
    ),
    onResolvedProps,
});

function onResolvedProps(props) {
    const element = <TodoListPresentation {...props}/>;

    console.log(
        require('pretty')(
            require('react-dom/server').renderToStaticMarkup(element)
        )
    );
}
~~~

~~~js
// /examples/todo/reprop-pure/components/TodoList.js

const React = require('react');
const Reprop = require('reprop/pure');
const ItemStore = require('../stores/Items');
const {TodoItemPresentation, TodoItemProps} = require('./TodoItem');

module.exports = {TodoListPresentation, TodoListProps};

function TodoListPresentation({items, isLoading}) {
    return (
        isLoading ? (
            <div>Loading...</div>
        ) : (
            <div>{items.map(props => <TodoItemPresentation {...props}/>)}</div>
        )
    );
};

function TodoListProps() {
    // Everything defined here is encapsulated and only the view logic of TodoList can write/read it.
    // Only source-of-truths should reside here.

    // Only TodoList needs to know about the loading status
    const state = {
        isLoading: null,
    };

    return {
        onResolve,
        addContext,
        onBegin,
        onUpdate,
     // onEnd,
     // staticProps,
    };

    function onResolve({context, /*props, state*/}) {
        const items =
            context.itemStore
            .getItems()
            .map(({id}) =>
                Reprop.createPropsElement(TodoItemProps, {id})
            );
        return {
            items,
            ...state,
        };
    }

    function addContext({/*props, context*/}) {
        const itemStore = new ItemStore();
        return {itemStore};
    }

    async function onBegin({resolve, context, /*props, endParams*/}) {
        state.isLoading = true;
        resolve();

        await context.itemStore.loadItems();

        state.isLoading = false;
        resolve();
    }

    // `onUpdate` is called every time `createPropsElement` is called on an element that
    // has already been instantiated. This is the pendant of React's `componentWillReceiveProps`.
    function onUpdate({resolve, /*props,*/ context}) {
        resolve();
    }

    /*
    function onEnd({endParams, props, state, context}) {
    }
    function staticProps({resolve, state, context, props}) {
        return {};
    }
    */
};
~~~

~~~js
// /examples/todo/reprop-pure/components/TodoItem.js

const React = require('react');
const Reprop = require('reprop/pure');

module.exports = {TodoItemPresentation, TodoItemProps};

function TodoItemPresentation({text, createdAt}) {
    return (
        <div>
            {text}
            <br/>
            <small>{createdAt.toLocaleString()}</small>
        </div>
    );
}

function TodoItemProps() {
    // Encapsulated information that only TodoItem can write/read.

    // If we would make the todos editable we would then add something like
    // `const state = {draftText: null, isEditing: false};` here

    let itemId;

    return {
        onResolve,
        onBegin,
        onUpdate,
    };

    function onResolve({context}) {
        const item = context.itemStore.getItem(itemId);

        const {text, createdAt} = item;

        return {
            key: item.id,
            text,
            createdAt,
        };
    }

    function onBegin({resolve, props}) {
        itemId = props.id;
        resolve();
    }

    function onUpdate({resolve, props}) {
        itemId = props.id;
        resolve();
    }
}
~~~

<!---






    WARNING, READ THIS.
    This is a computed file. Do not edit.
    Edit `/docs/usage_reprop_pure.template.md` instead.












    WARNING, READ THIS.
    This is a computed file. Do not edit.
    Edit `/docs/usage_reprop_pure.template.md` instead.












    WARNING, READ THIS.
    This is a computed file. Do not edit.
    Edit `/docs/usage_reprop_pure.template.md` instead.












    WARNING, READ THIS.
    This is a computed file. Do not edit.
    Edit `/docs/usage_reprop_pure.template.md` instead.












    WARNING, READ THIS.
    This is a computed file. Do not edit.
    Edit `/docs/usage_reprop_pure.template.md` instead.






-->