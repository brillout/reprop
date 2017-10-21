!MENU_TITLE Usage with `reprop/pure`
!MENU_ORDER 20
!MENU_LINK /packages/reprop/pure
!MENU

## `reprop/pure`

`reprop` is based on `reprop/pure`.

Using `reprop/pure` is less easy than using `reprop` but it gives you more control.

It is recommended to use `reprop` instead of `reprop/pure`.

<!---
In general it is expected that a vast majority of people will use `react-reprop` instead of `reprop/pure` directly.

If you don't know what the following bullet points are about then just ignore `reprop/pure` and use `react-reprop` instead.
-->

Using `reprop/pure` over `reprop` means;

Cons:
 - More boilerplate
 - More possibilities to "wrongly use" Reprop

Pros:
 - The management of the the `props` and `state` objects is left to you.
   - That gives you the opportunity to use a state management library like `Redux` to have more control and insights over what's going on.
 - More minimalistic API
   - "More" Pure. In the FP sense.
 - More insights about how Reprop works.


Using `reprop` or `reprop/pure` over `reprop-react` means;

Cons:
 - More boilerplate
 - More possibilities to "wrongly use" Reprop

Pros:
 - No dependencies and entirely view agnostic
   - Including no dependencies to React and entirely agnostic to React
   - Build an entire UI on Node.js by only implementing the view logic and without any presentational component, any view library, and any rendering engine.
 - Clean cut (codebase-wise) between view logic and presentational component
   - Swiping out React to something else is trivial. (Of course still lots of work to rewrite every presentational component.)



### API / Usage Example

The following example acts as API description as it displays (almost) the whole API.

To run the example;
~~~js
cd /tmp && git clone git@github.com:brillout/reprop && cd reprop && npm i && ./node_modules/.bin/lerna bootstrap && node ./examples/todo/reprop-pure
~~~

~~~js
!INLINE ../examples/todo/reprop-pure/app.js
~~~

~~~js
!INLINE ../examples/todo/reprop-pure/components/TodoList.js
~~~

~~~js
!INLINE ../examples/todo/reprop-pure/components/TodoItem.js
~~~
