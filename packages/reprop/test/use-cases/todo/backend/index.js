process.on('unhandledRejection', err => {throw err});

const Reprop = require('reprop/pure');
const ReactDOMServer = require('react-dom/server');
const {createElement: el} = require('react');
const {AppProps, AppComponent} = require('../components/App');
const pretty = require('pretty');


let simulationHasStarted = false;

Reprop.resolve({
    propsElement: Reprop.createPropsElement(AppProps, {isSSR: true}),
    onResolvedProps: props => {
     // console.log(JSON.stringify(props, null, 2));

        const html_str = ReactDOMServer.renderToStaticMarkup(el(AppComponent, props));
        console.log('\n', pretty(html_str));

        if( props.todoListData.displayedItems && ! simulationHasStarted ) {
            simulationHasStarted = true;
            setTimeout(() => simulateUserClickOnToggle(props), 1000);
            setTimeout(() => simulateUserClickOnToggle(props), 1500);
        }
    },
 // debug: true,
});

function simulateUserClickOnToggle(props) {
    props.todoListData.hideCompletedItemsToggle();
}

