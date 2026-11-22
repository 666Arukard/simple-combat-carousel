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

export function localizeModuleSettings(currentGame) {
  const selected = currentGame.settings.get(MODULE_ID, "language");
  const text = key => translate(key, {}, selected, currentGame.i18n?.lang);
  const labels = {
    language: ["LanguageName", "LanguageHint"],
    healthOrange: ["HealthOrange", "HealthThresholdHint"],
    healthRed: ["HealthRed", "HealthThresholdHint"],
    healthOverlay: ["HealthOverlay", "HealthThresholdHint"],
    imageSource: ["ImageSourceName", "ImageSourceHint"],
    onlyStarted: ["PlayersStartedName", "PlayersStartedHint"],
    gmOnlyStarted: ["GMStartedName", "GMStartedHint"],
    playersOnly: ["PlayersOnlyName", "PlayersOnlyHint"],
    collapsed: ["CollapsedName", "CollapsedHint"],
    showHealthBars: ["HealthName", "HealthHint"],
    enabled: ["EnabledName"], portraitSize: ["SizeName"]
  };
  for (const [key, [name, hint]] of Object.entries(labels)) {
    const config = currentGame.settings.settings?.get(`${MODULE_ID}.${key}`);
    if (!config) continue;
    config.name = text(name);
    if (hint) config.hint = text(hint);
    if (key === "language") config.choices = { auto: text("Automatic"), de: "Deutsch", en: "English" };
    if (key === "imageSource") config.choices = { avatar: text("AvatarImage"), token: text("TokenImage") };
  }
}
