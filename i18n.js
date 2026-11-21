import { catalogs } from "./locales.js";

export const MODULE_ID = "rpg-suite-combat-carousel";

export function languageCode(selected, foundryLanguage) {
  const code = (selected === "auto" || !selected ? foundryLanguage : selected) ?? "en";
  return String(code).toLowerCase().split(/[-_]/)[0] === "de" ? "de" : "en";
}

export function translate(key, values = {}, selected = "auto", foundryLanguage = "en") {
  const catalog = catalogs[languageCode(selected, foundryLanguage)];
  const text = catalog[`SCC.${key}`] ?? catalogs.en[`SCC.${key}`] ?? key;
  return text.replace(/\{(\w+)\}/g, (match, name) => String(values[name] ?? match));
}

export function t(key, values) {
  // The language setting is not registered yet while init registers its own labels.
  let selected = "auto";
  try { selected = game.settings.get(MODULE_ID, "language"); } catch { /* use Foundry */ }
  return translate(key, values, selected, game.i18n?.lang);
}
