import { test } from "node:test";
import assert from "node:assert/strict";
import { portraitData, canEndTurn } from "../model.js";

function fixture() {
  const player = { id: "player", isGM: false }, gm = { isGM: true };
  const make = (id, owned = false) => ({ id, name: id, visible: true, initiative: 12,
    actor: { testUserPermission: u => owned && u.id === player.id,
      system: { attributes: { ac: { value: 19 }, hp: { value: 30, max: 60 } } }, appliedEffects: [] } });
  const a = make("a"), b = make("b", true), hidden = { ...make("secret"), hidden: true };
  const combat = { started: true, turns: [a, b, hidden], combatant: b, nextCombatant: hidden };
  return { player, gm, a, b, hidden, combat };
}
test("Spieler erhalten weder RK noch HP, auch bei eigenen Akteuren; versteckte Gegner fehlen", () => {
  const { combat, player } = fixture();
  const rows = portraitData(combat, player);
  assert.deepEqual(rows.map(r => r.id), ["b", "a"]);
  for (const row of rows) { assert.equal("ac" in row, false); assert.equal("hpPercent" in row, false); }
  assert.equal(rows[0].active, true);
  assert.equal(rows[1].roundBreak, true);
  assert.equal(rows.some(r => r.next), false);
});
test("SL erhält Balken, RK und versteckte Teilnehmer", () => {
  const { combat, gm } = fixture();
  const rows = portraitData(combat, gm);
  assert.deepEqual(rows.map(r => r.id), ["b", "secret", "a"]);
  assert.equal(rows[0].hpPercent, 50); assert.equal(rows[0].ac, 19);
  assert.equal(rows[1].next, true);
});
test("Zug beenden erfordert aktiven Kampf, aktuellen Teilnehmer und Eigentum oder SL", () => {
  const { combat, player, gm, a, b } = fixture();
  assert.equal(canEndTurn(combat, b, player), true);
  assert.equal(canEndTurn(combat, a, player), false);
  assert.equal(canEndTurn(combat, a, gm), false);
  combat.combatant = a;
  assert.equal(canEndTurn(combat, a, player), false);
  assert.equal(canEndTurn(combat, a, gm), true);
  combat.started = false;
  assert.equal(canEndTurn(combat, a, gm), false);
});
