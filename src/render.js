/**
 * 基本的render方法：全量渲染DOM tree。
 *
 * 问题1：当前是全量渲染，如果递归节点过多，将会阻塞渲染主线程。
 * 优化render：将任务拆解为最小单元，如果有更高优先级的任务则中断渲染。
 *
 * 问题2：当DOM tree节点过多时，就算我们使用空闲时间渲染，但是用户会看到我们的分割渲染的问题。
 * React的解决方案：使用双缓存机制，完成遍历全部fiber节点经过协调reconciliation后进入commit阶段才去渲染effectList上的DOM并根据fiber的flag来处理对应的mutation。
 */
let nextUnitOfWork = null;
// 对应着React的work in progress root fiber
let wipRoot = null;
let currentRoot = null;
let deletions = null;

const Placement = /*                    */ 0b00000000000000000010;
const Update = /*                       */ 0b00000000000000000100;
const Deletion = /*                     */ 0b00000000000000001000;

/**
 * requestIdleCallback利用了浏览器的空闲的工作时间执行低优先级任务，并且不会影响用户的io等高优先级任务。
 * React已经不使用requestIdleCallback了，但是概念还是以利用空闲时间
 * https://github.com/facebook/react/issues/11171#issuecomment-417349573
 */

requestIdleCallback(workLoop);

function workLoop(deadline) {
  let shouldYield = false;
  while (nextUnitOfWork && !shouldYield) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
    // 该帧剩余可用时间的毫秒数,少于1代表没有空闲时间
    shouldYield = deadline.timeRemaining() < 1;
  }

  if (!nextUnitOfWork && wipRoot) {
    commitRoot();
  }

  requestIdleCallback(workLoop);
}


function render(element, container) {
  // root fiber
  wipRoot = {
    dom: container,
    props: {
      children: [element],
    },
    alternate: currentRoot,
  };
  deletions = [];
  nextUnitOfWork = wipRoot;

  // 文本类型的元素需要使用craeteTextNode创建文本元素，并设置属性nodeValue显示文本
  // 处理文本和元素
  /* 第一版：全量渲染 */
  //   const dom =
  //     element.type === "TEXT_ELEMENT"
  //       ? document.createTextNode("")
  //       : document.createElement(element.type);

  //   // 分配props对节点
  //   const isProperty = (key) => key !== "children";
  //   Object.keys(element.props)
  //     .filter(isProperty)
  //     .forEach((name) => {
  //       dom[name] = element.props[name];
  //     });

  //   // 递归render
  //   element.props.children.forEach((child) => {
  //     render(child, dom);
  //   });
  //   if (container) {
  //     container.appendChild(dom);
  //   }
}

const isEvent = (key) => key.startsWith("on");
const isProperty = (key) => key !== "children" && !isEvent(key);
const isNew = (prev, next) => (key) => prev[key] !== next[key];
const isGone = (prev, next) => (key) => !(key in next);

function updateDom(dom, prevProps, nextProps) {
  // 删除事件监听
  Object.keys(prevProps)
    .filter(isEvent)
    .filter((key) => !(key in nextProps) || isNew(prevProps, nextProps)(key))
    .forEach((name) => {
      const eventType = name.toLowerCase().substring(2);
      dom.removeEventListener(eventType, prevProps[name]);
    });
  // 删除旧的属性
  Object.keys(prevProps)
    .filter(isProperty)
    .filter(isGone(prevProps, nextProps))
    .forEach((name) => {
      dom[name] = "";
    });
  // 设置新的属性
  Object.keys(nextProps)
    .filter(isProperty)
    .filter(isNew(prevProps, nextProps))
    .forEach((name) => {
      dom[name] = nextProps[name];
    });
  // 新增事件监听
  Object.keys(nextProps)
    .filter(isEvent)
    .filter(isNew(prevProps, nextProps))
    .forEach((name) => {
      const eventType = name.toLowerCase().substring(2);
      dom.addEventListener(eventType, nextProps[name]);
    });
}

function commitRoot() {
  deletions.forEach(commitWork);
  commitWork(wipRoot.child);
  currentRoot = wipRoot;
  wipRoot = null;
}

function commitWork(fiber) {
  if (!fiber) return;

  const domParent = fiber.parent.dom;

  // 处理fiber中的mutation
  if (fiber.flags === Placement && fiber.dom != null) {
    domParent.appendChild(fiber.dom);
  } else if (fiber.flags === Update && fiber.dom != null) {
    updateDom(fiber.dom, fiber.alternate.props, fiber.props);
  } else if (fiber.flags === Deletion) {
    domParent.removeChild(fiber.dom);
  }

  commitWork(fiber.child);
  commitWork(fiber.sibling);
}

function createDom(fiber) {
  const dom =
    fiber.type == "TEXT_ELEMENT"
      ? document.createTextNode("")
      : document.createElement(fiber.type);

  updateDom(dom, {}, fiber.props);

  return dom;
}

function performUnitOfWork(fiber) {
  // 创建DOM Node
  // fiber的dom链路
  if (!fiber.dom) {
    fiber.dom = createDom(fiber);
  }

  const elements = fiber.props.children;
  reconcileChildren(fiber, elements);

  // 返回下个工作单元
  if (fiber.child) {
    return fiber.child;
  }
  let nextFiber = fiber;
  while (nextFiber) {
    if (nextFiber.sibling) {
      return nextFiber.sibling;
    }
    nextFiber = nextFiber.parent;
  }
}

// 协调旧的fiber和新的dom节点
function reconcileChildren(wipFiber, elements) {
  // 创建Fiber
  let index = 0;
  let oldFiber = wipFiber.alternate && wipFiber.alternate.child;
  let prevSibling = null;

  while (index < elements.length || oldFiber != null) {
    const element = elements[index];
    let newFiber = null;

    // oldFiber是上次渲染的fiber，element是新的元素
    const sameType = oldFiber && element && element.type == oldFiber.type;

    if (sameType) {
      // 旧的fiber和新的element具有相同类型则保留element并更新

      // 创建新的fiber，但保留element节点
      newFiber = {
        type: oldFiber.type,
        props: element.props,
        dom: oldFiber.dom,
        parent: wipFiber,
        alternate: oldFiber,
        // flags用于commit阶段
        flags: Update, // 在旧版React是effectTag
      };
    }
    if (element && !sameType) {
      // 类型不一样且有新元素则创建
      newFiber = {
        type: element.type,
        props: element.props,
        dom: null,
        parent: wipFiber,
        alternate: null,
        flags: Placement,
      };
    }
    if (oldFiber && !sameType) {
      // 类型不一样且有旧的fiber则删除
      oldFiber.flags = Deletion;
      deletions.push(oldFiber);
    }

    // element时新的DOM 对比 oldFiber
    if (oldFiber) {
      oldFiber = oldFiber.sibling;
    }

    if (index === 0) {
      wipFiber.child = newFiber;
    } else if (element) {
      prevSibling.sibling = newFiber;
    }

    prevSibling = newFiber;
    index++;
  }
}

module.exports = { render };
