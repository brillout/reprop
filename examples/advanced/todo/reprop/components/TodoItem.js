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
    // This `onResolve` computes and returns the props that `TodoItemPresentation` needs.
    // It assembles the props from the attr `attrs.id` and
    // the source-of-truth `context.itemStore`.
    onResolve: ({attrs: {id}, context: {itemStore}}) => {
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
