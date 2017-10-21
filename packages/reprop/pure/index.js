"use strict";

const {assert_internal, assert_usage, assert_warning, make_immutable, gen_id} = require('../utils');

const is_element = Symbol();

const NAMES = {
    create_element: 'createPropsElement',
    resolve_root: 'resolve',
    resolve_root_listener: 'onResolvedProps',
    initial_props: 'propsElement',
    context_obj: 'context',
    life_methods_on_resolve: 'onResolve',
    life_methods_on_begin: 'onBegin',
    life_methods_on_update: 'onUpdate',
    life_methods_add_context: 'addContext',
    life_methods_static_props: 'staticProps',
    life_methods_args_resolve: 'resolve',
    life_methods_args_resolve_branch: 'resolveSelfAndDescendantsOnly',
    life_methods_args_props: 'props',
    life_methods_args_previous_resolved_props: 'previousResolvedProps',
    project: 'reprop',
};


module.exports = {
    [NAMES.resolve_root]: resolve_root,
    [NAMES.create_element]: create_props_element,
    __INTERNALS_DO_NOT_USE__: {
        NAMES,
    },
};


function resolve_root({[NAMES.initial_props]: initial_props, [NAMES.resolve_root_listener]: listener, debug}={}) {
    assert_usage(
        listener instanceof Function,
        "Argument `"+NAMES.resolve_root_listener+"` is required and should be a Function.",
    );

    const process_listener = debug && create_process_logger();

    process_listener && process_listener.on_init({props__root: initial_props});

    traverse_and_resolve({
        props__initial: initial_props,
        process_listener,
        resolve_listener: (...args) => {
            const {props__resolved} = args[0];

            process_listener && process_listener.on_done({
                props__root: props__resolved,
                ...(args[0]),
            });

            listener(props__resolved);
        },
        path__parent: [],
        new_props_count: {count: 0},
        instance_candidates: InstanceCollection(null),
    });
}

function traverse_and_resolve({props__initial, resolve_listener, process_listener, path__parent, root_assembler, new_props_count, instance_candidates}) {
    assert_internal(resolve_listener);
    assert_internal(instance_candidates);

    assert_usage(
        props__initial!==undefined,
        "Resolving props as `undefined` which is forbidden.",
        "Resolve `null` instead if you want to erase the previous resolved value.",
    );
    assert_warning(
        !(props__initial instanceof Function),
        "Resolving a function named `"+(props__initial||{}).name+"` which is a no-op.",
        "*Props functions should be passed to `"+NAMES.create_element+"`.",
        "`"+NAMES.create_element+"` returns an element that can be resolved.",
    );

    const props_assembler = PropsAssembler({props__initial});

    root_assembler = root_assembler || props_assembler;

    const unresolved_elements_tracker = UnresolvedElementsTracker();

    const elements = [];
    traverse_and_find_elements({
        props__unresolved: props_assembler.get_props(),
        on_element: ({element, path: path__from_parent}) => {
            assert_internal(isPropsElement(element));

            const element_id = Symbol();

            unresolved_elements_tracker.add_unresolved_element(element_id);

            const path__from_root = [...path__parent, ...path__from_parent];

            elements.push({element, element_id, path__from_parent, path__from_root});
        },
    });

    map_with_instances(elements, instance_candidates);

    let is_sync_resolving = true;
    elements.forEach(({element_instance, element, element_id, path__from_parent, path__from_root}) => {

        let last_props;

        element_instance.listen_for_new_props({
            element,
            // `on_new_unresolved_props` will be called every time the user calls `resolveProps`
            on_new_unresolved_props: new_unresolved_props => {
                assert_internal(element!==new_unresolved_props);

                const count = ++new_props_count.count;

                const current_props = last_props = Symbol();

                if( process_listener ) {
                    root_assembler.update_props(new_unresolved_props, path__from_root);
                    const props__root = root_assembler.get_props();
                    process_listener.on_new_props({
                        new_unresolved_props,
                        element,
                        element_instance,
                        path__element: path__from_root,
                        props__root,
                        count,
                    });
                }

                traverse_and_resolve({
                    props__initial: new_unresolved_props,
                    resolve_listener: ({props__resolved}) => {

                        // Cancel resolving if child is orphaned.
                        // That is if parent has resolved to another element
                        // between this element has been discovered
                        // and the element resolving now
                        if( last_props !== current_props ) {
                            return;
                        }

                        props_assembler.update_props(props__resolved, path__from_parent);

                        unresolved_elements_tracker.set_as_resolved(element_id);

                        // Synchronously resolve only once
                        if( ! is_sync_resolving ) {
                        }
                            resolve_if_ready();
                    },
                    process_listener,
                    path__parent: path__from_root,
                    root_assembler,
                    new_props_count,
                    instance_candidates: element_instance.my_lil_child_instances,
                });
            },
        });
    });
    is_sync_resolving = false;

    // Synchronously resolve when
    // all elements have synchronously resolved already
    if( elements.length===0 ) {
        resolve_if_ready();
    }

    return undefined;

    function resolve_if_ready () {
        if( ! unresolved_elements_tracker.all_elements_are_resolved() ) {
            return;
        }

        const props__resolved = props_assembler.get_props();

        assert__all_elements_are_resolved(props__resolved);

        resolve_listener({
            props__resolved,
            count: new_props_count.count,
        });
    }

    function traverse_and_find_elements({props__unresolved, on_element}) {
        const cycle_catcher = CycleCatcher();


        traverse(props__unresolved, []);

        function traverse(obj, path) {
            if( cycle_catcher.add_visit(obj) ) {
                return;
            }
            if( isPropsElement(obj) ) {
                const element = obj;
                on_element({element, path});
            } else {
                if( obj instanceof Object ) {
                    for(const key in obj) {
                        traverse(obj[key], [...path, key]);
                    }
                }
            }
        }

    }
}

function CycleCatcher() {
    const already_visited = new WeakMap();

    return {add_visit};

    function add_visit(obj) {
        if( !(obj instanceof Object) ) {
            return false;
        }
        if( already_visited.has(obj) ) {
            assert_usage(
                false,
                obj,
                "You can't use a cyclic object as props. Yet props printed above is cyclic."

            );
            return true;
        }
        already_visited.set(obj, true);
        return false;
    }
}

function map_with_instances(elements, instance_candidates) {
    assert_internal(instance_candidates);

    elements.forEach(info => {
        const {element} = info;
        const element_instance = instance_candidates.get_or_add(element);
        assert_internal(element_instance.is_instance);
        info.element_instance = element_instance;
    });
}

function InstanceCollection(daddy_instance) {
    const element_to_instance_map = new WeakMap();

    return {
        get_or_add,
        toJSON: () => '[Instances]'
    };

    function get_or_add(element) {
        {
            const instance_ = get(element);
            if( instance_ !== null ) {
                assert_internal(instance_.is_instance);
                return instance_;
            }
        }
        const instance_ = create_element_instance(element, daddy_instance);
        assert_internal(instance_.is_instance);
        add(instance_);
        return instance_;
    }

    function get(element) {
        const {element_fn, element_key} = get_element_info(element);

        if( ! element_to_instance_map.has(element_fn) ) {
            return null;
        }

        const key_map = element_to_instance_map.get(element_fn);

        if( !(element_key in key_map) ) {
            return null;
        }

        const instance_ = key_map[element_key];
        assert_internal(instance_);
        assert_internal(instance_.is_instance);
        assert_internal(instance_.element_fn);

        return instance_;
    }
    function add(instance_) {
        assert_internal(instance_);
        assert_internal(instance_.is_instance);
        const {element_fn, element_key} = instance_;
        assert_internal(element_fn);
        assert_internal(element_fn.name);

        if( ! element_to_instance_map.has(element_fn) ) {
            element_to_instance_map.set(element_fn, {});
        }

        const key_map = element_to_instance_map.get(element_fn);

        assert_usage(
            ! (element_key in key_map),
            (key_map[element_key]||{}).element_current,
            instance_.element_current,
            "The two elements have the same *Props function `"+instance_.element_fn.name+"` and the same key `"+element_key+"`.",
            "Child elements with the same *Props function and the same parent should have different keys.",
        );

        key_map[element_key] = instance_;
    }
}

function create_element_instance(element, daddy_instance) {
    assert_internal(daddy_instance===null || daddy_instance.is_instance===true);
    const {element_fn, element_key, element_id} = get_element_info(element);
    assert_internal(element_fn, element);
    assert_internal(element_id);

    let life_methods;
    let new_props_listener;
    let element_fn_has_run = false;
    let props_resolved_old = {};
    let is_calling_on_resolve = false;
    let static_props;
    let initial_resolve_done = false;

    const element_ids__props = [];

    const instance_me = {
        listen_for_new_props,
        is_instance: true,
        element_fn,
        instance_id: gen_id(),
        element_key,
        element_creator: element,
        element_current: element,
        element_ids__props,
        context_addendum: undefined,
        retrieve_props,
        is_resolve_source: false,
        is_root_resolve: daddy_instance===null,
     // is_resolving: false,

        // We need the instances between root and this instance to be able
        //  - to compose contexts from to root to element, see `get_context`
        //  - to re-resolve whole tree
        daddy_instance,
    };

    instance_me.my_lil_child_instances = InstanceCollection(instance_me);

    return instance_me;

    function listen_for_new_props({element, on_new_unresolved_props}) {
        assert_internal(on_new_unresolved_props instanceof Function);

        const element_info = get_element_info(element);
        const {element_props, element_id} = element_info;
        assert_internal(element_props instanceof Object);
        assert_internal(element_id);
        assert_internal(element_info.element_fn===element_fn);
        assert_internal(element_info.element_key===element_key);
        instance_me.element_current = element;

        element_ids__props.push(element_id);

        new_props_listener = on_new_unresolved_props;

        if( ! life_methods ) {
            run_element_fn();
            assert_internal(instance_me.context_addendum===undefined);
            run_ctx_getter();
            assert_internal(instance_me.context_addendum!==undefined);
            assert_internal(life_methods);
            const on_begin = life_methods[NAMES.life_methods_on_begin];
            if( on_begin ) {
                on_begin({
                    [NAMES.life_methods_args_props]: element_props,
                    [NAMES.life_methods_args_resolve]: resolver__begin,
                    [NAMES.life_methods_args_resolve_branch]: resolve_branch,
                    [NAMES.context_obj]: get_context(),
                });
            } else {
                retrieve_props();
            }
        } else {
            assert_internal(instance_me.context_addendum!==undefined);
            const on_update = life_methods[NAMES.life_methods_on_update];
            if( on_update ) {
                on_update({
                    [NAMES.life_methods_args_props]: element_props,
                    [NAMES.life_methods_args_resolve]: resolver__update,
                    [NAMES.life_methods_args_resolve_branch]: resolve_branch,
                    [NAMES.context_obj]: get_context(),
                });
            } else {
                retrieve_props();
            }
        }
    }

    function run_element_fn() {
        assert_internal(element_fn_has_run===false);
        element_fn_has_run = true;

        life_methods = element_fn();
        assert_lifecycle_methods(life_methods);
   }

   function run_ctx_getter() {
        const element_info = get_element_info(instance_me.element_current);
        const {element_props} = element_info;
        const ctx_getter = life_methods[NAMES.life_methods_add_context];
        const ctx_addendum = (
            !ctx_getter ? (
                null
            ) : (
                ctx_getter({
                    [NAMES.life_methods_args_props]: element_props,
                    [NAMES.context_obj]: get_context(),
                })
            )
        );
        assert_context_addendum(ctx_addendum);
        instance_me.context_addendum = ctx_addendum;
    }

    function resolver__begin() {
        initial_resolve_done = true;
        resolver();
        instance_me.is_root_resolve = false;
    }
    function resolver__update() {
        if( ! initial_resolve_done ) {
            return;
        }
        resolver();
    }
    function resolver__static_props() {
        resolver__update();
    }
    function resolver() {
        if( is_first_resolve() ) {
            const root_instance = get_root_instance();
            resolve_and_mark_as_source(root_instance);
        } else {
            instance_me.retrieve_props();
        }
    }

    function resolve_and_mark_as_source(instance_) {
        instance_.is_resolve_source = true;
        instance_.retrieve_props();
        instance_.is_resolve_source = false;
    }

    function resolve_branch() {
        resolve_and_mark_as_source(instance_me);
    }

    function is_first_resolve() {
        let parent_instance = instance_me;
        while( parent_instance.daddy_instance ) {
            assert_internal(parent_instance.is_root_resolve===false);
            parent_instance = parent_instance.daddy_instance;
            if( parent_instance.is_resolve_source ) {
                return false;
            }
        }
        if( parent_instance.is_root_resolve ) {
            return false;
        }
        return true;
    }

    function get_root_instance() {
        let parent_instance = instance_me;
        while( parent_instance.daddy_instance ) {
            parent_instance = parent_instance.daddy_instance;
        }
        return parent_instance;
    }

    function retrieve_props() {
     // instance_me.is_resolving = true;
        assert_no_infinite_loop(is_calling_on_resolve);
        is_calling_on_resolve = true;
        const props_new = (
            life_methods[NAMES.life_methods_on_resolve]({
                [NAMES.life_methods_args_previous_resolved_props]: props_resolved_old,
                [NAMES.context_obj]: get_context(),
            })
        );
        is_calling_on_resolve = false;
        assert_resolved_props(props_new);
        if( props_new === null ) {
            return;
        }
        props_resolved_old = props_new;
        get_static_props();
        const props_all = {...static_props, ...props_new};
        new_props_listener(props_all);
     // instance_me.is_resolving = false;
    }

    function get_static_props() {
        if( static_props !== undefined ) {
            return;
        }
        if( ! life_methods[NAMES.life_methods_static_props] ) {
            static_props = null;
            return;
        }
        const element_info = get_element_info(instance_me.element_current);
        const {element_props} = element_info;
        static_props = life_methods[NAMES.life_methods_static_props]({
            [NAMES.life_methods_args_resolve]: resolver__static_props,
            [NAMES.life_methods_args_resolve_branch]: resolve_branch,
            [NAMES.life_methods_args_props]: element_props,
            [NAMES.context_obj]: get_context(),
        });
        assert_static_props(static_props);
    }

    function get_context() {
        let ctx = {};

        walk_up_instance_tree_to_root(instance_me);

        const ctx__immutable = make_immutable(ctx);

        return ctx__immutable;

        function walk_up_instance_tree_to_root(instance_) {
            assert_internal(instance_===null || instance_.is_instance);
            if( instance_ === null ) {
                return;
            }
            const ctx_addendum = instance_.context_addendum;
            if( ctx_addendum ) {
                for(const key in ctx_addendum) {
                    assert_usage(
                        !(key in ctx),
                        "Old context:",
                        ctx[key],
                        "New context:",
                        ctx_addendum[key],
                        "Conflicting contexts; You are not supposed to override the context provided by an ancestor element.",
                    );
                    ctx[key] = ctx_addendum[key];
                }
            }
            walk_up_instance_tree_to_root(instance_.daddy_instance);
        }
    }

    function assert_context_addendum(ctx_addendum) {
        if( ctx_addendum===null ) {
            return;
        }
        assert_is_object(ctx_addendum, NAMES.life_methods_add_context);
    }

    function assert_static_props(static_props) {
        assert_is_object(static_props, NAMES.life_methods_static_props);
    }

    function assert_is_object(thing, life_method) {
        assert_usage(
            thing instanceof Object,
            thing,
            "`"+life_method+"` of `"+get_props_name()+"` is expected to return an object but returns the value printed above instead.",
        );
    }

    function get_props_name() {
        return element_fn.name;
    }

    function assert_no_infinite_loop(is_calling_on_resolve) {
        assert_usage(
            is_calling_on_resolve===false,
            "The `"+NAMES.life_methods_on_resolve+"` of `"+get_props_name()+"` is calling `"+NAMES.life_methods_args_resolve+"` which is forbidden.",
            "This would lead to an infinite loop otherwise.",
        );
    }
    function assert_resolved_props(props_) {
        const prefix = "The `"+NAMES.life_methods_on_resolve+"` of `"+get_props_name()+"` is returning ";
        const addendum = "The props returned by `"+NAMES.life_methods_on_resolve+"` should be `null` or an object.";
        assert_usage(
            props_!==undefined,
            prefix+"`undefined`.",
            "It should return the resolved props instead.",
            addendum,
        );
        assert_usage(
            !((props_||{}).then instanceof Function),
            prefix+"a promise (a then-able to be more precise).",
            "It should synchronously return the resolved props instead.",
            "The asyncronous logic should reside at the place where `"+NAMES.life_methods_args_resolve+"` is called.",
            addendum,
        );
        assert_usage(
            props_===null || props_ instanceof Object,
            props_,
            addendum,
            "Instead it is the value printed above.",
        );
    }

    function assert_lifecycle_methods(lm) {
        assert_usage(
            lm[NAMES.life_methods_on_resolve] instanceof Function,
            lm,
            wrong_usage_intro()+"return an object with a function `"+NAMES.life_methods_on_resolve+"` but returns the value printed above instead.",
        );
        const ctx_key = NAMES.life_methods_add_context;
        assert_usage(
            !(ctx_key in lm) || lm[ctx_key] instanceof Function,
            lm[ctx_key],
            "`"+ctx_key+"` should be a function. Instead it is the value printed above.",
        );
        /* TODO
        assert_usage(
            !lm.name.endsWith('Props'),
            lm,
            wrong_usage_intro()+"not return a *Props function but it does return the *Props function printed above."
        );
        */
    }

    /*
    function assert_undefined_return(ret) {
        assert_usage(
            ret===undefined,
            ret,
            'Resolved props are to be returned using `'+NAMES.life_methods_args_resolve+'`.',
            'Instead `'+element_fn+'` returns the value printed above.',
            'Use `reolveProps` instead of `return`.',
        );
    }
    */

    function wrong_usage_intro() {
        return "The *Props function `"+get_props_name()+"` should ";

    }
}

function PropsAssembler({props__initial}) {
    let props__interim = props__initial;

    const is_copy = Symbol();

    return {
        update_props,
        get_props,
    };

    function get_props() {
        assert_internal(props__interim);
        return props__interim;
    }

    function update_props(new_props, path__from_parent) {
        if( path__from_parent.length === 0 ) {
            props__interim = new_props;
            return;
        }

        props__interim = copy(props__interim);
        let current_obj = props__interim;

        path__from_parent.slice(0, -1)
        .forEach(key => {
            current_obj[key] = copy(current_obj[key]);
            freeze_copy(current_obj);
            current_obj = current_obj[key];
        });

        const last_key = path__from_parent.slice(-1);
        assert_internal(last_key);
        current_obj[last_key] = new_props;
        freeze_copy(current_obj);
    }

    function copy(obj) {
        assert_internal(obj instanceof Object);
        const obj__copy = new obj.constructor;
        // Object.assign also works for arrays
        Object.assign(obj__copy, obj, {[is_copy]: true});
        return obj__copy;
    }

    function freeze_copy(obj) {
        assert_internal(obj[is_copy]===true);
        // TODO make freeze throw with Proxy when not in production for non strict mode
        Object.freeze(obj);
    }
}

function UnresolvedElementsTracker() {
    const branches__unresolved = [];
    return {
        add_unresolved_element: element_id => {
            branches__unresolved.push(element_id);
        },
        set_as_resolved: element_id => {
            const idx = branches__unresolved.indexOf(element_id);
            //assert_internal(idx>=0);
            branches__unresolved.splice(idx, 1);
        },
        all_elements_are_resolved: () => {
            return branches__unresolved.length === 0;
        },
    };
}

function assert__all_elements_are_resolved(props__resolved) {
    assert_internal(props__resolved);
    validate(props__resolved);
    function validate(obj) {
        assert_isnt_element(obj, props__resolved);
        if(obj instanceof Object) {
            Object.values(obj)
            .forEach(child_props => validate(child_props));
        }
    }
}

function assert_isnt_element(obj, props__resolved) {
    if( !isPropsElement(obj) ) {
        return;
    }
    assert_internal(false, JSON.stringify(props__resolved, null, 2), JSON.stringify(obj, null, 2));
}

function create_props_element(element_fn, element_props, {disable_name_warning}={}) {
    assert_element_args(arguments, NAMES.create_element);

    const element = {
        [is_element]: true,
        toJSON,
        element_fn,
        element_props,
        element_id: gen_id(),
    };

    return element;

    function toJSON() {
        assert_internal(element.element_fn);
        assert_internal(element.element_fn.name);
        return (
            {
                '[is_element]': true,
                ...element,
                element_fn: '['+element.element_fn.name+']',
                element_props: element.element_props||{},
            }
        );
    }
}

function get_element_info(obj) {
    assert_internal(isPropsElement(obj));
    assert_internal(!('props' in obj));

    const {element_props={}, element_fn, element_id} = obj;

    const {key: element_key} = element_props;

    return {element_fn, element_props, element_key, element_id};
}

function create_process_logger() {
    return {
        on_init,
        on_done,
        on_new_props,
    };

    function on_init({count, props__root}) {
        logger({
            title: 'Props Resolve Initial',
            text: [
                stringify_props(props__root),
                'Above are the props before starting resolving.',
            ],
        })
    }

    function on_done({count}) {
        logger({
            title: 'Root resolved',
            text: [
                'All props are resolved and no more elements need to be resolved.',
                'The `'+NAMES.resolve_root_listener+'` provided by the user is being called with the entire resolved props tree.',
            ],
            /*
            text: [
                'Above are the props after resolving root element and all its descendant elements.',
                'User has resolved props '+count+' time'+(count!==1?'s':'')+'.',
            ]
            title: 'Props Resolve Complete',
            */
        });
    }

    function on_new_props({new_unresolved_props, element, element_instance, count, props__root, path__element}) {
        logger({
            title: 'New Props ('+count+')',
            text: [
                ...from_props({element, path__element, element_instance}),
                'Props received;',
                stringify_props(new_unresolved_props),
                ...(
                    path__element.length===0 ? [
                        'Which becomes the root props.',
                    ] : [
                        'Resulting into following root props;',
                        stringify_props(props__root),
                    ]
                )
            ],
        });
    }

    function from_props({element, path__element, element_instance}) {
        const {element_fn, element_props, element_key} = get_element_info(element);
        return [JSON.stringify(arguments[0], null, 2)];
        assert_internal(element_props);
        assert_internal(element_fn);
        assert_internal(element_fn.name);
        const loc = (
            path__element.length>0 ? (
                '`'+path__element.join('.')+'`'
            ) : (
                'root'
            )
        );
        const key_text = element_key===undefined ? 'Without key' : 'Key: `'+element_key+'`';
        const props_text = 'Props: '+JSON.stringify(element_props);
        const from_props = [
            'New props received from `'+element_fn.name+'`',
            ' - '+key_text,
            ' - At '+loc,
            ' - '+props_text,
        ];
        return from_props;
    }

    function logger({text, title}) {
        console.log(
            [
                '',
                '',
                '',
                '',
                line_top({title}),
                ...text,
                line_bot(),
                '',
                '',
                '',
                '',
            ].join('\n')
        );
    }

    function line_top({title}) {
        const filler = '\u02C5';
        const title_line = text_line(filler, 13)+' '+title+' ';
        let line = text_line(filler);
        line = Object.assign(line.split(''), title_line.split('')).join('');
        return line;
    }
    function line_bot() {
        return text_line('\u02C4');
    }
    function text_line(fill, width=50) {
        return Array(width).fill(fill).join('');
    }

    function stringify_props(props_) {
        return JSON.stringify(props_, null, 2);
    }
}

function isPropsElement(obj) {
    return (obj||{})[is_element];
}

function assert_element_args([element_fn, element_props, {disable_name_warning}={}], create_element_name) {
    assert_usage(
        element_fn instanceof Function,
        [
            "The first argument to "+create_element_name,
            "should be a *Props function.",
        ].join(' '),
        "Instead, the first provied argument is;",
        element_fn,
    );
    assert_warning(
        element_fn.name.endsWith('Props') || disable_name_warning,
        "We recommand all *Props function to have a name ending with `Props`.",
        [
            "You can hide this warning by passing",
            "`{disable_name_warning: true}` as third argument to",
            "`"+create_element_name+"`.",
        ].join(' '),
    );
}
