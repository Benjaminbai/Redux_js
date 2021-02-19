
/**
 * store的实现原理
 * 根据传入的初始值来创建一个对象利用闭包特性来保留这个store
 * 允许通过getState()来获取store 
 * 之所以通过getState获取store，是为了获取当前store的快照
 * 便于打印日志以对比前后两次store的变化，方便调试
 */
const createStore = (reducer, initialState, enhaancer) => { // 俩参数后面会用到的
    let store = initialState
    const getState = () => store
    return {
        getState
    }
}

/**
 * redux本质上是一个发布-订阅模式
 * 那么一定会有一个监听，解除监听的两个方法
 * 实现方式比较简单，就是使用一个数组来保存所有监听方法
*/
const createStore = () => {
    //...
    let listeners = []
    const subscribe = (listener) => {
        listeners.push(listener)
    }
    const unsubscribe = (listener) => {
        const index = listeners.indexOf(listener)
        listeners.splice(index, 1)
    }
}

/**
 * 只有通过dispatch才能发送action，
 * 而发送action之后才会执行subscribe监听那些方法
 * dispatch做的事情就是将action传给reducer
 * 将执行后的结果设置为新的store
 * 然后执行listeners中的方法
 * */ 
const createStore = (reducer, initialState) => {
    //...
    let store = initialState
    const dispatch = (action) => {
        store = reducer(store, action)
        listeners.forEach(listener => listener());
    }
}

/**
 * 如果多个action同时发送，很难说清楚最后的store到底是什么样
 * dispatch执行后返回的值也是当前的action
 * */ 
const createStore = (reducer, initialState) => {
    //...
    let store = initialState
    let isDispatch = false
    const dispatch = (action) => {
        if(isDispatch) return action
        isDispatch = true
        store = reducer(store, action)
        isDispatch = false
        listeners.forEach(listener => listener())
        return action
    }
}

/**
 * createState接收的第一个参数，有两种形式
 * 一种是reducer函数
 * 另一种是用combineReducers把多个reducer函数合并到一起
 * combineReducers是一个高阶函数，接收一个对象作为参数，
 * 返回一个新的函数
 * 这个新的函数和普通的reducer函数的参数保持一致
 */ 
const combineReducers = (reducers) => {
    return function combination(state ={}, actiion) {}
}

/**
 * 主要作用：
 * 收集传入的reducer函数
 * 在dispatch中执行combination函数时，遍历执行所有reducer函数
 * 如果某个reducer函数返回了新的state，那么combination就会返回这个state
 * 否则就返回传入的state
 */ 
const combineReducers = reducers => {
    const finalReducers = {}
    const nativeKeys = Object.keys
    nativeKeys(reducers).forEach(reducerKey => {
        if(typeof reducers[reducerKey] === "function") {
            finalReducers[reducerKey] = reducers[reducerKey]
        }
    })
    return function combination(state, action) {
        let hasChanged = false
        const store = {}
        nativeKeys(finalReducers).forEach(key => {
            const reducer = finalReducers[key]
            const nextState = reducer(state[key], action)
            store[key] = nextState
            hasChanged = hasChanged || nextState !== state[key]
        })
        return hasChanged ? nextState: state
    }
}
/**
 * 这种写法每次调用dispatch都会执行这个combination的话
 * 无论发送什么类型的action，所有的reducer都会执行一编
 * 如果reducer很多，效率就低
 * 所以可以通过键值对的形式匹配action.type
 */ 
const count = (state = 0, action) => {
    switch(action.type) {
        case 'increment':
            return state + action.payload
        case 'decrement':
            return state - action.payload
        default:
            return state
    }
}
// 改进
const count = {
    state: 0,
    reducers: {
        increment: (state, payload) => state + payload,
        decrement: (state, payload) => state - payload
    }
}

/**
 * createStore提供的第三个参数，可以实现对dispatch函数的增强
 * 称之为store enhancer
 * 是一个高阶函数
 */ 
const logger = () => {
    return (createStore) => (reducer, initialState, enhancer) => {
        const store = createStore(reducer,initialState, enhancer)
        const dispatch = (action) => {
            const result = store.dispatch(action)
            const state = store.getState()
            return result
        }
        return {
            ...state,
            dispatch
        }
    }
}

/**
 * applyMiddleware 的实现类似上面的 Store Enhancer。
 * 由于多个中间件可以串行使用，因此最终会像洋葱模型一样，action 传递需要经过一个个中间件处理，
 * 所以中间件做的事情就是增强 dispatch 的能力，将 action 传递给下一个中间件。
 * 那么关键就是将新的 store 和 dispatch 函数传给下一个中间件
 */ 
const applyMiddleware = (...middlewares) => {
    return (createStore) => (reducer, initialState, enhancer) => {
        const store = createStore(reducer, initialState, enhancer)
        const middlewaresAPI = {
            getState: store.getState,
            dispatch: (action) => dispatch(action)
        }
        let chain = middlewares.map(middlewares => middlewares(middlewaresAPI))
        store.dispatch = compose(...chain)(store.dispatch)
        return {
            ...store,
            dispatch
        }
    }
}

/**
 * 这里用到了一个 compose 函数，compose 函数类似管道，可以将多个函数组合起来。compose(m1, m2)(dispatch) 等价于 m1(m2(dispatch))
 */ 
const compose = (...funcs) => {
    if(!funcs) {
        return args => args
    }
    if(funcs.length === 1) {
        return funcs[0]
    }
    return funcs.reduce((f1, f2) => (...args) => f1(f2(...args)))
}

/**
 * 再来看一下 redux-logger 中间件的精简实现，会发现两者恰好能匹配到一起
 */ 
function logger(middlewaresAPI) {
    return function(next) {
        return function(action) {
            var returnValue = next(action)
            return returnValue
        }
    }
}