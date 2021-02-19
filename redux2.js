
const createStore = function(reducer, initState, enhancer) {
    if(!enhancer && typeof initState === "function") {
        enhancer = initState
        initState = null
    }
    if(enhancer && typeof enhancer === "function") {
        return enhancer(createStore)(reducer, initState)
    }

    return {
        getState,
        dispatch,
        subscribe,
        unsubscribe
    }
}