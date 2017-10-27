const React = require('react');
const Reprop = require('reprop');

const TodoItemPresentation = ({text, draftText, onTextChange, onEdit, onSave}) => (
    draftText === null ? (
        <div onClick={onEdit}>{text}</div>
    ) : (
        <form onSubmit={onSave}>
            <input type='text' value={draftText} onChange={ev => onTextChange(ev.target.value)} />
            <button type='submit'>Save</button>
        </form>
    )
);

const TodoItemProps = {
    name: 'TodoItem',
    // Note that you can't mutate `state` in `onResolve` and you can never mutate `attrs`
    onResolve: ({state: {draftText}, attrs: {id}, context: {itemStore}}) => {
        // We assemble the props from source-of-truths `state.draftText` and `context.itemStore`
        const {text} = itemStore.getItem(id);
        return {
            text,
            draftText,
            key: id,
        };
    },
    onBegin: ({resolve, state}) => {
        state.draftText = null;
        resolve();
    },
    // As we don't have access to `resolve` in `onResolve` we add the event listeners to `staticProps`,
    // `staticProps` is run once and the returned props are added to the props returned by `onResolve`
    staticProps: ({resolve, state, context: {itemStore}, attrs: {id}}) => {
        return {
            onTextChange,
            onEdit,
            onSave,
        };
        function onTextChange(newText) {
            state.draftText = newText;
            resolve();
        }
        function onEdit() {
            const {text} = itemStore.getItem(id);
            state.draftText = text;
            resolve();
        }
        async function onSave() {
            await itemStore.updateItem(
                id,
                {text: state.draftText}
            );
            state.draftText = null;
            resolve();
        }
    },
};

module.exports = {TodoItemPresentation, TodoItemProps};
