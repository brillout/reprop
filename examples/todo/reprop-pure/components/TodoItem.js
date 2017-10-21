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
