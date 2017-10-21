<!---






    WARNING, READ THIS.
    This is a computed file. Do not edit.
    Edit `/docs/usage_react_reprop.template.md` instead.












    WARNING, READ THIS.
    This is a computed file. Do not edit.
    Edit `/docs/usage_react_reprop.template.md` instead.












    WARNING, READ THIS.
    This is a computed file. Do not edit.
    Edit `/docs/usage_react_reprop.template.md` instead.












    WARNING, READ THIS.
    This is a computed file. Do not edit.
    Edit `/docs/usage_react_reprop.template.md` instead.












    WARNING, READ THIS.
    This is a computed file. Do not edit.
    Edit `/docs/usage_react_reprop.template.md` instead.






-->
[Introduction](/../../)<br/>
[About Performance](/docs/performance.md)<br/>
[Usage with `reprop/pure`](/packages/reprop/pure)<br/>
[Usage with `react-reprop`](/packages/react-reprop)<br/>
[Usage with `reprop`](/packages/reprop)

## `react-reprop`

Reprop's React integration `react-reprop` is work in progress.

Check out https://github.com/brillout/reprop/issues/1 to see its progress.

You can use `reprop`, Reprop's standalone version, in the meantime.

The API will be something like the following;

~~~js
// /examples/todo/react-reprop/components/TodoList.js

const React = require('react');
const ReactReprop = require('react-reprop');
const ItemStore = require('../stores/Items');
const TodoItem = require('./TodoItem');

module.exports = TodoList;

const TodoList = ReactReprop(
    // Presentation part
    ({itemIds, isLoading}) => (
        isLoading ? (
            <div>Loading...</div>
        ) : (
            // Note how the only argument we give to TodoItem is `id`.
            // That we only have to pass the `id` means that we have successfully
            // encapsulated the entire TodoItem view logic away from TodoList.
            <div>{itemIds.map(id => <TodoItem id={id} />)}</div>
        )
    ),{

    // View logic part
    name: 'TodoList',
    onResolve: ({state, context/*, props*/}) => {
        return {
            itemIds: context.itemStore.getItems().map(({id}) => id),
            isLoading: state.isLoading,
        };
    },
    addContext: ({/*props, context*/}) {
        const itemStore = new ItemStore();
        return {itemStore};
    },
    onBegin: async ({resolve, /*props,*/ state, context/*, endParams*/}) => {
        state.isLoading = true;
        // We don't want the temporary loading state to be resolved in the case of
        // server-side rendering
        if( ! context.isServerSideRendering ) {
            resolve();
        }

        await context.itemStore.loadItems();

        state.isLoading = false;
        resolve();
    },
 // onEnd: ({endParams, props, state, context}) => {},
});
~~~

~~~js
// /examples/todo/react-reprop/components/TodoItem.js

const React = require('react');
const ReactReprop = require('react-reprop');

module.exports = TodoItem;

const TodoItem = ReactReprop(
    // Presentation part
    ({text, createdAt}) => (
        <div>
            {text}
            <br/>
            <small>{createdAt.toLocaleString()}</small>
        </div>
    ),{

    // View logic part
    name: 'TodoItem',
    onResolve: ({props: {id}, context: {itemStore}}) => {
        const item = itemStore.getItem(id);
        const {text, createdAt} = item;
        return {
            text,
            createdAt,
        };
    },
    // `keyProp` is required in the case we expect several same-component siblings.
    // This is the case for TodoItem.
    keyProp: 'id',
});
~~~

~~~js
// /examples/todo/react-reprop/app.js

const React = require('react');
const ReactReprop = require('react-reprop');
const TodoList = require('./components/TodoList');
const ReactDOMServer = require('react-dom/server');

// We pretend that the code is running in the browser for the sake of the example
const initialContext = {isServerSideRendering: false};

// The `ReactReprop.resolve` API will likely change to something that better fits React's Fiber API
ReactReprop.resolve(() => <TodoList />, listener, {initialContext});

// The listener is called once the entire props tree is resolved for the first time
// and subsequently every time new props are resolved
function listener(element) {
    prettyHtmlLog(
        ReactDOMServer.renderToStaticMarkup(element)
    )
}

function prettyHtmlLog(html) {
    console.log(require('pretty')(html));
}
~~~


<!---






    WARNING, READ THIS.
    This is a computed file. Do not edit.
    Edit `/docs/usage_react_reprop.template.md` instead.












    WARNING, READ THIS.
    This is a computed file. Do not edit.
    Edit `/docs/usage_react_reprop.template.md` instead.












    WARNING, READ THIS.
    This is a computed file. Do not edit.
    Edit `/docs/usage_react_reprop.template.md` instead.












    WARNING, READ THIS.
    This is a computed file. Do not edit.
    Edit `/docs/usage_react_reprop.template.md` instead.












    WARNING, READ THIS.
    This is a computed file. Do not edit.
    Edit `/docs/usage_react_reprop.template.md` instead.






-->
