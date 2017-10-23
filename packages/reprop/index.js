const RepropPure = require('./pure');
const {assert_internal, assert_usage} = require('./utils');

const {NAMES} = RepropPure.__INTERNALS_DO_NOT_USE__;

const NAMES_2 = {
    life_methods_args_previous_props: 'previousProps',
};

module.exports = {
    ...RepropPure,
    [NAMES.create_element]: create_props_element,
};

function create_props_element(element_obj, ...rest) {
    assert_element_obj(element_obj);
    const element_fn = get_element_fn(element_obj);
    return RepropPure[NAMES.create_element](element_fn, ...rest);
}

const element_fn_map = new WeakMap();
function get_element_fn(element_obj) {
    if( ! element_fn_map.has(element_obj) ) {
        element_fn_map.set(element_obj, create_element_fn(element_obj));
    }
    return element_fn_map.get(element_obj);
}

const element_names = {};
function create_element_fn(element_obj) {
    const {name} = element_obj;
    assert_internal(name.constructor===String);

    assert_usage(
        !element_names[name],
        /* TODO stringify functions
        element_fn_map.get(element_obj),
        element_obj,
        "The name `"+name+"` should be used for one *Props object only. The name is used at the two above printed *Props object instead.",
        */
        "The name `"+name+"` should be used for one *Props object only.",
    );
    assert_internal(
        !element_names[name] || element_fn_map.has(element_obj),
        element_names,
        name,
    );
    element_names[name] = true;

    Object.defineProperty(element_fn, "name", {value: name+'Props'});

    return element_fn;

    function element_fn() {
        let props = {};
        const state = {};
        const endParams = {};
        let props_old = {};

        /*
        [
            {
                life_method: NAMES.life_methods_on_resolve,
                additional_args: get_stateful_objects,
            },
            {
                life_method: NAMES.life_methods_on_end,
                additional_args: () => ({endParams, ...get_stateful_objects()}),
            },
            {
                life_method: NAMES.life_methods_on_begin,
                fn_new: (args, fn_old) => {},
                additional_args: () => ({endParams, ...get_stateful_objects()}),
            },
        ];
        */

        const {
            life_methods_on_resolve: onResolve,
            life_methods_on_begin: onBegin,
            life_methods_on_update: onUpdate,
            life_methods_on_end: onEnd,
            life_methods_static_props: staticProps,
            life_methods_add_context: addContext,
        } = NAMES;

        const life_methods = {
           [onResolve]: args => {
                return element_obj[onResolve]({...args, ...get_stateful_objects()});
            },
           [onBegin]: args => {
                update_props(args);
                if( ! element_obj[onBegin] ) {
                    resolve(args);
                } else {
                    return element_obj[onBegin]({...args, endParams, ...get_stateful_objects()});
                }
            },
           [onUpdate]: args => {
                update_props(args);
                if( ! element_obj[onUpdate] ) {
                    resolve(args);
                } else {
                    return element_obj[onUpdate]({...args, ...get_stateful_objects()});
                }
            },
        };

        if( element_obj[onEnd] ) {
            life_methods[onEnd] = args => {
                return element_obj[onEnd]({...args, endParams, ...get_stateful_objects()});
            };
        }

        if( element_obj[staticProps] ) {
            life_methods[staticProps] = args => {
                return element_obj[staticProps]({...args});
            };
        }

        if( element_obj[addContext] ) {
            life_methods[addContext] = args => {
                return element_obj[addContext]({...args});
            };
        }

        return life_methods;

        function get_stateful_objects() {
            return {props, state, [NAMES_2.life_methods_args_previous_props]: props_old};
        }

        function update_props(args) {
            props_old = props;
            props = {...args.props};
        }

        function resolve(args) {
            args.resolve();
        }
    }
}

function assert_element_obj(element_obj) {
    assert_usage(
        element_obj instanceof Object,
        element_obj,
        "*Props object is expected to be an object be we got the value printed above instead",
    );
    assert_usage(
        element_obj.onResolve instanceof Function,
        "`onResolve` is required and has to be a function.",
    );
    assert_usage(
        (element_obj.name||0).constructor===String,
        "`name` is required",
    );
}
