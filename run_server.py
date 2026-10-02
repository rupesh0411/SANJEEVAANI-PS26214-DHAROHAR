"""
Digital Heritage Artifact Scanner - System Launcher
Starts the FastAPI server with WebSockets, hardware controller, and static file hosting.
"""

import os
import sys
import uvicorn

def main():
    print("=" * 70)
    print(" DIGITAL HERITAGE ARTIFACT SCANNER & HERITAGE MAPPING EXTENSION")
    print(" SIH-26214 &bull; Cyber-Archaeology & Digital Heritage Passport Network")
    print("=" * 70)
    print(" [1] Command Center Dashboard : http://localhost:8000/")
    print(" [2] Visitor Mobile Passport  : http://localhost:8000/passport.html?id=DH-IND-0001")
    print(" [3] Interactive API Docs     : http://localhost:8000/docs")
    print("=" * 70)
    print(" Starting Uvicorn ASGI Server on http://0.0.0.0:8000 ...")

    uvicorn.run("backend.app:app", host="0.0.0.0", port=8000, reload=False, log_level="info")

if __name__ == "__main__":
    main()
