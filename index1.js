// createStore 接收三个参数, 提供了getstate，dispatch，发布订阅模式
const createStore = (reducer, initState, enhancer) => {
    // 如果没传enhancer， 并且initstate是函数
    if(!enhancer && typeof initState === "function") {
        // 把initstate当作enhancer？
        enhancer = initState
        initState = null
    }
    if(enhancer && typeof enhancer === "function") {
        // enhancer 接收 createStore 作为参数，最后返回的是一个加强版的 store，本质上是对 dispatch 函数进行了扩展
        return enhancer(createStore)(reducer, initState)
    }
    let store = initState
    let listeners = []
    // 用于一个一个执行action
    let isDispatch = false
    // 获取store
    const getState = () => store
    // 发送action
    const dispatch = (action) => {
        if(isDispatch) return action
        isDispatch = true
        store = reducer(state, action)
        isDispatch = false
        // 会触发监听方法
        listeners.forEach(listen => listen())
        return action
    }
    // 监听方法
    const subscribe = (listener) => {
        if(typeof listener === "function") {
            listeners.push(listener)
        }
        return () => unsubcribe(listener)
    }
    const unsubcribe = (listener) => {
        const index = listeners.indexOf(listener)
        listeners.splice(index, 1)
    }
    return {
        getState,
        dispatch,
        subscribe,
        unsubcribe
    }
}


// 该函数接受两个参数,其中dealActions表示actionCreateor函数，如果有多个actionCreator函数，可以放在dealAction.js文件中一次引入
// let createActionAndDispatch = bindActionCreator(dealActions, dispatch)
// createActionAndDispatch.reload()
// 将会自动创建reload这个action，并自动dispatch。换句话说，bindActionCreator(dealAction,diapatch)函数返回的是一个对象，调用这个对象中（对应相应action）的属性，就会自动创建aciton并dispatch
const bindActionCreator = (dealActions, dispatch) => {
    return (...arg) => dispatch(dealActions(...arg))
}

const combineReducer = (reducers) => {
    const finalReducers = {}
    Object.keys(reducers).forEach(reducerKey => {
        if(typeof reducers[reducerKey] === "function") {
            finalReducers[reducerKey] = reducers[reducerKey]
        }
    })
    return (state, action) => {
        const store = {}
        Object.keys(finalReducers).forEach(key => {
            const reducer = finalReducers[key]
            const nextState = reducer(state[key], action)
            store[key] = nextState
        })
        return store
    }
}

const applyMiddleWare = (...middleWares) => {
    return (createStore) => (reducer, initState, enhancer) => {
        const store = createStore(reducer, initState, enhancer)
        const middleWareAPI = {
            getState: store.getState,
            dispatch: (action) => dispatch(action)
        }
        let chain = middleWares.map(middleWare => middleWare(middleWareAPI))
        store.dispatch = compose(chain)(store.dispatch)
        return store
    }
}

const compose = (...funcs) => {
    if(!funcs) {
        return arg => arg
    }
    if (funcs.length === 1) {
        return funcs[0]
    }
    return funcs.reduce((f1,f2) => (...arg) => f1(f2(...arg))
}