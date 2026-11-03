# Career Compass

## Run locally
1. Get a free Gemini key: https://aistudio.google.com/apikey
2. Copy `.env.example` to `.env` and paste your key (or set the `GEMINI_API_KEY` environment variable).
3. `python server.py`  ->  open http://localhost:8000
No pip installs needed. Test without a key: `GEMINI_MOCK=1 python server.py`

## Deploy (Render / Railway)
- Start command: `python server.py`
- Add environment variable `GEMINI_API_KEY` in the dashboard (do NOT upload .env).
- The server reads the `PORT` variable automatically.
