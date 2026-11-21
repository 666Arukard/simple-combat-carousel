"""Validate public release assets, then register the version with Foundry.

The package token is read only from FOUNDRY_RELEASE_TOKEN and sent only to
Foundry's fixed HTTPS endpoint. Existing GitHub releases are never modified.
"""
import hashlib
import io
import json
import os
import pathlib
import re
import urllib.error
import urllib.request
import zipfile

REPO = "666Arukard/simple-combat-carousel"
BASE = "https://github.com/" + REPO
API = "https://foundryvtt.com/_api/packages/release_version/"


def validate_release(release, manifest, archive):
    version = manifest.get("version", "")
    if not re.fullmatch(r"\d+\.\d+\.\d+", version):
        raise ValueError("A stable version is required.")
    if manifest.get("id") != "rpg-suite-combat-carousel":
        raise ValueError("Unexpected package ID.")
    tag = "v" + version
    if release.get("tag_name") != tag or release.get("draft") or release.get("prerelease"):
        raise ValueError("Expected a published stable GitHub release.")
    version_base = BASE + "/releases/download/" + tag
    manifest_url = version_base + "/module.json"
    archive_name = "simple-combat-carousel-" + version + ".zip"
    if manifest.get("manifest") != BASE + "/releases/latest/download/module.json":
        raise ValueError("Unexpected update URL.")
    if manifest.get("download") != version_base + "/" + archive_name:
        raise ValueError("Unexpected archive URL.")
    assets = {a["name"]: a for a in release.get("assets", [])}
    for name in ["module.json", archive_name]:
        if assets.get(name, {}).get("browser_download_url") != version_base + "/" + name:
            raise ValueError("Missing or unexpected release asset: " + name)
    digest = assets[archive_name].get("digest")
    if digest and digest != "sha256:" + hashlib.sha256(archive).hexdigest():
        raise ValueError("Archive digest mismatch.")
    compatibility = manifest.get("compatibility", {})
    if not compatibility.get("minimum") or not compatibility.get("verified"):
        raise ValueError("Compatibility metadata is incomplete.")
    if compatibility.get("maximum"):
        raise ValueError("No upper-version restriction is expected.")
    with zipfile.ZipFile(io.BytesIO(archive)) as z:
        names = [n for n in z.namelist() if n.replace("\\", "/") in
                 ["module.json", "rpg-suite-combat-carousel/module.json"]]
        if len(names) != 1 or json.loads(z.read(names[0])) != manifest:
            raise ValueError("Archive and release manifests differ.")
    return {"id": manifest["id"], "release": {
        "version": version, "manifest": manifest_url,
        "notes": BASE + "/releases/tag/" + tag,
        "compatibility": compatibility,
    }}


def fetch(url, limit):
    request = urllib.request.Request(url, headers={"User-Agent": "Simple-Combat-Carousel-Release"})
    with urllib.request.urlopen(request, timeout=60) as response:
        data = response.read(limit + 1)
    if len(data) > limit:
        raise ValueError("Release asset exceeds size limit.")
    return data


def already_registered(error):
    # Foundry documents unique_together for an existing package/version pair.
    return any(item.get("code") == "unique_together"
               for item in error.get("errors", {}).get("__all__", []))


def main():
    token = os.environ.get("FOUNDRY_RELEASE_TOKEN", "").strip()
    if not token.startswith("fvttp_") or any(c.isspace() for c in token):
        raise ValueError("Repository secret FOUNDRY_RELEASE_TOKEN is missing or invalid.")
    if os.environ.get("GITHUB_REPOSITORY") != REPO:
        raise ValueError("Unexpected repository.")
    local = json.loads(pathlib.Path("module.json").read_text(encoding="utf-8"))
    version = local["version"]
    if not re.fullmatch(r"\d+\.\d+\.\d+", version):
        raise ValueError("Invalid release version.")
    release = json.loads(fetch(f"https://api.github.com/repos/{REPO}/releases/tags/v{version}", 2_000_000))
    manifest = json.loads(fetch(f"{BASE}/releases/download/v{version}/module.json", 2_000_000))
    archive = fetch(f"{BASE}/releases/download/v{version}/simple-combat-carousel-{version}.zip", 20_000_000)
    if manifest != local:
        raise ValueError("Public release manifest differs from the checked source.")
    payload = validate_release(release, manifest, archive)
    request = urllib.request.Request(API, data=json.dumps(payload).encode(), method="POST",
        headers={"Authorization": token, "Content-Type": "application/json",
                 "User-Agent": "Simple-Combat-Carousel-Release"})
    # Do not follow redirects carrying the package credential.
    class NoRedirect(urllib.request.HTTPRedirectHandler):
        def redirect_request(self, *args, **kwargs):
            return None
    try:
        with urllib.request.build_opener(NoRedirect()).open(request, timeout=60) as response:
            result = json.load(response)
    except urllib.error.HTTPError as error:
        try:
            result = json.loads(error.read(100_000))
        except (ValueError, UnicodeError):
            result = {}
        if error.code == 400 and already_registered(result):
            print(f"Foundry already lists version {version}; no changes made.")
            return
        raise RuntimeError(f"Foundry rejected registration (HTTP {error.code}). Check the package ID, token and version in the Foundry package editor.") from None
    if result.get("status") != "success":
        raise RuntimeError("Foundry did not confirm registration.")
    print(f"Foundry successfully registered Simple Combat Carousel {version}.")


if __name__ == "__main__":
    main()
