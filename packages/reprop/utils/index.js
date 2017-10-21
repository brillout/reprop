module.exports = {
    assert_internal,
    assert_warning: assert_warning,
    assert_usage,
    make_immutable,
    gen_id,
};

function assert(val, text) {
    if( ! val ) {
        throw new Error(
            stringify(text)
        );
    }
}

function assert_warning(val, ...args) {
    if( ! val ) {
        console.log(
            stringify(
                [
                    'Usage warning;',
                    ...args,
                ],
            )
        );
        console.trace && console.trace();
    }
}

function assert_internal(val, ...args) {
    assert(
        val,
        [
            '',
            ...args,
            'Internal Reprop error, something went wrong, please open an issue on GitHub.',
        ],
    );
}

function assert_usage(val, ...args) {
    assert(
        val,
        [
            'Wrong Reprop usage;',
            ...args,
        ],
    );
}

function stringify(arr) {
    return (
        arr
        .map(v => {
            if( v && v.constructor===Object ) {
                return JSON.stringify(v, null, 2)
            }
            return ''+v;
        })
        .join('\n')
    );
}

function make_immutable(obj) {
    return {...obj};
    /* TODO
    if( typeof Proxy === "undefined" ) {
        return undefined;
    }
    return (
        obj,
        {
            get: wrong_usage,
            set: wrong_usage,
            deleteProperty: wrong_usage,
            apply: wrong_usage,
        }
    );

    function wrong_usage(){};
    */
}

function gen_id() {
    return Math.random().toString(32).slice(2);
}
