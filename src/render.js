function render(element, container) {
  const dom =
    element.type === "TEXT_ELEMENT"
      ? document.createTextNode("")
      : document.createElement(element.type);

  // 分配props对节点
  const isProperty = (key) => key !== "children";
  Object.keys(element.props)
    .filter(isProperty)
    .forEach((name) => {
      dom[name] = element.props[name];
    });

  // 递归render
  element.props.children.forEach((child) => {
    render(child, dom);
  });
  if (container) {
    container.appendChild(dom);
  }
}

module.exports = { render };
