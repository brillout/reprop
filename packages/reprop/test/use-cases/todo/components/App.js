const {createElement: el} = require('react');
const {TodoListProps, TodoListComponent} = require('../components/TodoList');
const Reprop = require('reprop/pure');

module.exports = {
    AppComponent,
    AppProps,
};

function AppComponent({todoListData}) {
    return (
        el(TodoListComponent, todoListData)
    );
}

function AppProps() {
    return {
        onBegin: ({resolve}) => {
            resolve();
        },
        onResolve: () => {return {todoListData: Reprop.createPropsElement(TodoListProps)}},
        addContext: ({/*context*/}) => ({isSSR: true}),
    };
}
