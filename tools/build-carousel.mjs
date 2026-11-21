import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import assert from "node:assert/strict";

const root = fileURLToPath(new URL("../", import.meta.url));
const read = file => JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));
const catalogs = Object.fromEntries(["de", "en"].map(lang => [lang, read(`lang/${lang}.json`)]));
assert.deepEqual(Object.keys(catalogs.de).sort(), Object.keys(catalogs.en).sort());
fs.writeFileSync(path.join(root, "locales.js"), "// Generated from lang/de.json and lang/en.json by tools/build-carousel.mjs.\nexport const catalogs = " + JSON.stringify(catalogs, null, 2) + ";\n");
const manifest = read("module.json"), pkg = read("package.json");
assert.equal(manifest.version, pkg.version);
assert.equal(manifest.title, "Simple Combat Carousel");
assert.equal(manifest.id, "rpg-suite-combat-carousel");
assert.equal(manifest.authors[0].name, "Daniel Brune");
assert.equal(manifest.compatibility.verified, "14.370");
assert.equal(manifest.compatibility.maximum, undefined);
const base = "https://github.com/666Arukard/simple-combat-carousel";
assert.equal(manifest.url, "https://dnd.brunecoaching.de/tools-spielmaterial/simple-combat-carousel");
assert.equal(manifest.manifest, `${base}/releases/latest/download/module.json`);
assert.equal(manifest.download, `${base}/releases/download/v${pkg.version}/simple-combat-carousel-${pkg.version}.zip`);
const dist = path.join(root, "dist");
fs.mkdirSync(path.join(dist, manifest.id, "lang"), { recursive: true });
for (const file of ["module.json", "carousel.js", "carousel.css", "model.js", "i18n.js", "locales.js", "lang/de.json", "lang/en.json", "README.md", "CHANGELOG.md", "ROADMAP.md", "TESTING.md"])
  fs.copyFileSync(path.join(root, file), path.join(dist, manifest.id, file));
fs.copyFileSync(path.join(root, "module.json"), path.join(dist, "module.json"));
console.log(`Prepared Simple Combat Carousel ${pkg.version}`);
