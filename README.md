
# Swayog

Lightweight pose-correction app that runs a Python CV/ML backend (FastAPI),
a React + Vite frontend, and an optional Spring Boot security backend. Includes
live webcam pose analysis and voice feedback for corrective guidance.

## Project Structure

- `api/` — FastAPI backend that processes webcam frames, runs pose checkers from `logic/`, and exposes a WebSocket at `/ws/{client_id}`.
- `frontend/` — React + Vite single-page app (TypeScript) used for live camera feed and UI (`src/pages/Practice.tsx` handles the WebSocket client).
- `logic/` — Pose-checker implementations and `voice_feedback.py` utilities used by the backend (legacy TTS available here).
- `Poses/` — Landmark/pose data (e.g. `yoga_pose_landmarks.json`).
- `sec/` — Spring Boot project (optional) providing auth/MFA and APIs used by the frontend.

## Quick Start (Windows PowerShell)

1. Open PowerShell in the repository root (`d:\YogaFix`).

2. Create and activate a Python virtual environment (recommended name: `.venv`):

```powershell
python -m venv .venv
# Activate for this PowerShell session
.\.venv\Scripts\Activate.ps1
```

If PowerShell blocks the activation script because of execution policy, run (temporary for the session):

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process
.\.venv\Scripts\Activate.ps1
```

3. Install Python dependencies:

```powershell
pip install -r requirements.txt
```

4. Start the FastAPI backend (from `d:\YogaFix\api`):

```powershell
cd api
# dev: use uvicorn for autoreload
py -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

5. Start the frontend (from `d:\YogaFix\frontend`):

```powershell
cd frontend
npm install
npm run dev
```

6. (Optional) Start the Spring Boot server (from `d:\YogaFix\sec`):

```powershell
cd sec
./mvnw.cmd spring-boot:run
```

## License & Contributing

This repository is provided as-is. Feel free to open issues or contribute improvements via pull requests.


