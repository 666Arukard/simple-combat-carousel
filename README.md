# Simple Combat Carousel

By **Daniel Brune** · [Website](https://dnd.brunecoaching.de) · Discord: `arukard`

## English

Prepared for 1.1.0 (not released): optional **Player view: player characters only** world setting, configured by the GM. NPC turns appear as one anonymous placeholder; upcoming visible PCs retain their turn order. The GM view and the default full view remain complete. Health bars change to orange at ≤50% and red at ≤25%; portraits receive a translucent red overlay at ≤10%, also in mini view. These health indicators are GM-only and follow the health-bar setting. Conditions and temporary effects are displayed, passive effects are excluded. Initiative buttons use Foundry's bundled D20 icon.

A compact combat carousel at the top center of Foundry VTT. Portraits show initiative and active conditions; the current turn is highlighted in gold and the next combatant in blue. Collapse the carousel into a small centered bar showing the current and next combatant with pictures and names. The end-turn button works in both views.

Players can end their own active turn. The GM has initiative and previous-turn controls on the left and forward controls on the right. No buttons cover portraits. Only the GM sees D&D 5e health bars (enabled by default, can be disabled) and armor class on hover. Hidden combatants are omitted from the player view.

Under **Configure Settings → Simple Combat Carousel → Module language**, choose **Automatic**, **Deutsch** or **English**, independently for each client. Automatic follows Foundry's language and falls back to English. Reload after changing language to refresh settings labels. Character names and effect names remain as entered in the world. Portrait size, visibility, health bars and collapsed state are also configurable per client.

### Installation and updates

Paste this manifest URL into **Install Module → Manifest URL**:

`https://github.com/666Arukard/simple-combat-carousel/releases/latest/download/module.json`

Enable **Simple Combat Carousel** in your world. Disable **Carousel Combat Tracker** if installed to avoid duplicate displays. Foundry checks the stable manifest URL for subsequent updates.

For a manual installation, extract the `rpg-suite-combat-carousel` directory into `Data/modules/`. The technical ID is intentionally retained from the prototypes; do not rename the directory. Existing settings remain intact when updating from 0.1.4. No dependency on combat-tracker-dock and no copied code from that project.

### Compatibility

Foundry VTT 14, verified for **14.370** based on Daniel's successful GM/player test of 0.1.4. Version 1.0.0 adds translations and release metadata, validated by automated tests. No maximum version is declared: newer Foundry versions are not blocked, but compatibility with future API changes cannot be guaranteed. The combat display uses Foundry's native Combat API; HP and AC support uses D&D 5e data paths. Other game systems can use the combat order, but their HP and AC values may require adapters.

## Deutsch

Für 1.1.0 vorbereitet, noch unveröffentlicht: Die Spielleitung kann **Spieleransicht: nur Spielercharaktere** weltweit einschalten. Beim NSC-Zug erscheint ein anonymer Platzhalter; danach folgen die sichtbaren SC in ihrer Reihenfolge. SL-Ansicht und Standardansicht bleiben vollständig. Lebensbalken werden bei ≤50% orange und bei ≤25% rot; bei ≤10% erhält das Porträt eine transparente rote Überblendung, auch in der Miniansicht. Diese HP-Hinweise gelten nur für den SL und folgen der Lebensbalken-Einstellung. Nur Zustände und temporäre Effekte erscheinen als Icons, keine passiven Effekte. Initiativeknöpfe verwenden Foundrys eingebundenes D20-Icon.

Kompaktes Combat Carousel oben mittig in Foundry VTT. Porträts zeigen Initiative und aktive Zustände. Der aktuelle Charakter ist goldfarben, der nächste blau hervorgehoben. Die einklappbare Miniansicht zeigt den aktuellen und nächsten Charakter mit Bild und Name. „Zug beenden“ funktioniert in beiden Ansichten.

Spieler können ihren eigenen aktiven Zug beenden. Die Spielleitung erhält Initiative- und Rückwärtssteuerung links sowie Vorwärtssteuerung rechts. Keine Steuerknöpfe liegen über den Porträts. D&D-5e-Lebensbalken (standardmäßig an, abschaltbar) und RK beim Hover sieht ausschließlich die Spielleitung. Versteckte Kampfteilnehmer fehlen in der Spieleransicht.

Unter **Einstellungen konfigurieren → Simple Combat Carousel → Modulsprache** stehen **Automatisch**, **Deutsch** und **English** zur Wahl. Die Auswahl gilt pro Client, unabhängig von der Foundry-Sprache. Automatisch verwendet bei nicht unterstützten Sprachen Englisch. Nach dem Sprachwechsel neu laden, damit auch die Einstellungsbeschriftungen aktualisiert werden. Namen von Charakteren und Effekten werden nicht übersetzt. Größe, Sichtbarkeit, Lebensbalken und eingeklappte Ansicht sind ebenfalls pro Client einstellbar.

### Installation und Updates

Die oben genannte Manifest-Adresse unter **Modul installieren → Manifest-URL** eintragen und **Simple Combat Carousel** in der Welt aktivieren. Weitere Versionen lassen sich über Foundrys normale Updatefunktion installieren. Bei manueller Installation den Ordner `rpg-suite-combat-carousel` nach `Data/modules/` entpacken. Der technische Ordnername bleibt erhalten, damit die bisherigen Einstellungen weiterverwendet werden. Ein paralleles **Carousel Combat Tracker** bitte deaktivieren.

### Kompatibilität und Herkunft

Die Angabe **verified: 14.370** beruht auf Daniels bestätigtem Praxistest von 0.1.4 mit Spielleiter- und Spieleransicht. Die Übersetzungen und Release-Dateien von 1.0.0 wurden zusätzlich automatisiert geprüft. Keine Versionsobergrenze; spätere Foundry-Versionen werden nicht pauschal gesperrt, sind aber noch nicht praktisch abgenommen. HP/RK verwenden D&D-5e-Wertepfade.

Eigenständige Implementierung mit KI-Unterstützung durch ChatGPT/Codex. Carousel Combat Tracker diente als Funktionsreferenz, ohne Codeübernahme oder Laufzeitabhängigkeit. Eine spätere optionale Integration in die RPG Suite ist geplant. Weitere Ideen stehen in [ROADMAP.md](ROADMAP.md), noch ohne Implementierung.
