// 优化render：将任务拆解为最小单元，如果有更高优先级的任务则中断渲染。
let nextUmitOfWork = null;

/**
 * 基本的render方法：
 * 但是有一个很大的问题是：当前是全量渲染，如果递归节点过多，将会阻塞渲染主线程。
 * @param {*} element
 * @param {*} container
 */
function render(element, container) {
  // root fiber
  nextUmitOfWork = {
    dom: container,
    props: {
      children: [element],
    },
  };

  // 文本类型的元素需要使用craeteTextNode创建文本元素，并设置属性nodeValue显示文本
  // 处理文本和元素
  /* 第一版 */
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

function workLoop(deadline) {
  let shouldYield = false;
  while (nextUmitOfWork && !shouldYield) {
    nextUmitOfWork = performUnitOfWork(nextUmitOfWork);
    shouldYield = deadline.timeRemaining() < 1;
  }
  requestIdleCallback(workLoop);
}

/**
 * requestIdleCallback利用了浏览器的空闲的工作时间执行低优先级任务，并且不会影响用户的io等高优先级任务。
 * React已经不使用requestIdleCallback了，但是概念还是以利用空闲时间
 * https://github.com/facebook/react/issues/11171#issuecomment-417349573
 */
requestIdleCallback(workLoop);

function performUnitOfWork(fiber) {
  // 创建DOM Node
  // fiber的dom链路
  if (!fiber.dom) {
    fiber.dom = createDom(fiber);
  }

  if (fiber.parent) {
    fiber.parent.dom.appendChild(fiber.dom);
  }

  // 创建Fiber
  const elements = fiber.props.children;
  let index = 0;
  let prevSibling = null;

  while (index < elements.length) {
    const element = elements[index];
    const newFiber = {
      type: element.type,
      props: element.props,
      parent: fiber,
      dom: null,
    };

    if (index === 0) {
      fiber.child = newFiber;
    } else {
      prevSibling.sibling = newFiber;
    }

    prevSibling = newFiber;
    index++;
  }

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

module.exports = { render };
