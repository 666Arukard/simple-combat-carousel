# Verification record

- 2026-11-22: Daniel confirmed all suggested 2.0.0 practical checks (double-click sheets, image source, separate start visibility, turn progression, context menu and initiative buttons). Individual portrait overrides and configurable HP thresholds are new for unreleased 2.1.0 and need a final live check.

- 2026-11-21: Daniel confirmed successful GM and player testing of 0.1.4 on Foundry VTT 14.370.
- 1.0.0: Combat behavior retained; German/English translations, settings, branding and distribution metadata added.
- Automated tests cover ownership and active-turn checks, GM-only HP/AC, hidden combatants, turn order, mini-view collapse/expand, mini-view end-turn authorization, language switching, locale completeness and synchronized catalogs.
- Build checks package identity, version, author, compatibility metadata and stable/versioned distribution URLs. Release workflow additionally checks the archive manifest and language files.
- No local Foundry installation is available. No independent live test of 1.0.0 or later Foundry versions is claimed.

## Suggested final language smoke test

On Foundry 14.370, open GM and player clients, select English and German independently, reload, and check settings labels, tooltips, expanded/mini views and end-turn buttons. Character and effect names remain world data. Confirm no HP/AC appear for players; toggle the GM health bars. Try a normal Foundry update using the stable manifest URL.

- 2026-11-22: Prepared 2.2.0: 20 Node tests pass, including frame persistence, legacy highlight fallback, player permission denial and full/mini enemy frame rendering. Live visual verification pending: choose all four frames, mark multiple enemies and a boss, change turns, collapse/expand, remove a legacy highlight and check HP/initiative/effect readability.

- 2026-11-22: Daniel confirmed successful practical tests of the 2.2.0 portrait frames and authorized release.

- 2026-11-28: 2.2.1 compatibility-only release for Foundry 14.371 and D&D 5e 6.1.2. Reviewed official release notes: no identified impact on used combat, actor HP/AC, condition, portrait or context-menu interfaces. Manifest verified target updated to 14.371 on static review; automated tests run. No live test under these new versions was performed. Runtime files unchanged from 2.2.0.
