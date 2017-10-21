"use strict";

const ItemStore = require('../stores/Items');

const {createElement, isValidElement} = require('react');

const {TodoItemProps, TodoItemComponent} = require('../components/TodoItem');

const Reprop = require('reprop/pure');

module.exports = {TodoListComponent, TodoListProps};

function TodoListComponent({displayedItems, isLoadingItems, hideCompletedItems, hideCompletedItemsToggle}) {
    if( isLoadingItems ) {
        return div('Loading todos...');
    }

    return (
        el('div',
            el('label',
              {style: {cursor: 'pointer'}},
                el('input', {
                  type: 'checkbox',
                  checked: !hideCompletedItems,
                  onChange: hideCompletedItemsToggle,
                }),
                'Show Completed Todos',
            ),
            div(
                displayedItems
                .map(itemProps => el(TodoItemComponent, itemProps))
            ),
        )
    );
}

function TodoListProps() {

    const state = {
        isLoadingItems: null,
        hideCompletedItems: false,
    };

    return {
        onBegin,
        onUpdate,
        onResolve,
        staticProps,
        addContext: ({/*context*/}) => {
            const itemStore = ItemStore();
            return {itemStore}
        },
    };

    async function onBegin({resolve, context}) {
        state.isLoadingItems = true;

        if( ! context.isSSR ) {
            resolve();
        }

        await context.itemStore.loadItems();

        state.isLoadingItems = false;
        resolve();
    }

    function onUpdate({resolve}) {
        resolve();
    }

    function onResolve({context}) {
        const displayedItems = getItemsToDisplay();

        return {
            ...state,
            displayedItems,
        };

        function getItemsToDisplay() {
            return (
                context.itemStore
                .getItems()
                .filter(state.hideCompletedItems ? filterCompletedItems : () => true)
                .sort(sortByUpdatedAt)
                .map(({id}) =>
                    Reprop.createPropsElement(
                        TodoItemProps,
                        {key: id, id},
                    )
                )
            );

            function filterCompletedItems(item) {
                return item.isCompleted === false;
            }

            function sortByUpdatedAt(item1, item2) {
                return item2.createdAt.getTime() - item1.createdAt.getTime();
            }
        }
    }

    function staticProps({resolve}) {
        return {
            hideCompletedItemsToggle,
        };

        function hideCompletedItemsToggle() {
            state.hideCompletedItems = !state.hideCompletedItems;
            // update props -- when user wants to see/hide the completed todos
            resolve();
        }
    }
}


function div(...args) {
    return el('div', ...args);
}
function el(tagName, props, ...args_rest) {
    const args = [
        tagName,
        ...(
            isValidElement(props) || props && props.constructor!==Object ? [null] : []
        ),
        props,
        ...args_rest,
    ];
    return createElement(...args);
}
