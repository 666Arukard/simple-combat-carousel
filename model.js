export function canEndTurn(combat, combatant, user) {
  return Boolean(combat?.started && combat.combatant?.id === combatant?.id
    && (user.isGM || combatant?.actor?.testUserPermission(user, "OWNER")));
}

export function portraitData(combat, user, translate = key => ({ Unknown: "Unbekannt", Condition: "Zustand" })[key]) {
  const turns = combat.turns ?? [];
  const visible = turns.filter(c => user.isGM || (!c.hidden && c.visible !== false));
  const current = visible.findIndex(c => c.id === combat.combatant?.id);
  const ordered = current >= 0 ? [...visible.slice(current), ...visible.slice(0, current)] : visible;
  return ordered.map((c, index) => {
    const actor = c.actor;
    const data = {
      id: c.id, name: c.name ?? translate("Unknown"), img: c.img || actor?.img || "icons/svg/mystery-man.svg",
      initiative: c.initiative ?? "–", active: combat.started && c.id === combat.combatant?.id,
      next: combat.started && c.id === combat.nextCombatant?.id,
      roundBreak: index > 0 && turns.indexOf(c) < turns.indexOf(ordered[index - 1]),
      defeated: c.isDefeated, hidden: c.hidden,
      effects: Array.from(actor?.appliedEffects ?? []).filter(e => !e.disabled && !e.isSuppressed)
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
