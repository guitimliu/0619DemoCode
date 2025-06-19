const isEven = require("./utils");

test("returns true for even number", () => {
  expect(isEven(4)).toBe(true);
});

test("returns false for odd number", () => {
  expect(isEven(5)).toBe(false);
});
