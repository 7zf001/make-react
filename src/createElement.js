/**
 *  transform the JSX to JS
 * @param {string} type
 * @param {object} props
 * @param  {...any} children
 */
function createElement(type, props, ...children) {
  return {
    type,
    props: {
      ...props,
      children: children.map((child) =>
        typeof child === "object" ? child : createTextElement(child)
      ),
    },
  };
}

function createTextElement(text) {
  return {
    type: "TEXT_ELEMENT",
    props: {
      nodeValue: text,
      children: [], // 简化
    },
  };
}

module.exports = {createElement, createTextElement};
