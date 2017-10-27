!MENU_TITLE Full-Blown Example
!MENU_ORDER 30
!MENU

**Read the introduction before reading this.**

## Full-blown usage example

This is a commented full Todo Item implementation.

~~~js
!INLINE ../examples/advanced/todo/reprop/app.js
~~~

~~~js
!INLINE ../examples/advanced/todo/reprop/components/TodoList.js
~~~

~~~js
!INLINE ../examples/advanced/todo/reprop/components/TodoItem.js
~~~

To run the example;

Get code & install dependencies;
~~~shell
git clone git@github.com:brillout/reprop && cd reprop && npm i && ./node_modules/.bin/lerna bootstrap
~~~

Run the example;
~~~shell
node examples/advanced/todo/reprop
~~~

Because `TodoItem` is isolated from `TodoList` we can modify it in isolation.
The following is a re-implementation of `TodoItem`
that removes the creation date from the presentation
and makes todo items editable.
Note that we do all that without touching `TodoList.js` or `app.js`.

~~~js
!INLINE ../examples/advanced/todo/editable/reprop/components/TodoItem.js
~~~

Run it;
~~~shell
node examples/advanced/todo/editable/reprop
~~~

