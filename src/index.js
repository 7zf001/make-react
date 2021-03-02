const { createElement } = require("./createElement");
const { render, useState } = require("./render");

const MakeR = {
  createElement,
  render,
  useState,
};

/** 强制修改babel转换的函数名 */
/** @jsx MakeR.createElement */
function Counter() {
  const [state, setState] = MakeR.useState(1);

  return (
    <div>
      <h1 onClick={() => setState((c) => c + 1)}>Count: {state}</h1>
    </div>
  );
}

const element = <Counter />;
const container = document.getElementById("root");
MakeR.render(element, container);
