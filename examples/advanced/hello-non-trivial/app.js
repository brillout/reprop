const Reprop = require('reprop');

const HelloProps = {
    name: 'Hello',
    onResolve: ({
        previousResolvedProps: {timerCount: previousTimerCount},
        state: {timerStart},
        attrs: {name},
        previousProps: {name: previousName}
    }) => {
        const timerCount = Math.floor((new Date() - timerStart)/1000);

        if( timerCount===previousTimerCount && name===previousName ) {
            return null;
        }

        const message = 'Hello '+name+', you are here since '+timerCount+' seconds';

        return {
            timerCount,
            message,
        };
    },
    onBegin: ({attrs, resolve, state}) => {
        state.timerStart = new Date();
        resolve();
        setInterval(() => {
            resolve();
        }, 100);
    },
};

// It is a convention to have one view = one file but we make an exception to keep things minimal.
const AppProps = {
    name: 'App',
    onResolve: ({state: {name}}) => {
        return {
            helloProps: Reprop.createPropsElement(HelloProps, {name})
        };
    },
    onBegin: ({resolve, state}) => {
        const setRandomName = () => {
            state.name = Math.random()<0.5 ? 'Jon': 'Cersei';
            resolve();
        };

        setRandomName();

        setInterval(() => {
            setRandomName();
        }, 1000);
    },
};

Reprop.resolve({
    propsElement: Reprop.createPropsElement(AppProps),
    onResolvedProps: props => {
        console.log(JSON.stringify(props, null, 2));
    },
});
