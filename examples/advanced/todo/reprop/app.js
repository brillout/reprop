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
    // `props` represents the entire props tree. It holds all props for
    // all presentations (which in this example are pure functional React components).

    const element = <TodoListPresentation {...props}/>;

    console.log(
        require('pretty')(
            require('react-dom/server').renderToStaticMarkup(element)
        )
    );
}
