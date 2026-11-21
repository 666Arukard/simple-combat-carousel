# Publishing releases

The GitHub Actions workflow tests and packages the source on pushes. Publishing is disabled by default. Only a manually dispatched run with the explicit `publish` checkbox enabled creates a GitHub release and registers it with Foundry's Package Release API.

Required repository secret: `FOUNDRY_RELEASE_TOKEN`, containing the token for the Foundry package `rpg-suite-combat-carousel`. Never commit or print the token. The author confirmed configuring this secret on 2026-11-21.

Foundry announcement policy: only stable `X.Y.0` releases are registered (e.g. `1.1.0`, `2.0.0`). Patch releases (`Z > 0`, e.g. `1.0.2`) and prerelease versions are skipped before checking credentials or making network requests. GitHub publication remains separate. This does not hide stable patch releases from Foundry clients checking the GitHub latest manifest. For an actual beta use a prerelease tag and a GitHub prerelease; the current stable-release build workflow is not a beta publishing workflow.

Foundry-Anmeldungen erfolgen ausschließlich für stabile `X.Y.0`-Versionen. Änderungen an `Z` sind für kleine Fixes und Tests reserviert und werden im Foundry-Verzeichnis nicht angemeldet. Der Veröffentlichungsstopp bleibt bestehen: ein Push führt nur Prüfungen aus; Releases erfordern weiterhin eine ausdrückliche manuelle Freigabe.

Existing releases and tags are left intact. For subsequent releases, update module.json, package.json, changelog and versioned URLs, then push the source to main for checks. Publish only after explicit authorization by starting the workflow manually with `publish` enabled. Changed release contents require a new version; do not overwrite historical assets.

Before the Foundry request, the workflow checks the published stable release, asset URLs, archive digest when available, and identical local, public and archived manifests. It sends the version-specific manifest URL and existing compatibility data. A documented duplicate-version response is treated as already registered; other failures are reported without blind retries. After an ambiguous network failure, check the package page before retrying. A successful GitHub release alone does not mean Foundry registration succeeded: check the final workflow step.

No module version bump is needed for this publishing infrastructure change. Historical releases are never overwritten.
