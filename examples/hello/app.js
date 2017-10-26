import Reprop from 'reprop' // npm install reprop

// === View Presentation ===
const HelloPresentation = props => (
    '<div>'+'Hello '+props.name+' (after '+props.elapsedSeconds+'s)</div>'
);

// === View Logic ===
const HelloProps = {
    name: 'Hello',
    onResolve({state}) {
        // We compute the `props` for `HelloPresentation` from
        // source-of-truths `state.name` and `state.startDate`
        return {
            name: state.name,
            elapsedSeconds: Math.floor((new Date() - state.startDate)/1000),
        };
    },
    onBegin({resolve, state}) { // `onBegin` is called once when the view is created
        state.startDate = new Date();
        state.name = 'Jon';
        resolve();
        // We call `resolve` every time we want to update `props`
        setTimeout(() => {state.name = 'Cersei'; resolve()}, 1000);
        setTimeout(() => {state.name = 'Tyrion'; resolve()}, 2000);
    },
};

// === Rendering ===
Reprop.resolve({
    propsElement: Reprop.createPropsElement(HelloProps),
    onResolvedProps(props) {
        console.log(HelloPresentation(props));
    },
});
