# 编写React

编写一个React之前，我们需要制定一个目标，有了目标我们就能更清晰地step by step地完成自己的React~。

1. 编写`createElement`函数
2. 编写`render`函数
3. 实现并发模式（Concurrent Mode）
4. 实现Fibers
5. 实现Render和Commit阶段
6. 实现协调（Reconciliation）
7. 实现函数组件
8. 实现基本的hook
9. 使用jest测试我们的React
10. 使用Lerna管理npm库


# 一、jsx是如何转换成createElement的


```
import React from 'react';

function App() {
  return <h1>Hello World</h1>;
}

---通过babel转义后---

import React from 'react';

function App() {
  return React.createElement('h1', null, 'Hello world');
}
```

> jsx在17版本中不在编译成createElement而是自动从 React 的 package 中引入新的入口函数并调用