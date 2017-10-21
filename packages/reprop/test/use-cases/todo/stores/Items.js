// Here are stored the todo items
// A communication with a Backend is simulated

module.exports = function() {
    const itemStore = {
        getItems,
        loadItems,
        getItem,
        updateItem,
        onChange: null,
    };

    const items = {};

    return itemStore;

    function getItems() {
        return Object.values(items);
    }

    function loadItems() {
        return (
            // pretend that the items come from a database on a remote server
            delay(1, () => {
                [
                    generateItem('Buy milk', true),
                    generateItem('Buy water', true),
                    generateItem('Buy chocolate', false),
                ]
                .forEach(item => {
                    items[item.id] = item;
                });
                return getItems();
            })
        );

    }

    function getItem(id) {
        return items[id];
    }

    function updateItem(id, props) {
        return (
            delay(2, () => {
                Object.assign(items[id], props);
                if( itemStore.onChange ) {
                    itemStore.onChange(Object.values(items));
                }
            })
        );
    }

    function generateItem(text, isCompleted) {
        return (
            {
                id: Math.random().toString().slice(2),
                text,
                createdAt: new Date(),
                isCompleted,
            }
        );
    }

    function delay(seconds, fn) {
        return (
            new Promise(resolvePromise => {
                setTimeout(() => {
                    resolvePromise(fn());
                }, seconds*1000);
            })
        );
    }
};
