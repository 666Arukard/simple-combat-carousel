import { test } from "node:test";
import assert from "node:assert/strict";

test("Steuerung liegt außerhalb der Avatare; SL-Balken sind abschaltbar", async () => {
  class Element {
    constructor(tag) { this.tag = tag; this.children = []; this.style = { setProperty() {} }; }
    append(...nodes) { this.children.push(...nodes); }
    setAttribute() {}
    addEventListener(event, callback) { this[event] = callback; }
    getBoundingClientRect() { return { width: 200, height: 100 }; }
    focus() { document.activeElement = this; }
    remove() { document.body.children = document.body.children.filter(c => c !== this); }
    querySelectorAll(tag) { return this.children.flatMap(c => [...(c.tag === tag ? [c] : []), ...c.querySelectorAll(tag)]); }
  }
  const hooks = new Map(), settings = new Map();
  globalThis.document = { createElement: tag => new Element(tag), body: new Element("body"), addEventListener() {} };
  globalThis.innerWidth = 1200; globalThis.innerHeight = 800;
  globalThis.Hooks = { once: (name, fn) => hooks.set(name, fn), on() {} };
  globalThis.requestAnimationFrame = callback => callback();
  const actor = { testUserPermission: () => true, system: { attributes: { hp: { value: 5, max: 10 } } } };
  const c = { id: "a", name: "Amiel", actor };
  globalThis.game = { i18n: { lang: "de" }, user: { isGM: true }, modules: new Map(),
    combat: { id: "combat", turns: [c], combatant: c, started: true, round: 2 },
    settings: { register: (id, key, config) => settings.set(key, config), get: (id, key) => settings.get(key).default,
      set: async (id, key, value) => { settings.get(key).default = value; settings.get(key).onChange(); } } };
  await import("../carousel.js");
  hooks.get("init")(); hooks.get("ready")();
  const root = () => document.body.children[0];
  const descendants = node => [node, ...node.children.flatMap(descendants)];
  const find = cls => descendants(root()).filter(n => n.className?.split(" ").includes(cls));
  assert.equal(settings.get("showHealthBars").default, true);
  assert.equal(find("rsc-hp").length, 1);
  assert.equal(find("rsc-card")[0].querySelectorAll("button").length, 0);
  assert.equal(find("rsc-controls-left")[0].querySelectorAll("button").length, 4);
  const diceButtons = find("rsc-controls-left")[0].querySelectorAll("button").slice(0, 2);
  for (const button of diceButtons) assert.equal(button.children[0].className, "fa-solid fa-dice-d20");
  actor.system.attributes.hp.value = 1;
  settings.get("showHealthBars").onChange();
  assert.equal(find("rsc-danger-overlay").length, 1);
  assert.equal(find("rsc-hp")[0].className, "rsc-hp is-danger");
  assert.equal(find("rsc-controls-right")[0].querySelectorAll("button").length, 2);
  settings.get("showHealthBars").default = false;
  settings.get("showHealthBars").onChange();
  assert.equal(find("rsc-hp").length, 0);
  assert.equal(find("rsc-danger-overlay").length, 0);
  game.user.isGM = false;
  settings.get("showHealthBars").default = true;
  settings.get("showHealthBars").onChange();
  assert.equal(find("rsc-hp").length, 0);
  assert.equal(find("rsc-controls-left")[0].querySelectorAll("button").length, 0);
  const end = find("rsc-controls-right")[0].querySelectorAll("button")[0];
  assert.equal(end.disabled, false);
  actor.testUserPermission = () => false;
  settings.get("showHealthBars").onChange();
  assert.equal(find("rsc-controls-right")[0].querySelectorAll("button")[0].disabled, true);
  await find("rsc-toggle")[0].click({ stopPropagation() {} });
  assert.equal(settings.get("collapsed").default, true);
  assert.equal(find("rsc-card").length, 0);
  assert.equal(find("rsc-controls-right").length, 0);
  assert.equal(find("is-collapsed").length, 1);
  assert.equal(find("rsc-compact-label")[0].textContent, "Kampf · Runde 2");
  assert.equal(find("rsc-compact-end")[0].disabled, true);
  let advances = 0;
  game.combat.nextTurn = async () => { advances++; };
  actor.testUserPermission = () => true;
  settings.get("collapsed").onChange();
  assert.equal(find("rsc-compact-end")[0].disabled, false);
  await find("rsc-compact-end")[0].click({ stopPropagation() {} });
  assert.equal(advances, 1);
  // Ownership can change after rendering: recheck before advancing.
  actor.testUserPermission = () => false;
  await find("rsc-compact-end")[0].click({ stopPropagation() {} });
  assert.equal(advances, 1);
  game.user.isGM = true;
  settings.get("collapsed").onChange();
  assert.equal(find("rsc-compact-end")[0].disabled, false);
  await find("rsc-compact-end")[0].click({ stopPropagation() {} });
  assert.equal(advances, 2);
  game.user.isGM = false;
  settings.get("collapsed").onChange();
  assert.deepEqual(find("rsc-compact-name").map(n => n.textContent), ["Amiel", "–"]);
  const next = { id: "b", name: "Garret", actor };
  game.combat.turns.push(next);
  game.combat.nextCombatant = next;
  settings.get("collapsed").onChange();
  assert.deepEqual(find("rsc-compact-name").map(n => n.textContent), ["Amiel", "Garret"]);
  next.hidden = true;
  settings.get("collapsed").onChange();
  assert.deepEqual(find("rsc-compact-name").map(n => n.textContent), ["Amiel", "–"]);
  game.combat.round = 3;
  settings.get("collapsed").onChange();
  assert.equal(find("rsc-compact-label")[0].textContent, "Kampf · Runde 3");
  await find("rsc-toggle")[0].click({ stopPropagation() {} });
  assert.equal(settings.get("collapsed").default, false);
  assert.equal(find("rsc-card").length, 1);
  await game.settings.set("rpg-suite-combat-carousel", "language", "en");
  assert.equal(find("rsc-order")[0].textContent, "Current turn");
  assert.equal(find("rsc-round")[0].textContent, "Round 3");
  await find("rsc-toggle")[0].click({ stopPropagation() {} });
  assert.equal(find("rsc-compact-role")[0].textContent, "Current turn");
  assert.equal(find("rsc-compact-role")[1].textContent, "Up next");
  assert.equal(find("rsc-compact-label")[0].textContent, "Combat · Round 3");
  await game.settings.set("rpg-suite-combat-carousel", "language", "de");
  assert.equal(find("rsc-compact-role")[0].textContent, "Am Zug");
  game.user.isGM = true;
  c.token = { parent: { id: "scene" }, object: { center: { x: 20, y: 30 }, isVisible: true } };
  game.combat.combatants = new Map([[c.id, c]]);
  globalThis.canvas = { ready: true, scene: { id: "scene" }, ping: async () => {} };
  let hiddenToggles = 0;
  globalThis.ui = { combat: { _onToggleHidden: async () => hiddenToggles++ } };
  settings.get("collapsed").onChange();
  const contextEvent = { preventDefault() {}, stopPropagation() {}, clientX: 1199, clientY: 799 };
  find("rsc-compact-frame")[0].contextmenu(contextEvent);
  let menu = document.body.children.find(c => c.className === "rsc-context-menu");
  assert.equal(menu.querySelectorAll("button").length, 3);
  assert.equal(menu.style.left, "996px");
  await menu.querySelectorAll("button")[0].click({ stopPropagation() {} });
  assert.equal(hiddenToggles, 1);
  assert.equal(document.body.children.some(c => c.className === "rsc-context-menu"), false);
  await game.settings.set("rpg-suite-combat-carousel", "collapsed", false);
  game.user.isGM = false;
  settings.get("collapsed").onChange();
  find("rsc-card")[0].contextmenu(contextEvent);
  menu = document.body.children.find(c => c.className === "rsc-context-menu");
  assert.equal(menu.querySelectorAll("button").length, 1);
});
