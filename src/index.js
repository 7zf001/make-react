const { createElement } = require("./createElement");
const { render } = require("./render");

const MakeR = {
  createElement,
  render,
};

/** 强制修改babel转换的函数名 */
/** @jsx MakeR.createElement */
const container = document.getElementById("root");

const updateValue = (e) => {
  rerender(e.target.value);
};

const rerender = (value) => {
  const element = (
    <div>
      <input onInput={updateValue} value={value} />
      <h2>Hello {value}</h2>
    </div>
  );
  MakeR.render(element, container);
};

rerender("World");
