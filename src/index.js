const { createElement } = require("./createElement");
const { render } = require("./render");

const MakeR = {
  createElement,
  render,
};

/** 强制修改babel转换的函数名 */
/** @jsx MakeR.createElement */
const container = document.getElementById("root");

function App(props) {
  return <h1>Hi {props.name}</h1>
}
const element = <App name="foo" />
MakeR.render(element, container)