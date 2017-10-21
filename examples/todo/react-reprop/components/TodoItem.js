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
