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
