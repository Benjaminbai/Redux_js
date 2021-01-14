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