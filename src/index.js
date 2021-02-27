const { createElement } = require("./createElement");
const { render } = require("./render");

const MakeR = {
  createElement,
  render,
};

/** 强制修改babel转换的函数名 */
/** @jsx MakeR.createElement */
const element = (
  <div id="foo">
    <span>bar</span>
    <div style="width: 100px; height: 100px; background: red" />
  </div>
);

const container = document.getElementById("root");
MakeR.render(element, container);
