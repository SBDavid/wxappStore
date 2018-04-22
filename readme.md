# 微信小程序全局状态管理，并提供Vuex的开发体验

## 1. 概要

微信小程序的开发体验类似vue和react，但是却没有提供全局状态管理的机制，所以状态的共享只能通过属性传递的方式来实现。这种做法在小规模的应用中尚可以满足开发效率，但是在复杂的应用中组件的嵌套层次很深，属性传递的路径过长。

于是我就想利用小程序Page中的data对象来构建一个全局store，这个store满足一下几点需求：

- 1. store可以被当前页面中任意一个组件访问，并且这种访问时直接的而不是通过属性传递。
- 2. 全局store对于组件是相应式的，也就是说store的变化可以使组件发生重绘。
- 3. 页面和组件都可以修改store的状态，并且这种修改不破坏原来的响应式。
- 4. 提供类似Vuex的开发体验，减小学习成本。

## 2. 使用

我们先跳过原理来看使用方法。

### 2.1 安装

将Store.js放入微信小程序项目的文件夹中，例如/lib/Store.js。

### 2.2 创建Page对象

这里我们通过```wxappStore.createPage```来创建。对比一下Store.js和原来的创建方法的区别

```js
// 原来的创建方法
Page({
  data: {
    message: ''
  },
  onLoad: function () {
    this.setData({
        message: 'hello world'
    })
  }
})
```

```js
// 增加全局状态管理之后
import wxappStore from "../../lib/Store.js";

Page(wxappStore.createPage({
    // 第一个参数和原来传入Page方法的option没有区别。其中的data会作为全局共享对象来使用。
    data: {
        message: ''
    },
    onLoad: function () {
        // 通过dispatch方法，进行一个异步操作。  
        this.store.dispatch({ 
            name: 'testAction',
            payload: 'hello world'
        });
        // 通过commit方法，修改全局状态。
        this.store.commit({ 
            name: 'testMutation',
            payload: 'hello world'
        });
    }
}, 
// 第二个参数是一个对象，其中包含mutations和actions
{
    mutations: {
        testMutation: function({ setData, payload, data }) {
            setData({
                message: payload
            });
        }
    },
    actions: {
        testAction: function ({ commit, payload, data }) {
            setTimeout(() => {
                commit({
                    name: 'testMutation',
                    payload: payload
                });
            });
        }
    }
}))
```

```wxappStore.createPage```方法有两个参数。

第一个参数和原来传入Page方法的option没有区别。其中的data会作为全局共享对象来使用。

第二个参数是一个对象，其中包含```mutations```和```actions```

### 2.3 使用mutation

mutation和Vuex中的mutation类似，它通过同步的方式修改状态。可以通过commit调用。

#### 2.3.1 定义mutation
mutations在```wxappStore.createPage```的第二个参数中定义，它用于修改全局状态。mutation通常同步的。mutation方法的参数是一个对象，包含三个属性：

- **setData** ```function```： 用来修改全局状态，在微信小程序中直接修改状态不会触发页面重汇。
- **payload** ```object```：修改的状态，可以是一个对象，也可以是String等基础数据类型
- **data** ```object```：当前状态

```js
mutations: {
    testMutation: function({ setData, payload, data }) {
        setData({
            message: payload
        });
    }
},
```

#### 2.3.2 调用mutation
通过commit方法调用mutation，它的参数是一个对象，包含两个属性：
- **name** ```String```：mutation的名称
- **payload** ```Object```：需要修改的状态，和Vuex的payload类似。

```js
this.store.commit({ 
    name: 'testMutation',
    payload: 'hello world'
});
```

### 2.4 使用action

action和Vuex中action概念类似，通常包含异步操作，在异步操作完成后进行commit操作。

### 2.4.1 定义action

action方法的参数是一个参数，包含3个属性：
- **commit** ```function```：执行commit操作
- **payload** ```Object```：数据对象，和Vuex类型
- **data** ```Object```：当前状态

```js
actions: {
    testAction: function ({ commit, payload, data }) {
        setTimeout(() => {
            commit({
                name: 'testMutation',
                payload: payload
            });
        });
    }
}
```

### 2.4.2 调用action
通过dispatch方法调用action，它的参数是一个对象，包含两个属性：
- **name** ```String```：action的名称
- **payload** ```Object```：需要修改的状态，和Vuex的payload类似。

```js
this.store.dispatch({ 
    name: 'testAction',
    payload: 'hello world'
});
```

### 2.5 创建Component

在Component中我们需要完成两项工作

第一将全局状态绑定到当前组件的data属性上，并将组件的data属性绑定到页面元素上。

第二组件需要使用commit或者dispatch完成全局状态的修改。

这里Store.j通过```wxappStore.createComp```来创建Component，它会通过代理的方式为Component实现全局状态管理的功能。

```js
import wxappStore from "../lib/Store.js";

Component(wxappStore.createComp({
  data: {
    localtimeData: ''
  },
  ready: function () {
    // 绑定全局状态
    this.getGlobalData({ globalDataKey: 'localtime', localDataKey: 'localtimeData' });

    // 改变全局状态  
    this.store.commit({
        name: 'testMutation',
        payload: (new Date()).toLocaleTimeString()
    })
  }
}))

```

```html
<view>读取全局状态：{{localtimeData}}</view>
```

### 2.5.1 全局状态绑定

全局状态绑定通过```getGlobalData```这个实例方法实现，这个方法并不在小程序的运行环境中，它是Store.js执行的过程中插入到Component实例中的。

> ```getGlobalData``` 不能再```created```回调中调用，应为component的实例方法```setData```不能再```created```中调用。

```getGlobalData```的参数是一个对象，包含两个属性：

- **globalDataKey** ```String```：这个属性表示需要全局状态的属性名，这个全局状态将于component的本地状态绑定。
- **localDataKey** ```String```：这个属性表示本地状态的属性名，这个本地状态将于全局状态绑定。

```js
// 绑定全局状态
this.getGlobalData({ globalDataKey: 'localtime', localDataKey: 'localtimeData' });
```

### 2.5.2 改变全局状态
可以使用```store.commit```或者```store.dispatch```，```store```并不是小程序的运行环境中内置的，同样是通过Store.js插入到每一个component实例中。它的使用方法和Page中的类似。

## 3. 这套框架的不足

- Store.js借用了Page对象的data属性来完成全局状态管理，所以data属性的职责并不单一。data属性兼具了页面ViewModel的功能和全局状态的功能。但是Page中的data属性本来也具有全局意义，所以两者的冲突并不大。

- component中的data属性职责并不单一。它兼具了本地属性的功能和绑定全局状态的功能。而且直接通过setData修改component中的data并不能触发全局状态的改变，因为data的作用域仅限于当前component，必须通过```store.commit```或者```store.dispatch```触发发全局状态的改变。

- 如果你发现其他问题，欢迎留言，我们共同进步！