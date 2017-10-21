const Reprop = require('reprop/pure');
const ReactDOM = require('react-dom');
const {createElement: el} = require('react');
const {AppProps, AppComponent} = require('../../components/App');

const domElement = document.body.appendChild(document.createElement('div'));

Reprop.resolve({
    propsElement: Reprop.createPropsElement(AppProps),
    onResolvedProps: props => {
        ReactDOM.render(
            el(AppComponent, props),
            domElement,
        );
    },
});

