const { createElement, createTextElement } = require("../createElement");

describe("createElement测试", () => {
  test("createElement 返回值", () => {
    expect(createElement("div")).toMatchObject({
      type: "div",
      props: { children: [] },
    });

    expect(createElement("div", null, "a")).toMatchObject({
      type: "div",
      props: {
        children: [createTextElement("a")],
      },
    });

    expect(createElement("div", null, "a", "b")).toMatchObject({
      type: "div",
      props: {
        children: [createTextElement("a"), createTextElement("b")],
      },
    });
  });
});
