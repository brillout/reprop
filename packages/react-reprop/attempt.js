const assert = require('assert');
const assert_usage = assert;
const React = require('react');
const TestRenderer = require('react-test-renderer');


module.exports = ReactReprop;
ReactReprop.resolve = resolve_all;

const component_wrappers = new WeakMap();

function ReactReprop(presentational_component, view_logic) {

    return create_wrapper_component();

    function create_wrapper_component() {
        let state = {};
        let props;
        let endParams = {};
        let update_all;
        let intercom;
        let context;

        const props_static = (
            view_logic.staticProps ? (
                view_logic.staticProps({resolve, state, props})
            ) : (
                {}
            )
        );

        const comp = (
            class Wrapper extends React.Component {
                constructor(props_) {
                    props = props_.component_props;
                    context = props_.context;
                    update_all = props_.update_all;
                    intercom = props_.intercom;

                    assert(props instanceof Object);
                    assert(context instanceof Object);
                    assert(intercom instanceof Object);

                    view_logic.onBegin({context, props, state, resolve, endParams});

                    intercom.is_constructed = true;

                    props_.addInstance();

                    super();
                }
                componendDidMount() {
                    intercom.is_mounted = true;
                }
                componentWillUnmount() {
                    intercom.is_mounted = false;
                        view_logic.onEnd({context, props, state, endParams});
                    if( view_logic.onEnd ) {
                    }
                }
                render() {
                    if( ! intercom.is_resolved ) {
                        return React.createElement('span', {}, 'PLACEHOLD');
                    }
                    const props_resolved = view_logic.onResolve({context, props, state});
                    assert_usage(props_resolved instanceof Object);
                    const key = get_key(props_resolved, props, view_logic.keyProp);
                    const props_presentational = {key, ...props_static, ...props_resolved};
                    return React.createElement(presentational_component, props_presentational/*, ...this.children*/);
                }
            }
        );

        component_wrappers.set(comp, true);

        return comp;

        function resolve() {
            intercom.is_resolved = true;
            update_all();
        }

    }
}

function get_key(props_resolved, props, keyProp) {
    return props[keyProp] || props_resolved[keyProp];
}


function resolve_all(root_component_generator, listener) {
    const createElement_original = React.createElement;

    let props_all_resolved;

    const instances = [];

    React.createElement = (component, component_props, ...children) => {
        if( ! component_wrappers.has(component) ) {
            return createElement_original.call(React, component, component_props, ...children);
        }
        const intercom = {
            is_resolved: false,
            is_constructed: false,
            is_mounted: null,
        };
        const props = {
            intercom,
            update_all,
            component_props: component_props||{},
            context: {},
            addInstance,
        };

        function addInstance() {
            instances.push({intercom});
        }

        const ret = createElement_original.call(React, component, props, ...children);

        /*
        assert(props.intercom.is_constructed===true);
        if( ! props.intercom.is_resolved ) {
            props_all_resolved = false;
        }
        */

        return ret;
    };

    let is_begin = true;
    let element;
    fake_render();
    is_begin = false;
    update_all();

    function update_all() {
        if( is_begin ) {
            return;
        }
        fake_render();
        console.log(instances);
        console.log(all_resolved());
        if( all_resolved() ) {
            listener(element);
        }
    }

    function all_resolved() {
        return instances.every(({intercom}) => intercom.is_resolved);
    }

    var testRenderer;
    function fake_render() {
        element = root_component_generator();
        if( ! testRenderer ) {
            testRenderer = TestRenderer.create(element);
        } else {
            testRenderer.update(element);
        }
        console.log(
            JSON.stringify(
                testRenderer.toJSON(),
                null, 2
            )
        );
    }
}
