const React = require('react');

const ItemStore = require('reprop/test/use-cases/todo/stores/Items');

function TodoItem({text, createdAt}) {
    return (
        <div>
            {text}
            <br/>
            <small>{createdAt.toLocaleString()}</small>
        </div>
    );
}

function TodoList({isLoading, items}) {
    if( isLoading ) {
        return <div>Loading...</div>;
    }

    return (
        <div>{
            items
            .map(props => {
                const {id, text, createdAt} = props;
                // TodoList determines what props TodoItem receives.
                // If we would want to change TodoItem and let's say display the author of
                // the todo item then we would need to change TodoList as well.
                // TodoItem is not encapsulated, i.e. TodoList and TodoItem are intricated.
                return <TodoItem key={id} text={text} createdAt={createdAt} />;
            })
        }</div>
    );
}

const itemStore = new ItemStore();

// The following code intricately holds both the loading logic of TodoList and the rendering logic.
// If we would want to change the renderer and use `require('react-dom').render` instead of
// `require('react-dom/server').renderToStaticMarkup` we would then need to modify code that also
// holds TodoList logic as well. In short, TodoList is not encapsulated.
render(<TodoList isLoading={true}/>);

itemStore
.loadItems()
.then(items => {
    render(<TodoList items={items}/>);
});

function render(component) {
    console.log(
        require('pretty')(
            require('react-dom/server').renderToStaticMarkup(component)
        )
    );
}
