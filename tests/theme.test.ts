import assert from "node:assert/strict";
import test from "node:test";
import { runInNewContext } from "node:vm";
import {
  resolveTheme,
  themeInitScript,
  THEME_STORAGE_KEY,
} from "../src/lib/utils/theme.ts";

test("defaults to dark and accepts only explicit light preferences", () => {
  assert.equal(resolveTheme(null), "dark");
  assert.equal(resolveTheme("dark"), "dark");
  assert.equal(resolveTheme("light"), "light");
  assert.equal(resolveTheme("system"), "dark");
  assert.equal(resolveTheme("invalid"), "dark");
});

test("initializes the saved theme before paint and reads only the theme key", () => {
  for (const saved of [null, "dark", "light", "invalid"]) {
    const document = { documentElement: { dataset: { theme: "dark" } } };
    const keys: string[] = [];
    runInNewContext(themeInitScript, {
      document,
      localStorage: {
        getItem(key: string) {
          keys.push(key);
          return saved;
        },
      },
    });
    assert.equal(document.documentElement.dataset.theme, resolveTheme(saved));
    assert.deepEqual(keys, [THEME_STORAGE_KEY]);
  }
});

test("keeps the default dark theme when storage is unavailable", () => {
  const document = { documentElement: { dataset: { theme: "dark" } } };
  assert.doesNotThrow(() =>
    runInNewContext(themeInitScript, {
      document,
      localStorage: {
        getItem() {
          throw new Error("Storage blocked");
        },
      },
    }),
  );
  assert.equal(document.documentElement.dataset.theme, "dark");
});
