# Simple Combat Carousel 2.1.0

Unreleased / Noch nicht veröffentlicht.

- Per-combatant actor/token/global image source and optional purple highlight with star, in full and mini views. Configured by GM via right-click in Combat Tracker or carousel. Stored only on the combatant, not the actor or token image.
- Individuelle Bildquelle Avatar/Token/globale Vorgabe und optionale violette Hervorhebung mit Stern in Groß- und Miniansicht. SL-Rechtsklick im Combat-Reiter oder Carousel. Speicherung nur am Kampfteilnehmer; Actor- und Tokenbilder bleiben unverändert.

- Three GM-only world settings independently configure the orange health bar, red health bar and red portrait-overlay thresholds (0–100%). Defaults remain 50%, 25%, 10%.
- Inclusive boundaries; red takes priority over orange on overlap. The overlay threshold does not change the bar color. Full/mini views and GM-only health visibility are preserved.
- Drei SL-Welteinstellungen für die Schwellen von orangem Balken, rotem Balken und rotem Porträtschleier (0–100%). Standard bleibt 50%, 25%, 10%.
- Grenzen gelten einschließlich; Rot hat bei Überschneidungen Vorrang. Der Schleier ist unabhängig von der Balkenfarbe. Anzeige weiterhin nur beim SL und an die Lebensbalken-Einstellung gebunden.

# Simple Combat Carousel 2.0.0

Released / Veröffentlicht: 2026-11-22.

- Double-click a portrait in full or mini view to open the character sheet using existing document permissions.
- Separate GM-controlled pre-combat visibility settings: players hidden until combat starts by default; GMs can see the preparation view by default.
- Initiative icons and order match the regular Combat Tracker: Roll All (users), Roll NPCs (users with gear).
- Doppelklick auf Porträts in Groß- und Miniansicht öffnet den Charakterbogen mit vorhandenen Dokumentrechten.
- Getrennte SL-Einstellungen für die Anzeige vor Kampfstart: Spieler standardmäßig erst nach Start, SL standardmäßig bereits zur Vorbereitung.
- Icons und Reihenfolge wie im Combat-Reiter: Alle würfeln (Gruppe), NSC würfeln (Gruppe mit Zahnrad).

- GM-configured world setting for actor portraits (default) or scene token images in full and mini views, with fallback for missing images.
- The player carousel is shown only after combat starts by default; GM visibility is configured separately.
- Weltweite SL-Einstellung für Avatar-Bilder (Standard) oder Szenentoken-Bilder in Groß- und Miniansicht, mit Ersatzquelle bei fehlendem Bild.
- Das Spieler-Carousel erscheint standardmäßig erst nach Kampfstart; die SL-Anzeige ist getrennt einstellbar.
- Per-combatant image overrides, special highlights and legendary-action interludes remain future work.

# Simple Combat Carousel 1.1.1

Released / Veröffentlicht: 2026-11-21.

- Right-click portraits in full and mini views for Hide/Show, Mark defeated/Remove defeated status (GM only), and Ping token.
- Uses Foundry V14's CombatTracker handlers for hidden/defeated state and Canvas ping for the token center. Does not change HP.
- Players can ping only visible tokens on the currently viewed scene. Anonymous PC-only placeholders have no context menu.
- Rechtsklick auf Porträts in Groß- und Miniansicht: Verstecken/Einblenden, Als besiegt markieren/Markierung entfernen (nur SL) sowie Token anpingen.
- Verwendet Foundrys CombatTracker-Handler und Canvas-Ping. Keine HP-Änderung. Spieler können nur sichtbare Tokens der aktuellen Szene anpingen; anonyme Platzhalter besitzen kein Menü.

# Simple Combat Carousel 1.1.0

Released / Veröffentlicht: 2026-11-21.

- Optional GM-configured PC-only player view with anonymous NPC-turn placeholder and next visible PC. Full order remains the default.
- Health bars: orange at 50% and below, red at 25% and below; translucent red portrait overlay at 10% and below. GM-only, follows the health-bar visibility setting, including the mini-view overlay.
- Only conditions and temporary effects are shown; passive effects such as Defense no longer appear as condition icons.
- Initiative buttons use Foundry's bundled Font Awesome D20 icon.

- Optionale SC-Ansicht für Spieler mit anonymem NSC-Platzhalter und nächstem sichtbaren SC. Die vollständige Reihenfolge bleibt Standard.
- Lebensbalken bis einschließlich 50% orange, bis 25% rot; bis 10% transparente rote Überblendung des Porträts. Nur für den SL, an die Lebensbalken-Einstellung gebunden; Überblendung auch in der Miniansicht.
- Nur Zustände und temporäre Effekte als Icons; keine passiven Effekte wie Defense.
- Initiativeknöpfe verwenden Foundrys eingebundenes Font-Awesome-D20-Icon.

## English

- Package URL: https://foundryvtt.com/packages/rpg-suite-combat-carousel/.
- Installation and update downloads continue to use GitHub.

## Deutsch

- Package URL: https://foundryvtt.com/packages/rpg-suite-combat-carousel/.
- Installation und Updates werden weiterhin über GitHub bereitgestellt.

# Simple Combat Carousel 1.0.0

## English

- First named release: Simple Combat Carousel by Daniel Brune.
- Complete German and English interface with per-client language selection (Automatic / Deutsch / English).
- Retains centered expanded and mini views, current/next portraits, end-turn controls, initiative and conditions.
- GM-only optional health bars and armor-class hover labels for D&D 5e.
- Stable GitHub manifest URL for Foundry installation and updates.
- Verified target 14.370 based on the author's successful GM/player test of 0.1.4; release translation/metadata checks automated. No upper-version block.
- Technical module ID retained to preserve prototype settings.

## Deutsch

- Erster Release unter dem Namen Simple Combat Carousel von Daniel Brune.
- Vollständige deutsche und englische Oberfläche mit Sprachauswahl pro Client (Automatisch / Deutsch / English).
- Mittige Groß- und Miniansicht, aktueller/nächster Charakter, Zugsteuerung, Initiative und Zustände bleiben erhalten.
- Optionale Lebensbalken und RK beim Hover für D&D 5e ausschließlich beim SL.
- Stabile GitHub-Manifest-Adresse für Foundry-Installation und Updates.
- Prüfziel 14.370 auf Grundlage des erfolgreichen SL-/Spielertests von 0.1.4 durch den Autor; Übersetzungen/Release-Dateien automatisiert geprüft. Keine Versionsobergrenze.
- Technische Modul-ID bleibt zum Erhalt der Prototyp-Einstellungen bestehen.


