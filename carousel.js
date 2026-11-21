import { canEndTurn, carouselRows, healthState } from "./model.js";
import { t } from "./i18n.js";
import { contextActions, runContextAction } from "./context-actions.js";

const ID = "rpg-suite-combat-carousel";
let root, busy = false, scheduled = false;
let contextMenu, contextListeners;
const el = (tag, cls, text) => {
  const node = document.createElement(tag);
  if (cls) node.className = cls;
  if (text !== undefined) node.textContent = text;
  return node;
};

function button(parent, label, icon, action, disabled = false) {
  const b = el("button", "rsc-button", icon.startsWith("fa-") ? undefined : icon);
  if (icon.startsWith("fa-")) {
    const glyph = el("i", icon); glyph.setAttribute("aria-hidden", "true"); b.append(glyph);
  }
  b.type = "button"; b.title = label; b.setAttribute("aria-label", label);
  b.disabled = disabled || busy;
  b.addEventListener("click", async event => {
    event.stopPropagation();
    if (busy) return;
    busy = true;
    root?.querySelectorAll("button").forEach(b => b.disabled = true);
    try { await action(); }
    catch (error) { console.error(ID, error); ui.notifications.error(t("ActionFailed")); }
    finally { busy = false; render(); }
  });
  parent.append(b);
  return b;
}

function closeContextMenu() {
  contextListeners?.abort(); contextListeners = null;
  contextMenu?.remove(); contextMenu = null;
}

function bindContextMenu(element, combat, portrait) {
  if (portrait.placeholder) return;
  element.tabIndex = 0;
  element.addEventListener("contextmenu", event => {
    event.preventDefault(); event.stopPropagation(); closeContextMenu();
    if (busy || game.combat?.id !== combat.id) return;
    const combatant = combat.combatants.get(portrait.id);
    const canvas = globalThis.canvas;
    const actions = contextActions(combatant, game.user, canvas);
    if (!actions.length) return;
    const menu = el("nav", "rsc-context-menu"); contextMenu = menu;
    menu.setAttribute("role", "menu"); menu.setAttribute("aria-label", portrait.name);
    const options = {
      hidden: [combatant.hidden ? "Show" : "Hide", "fa-solid fa-eye-slash"],
      defeated: [combatant.isDefeated ? "Undefeat" : "Defeat", "fa-solid fa-skull"],
      ping: ["Ping", "fa-solid fa-bullseye"]
    };
    for (const action of actions) {
      const [label, icon] = options[action];
      const item = button(menu, t(label), icon, async () => {
        closeContextMenu();
        await runContextAction(action, combat.id, portrait.id, { game, canvas: globalThis.canvas, tracker: ui.combat });
      });
      item.append(el("span", "rsc-menu-label", t(label)));
      item.setAttribute("role", "menuitem");
    }
    document.body.append(menu);
    const bounds = menu.getBoundingClientRect();
    menu.style.left = `${Math.max(4, Math.min(event.clientX, globalThis.innerWidth - bounds.width - 4))}px`;
    menu.style.top = `${Math.max(4, Math.min(event.clientY, globalThis.innerHeight - bounds.height - 4))}px`;
    contextListeners = new AbortController();
    const optionsListener = { capture: true, signal: contextListeners.signal };
    document.addEventListener("pointerdown", e => { if (!menu.contains(e.target)) closeContextMenu(); }, optionsListener);
    document.addEventListener("scroll", closeContextMenu, optionsListener);
    document.addEventListener("keydown", e => {
      if (e.key === "Escape") { closeContextMenu(); element.focus(); }
      if (["ArrowDown", "ArrowUp"].includes(e.key)) {
        e.preventDefault();
        const items = [...menu.querySelectorAll("button")];
        const index = items.indexOf(document.activeElement);
        items[(index + (e.key === "ArrowDown" ? 1 : -1) + items.length) % items.length].focus();
      }
    }, optionsListener);
    menu.querySelectorAll("button")[0]?.focus();
  });
}

function render() {
  closeContextMenu();
  root?.remove(); root = null;
  const combat = game.combat;
  if (!game.settings.get(ID, "enabled") || !combat?.turns?.length
    || (game.settings.get(ID, "onlyStarted") && !combat.started)) return;
  root = el("section", "rsc-carousel"); root.id = ID;
  root.setAttribute("aria-label", t("Order"));
  root.style.setProperty("--rsc-size", `${game.settings.get(ID, "portraitSize")}px`);
  const rows = carouselRows(combat, game.user, t, game.settings.get(ID, "playersOnly"), game.settings.get(ID, "imageSource"));
  const showHealth = game.user.isGM && game.settings.get(ID, "showHealthBars");
  const collapsed = game.settings.get(ID, "collapsed");
  const toggle = button(root, t(collapsed ? "Expand" : "Collapse"), collapsed ? "▾" : "▴",
    () => game.settings.set(ID, "collapsed", !game.settings.get(ID, "collapsed")));
  toggle.className += " rsc-toggle";
  toggle.setAttribute("aria-expanded", String(!collapsed));
  if (collapsed) {
    root.className += " is-collapsed";
    root.append(el("span", "rsc-compact-label", t("CompactRound", { round: combat.round ?? 0 })));
    for (const [label, participant] of [[t("Active"), rows.find(p => p.active)], [t("Next"), rows.find(p => p.next)]]) {
      const slot = el("div", "rsc-compact-participant");
      if (participant) {
        const frame = el("span", "rsc-compact-frame");
        const image = el("img", "rsc-compact-avatar");
        image.src = participant.img; image.alt = participant.name;
        frame.append(image);
        bindContextMenu(frame, combat, participant);
        if (showHealth && healthState(participant.hpPercent) === "danger")
          frame.append(el("span", "rsc-danger-overlay"));
        slot.append(frame);
      }
      const text = el("div", "rsc-compact-text");
      text.append(el("span", "rsc-compact-role", label));
      const name = el("span", "rsc-compact-name", participant?.name ?? "–");
      name.title = participant?.name ?? "";
      text.append(name); slot.append(text); root.append(slot);
    }
    const endTurn = button(root, t("EndTurn"), "➜", async () => {
      if (game.combat?.id === combat.id && canEndTurn(combat, combat.combatant, game.user))
        await combat.nextTurn();
    }, !canEndTurn(combat, combat.combatant, game.user));
    endTurn.className += " rsc-compact-end";
    document.body.append(root);
    return;
  }
  const controls = el("div", "rsc-controls rsc-controls-left");
  const rightControls = el("div", "rsc-controls rsc-controls-right");
  controls.append(el("span", "rsc-round", t("Round", { round: combat.round ?? 0 })));
  if (game.user.isGM) {
    const gmAction = method => async () => {
      if (game.user.isGM && game.combat?.id === combat.id) await combat[method]();
    };
    button(controls, t("RollNPC"), "fa-solid fa-dice-d20", gmAction("rollNPC"));
    button(controls, t("RollAll"), "fa-solid fa-dice-d20", gmAction("rollAll"));
    button(controls, t("PreviousTurn"), "‹", gmAction("previousTurn"), !combat.started);
    button(controls, t("PreviousRound"), "«", gmAction("previousRound"), !combat.started || combat.round <= 1);
    if (!combat.started) button(rightControls, t("Start"), "▶", gmAction("startCombat"));
    else {
      button(rightControls, t("Advance"), "➜", gmAction("nextTurn"));
      button(rightControls, t("NextRound"), "»", gmAction("nextRound"));
    }
  } else {
    button(rightControls, t("EndOwnTurn"), "➜", async () => {
      if (game.combat?.id === combat.id && canEndTurn(combat, combat.combatant, game.user))
        await combat.nextTurn();
    }, !canEndTurn(combat, combat.combatant, game.user));
  }
  root.append(controls);
  const portraits = el("div", "rsc-portraits");
  for (const p of rows) {
    if (p.roundBreak) portraits.append(el("span", "rsc-break", "↻"));
    const card = el("article", `rsc-card${p.active ? " is-active" : ""}${p.next ? " is-next" : ""}${p.defeated ? " is-defeated" : ""}`);
    bindContextMenu(card, combat, p);
    card.setAttribute("aria-label", `${p.name}${p.active ? `, ${t("Active")}` : p.next ? `, ${t("Next")}` : ""}`);
    const image = el("img", "rsc-avatar"); image.src = p.img; image.alt = p.name; card.append(image);
    if (showHealth && healthState(p.hpPercent) === "danger") card.append(el("span", "rsc-danger-overlay"));
    card.append(el("span", "rsc-init", String(p.initiative)));
    card.append(el("span", "rsc-name", `${p.hidden ? "◌ " : ""}${p.name}`));
    if (p.active || p.next) card.append(el("span", "rsc-order", t(p.active ? "Active" : "Next")));
    const effects = el("div", "rsc-effects");
    for (const effect of p.effects) {
      const img = el("img"); img.src = effect.img; img.alt = effect.name; img.title = effect.name;
      effects.append(img);
    }
    card.append(effects);
    if (game.user.isGM && p.ac != null) card.append(el("span", "rsc-ac", t("AC", { value: p.ac })));
    if (showHealth && p.hpPercent !== undefined) {
      const bar = el("div", `rsc-hp is-${healthState(p.hpPercent)}`); bar.setAttribute("aria-label", t("HP"));
      const fill = el("span"); fill.style.width = `${p.hpPercent}%`; bar.append(fill); card.append(bar);
    }
    portraits.append(card);
  }
  root.append(portraits, rightControls); document.body.append(root);
}

function schedule() {
  if (scheduled) return;
  scheduled = true;
  requestAnimationFrame(() => { scheduled = false; render(); });
}
Hooks.once("init", () => {
  game.settings.register(ID, "imageSource", { name: t("ImageSourceName"), hint: t("ImageSourceHint"), scope: "world", config: true, restricted: true, type: String, default: "avatar", choices: { avatar: t("AvatarImage"), token: t("TokenImage") }, onChange: schedule });
  game.settings.register(ID, "onlyStarted", { name: t("OnlyStartedName"), hint: t("OnlyStartedHint"), scope: "world", config: true, restricted: true, type: Boolean, default: true, onChange: schedule });
  game.settings.register(ID, "playersOnly", { name: t("PlayersOnlyName"), hint: t("PlayersOnlyHint"), scope: "world", config: true, restricted: true, type: Boolean, default: false, onChange: schedule });
  game.settings.register(ID, "language", { name: t("LanguageName"), hint: t("LanguageHint"), scope: "client", config: true, type: String, default: "auto", choices: { auto: t("Automatic"), de: "Deutsch", en: "English" }, requiresReload: true, onChange: schedule });
  game.settings.register(ID, "collapsed", { name: t("CollapsedName"), hint: t("CollapsedHint"), scope: "client", config: true, type: Boolean, default: false, onChange: schedule });
  game.settings.register(ID, "showHealthBars", { name: t("HealthName"), hint: t("HealthHint"), scope: "client", config: true, type: Boolean, default: true, onChange: schedule });
  game.settings.register(ID, "enabled", { name: t("EnabledName"), scope: "client", config: true, type: Boolean, default: true, onChange: schedule });
  game.settings.register(ID, "portraitSize", { name: t("SizeName"), scope: "client", config: true, type: Number, default: 88, range: { min: 56, max: 144, step: 8 }, onChange: schedule });
});
Hooks.once("ready", () => {
  if (game.modules.get("combat-tracker-dock")?.active)
    ui.notifications.warn(t("Conflict"));
  for (const hook of ["createCombat", "updateCombat", "deleteCombat", "createCombatant", "updateCombatant", "deleteCombatant", "updateActor", "updateToken", "createActiveEffect", "updateActiveEffect", "deleteActiveEffect", "canvasReady", "renderCombatTracker", "updateUser"])
    Hooks.on(hook, schedule);
  render();
});
