import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { catalogs } from "../locales.js";
import { translate, languageCode, localizeModuleSettings, MODULE_ID } from "../i18n.js";

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

test("Alle Einstellungsbeschriftungen, Hinweise und Auswahlen folgen der gespeicherten Modulsprache", () => {
  const keys = ["language", "healthOrange", "healthRed", "healthOverlay", "imageSource", "onlyStarted", "gmOnlyStarted", "playersOnly", "collapsed", "showHealthBars", "enabled", "portraitSize"];
  const settings = new Map(keys.map(k => [`${MODULE_ID}.${k}`, { name: "stale English", hint: "stale English" }]));
  let language = "de";
  const game = { i18n: { lang: "en" }, settings: { settings, get: () => language } };
  localizeModuleSettings(game);
  assert.equal(settings.get(`${MODULE_ID}.imageSource`).name, "Porträt-Bildquelle");
  assert.equal(settings.get(`${MODULE_ID}.imageSource`).choices.avatar, "Avatar-Bild (Standard)");
  assert.equal(settings.get(`${MODULE_ID}.onlyStarted`).name, "Spieler: erst nach Kampfstart anzeigen");
  assert.equal(settings.get(`${MODULE_ID}.language`).choices.auto, "Automatisch (Foundry-Sprache)");
  for (const key of keys) assert.notEqual(settings.get(`${MODULE_ID}.${key}`).name, "stale English");
  language = "en"; game.i18n.lang = "de";
  localizeModuleSettings(game);
  assert.equal(settings.get(`${MODULE_ID}.imageSource`).name, "Portrait image source");
  assert.equal(settings.get(`${MODULE_ID}.playersOnly`).name, "Player view: player characters only");
  language = "auto";
  localizeModuleSettings(game);
  assert.equal(settings.get(`${MODULE_ID}.imageSource`).name, "Porträt-Bildquelle");
});
