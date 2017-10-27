<!---






    WARNING, READ THIS.
    This is a computed file. Do not edit.
    Edit `/docs/debugging.template.md` instead.












    WARNING, READ THIS.
    This is a computed file. Do not edit.
    Edit `/docs/debugging.template.md` instead.












    WARNING, READ THIS.
    This is a computed file. Do not edit.
    Edit `/docs/debugging.template.md` instead.












    WARNING, READ THIS.
    This is a computed file. Do not edit.
    Edit `/docs/debugging.template.md` instead.












    WARNING, READ THIS.
    This is a computed file. Do not edit.
    Edit `/docs/debugging.template.md` instead.






-->
[Introduction](/../../)<br/>
[API](/docs/api.md)<br/>
[Full-Blown Example](/docs/full-blown-example.md)<br/>
[Lifting State Up](/docs/lifting-state-up.md)<br/>
[Source-of-Truth Rendering](/docs/source-of-truth-rendering.md)<br/>
[Testing](/docs/testing.md)<br/>
[Debugging](/docs/debugging.md)<br/>
[Performance](/docs/performance.md)<br/>
[Server-Side Rendering](/docs/server-side-rendering.md)

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


<!---






    WARNING, READ THIS.
    This is a computed file. Do not edit.
    Edit `/docs/debugging.template.md` instead.












    WARNING, READ THIS.
    This is a computed file. Do not edit.
    Edit `/docs/debugging.template.md` instead.












    WARNING, READ THIS.
    This is a computed file. Do not edit.
    Edit `/docs/debugging.template.md` instead.












    WARNING, READ THIS.
    This is a computed file. Do not edit.
    Edit `/docs/debugging.template.md` instead.












    WARNING, READ THIS.
    This is a computed file. Do not edit.
    Edit `/docs/debugging.template.md` instead.






-->
