import copy
import importlib.util
import io
import json
import pathlib
import unittest
import zipfile

ROOT = pathlib.Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location("publisher", ROOT / "tools/publish-foundry.py")
publisher = importlib.util.module_from_spec(spec)
spec.loader.exec_module(publisher)


class ReleaseTests(unittest.TestCase):
    def setUp(self):
        self.manifest = json.loads((ROOT / "module.json").read_text(encoding="utf-8"))
        self.release = {"tag_name": "v" + self.manifest["version"], "draft": False,
            "prerelease": False, "assets": [
                {"name": "module.json", "browser_download_url": self.manifest["download"].rsplit("/", 1)[0] + "/module.json"},
                {"name": self.manifest["download"].rsplit("/", 1)[1], "browser_download_url": self.manifest["download"]}]}

    def archive(self, manifest):
        data = io.BytesIO()
        with zipfile.ZipFile(data, "w") as z:
            z.writestr("rpg-suite-combat-carousel/module.json", json.dumps(manifest))
        return data.getvalue()

    def test_uses_version_specific_manifest_and_preserves_compatibility(self):
        payload = publisher.validate_release(self.release, self.manifest, self.archive(self.manifest))
        self.assertIn("/releases/download/v", payload["release"]["manifest"])
        self.assertNotIn("/latest/", payload["release"]["manifest"])
        self.assertEqual(payload["release"]["compatibility"], self.manifest["compatibility"])

    def test_rejects_wrong_zip_and_prerelease(self):
        other = copy.deepcopy(self.manifest)
        other["id"] = "wrong"
        with self.assertRaises(ValueError):
            publisher.validate_release(self.release, self.manifest, self.archive(other))
        self.release["prerelease"] = True
        with self.assertRaises(ValueError):
            publisher.validate_release(self.release, self.manifest, self.archive(self.manifest))

    def test_existing_version_requires_documented_error_code(self):
        self.assertTrue(publisher.already_registered({"errors": {"__all__": [{"code": "unique_together"}]}}))
        self.assertFalse(publisher.already_registered({"errors": {"manifest": [{"code": "invalid"}]}}))


if __name__ == "__main__":
    unittest.main()
