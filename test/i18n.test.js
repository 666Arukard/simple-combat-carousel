import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { catalogs } from "../locales.js";
import { translate, languageCode } from "../i18n.js";

test("complete, synchronized German and English translations", () => {
  assert.deepEqual(Object.keys(catalogs.de).sort(), Object.keys(catalogs.en).sort());
  for (const lang of ["de", "en"]) {
    assert.deepEqual(catalogs[lang], JSON.parse(fs.readFileSync(new URL(`../lang/${lang}.json`, import.meta.url), "utf8")));
    for (const value of Object.values(catalogs[lang])) assert.ok(typeof value === "string" && value.trim());
  }
  const source = fs.readFileSync(new URL("../carousel.js", import.meta.url), "utf8");
  for (const match of source.matchAll(/\bt\("([A-Za-z]+)"/g))
    assert.ok(catalogs.en[`SCC.${match[1]}`], `Missing ${match[1]}`);
});

test("automatic selection, explicit overrides, fallbacks and formatting", () => {
  assert.equal(languageCode("auto", "de-DE"), "de");
  assert.equal(languageCode("auto", "fr"), "en");
  assert.equal(translate("Active", {}, "en", "de"), "Current turn");
  assert.equal(translate("Active", {}, "de", "en"), "Am Zug");
  assert.equal(translate("AC", { value: 17 }, "en"), "AC 17");
  assert.equal(translate("AC", { value: 17 }, "de"), "RK 17");
  assert.equal(translate("CompactRound", { round: 2 }, "en"), "Combat · Round 2");
});
