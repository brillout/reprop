!MENU_TITLE API / Full-blown Usage Example
!MENU_ORDER 10
!MENU

**Read the introduction before reading this.**

(A classical API description is work-in-progress.)

## API / Full-blown usage Example

The following example acts as API description as it displays (almost) the whole API.
After comprehending this example you will be able to use Reprop.
Thoroughly going over this example will make sure that you have a good understanding of Reprop.

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
~~~shell
cd /tmp && git clone git@github.com:brillout/reprop && cd reprop && npm i && ./node_modules/.bin/lerna bootstrap && node ./examples/todo/reprop
~~~

Because `TodoItem` is isolated from `TodoList` we can modify it in isolation.
The following re-implementation of `TodoItem`
removes the creation date from the presentation
and makes the todo items editable.
Note that we do all that without touching `TodoList.js` or `app.js`.

~~~js
!INLINE ../examples/advanced/todo/editable/reprop/components/TodoItem.js
~~~
