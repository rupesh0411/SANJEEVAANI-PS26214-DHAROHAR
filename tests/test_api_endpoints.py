"""
API Integration tests for DHAROHAR FastAPI endpoints:
- /api/artifacts
- /api/artifacts/DH-IND-0001
- /static/assets/models/buddha.glb
"""

import sys, os
import unittest
from fastapi.testclient import TestClient

# Add parent path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from backend.app import app

class TestApiEndpoints(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)

    def test_api_artifacts_endpoint(self):
        resp = self.client.get("/api/artifacts")
        self.assertEqual(resp.status_code, 200, f"Expected 200, got {resp.status_code}")
        data = resp.json()
        self.assertIsInstance(data, list, "Artifacts should be returned as a list")
        self.assertGreaterEqual(len(data), 1, "Catalog should have at least 1 artifact")
        print(f"[OK] /api/artifacts returned {len(data)} artifacts")

    def test_artifact_buddha_metadata(self):
        resp = self.client.get("/api/artifacts/DH-IND-0001")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertEqual(data["id"], "DH-IND-0001")
        self.assertIn("3d_model_url", data)
        print(f"[OK] Artifact DH-IND-0001 verified: '{data['name']}' -> {data['3d_model_url']}")

if __name__ == "__main__":
    print("Testing DHAROHAR REST API Endpoints...")
    unittest.main()
