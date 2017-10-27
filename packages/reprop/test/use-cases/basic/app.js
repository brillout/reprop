"use strict";

process.on('unhandledRejection', err => {throw err});
const Reprop = require('reprop/pure'); // `npm install reprop`

Reprop.resolve({
    propsElement: Reprop.createPropsElement(AppProps),
    onResolvedProps,
 // {debug: true},
});

function onResolvedProps(props) {
    console.log(JSON.stringify(props, null, 2));
 // console.log(new Error().stack);
}

function AppProps() {
    const state = {
        isLoading: null,
        characters: null,
    };

    return {
        onBegin,
        onResolve,
    };

    function onResolve() {
        return {
            title: 'Game of Thrones Characters',
            ...state,
        };
    }

    async function onBegin({resolve}) {
        state.isLoading = true;
        // initial props -- when loading characters
        resolve();

        await (
            loadCharacters()
            .then(characters => {
                state.characters = (
                    characters
                    .map(character =>
                        Reprop.createPropsElement(
                            CharacterProps,
                            {key: 'key -- '+character.name, ...character},
                        )
                    )
                );
            })
        );

        state.isLoading = false;
        // update props -- once we have loaded the characters
        resolve();
    }
}

function loadCharacters() {
    return (
        new Promise(resolvePromise => {
            setTimeout(() => {
                resolvePromise([
                    {name: 'Daenerys Targaryen'},
                    {name: 'Jon Snow'},
                    {name: 'Tyrion Lannister'},
                ]);
            }, 1000); // pretend that we are loading the characters from a database on a remote server
        })
    );
}

function CharacterProps() {
    let attrs;

    return {
        onBegin: onProp,
        onUpdate: onProp,
        onResolve: () => {
            return {
                extraProp: true,
                ...attrs,
            };
        },
    };

    function onProp({attrs: attrs_, resolve}) {
        attrs = attrs_;
        resolve();
    }
}
