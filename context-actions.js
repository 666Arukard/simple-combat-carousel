import { portraitPreferences } from "./model.js";

export const FRAME_ACTIONS = { frameNone: "none", frameOrnate: "ornate", frameAlly: "ally", frameEnemy: "enemy", frameBoss: "boss" };
export const PORTRAIT_ACTIONS = ["sourceDefault", "sourceAvatar", "sourceToken", ...Object.keys(FRAME_ACTIONS)];

export function portraitMenuOptions(combatant) {
  const preferences = portraitPreferences(combatant);
  return {
    sourceDefault: ["SourceDefault", "fa-solid fa-rotate-left", preferences.source === "default"],
    sourceAvatar: ["SourceAvatar", "fa-solid fa-user", preferences.source === "avatar"],
    sourceToken: ["SourceToken", "fa-solid fa-circle-user", preferences.source === "token"],
    ...Object.fromEntries(Object.entries(FRAME_ACTIONS).map(([action, frame]) =>
      [action, [action[0].toUpperCase() + action.slice(1), frame === "boss" ? "fa-solid fa-crown" : "fa-solid fa-image", preferences.frame === frame]]))
  };
}

export function addPortraitMenuEntries(application, menuItems, { game, translate, onError }) {
  if (!game.user.isGM) return;
  const combat = application.viewed ?? game.combat;
  if (!combat?.combatants) return;
  const resolve = element => combat.combatants.get(element?.dataset?.combatantId ?? element?.dataset?.entryId);
  for (const action of PORTRAIT_ACTIONS) {
    const [label, icon] = portraitMenuOptions(null)[action];
    menuItems.push({ name: translate(label), icon: `<i class="${icon}"></i>`,
      condition: element => game.user.isGM && Boolean(resolve(element)),
      callback: async element => {
        const c = resolve(element);
        if (!c || !game.user.isGM) return;
        try { await applyPortraitAction(action, c, game.user); }
        catch (error) { onError(error); }
      }
    });
  }
}

export async function applyPortraitAction(action, combatant, user) {
  if (!user.isGM || !combatant || ![...PORTRAIT_ACTIONS, "featured"].includes(action)) return false;
  const scope = "rpg-suite-combat-carousel";
  if (action === "featured")
    await combatant.setFlag(scope, "frameStyle", portraitPreferences(combatant).featured ? "none" : "ornate");
  else if (Object.hasOwn(FRAME_ACTIONS, action))
    await combatant.setFlag(scope, "frameStyle", FRAME_ACTIONS[action]);
  else
    await combatant.setFlag(scope, "imageSource", { sourceDefault: "default", sourceAvatar: "avatar", sourceToken: "token" }[action]);
  return true;
}

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
  if (user.isGM) actions.push(...PORTRAIT_ACTIONS);
  return actions;
}

export async function runContextAction(action, combatId, combatantId, { game, canvas, tracker }) {
  // Resolve documents again: permissions, scene, visibility and combat may have changed.
  const combat = game.combat;
  if (combat?.id !== combatId) return false;
  const combatant = combat.combatants.get(combatantId);
  if (!contextActions(combatant, game.user, canvas).includes(action)) return false;
  if (PORTRAIT_ACTIONS.includes(action)) return applyPortraitAction(action, combatant, game.user);
  if (action === "ping") return canvas.ping(pingToken(combatant, game.user, canvas).center);
  // Foundry V14 handlers retain the sidebar's token/status synchronization.
  const handler = action === "hidden" ? "_onToggleHidden" : "_onToggleDefeatedStatus";
  if (typeof tracker?.[handler] !== "function") throw new Error(`Combat tracker handler unavailable: ${handler}`);
  await tracker[handler](combatant);
  return true;
}
