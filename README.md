# 编写 React

编写一个 React 之前，我们需要制定一个目标，有了目标我们就能更清晰地 step by step 地完成自己的 React~。

1. 编写`createElement`函数
2. 编写`render`函数
3. 实现并发模式（Concurrent Mode）
4. 实现 Fibers
5. 实现 Render 和 Commit 阶段
6. 实现协调（Reconciliation）
7. 实现函数组件
8. 实现基本的 hook

额外工作：

1. 部署 webpack 编译环境。
2. 使用 jest 测试我们的 React。
3. 使用 Lerna 管理 npm 库

# 了解 jsx 是如何转换成 createElement

```
import React from 'react';

function App() {
  return <h1>Hello World</h1>;
}

---通过@babel/plugin-transform-react-jsx转义后---

import React from 'react';

function App() {
  return React.createElement('h1', null, 'Hello world');
}
```

> jsx 在 17 版本中不在编译成 createElement 而是自动从 React 的 package 中引入新的入口函数并调用

# 简易版 React 具体逻辑和思路

0. 利用requestIdleCallback轮询在空闲时触发执行任务，判断是否有工作单元。
1. 处理 craeteElement 生成的对象，赋值工作单元并等待浏览器空闲时间处理任务，并挂载到 FiberRoot
2. performUnitOfWork开始处理工作单元，在第一次渲染时创建真实DOM但此时还没appendChild中
3. 在处理工作单元中执行reconcileChildren进行协调逻辑，创建新的Fiber节点并且有flags属性提供UI的mutation。
4. 当遍历完Fiber tree时，并且每个fiber节点中都有即将要mutaion的状态，进入commit阶段。
5. commit阶段首先删除拥有deletion flags的fiber节点，然后开始从work in progress的fiber root下的child开始执行深入优先遍历对真实DOM的修改。
