export function canEndTurn(combat, combatant, user) {
  return Boolean(combat?.started && combat.combatant?.id === combatant?.id
    && (user.isGM || combatant?.actor?.testUserPermission(user, "OWNER")));
}

export function healthState(percent) {
  if (!Number.isFinite(percent)) return undefined;
  return percent <= 10 ? "danger" : percent <= 25 ? "critical" : percent <= 50 ? "bloodied" : "healthy";
}

export function conditionEffects(actor) {
  // Passive item modifiers (e.g. Defense) are not combat conditions.
  const effects = actor?.temporaryEffects ?? actor?.appliedEffects ?? [];
  return Array.from(effects).filter(e => !e.disabled && !e.isSuppressed
    && (e.isTemporary || (e.statuses?.size ?? e.statuses?.length ?? 0) > 0));
}

export function portraitImage(combatant, source = "avatar") {
  const avatar = combatant.actor?.img;
  const token = combatant.token?.texture?.src || combatant.img;
  return (source === "token" ? token || avatar : avatar || token) || "icons/svg/mystery-man.svg";
}

export function portraitData(combat, user, translate = key => ({ Unknown: "Unbekannt", Condition: "Zustand" })[key], imageSource = "avatar") {
  const turns = combat.turns ?? [];
  const visible = turns.filter(c => user.isGM || (!c.hidden && c.visible !== false));
  const current = visible.findIndex(c => c.id === combat.combatant?.id);
  const ordered = current >= 0 ? [...visible.slice(current), ...visible.slice(0, current)] : visible;
  return ordered.map((c, index) => {
    const actor = c.actor;
    const data = {
      id: c.id, name: c.name ?? translate("Unknown"), img: portraitImage(c, imageSource),
      initiative: c.initiative ?? "–", active: combat.started && c.id === combat.combatant?.id,
      next: combat.started && c.id === combat.nextCombatant?.id,
      roundBreak: index > 0 && turns.indexOf(c) < turns.indexOf(ordered[index - 1]),
      defeated: c.isDefeated, hidden: c.hidden,
      effects: conditionEffects(actor)
        .map(e => ({ img: e.img || "icons/svg/aura.svg", name: e.name ?? translate("Condition") }))
    };
    // Sensitive values are never included in the player's view model or markup.
    if (user.isGM) {
      data.ac = actor?.system?.attributes?.ac?.value;
      const hp = actor?.system?.attributes?.hp;
      if (Number.isFinite(hp?.value) && Number.isFinite(hp?.max) && hp.max > 0)
        data.hpPercent = Math.min(100, Math.max(0, hp.value / hp.max * 100));
    }
    return data;
  });
}

export function carouselRows(combat, user, translate, playersOnly = false, imageSource = "avatar") {
  const rows = portraitData(combat, user, translate, imageSource);
  if (user.isGM || !playersOnly) return rows;
  const isPC = c => c.actor?.type === "character" || (c.actor?.type !== "npc" && c.isNPC === false && c.actor?.hasPlayerOwner);
  const ids = new Set((combat.turns ?? []).filter(isPC).map(c => c.id));
  const pcs = rows.filter(p => ids.has(p.id));
  const turns = combat.turns ?? [];
  const pivot = turns.findIndex(c => c.id === combat.combatant?.id);
  if (pivot >= 0) {
    const position = id => (turns.findIndex(c => c.id === id) - pivot + turns.length) % turns.length;
    pcs.sort((a, b) => position(a.id) - position(b.id));
    for (let i = 0; i < pcs.length; i++)
      pcs[i].roundBreak = i > 0 && turns.findIndex(c => c.id === pcs[i].id) < turns.findIndex(c => c.id === pcs[i - 1].id);
  }
  const active = pcs.find(p => p.active);
  let next = pcs.find(p => !p.active);
  if (!next && active) next = active; // One PC: next PC turn is in the next round.
  for (const p of pcs) p.next = combat.started && p === next;
  if (combat.started && !active) {
    // A single anonymous current-turn slot reveals no NPC name, image, count or initiative.
    pcs.unshift({ id: "npc-turn", name: translate("NPCTurn"), img: "icons/svg/mystery-man.svg",
      initiative: "–", active: true, next: false, placeholder: true, effects: [] });
  }
  return pcs;
}
