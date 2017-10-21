<!---






    WARNING, READ THIS.
    This is a computed file. Do not edit.
    Edit `/docs/performance.template.md` instead.












    WARNING, READ THIS.
    This is a computed file. Do not edit.
    Edit `/docs/performance.template.md` instead.












    WARNING, READ THIS.
    This is a computed file. Do not edit.
    Edit `/docs/performance.template.md` instead.












    WARNING, READ THIS.
    This is a computed file. Do not edit.
    Edit `/docs/performance.template.md` instead.












    WARNING, READ THIS.
    This is a computed file. Do not edit.
    Edit `/docs/performance.template.md` instead.






-->
[Introduction](/)<br/>
[About Performance](/docs/performance.md)<br/>
[Usage with `reprop/pure`](/packages/reprop/pure)<br/>
[Usage with `react-reprop`](/packages/react-reprop)<br/>
[Usage with `reprop`](/packages/reprop)

## Performance

In general, there are two ways of tuning up the performance of a React app;

1. The Pull Method
   <br/>
   On a re-render every component is "asked" if it needs to be re-rendered allowing React to skip the re-rendering for those that "answer no".
   This is the standard way of increasing performance with React and is typically achieved by shallow comparing immutable data structures in `shouldComponentUpdate`.
   You can use the pull method with Reprop by returning `null` in `onResolve`.

2. The Push Method
   <br/>
   Components are updated in isolation;
   Only the components that need to be updated are re-rendered.
   This is generally not recommended as it breaks the source-of-truth rendering paradigm making reasoning and predictability considerably more difficult.
   You can use the push method with Reprop by using `resolveSelfAndDescendantsOnly` instead of `resolve`.


### "Fiber Pruning"

Reprop introduces a way to use the pull method in an asynchronous fashion leading to further performance gains without cost in reasoning simplicity.
It leverages React's new Fiber architecture.

Note that the current Fiber Pruning implementation is based on `react-reprop` which is work-in-progress.

So, what is Fiber Pruning?

With Fiber, components will be able to update asynchronously.
But in order to be able to shallow compare in `shouldComponentUpdate`,
the entire props tree representing the entire UI needs be synchronously computed.
This can become expensive when dealing with lots of elements.

Instead, and with `react-reprop`, the latest props of a component are retrieved only at the time when the component is actually being re-rendered.
Allowing the props computation to be on par with the component's asynchronousity.

With Fiber Pruning, the pull method can be used while the computation of all props for the entire UI happens asynchronously.

<!---






    WARNING, READ THIS.
    This is a computed file. Do not edit.
    Edit `/docs/performance.template.md` instead.












    WARNING, READ THIS.
    This is a computed file. Do not edit.
    Edit `/docs/performance.template.md` instead.












    WARNING, READ THIS.
    This is a computed file. Do not edit.
    Edit `/docs/performance.template.md` instead.












    WARNING, READ THIS.
    This is a computed file. Do not edit.
    Edit `/docs/performance.template.md` instead.












    WARNING, READ THIS.
    This is a computed file. Do not edit.
    Edit `/docs/performance.template.md` instead.






-->
