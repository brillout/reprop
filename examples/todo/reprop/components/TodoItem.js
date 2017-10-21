const React = require('react');
const Reprop = require('reprop');

const TodoItemPresentation = ({text, createdAt}) => (
    <div>
        {text}
        <br/>
        <small>{createdAt.toLocaleString()}</small>
    </div>
);

const TodoItemProps = {
    name: 'TodoItem',
    // This `onResolve` computes and returns the "presentation props" that `TodoItemPresentation` needs.
    // It assembles the "presentation props" from the "logic props" `props.id` and
    // the source-of-truth `context.itemStore`.
    onResolve: ({props: {id}, context: {itemStore}}) => {
        const item = itemStore.getItem(id);
        const {text, createdAt} = item;
        return {
            text,
            createdAt,
            key: id,
        };
    },
};

module.exports = {TodoItemPresentation, TodoItemProps};
