const React = require('react');
const ReactReprop = require('react-reprop');
const TodoList = require('./components/TodoList');
const ReactDOMServer = require('react-dom/server');

// We pretend that the code is running in the browser for the sake of the example
const initialContext = {isServerSideRendering: false};

// The `ReactReprop.resolve` API will likely change to something that better fits React's Fiber API
ReactReprop.resolve(() => <TodoList />, listener, {initialContext});

// The listener is called once the entire props tree is resolved for the first time
// and subsequently every time new props are resolved
function listener(element) {
    prettyHtmlLog(
        ReactDOMServer.renderToStaticMarkup(element)
    )
}

function prettyHtmlLog(html) {
    console.log(require('pretty')(html));
}
