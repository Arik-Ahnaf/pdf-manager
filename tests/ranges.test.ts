import assert from "node:assert/strict";
import test from "node:test";
import { formatPageSelection, rangePages } from "../src/lib/utils/ranges.ts";

test("expands valid ranges including the first and last page", () => {
  assert.deepEqual(rangePages("1", "3", 12), [1, 2, 3]);
  assert.deepEqual(rangePages("12", "12", 12), [12]);
});
test("invalid and incomplete ranges never select phantom pages", () => {
  for (const [from, to] of [
    ["", "3"],
    ["0", "3"],
    ["3", "1"],
    ["1", "13"],
    ["1.5", "3"],
    ["1e1", "12"],
    ["1", "Infinity"],
  ]) {
    assert.equal(rangePages(from, to, 12), null);
  }
});
test("formats unordered, overlapping, empty and disjoint selections", () => {
  assert.equal(formatPageSelection([5, 1, 3, 2, 3, 8, 9]), "1–3, 5, 8–9");
  assert.equal(formatPageSelection([]), "");
  assert.equal(formatPageSelection([12]), "12");
});
