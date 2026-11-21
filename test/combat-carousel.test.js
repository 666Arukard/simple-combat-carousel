import { test } from "node:test";
import assert from "node:assert/strict";
import { portraitData, canEndTurn, conditionEffects, healthState, carouselRows, portraitImage } from "../model.js";

function fixture() {
  const player = { id: "player", isGM: false }, gm = { isGM: true };
  const make = (id, owned = false) => ({ id, name: id, visible: true, initiative: 12,
    actor: { testUserPermission: u => owned && u.id === player.id,
      system: { attributes: { ac: { value: 19 }, hp: { value: 30, max: 60 } } }, appliedEffects: [] } });
  const a = make("a"), b = make("b", true), hidden = { ...make("secret"), hidden: true };
  const combat = { started: true, turns: [a, b, hidden], combatant: b, nextCombatant: hidden };
  return { player, gm, a, b, hidden, combat };
}

test("Avatar ist Standard, Token wählbar; fehlende Bilder haben sichere Fallbacks", () => {
  const c = { actor: { img: "avatar.webp" }, img: "combat.webp", token: { texture: { src: "scene-token.webp" } } };
  assert.equal(portraitImage(c), "avatar.webp");
  assert.equal(portraitImage(c, "token"), "scene-token.webp");
  delete c.token;
  assert.equal(portraitImage(c, "token"), "combat.webp");
  delete c.img;
  assert.equal(portraitImage(c, "token"), "avatar.webp");
  assert.equal(portraitImage({}), "icons/svg/mystery-man.svg");
});
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

test("HP-Grenzen sind inklusive und ohne Rundung", () => {
  for (const [hp, state] of [[100,"healthy"],[50.01,"healthy"],[50,"bloodied"],[25.01,"bloodied"],[25,"critical"],[10.01,"critical"],[10,"danger"],[0,"danger"]])
    assert.equal(healthState(hp), state);
  assert.equal(healthState(undefined), undefined);
});

test("Passive Defense verschwindet, Zustände und temporäre Effekte bleiben", () => {
  const effects = [{ name: "Defense", statuses: new Set(), isTemporary: false },
    { name: "Poisoned", statuses: new Set(["poisoned"]) },
    { name: "Bless", isTemporary: true },
    { name: "Disabled", isTemporary: true, disabled: true },
    { name: "Suppressed", isTemporary: true, isSuppressed: true }];
  assert.deepEqual(conditionEffects({ appliedEffects: effects }).map(e => e.name), ["Poisoned", "Bless"]);
});

test("SC-Ansicht verbirgt NSC-Daten und folgt auch nach verstecktem aktivem NSC der Zugfolge", () => {
  const { combat, player, gm, a, b, hidden } = fixture();
  a.actor.type = b.actor.type = "character";
  hidden.actor.type = "npc";
  combat.combatant = hidden;
  const t = key => key;
  const rows = carouselRows(combat, player, t, true);
  assert.deepEqual(rows.map(p => p.id), ["npc-turn", "a", "b"]);
  assert.equal(rows[0].active, true);
  assert.equal(rows[0].name, "NPCTurn");
  assert.equal(rows[1].next, true);
  assert.equal(JSON.stringify(rows).includes("secret"), false);
  assert.equal(rows.some(p => "hpPercent" in p || "ac" in p), false);
  assert.equal(carouselRows(combat, gm, t, true).length, 3);
  combat.combatant = b;
  assert.deepEqual(carouselRows(combat, player, t, true).map(p => p.id), ["b", "a"]);
});
