const {createElement: el} = require('react');

module.exports = {TodoItemComponent, TodoItemProps};

function TodoItemComponent({text, isCompleted, editText, isEditing, isSaving, editItem, saveText, changeText, toggleCompleted}) {
    const body = (() => {
        if( isEditing ) {
            return (
                el('form', {onSubmit},
                    el('input', {
                      type: 'text',
                      disabled: isSaving,
                      value: editText,
                      autoFocus: true,
                      onChange,
                    }),
                    el('button', {type: 'submit', disabled: isSaving}, 'Save'),
                )
            );
        }
        return (
            el('span', {onClick: editItem}, text)
        );
    })();

    return (
        el('div', null,
            el('input', {
                type: 'checkbox',
                checked: isCompleted,
                disabled: isSaving,
                onChange: toggleCompleted,
            }),
            body
        )
    )

    function onSubmit(ev) {
        ev.preventDefault();
        saveText();
    }

    function onChange(ev) {
        changeText(ev.target.value);
    }
}

function TodoItemProps() {
    const state = {
        isEditing: false,
        isSaving: false,
        editText: '',
    };

    let itemId;

    return {
        onResolve,
        onBegin: onProp,
        onUpdate: onProp,
        staticProps,
    };

    function onResolve({context: {itemStore}}) {
        const item = itemStore.getItem(itemId);
        return {
            key: itemId,
            ...item,
            ...state,
        };
    }

    function onProp({attrs: {id}, resolve}) {
        itemId = id;
        resolve();
    }

    function staticProps({resolve, context: {itemStore}}) {
        return {
            editItem,
            changeText,
            saveText,
            toggleCompleted,
        };

        function editItem() {
            const item = itemStore.getItem(itemId);
            state.editText = item.text;
            state.isEditing = true;
            resolve();
        }

        function changeText(text) {
            state.editText = text;
            resolve();
        }

        function toggleCompleted() {
            const item = itemStore.getItem(itemId);
            const isCompleted = !item.isCompleted;
            updateItem({isCompleted});
        }

        function saveText() {
            state.isEditing = false;
            updateItem({text: state.editText});
        }

        async function updateItem(updatedProps) {
            state.isSaving = true;
            resolve();

            await itemStore.updateItem(
                itemId,
                updatedProps,
            );

            state.isSaving = false;
            resolve();
        }
    }
}
