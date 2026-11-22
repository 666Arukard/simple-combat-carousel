export function pingToken(combatant, user, canvas) {
  const document = combatant?.token;
  if (!canvas?.ready || document?.parent?.id !== canvas.scene?.id) return null;
  const token = document.object;
  if (!token?.center || (!user.isGM && (combatant.hidden || combatant.visible === false
    || document.hidden || !token.isVisible))) return null;
  return token;
}

export async function openCombatantSheet(combatId, combatantId, game) {
  if (game.combat?.id !== combatId) return false;
  const combatant = game.combat.combatants.get(combatantId);
  const actor = combatant?.actor;
  if (!actor?.sheet || (!game.user.isGM && (combatant.hidden || combatant.visible === false
    || !actor.testUserPermission(game.user, "LIMITED")))) return false;
  // Foundry's sheet selects the permitted full/limited presentation for this user.
  await actor.sheet.render(true);
  return true;
}

export function contextActions(combatant, user, canvas) {
  if (!combatant) return [];
  const actions = user.isGM ? ["hidden", "defeated"] : [];
  if (pingToken(combatant, user, canvas)) actions.push("ping");
  return actions;
}

export async function runContextAction(action, combatId, combatantId, { game, canvas, tracker }) {
  // Resolve documents again: permissions, scene, visibility and combat may have changed.
  const combat = game.combat;
  if (combat?.id !== combatId) return false;
  const combatant = combat.combatants.get(combatantId);
  if (!contextActions(combatant, game.user, canvas).includes(action)) return false;
  if (action === "ping") return canvas.ping(pingToken(combatant, game.user, canvas).center);
  // Foundry V14 handlers retain the sidebar's token/status synchronization.
  const handler = action === "hidden" ? "_onToggleHidden" : "_onToggleDefeatedStatus";
  if (typeof tracker?.[handler] !== "function") throw new Error(`Combat tracker handler unavailable: ${handler}`);
  await tracker[handler](combatant);
  return true;
}
