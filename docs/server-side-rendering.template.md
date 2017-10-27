!MENU_TITLE Server-Side Rendering
!MENU_ORDER 55
!MENU

## Server-Side Rendering

Reprop makes server-side rendering (SSR) easier.
Let's see why.

First, let's look at following snippet.

~~~js
onBegin: async ({resolve, context: {itemStore}}) => {
    await itemStore.loadItems();
    // The initial and first `resolve` call is done asynchronously after loading the items.
    resolve();
},
~~~

Delaying the first `resolve` call is blocking;
Reprop calls `onResolvedProps` only after all elements have resolved their initial props.
This is exactly what we want on the server.

On the server we want to render the entire HTML after all initial data is loaded.
So to achieve that we simply don't call `resolve` until initial data is retrieved.

But on the other hand, when running in a browser, we want to show a loading indication instead of blocking the initial resolve.
We can fix that with following modifications

~~~js
onBegin: async ({resolve, context: {itemStore, isServerSideRendering}}) => {
    state.isLoading = true;
    if( ! isServerSideRendering ) {
        resolve();
    }
    await itemStore.loadItems();
    state.isLoading = false;
    resolve();
},
~~~

and

~~~js
Reprop.resolve({
    propsElement,
    onResolvedProps,
    initialContext: {isServerSideRendering: typeof window === "undefined"},
});
~~~

With our newest modification the initial resolve will only be delayed on the server.

Another thing to watch out for SSR is that for every new incoming HTTP request the server needs to start with a pristine state.
This forbids us to create global variables holding state because it would persist between two HTTP requests.
Instead we can use the `context` object to make things globally available.

With Reprop

> Server-Side Rendering is included "for free".

As long as you
  1. don't use any global variable holding state, and
  2. make sure to not call `resolve` before initial data is loaded (on the server)

