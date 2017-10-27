// === View presentation ===
const HelloPresentation = (
    // This could as well be a React component / Vue component / etc.
    props => "<div style='color: green'>"+props.message+"</div>"
);

// === View logic ===
const HelloProps = {
    name: 'Hello',
    onResolve() { // `onResolve` returns the `props` for `HelloPresentation`
        const props = {message: 'Hello World'};
        return props;
    },
};

// === Rendering ===
const Reprop = require('reprop'); // npm install reprop
const HelloPropsElement = Reprop.createPropsElement(HelloProps);
Reprop.resolve({
    propsElement: HelloPropsElement,
    onResolvedProps(props) { // `onResolvedProps` is called every time `HelloPropsElement` resolves
        const viewElement = HelloPresentation(props);
        console.log(viewElement); // or alternatively: `document.body.innerHTML = viewElement`;
    },
});

