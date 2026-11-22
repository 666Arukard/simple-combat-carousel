import { test } from "node:test";
import assert from "node:assert/strict";
import { contextActions, runContextAction, openCombatantSheet } from "../context-actions.js";

function fixture() {
  const token = { center: { x: 100, y: 200 }, isVisible: true };
  const combatant = { id: "a", token: { parent: { id: "scene" }, object: token } };
  const game = { user: { isGM: true }, combat: { id: "combat", combatants: new Map([["a", combatant]]) } };
  const calls = [];
  const canvas = { ready: true, scene: { id: "scene" }, ping: async p => calls.push(["ping", p]) };
  const tracker = { _onToggleHidden: async c => calls.push(["hidden", c]),
    _onToggleDefeatedStatus: async c => calls.push(["defeated", c]) };
  return { token, combatant, game, canvas, tracker, calls };
}

test("Bogen öffnet für SL und berechtigte Spieler mit nativer eingeschränkter Ansicht", async () => {
  const f = fixture(); let opened = 0;
  f.combatant.actor = { sheet: { render: async force => { assert.equal(force, true); opened++; } },
    testUserPermission: (user, level) => { assert.equal(level, "LIMITED"); return true; } };
  assert.equal(await openCombatantSheet("combat", "a", f.game), true);
  f.game.user.isGM = false;
  assert.equal(await openCombatantSheet("combat", "a", f.game), true);
  assert.equal(opened, 2);
  f.combatant.actor.testUserPermission = () => false;
  assert.equal(await openCombatantSheet("combat", "a", f.game), false);
  f.combatant.actor.testUserPermission = () => true;
  f.combatant.hidden = true;
  assert.equal(await openCombatantSheet("combat", "a", f.game), false);
  assert.equal(await openCombatantSheet("old-combat", "a", f.game), false);
  assert.equal(await openCombatantSheet("combat", "npc-turn", f.game), false);
  assert.equal(opened, 2);
});

test("SL-Aktionen verwenden Foundrys CombatTracker-Handler, Ping verwendet die Tokenmitte", async () => {
  const f = fixture();
  assert.deepEqual(contextActions(f.combatant, f.game.user, f.canvas), ["hidden", "defeated", "ping"]);
  for (const action of ["hidden", "defeated", "ping"]) await runContextAction(action, "combat", "a", f);
  assert.deepEqual(f.calls.map(c => c[0]), ["hidden", "defeated", "ping"]);
  assert.deepEqual(f.calls[2][1], { x: 100, y: 200 });
});

test("Spieler erhalten nur Ping und können keine SL-Aktionen aufrufen", async () => {
  const f = fixture(); f.game.user.isGM = false;
  assert.deepEqual(contextActions(f.combatant, f.game.user, f.canvas), ["ping"]);
  assert.equal(await runContextAction("hidden", "combat", "a", f), false);
  assert.equal(await runContextAction("defeated", "combat", "a", f), false);
  assert.equal(f.calls.length, 0);
});

test("Versteckte, unsichtbare und szenenfremde Tokens können von Spielern nicht angepingt werden", () => {
  const f = fixture(); f.game.user.isGM = false;
  for (const hide of [() => f.combatant.hidden = true, () => f.token.isVisible = false,
    () => f.combatant.token.hidden = true, () => f.combatant.token.parent.id = "other"]) {
    f.combatant.hidden = false; f.token.isVisible = true; f.combatant.token.hidden = false; f.combatant.token.parent.id = "scene";
    hide(); assert.deepEqual(contextActions(f.combatant, f.game.user, f.canvas), []);
  }
});

test("Berechtigung, Szenenwechsel und gelöschte Teilnehmer werden beim Ausführen erneut geprüft", async () => {
  const f = fixture();
  f.game.user.isGM = false; f.canvas.scene.id = "other";
  assert.equal(await runContextAction("ping", "combat", "a", f), false);
  f.game.user.isGM = true;
  assert.equal(await runContextAction("hidden", "old-combat", "a", f), false);
  f.game.combat.combatants.clear();
  assert.equal(await runContextAction("defeated", "combat", "a", f), false);
  assert.equal(f.calls.length, 0);
});
