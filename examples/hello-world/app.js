// === View presentation ===
const HelloPresentation = (
    props => "<div style='color: green'>"+props.message+"</div>"
);

// === View logic ===
const HelloProps = {
    name: 'Hello',
    onResolve() { // `onResolve` returns the `props` for `HelloPresentation`
        return {message: 'Hello World'};
    },
};

// === Rendering ===
const Reprop = require('reprop');
const HelloPropsElement = Reprop.createPropsElement(HelloProps);
Reprop.resolve({
    propsElement: HelloPropsElement,
    onResolvedProps(props) { // `onResolvedProps` is called every time `HelloPropsElement` resolves
        const viewElement = HelloPresentation(props);
        console.log(viewElement); // or alternatively: `document.body.innerHTML = viewElement`;
    },
});

