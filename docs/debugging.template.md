!MENU_ORDER 53
!MENU

## Debuging

By using
<pre>
Reprop.resolve({
    propsElement,
    onResolvedProps: (props<b>, {propsHistory}</b>) => {
        console.log(props, propsHistory);
    },
    <b>debug: true,</b>
});
</pre>
the history of your props tree is recorded and made available.

When enabling `debug: true`,
make sure that your `onResolve` functions return something JSON serializable.
(Reprop records a copy of previous props by doing `JSON.parse(JSON.stringify(props))`. Functions are not a problem and are simply skipped.)

And
how data stores are managed is up to you and
you can use a library like Redux to track them.

Also,
you can use `reprop/pure` instead of `reprop`
if you want to manage the `state` and `props` objects yourself.
Docs of `reprop/pure`: [/packages/reprop/pure](/packages/reprop/pure).

