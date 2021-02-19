// store 的原理，利用闭包保留store，允许通过getstore获取当前store的快照
const createStore = (reducer, initState, enhancer) => {
    const store = initState
    const getState = () => store
    return {
        getState
    }
}

// redux 本质上是发布订阅模式，需要一个监听，解除监听的方法, 使用数组保存所有监听的方法
const createStore = () => {
    let listeners = []
    const subscribe = (listener) => {
        listeners.push(listener)
    }
    const unsubscribe = (listener) => {
        let index = listeners.indexOf(listener)
        listeners.splice(index, 1)
    }
}

// 只能通过dispatch才能发送action，发送action之后，会触发监听器，dispatch要做的事情就是把action传给reducer，将执行后的新结果赋值给store，在执行监听起中的方法
const createStore = (reducer, initState) => {
    let store = initState
    const dispatch = (action) => {
        store = reducer(store, action)
        listeners.foreach(listener => listener())
    }
}

// 如果多个action同时发送，很难确定最后的store
const createStore = (reducer, initState) => {
    let store = initState
    let isDispatch = false
    const dispatch = (action) => {
        if (isDispatch) return action
        isDispatch = true
        store = reducer(store, action)
        isDispatch = false
        listeners.foreach(listener => listener())

        return action
    }
}

// createStore接收的第一个参数有两种形式，一种是reducer，另一种是用combinereducers把多个reducer合并到一起，combinereducers是一个高阶函数，接收一个对象作为参数，返回一个新函数，这个新函数和普通reduccer的参数保持一致
const combineReducers = (reducers) => {
    return function combination(state = {}, action) {

    }
}

// 主要作用，收集reducer，当distach执行combination函数时，遍历所有reducer，如果某个reducer返回了新的state，那么combination函数就返回新的state，否则就返回传入的state
const combineReducers = reducers => {
    const finalReducers = {}
    Object.keys(reducers).forEach(reducerKey => {
        if (typeof reducers[reducerKey] === "function") {
            finalReducers[reducerKey] = reducers[reducerKey]
        }
    })
    return function combination(state, action) {
        let hasChanged = false
        const store = {}
        Object.keys(finalReducers).forEach(key => {
            const reducer = finalReducers[key]
            const nextState = reducer(state[key], action)
            store[key] = nextState
            hasChanged = hasChanged || nextState !== state[key]
        })
        return hasChanged ? nextState : state
    }
}

// 上面这种方法每次distach都会执行combination，无论什么类型的action，所有的reducer都会执行一遍，所以采用键值对方式，匹配action.type
