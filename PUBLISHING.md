# Publishing releases

The GitHub Actions workflow tests the source, creates the versioned ZIP and module.json release assets, then registers the published version with Foundry's Package Release API.

Required repository secret: `FOUNDRY_RELEASE_TOKEN`, containing the token for the Foundry package `rpg-suite-combat-carousel`. Never commit or print the token. The author confirmed configuring this secret on 2026-11-21.

For the existing 1.0.0 release the workflow leaves GitHub assets and tag intact and registers that exact version with Foundry. For subsequent releases, update module.json, package.json, changelog and versioned URLs, then push the source to main. The release workflow can also be started manually from Actions.

Before the Foundry request, the workflow checks the published stable release, asset URLs, archive digest when available, and identical local, public and archived manifests. It sends the version-specific manifest URL and existing compatibility data. A documented duplicate-version response is treated as already registered; other failures are reported without blind retries. After an ambiguous network failure, check the package page before retrying. A successful GitHub release alone does not mean Foundry registration succeeded: check the final workflow step.

No module version bump is needed for this publishing infrastructure change. Historical releases are never overwritten.
