实现redux，了解原理

1. 全局状态管理
    - 我们在写react组件的时候，如果遇到兄弟，父子组件传值的情况
    - 经常要将状态提升到父组件里
    - 一旦通信多了，嵌套深了，数据管理就是一个问题
    - 按照上面的思路，是不是可以将数据都放到最顶层组件或外部维护呢？
        - 这个大的 store 可以放到顶层组件中维护，也可以放到顶层组件之外来维护，这个顶层组件我们一般称之为“容器组件”
        - 我们可以将容器组件的 state 按照组件来划分
        - 现在这个 state 就是整个应用的 store
        - 将修改 state 的方法放到 actions 里面，按照和 state 一样的结构来组织
        - 最后将其传入各自对应的子组件中
        - 这种模式还可以继续做一些优化，比如结合 Context 来实现向深层子组件传递数据
        ```
        const Context = createContext(null);
        class App extends Component {
            ...
            render() {
                return (
                    <div className="main">
                        <Context.Provider value={...this.state, ...this.events}>
                            <Header />
                            <Body />
                            <Footer />
                        </Context.Provider>
                    </div>
                )
            }
        }
        const Header = () => {
            // 获取到 Context 数据
            const context = useContext(Context);
        }
        ```
    - 如果我们把 App 组件中的 state 移到外面，这不就是 Redux 了吗？
    - 没错，Redux 的核心原理也是这样
        - 在组件外部维护一个 store
        - 在 store 修改的时候会通知所有被 connect 包裹的组件进行更新

## Redux
1. Redux 是一个状态管理库，它并非绑定于 React 使用，你还可以将其和其他框架甚至原生 JS 一起使用
2. 在学习 Redux 之前需要先理解其工作原理，一般来说流程是这样的
    - 用户触发页面操作，通过dispatch触发一个action
    - redux通过这个action后， 通过reducer函数获取到下一个状态
    - 将新状态更新进store
    - store更新后，通知页面进行渲染
    - 从这个流程中不难看出，Redux 的核心就是一个 发布-订阅 模式
    - 一旦 store 发生了变化就会通知所有的订阅者
    - view 接收到通知之后会进行重新渲染
3. Redux 有三大原则
    - 单一数据源
        - 所有状态都放到了顶层组件的state中
        - 这个state形成了一个状态树
        - 在redux中，这个state状态树就是store
        - 一个应用般只有一个store
    - state是只读的
        - 在redux中，唯一触发state发生变化是通过action
        - action描述了触发这次行为的信息
        - 通过纯函数来修改
            - 为了描述action使状态修改，需要编写reducer函数来修改状态
            - reducer函数接收前一次的state和action， 返回新的state
            - 无论被调用多少次，只要传入相同的 state 和 action，那么就一定返回同样的结果
4. 设计思想
    - Redux 的设计思想很简单，就两句话
    - Web 应用是一个状态机，视图与状态是一一对应的
    - 所有的状态，保存在一个对象里面
5. 基本概念和 API
    - store
        - 就是保存数据的地方，可以当成一个容器
        - 整个应用只有一个store
        - redux提供createStore这个函数，用来生成store
            ```
            import {createStore} from "redux"
            const store = createStore(fn)
            ```
        - createStore接收另一个函数作为参数，返回新的store
        - fn就是纯函数reducer
    - state
        - store对象包含所有数据，如果想得到某个时点的数据，就要对store生成快照，这个时点的数据集合就是state
        - 当前时刻的state，可以通过store.getState()拿到
        ```
        const state = store.getState();
        ```
        - redux规定，一个state对应一个view
        - 只要 State 相同，View 就相同。你知道 State，就知道 View 是什么样，反之亦然
    - action
        - state的变化会导致vie的变化
        - 但是用户接触不到state，只能接触到view
        - 所以state的变化必须是view导致的
        - action就是view发出的通知，表示view要变化了
        - action是一个对象
            - 其中的type属性是必须的，表示action的类型，名称
            ```
            const action = {
                type: 'ADD_TODO',
                payload: 'Learn Redux'
            };
            ```
        - 可以这样理解，action描述当前发生的事情
        - 是改变state的为一办法
        - 他会运送数据到store
    - action creator
        - view要发送多少信息，就会有多少action
        - 如果都手写很麻烦
        - 可以定义一个函数来生成action
        - 这个函数就叫action creator
        ```
        const ADD_TODO = 'TODO'
        function add_todo(text) {
            return {
                type: ADD_TODO
                text
            }
        }
        const action = addTodo('Learn Redux')
        ```
    - store.dispatch是view发出action的唯一方法
        ```
        import { createStore } from 'redux';
        const store = createStore(fn);

        store.dispatch({
            type: 'ADD_TODO',
            payload: 'Learn Redux'
        });
        ```
        - store.dispatch接收一个action对象作为参数
        - 将它发送出去
    - Reducer
        - store收到action以后，必须给出一个新的state，这样view才会发生变化
        - 这种 State 的计算过程就叫做 Reducer
        - Reducer是一个函数，它接收action和当前state作为参数
        - 返回一个新的state
        - 整个应用的初始状态，可以作为 State 的默认值
        ```
        const defaultState = 0;
        const reducer = (state = defaultState, action) => {
            switch (action.type) {
                case 'ADD':
                    return state + action.payload;
                default: 
                    return state;
            }
        };

        const state = reducer(1, {
            type: 'ADD',
            payload: 2
        });
        ```
        - 为什么这个函数叫做 Reducer 呢？因为它可以作为数组的reduce方法的参数
        - Reducer 函数最重要的特征是，它是一个纯函数
        - 由于 Reducer 是纯函数，就可以保证同样的State，必定得到同样的 View。但也正因为这一点，Reducer 函数里面不能改变 State，必须返回一个全新的对象
        - 最好把 State 对象设成只读。你没法改变它，要得到新的 State，唯一办法就是生成一个新对象。这样的好处是，任何时候，与某个 View 对应的 State 总是一个不变的对象
    - store.subscribe()
        - Store 允许使用store.subscribe方法设置监听函数，一旦 State 发生变化，就自动执行这个函数
        - store.subscribe方法返回一个函数，调用这个函数就可以解除监听
            ```
            let unsubscribe = store.subscribe(() =>
                console.log(store.getState())
            );

            unsubscribe();
            ```
    - Redux 提供了一个combineReducers方法，用于 Reducer 的拆分。你只要定义各个子 Reducer 函数，然后用这个方法，将它们合成一个大的 Reducer

## 实现一个 Redux
1. 实现 store
    - 在redux中，store通过createState创建
    ```
    import { createStore } from 'redux'; 
    const store = createStore(rootReducer, initalStore, middleware);
    ```
    - 先看一下redux中暴露的几个方法
        - 其中 createStore 返回的方法主要有 subscribe、dispatch、replaceReducer、getState
        - createStore 接收三个参数，分别是 reducers 函数、初始值 initalStore、中间件 middleware
        - store 上挂载了 getState、dispatch、subscribe 三个方法
        - getState 是获取到 store 的方法，可以通过 store.getState() 获取到 store
        - dispatch 是发送 action 的方法，它接收一个 action 对象，通知 store 去执行 reducer 函数
        - subscribe 则是一个监听方法，它可以监听到 store 的变化，所以可以通过 subscribe 将 Redux 和其他框架结合起来
        - replaceReducer 用来异步注入 reducer 的方法，可以传入新的 reducer 来代替当前的 reducer
2. 实现 getState
    - store 的实现原理比较简单，就是根据传入的初始值来创建一个对象
    - 利用闭包的特性来保留这个 store
    - 允许通过 getState 来获取到 store
    ```
    const createStore = (reducers, initialState, enhancer) => {
        let store = initialState;
        const getState = () => store;
        return {
            getState
        }
    }
    ```
3. 实现 subscribe && unsubscribe
    - 既然 Redux 本质上是一个 发布-订阅 模式，那么就一定会有一个监听方法
    - 在 Redux 中提供了监听和解除监听的两个方法
    - 实现方式也比较简单，使用一个数组来保存所有监听的方法
    ```
    const createStore = (...) => {
        ...
        let listeners = [];
        const subscribe = (listener) => {
            listeners.push(listener);
        }
        const unsubscribe = (listener) => {
            const index = listeners.indexOf(listener)
            listeners.splice(index, 1)
        }
    }
    ```
4. 实现 dispatch
    - dispatch 和 action 是息息相关的，只有通过 dispatch 才能发送 action
    - 而发送 action 之后才会执行 subscribe 监听到的那些方法
    - 所以 dispatch 做的事情就是将 action 传给 reducer 函数
    - 将执行后的结果设置为新的 store，然后执行 listeners 中的方法
    ```
    const createStore = (reducers, initialState) => {
        ...
        let store = initialState;
        const dispatch = (action) => {
            store = reducers(store, action);
            listeners.forEach(listener => listener())
        }
    }
    ```
    - 这样就行了吗？当然还不够。
    - 如果有多个 action 同时发送，这样很难说清楚最后的 store 到底是什么样的
    - 所以需要加锁。在 Redux 中 dispatch 执行后的返回值也是当前的 action
    ```
    const createStore = (reducers, initialState) => {
        ...
        let store = initialState;
        let isDispatch = false;
        const dispatch = (action) => {
            if (isDispatch) return action
            // dispatch必须一个个来
            isDispatch = true
            store = reducers(store, action);
            isDispatch = false
            listeners.forEach(listener => listener())
            return action;
        }
    }
    ```
5. 实现 combineReducers
    - 可以猜测 combineReducers 是一个高阶函数，接收一个对象作为参数，返回了一个新的函数
    - combineReducers 做了什么工作:
        - 收集所有传入的 reducer 函数
        - 在 dispatch 中执行 combination 函数时，遍历执行所有 reducer 函数
        - 如果某个 reducer 函数返回了新的 state，那么 combination 就返回这个 state，否则就返回传入的 state
6. 中间件 和 Store Enhancer
    - 考虑到这样的情况，我想要打印每次 action 的相关信息以及 store 前后的变化，那我只能到每个 dispatch 处手动打印信息，这样繁琐且重复
    - createStore 中提供的第三个参数，可以实现对 dispatch 函数的增强，我们称之为 Store Enhancer

7. 实现 applyMiddleware
    - 在创建 store 的时候，经常会使用很多中间件，通过 applyMiddleware 将多个中间件注入到 store 之中
    ```
    // 这里需要对参数为0或1的情况进行判断
    const compose = (...funcs) => {
        if (!funcs) {
            return args => args
        }
        if (funcs.length === 1) {
            return funcs[0]
        }
        return funcs.reduce((f1, f2) => (...args) => f1(f2(...args)))
    }

    const bindActionCreator = (action, dispatch) => {
        return (...args) => dispatch(action(...args))
    }

    const createStore = (reducer, initState, enhancer) => {
        if (!enhancer && typeof initState === "function") {
            enhancer = initState
            initState = null
        }
        if (enhancer && typeof enhancer === "function") {
            return enhancer(createStore)(reducer, initState)
        }
        let store = initState, 
            listeners = [],
            isDispatch = false;
        const getState = () => store
        const dispatch = (action) => {
            if (isDispatch) return action
            // dispatch必须一个个来
            isDispatch = true
            store = reducer(store, action)
            isDispatch = false
            listeners.forEach(listener => listener())
            return action
        }
        const subscribe = (listener) => {
            if (typeof listener === "function") {
                listeners.push(listener)
            }
            return () => unsubscribe(listener)
        }
        const unsubscribe = (listener) => {
            const index = listeners.indexOf(listener)
            listeners.splice(index, 1)
        }
        return {
            getState,
            dispatch,
            subscribe,
            unsubscribe
        }
    }

    const applyMiddleware = (...middlewares) => {
        return (createStore) => (reducer, initState, enhancer) => {
            const store = createStore(reducer, initState, enhancer);
            const middlewareAPI = {
                getState: store.getState,
                dispatch: (action) => dispatch(action)
            }
            let chain = middlewares.map(middleware => middleware(middlewareAPI))
            store.dispatch = compose(...chain)(store.dispatch)
            return {
            ...store
            }
        }
    }

    const combineReducers = reducers => {
        const finalReducers = {},
            nativeKeys = Object.keys
        nativeKeys(reducers).forEach(reducerKey => {
            if(typeof reducers[reducerKey] === "function") {
                finalReducers[reducerKey] = reducers[reducerKey]
            }
        })
        return (state, action) => {
            const store = {}
            nativeKeys(finalReducers).forEach(key => {
                const reducer = finalReducers[key]
                const nextState = reducer(state[key], action)
                store[key] = nextState
            })
            return store
        }
    }
    ```