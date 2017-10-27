!MENU_TITLE API
!MENU_ORDER 20
!MENU

## API

Reprop API description.

#### `Resolve.createPropsElement`

~~~js
const attrs = {someAttribute: 'someVal'};
Reprop.createPropsElement(ViewProps, attrs);
~~~

`ViewProps`
<br/>
Plain JavaScript object with hook definitions.
At least `onResolve` and `name` should be defined.

`attrs`
<br/>
Parameters for `ViewProps` that will be available as `attrs` hook argument.

#### `Resolve.resolve`

~~~js
Reprop.resolve({
    propsElement,
    onResolvedProps: (props, propsHistory) => {
        console.log(props, propsHistory);
    },
    debug: false,
});
~~~

`propsElement`
<br/>
The returned value of `Resolve.createPropsElement`.

`onResolvedProps`
<br/>
Listener that Reprop calls every time new props are resolved.

Reprop calls `onResolvedProps` only when all elements have resolved.
This means that not calling the initial `resolve` is blocking and Reprop will wait indefinitely.

The newly computed props are passed as first argument.

If `debug: true` then `onResolvedProps` will be called with a second argument holding the entire props history.

`debug`
<br/>
Whether to track previous props or not.

### Hook arguments

#### `endParams` hook argument

A plain writeable JavaScript object that is accessible to `onBegin` and `onEnd`.

The purpose of `endParams` is to pass cleanup information from `onBegin` to `onEnd`.

#### `resolveSelfAndDescendantsOnly` hook argument

When calling `resolve` all props are re-computed (by calling all `onResolve` of all elements).
When calling `resolveSelfAndDescendantsOnly` instead of `resolve` Reprop re-computes the element's and its descendants' props only.
In other words Reprop calls the `onResolve`s of the element and its descendants only.

#### `previousResolvedProps` hook argument

A reference to the previously resolved props.

#### `attrs` hook argument

The second argument passed in `Reprop.createPropsElement(ViewProps, attrs)`.

Reprop makes `attrs` read-only.

If you want to manage the `attrs` object yourself then use `reprop/pure` instead of `reprop`.

#### `state` hook argument

A writeable plain JavaScript object encapsulated within Reprop that is available to most hooks.

An exception is that `state` is not editable in `resolve` (`resolve` is supposed to be side-effect free).

If you want to manage the state object yourself then use `reprop/pure` instead of `reprop`.

#### `context` hook argument

A read-only plain JavaScript object holding the context.

The context's purpose is (typically) to makes data stores and contextual information available to views.

Use `addContext` to add things to the `context` object.

#### `resolve` hook argument

Calling `resolve` makes Reprop re-compute all props of all elements and
Reprop will call every `onResolve` of each element.



### `name`

**[required]**

The name doesn't have any function and
is used by Reprops only to make error messages nicer and
be able to print something like
"Error: Your view `MyView` is missing the `onResolve` hook".


### Hooks


#### `onEnd` hook

~~~js
const ViewProps = {
    onEnd({endParams, attrs, state, context}) => {},
};
~~~

`onEnd` is called when the element is not used anymore.
In other words when the element's parent stops using it.

#### `onUpdate` hook

~~~js
const ViewProps = {
    onUpdate({resolve, attrs, state, context}) => {
        resolve();
    },
};
~~~

`onUpdate` is called whenever Reprop resolves an element that has already been created (i.e. already used by its parent).

If the element doesn't exist already, then the element is created and `onBegin` is called instead.

The default `onUpdate` is `onUpdate: ({resolve}) => {resolve();}`.

#### `staticProps` hook

~~~js
const ViewProps = {
    staticProps({resolve, attrs, state, context}) => {
        return {
            handleClick,
        };
        function handleClick(newVal) {
            state.someProps = newVal;
            resolve();
        }
    },
};
~~~

If a props function needs to be able to resolve
(typically an event handler)
then add it to the props with `staticProps`.

Note that `resolve` is not available in `onResolve`.
(Calling `resolve` in `onResolve` would result in an infinite loop.)

The `staticProps` function is called once when the element is created.

Everything returned in `staticProps` is added to the props returned by `onResolve`.


#### `addContext` hook

~~~js
const ViewProps = {
    addContext({endParams, attrs, state, context}) => {
        const someStore = new SomeStore();
        const context = {someStore};
        return context;
    },
};
~~~

The `context` object is read-only.
If you want to add something to the context then use `addContext`.
Only descendants have access to the newly added context.

#### `onBegin` hook

~~~js
const ViewProps = {
    onBegin({resolve, attrs, state, context, endParams}) => {
        resolve();
    },
};
~~~

The `onBegin` function is called when the element doesn't exist already (i.e. the parent already uses it).
If it already exists then `onUpdate` is called instead.

The default `onBegin` is `onBegin: ({resolve}) => {resolve();}`.


#### `onResolve` hook

**[required]**

~~~js
const ViewProps = {
    onResolve: ({attrs, state, context, previousResolvedProps}) => {
        const props = {someProp: 'hello'};
        return props;
    },
};
~~~

The `onResolve` function's purpose is to build the props required by the view presentation.

Note that `resolve` is not available to `onResolve`.
Use `staticProps` instead if you need `resolve`.
