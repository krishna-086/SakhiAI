# SakhiAI

Voice-first AI healthcare screening assistant for ASHA workers and rural patients across India.

Patients describe symptoms in their own language — over the web or a WhatsApp voice note — and SakhiAI transcribes the audio, runs it through a safety-tuned LLM, classifies risk (LOW / MEDIUM / HIGH / CRITICAL), and replies in the patient's language with cautious, non-diagnostic guidance. A dashboard surfaces screenings, alerts, and trends for the worker.

Built for the **WitchHunt AI Hackathon 2026 (Health & Wellbeing track)** by **Team Tensorz**.

## Links

- **GitHub:** https://github.com/krishna-086/SakhiAI
- **Demo Video:** https://youtu.be/nL967R6DC-E

## Features

**Voice screening (web)**
- In-browser recording via `MediaRecorder` (no plugins).
- Server-side conversion of WebM → MP3 using `ffmpeg-static`.
- Transcription with Groq Whisper (`whisper-large-v3`).
- LLM analysis with Groq Llama 3.3 70B, returning structured JSON.
- Result page with transcript, possible concern, recommended action, warning signs, and patient-facing reply.

**WhatsApp screening**
- Twilio sandbox webhook accepts voice notes from any WhatsApp user.
- OGG audio is downloaded with Twilio Basic auth, transcribed, analyzed, and saved.
- Patient receives the AI reply over WhatsApp.

**AI pipeline**
- Multilingual: language detected via `franc`; supports Hindi, English, Tamil, Telugu, Bengali, Marathi, Kannada, Gujarati, Malayalam, Punjabi (falls back to English).
- Safety-tuned system prompt that refuses to diagnose or prescribe, and flags emergency-risk symptoms.
- Strict JSON output schema: `risk_level | possible_concern | warning_signs[] | recommended_action | response_for_user`.

**Dashboard (`/`, `/dashboard`, `/analytics`)**
- Stats: total screenings, total alerts, high-risk and medium-risk counts.
- Recent screenings list with risk-level badges.
- Recharts visualisations — bar chart, pie chart, area trend.

**Alerts (`/alerts`)**
- Grouped by HIGH / MEDIUM / LOW.
- Lists possible concern, AI response, and timestamp.

## Tech stack

| Area | Choices |
| --- | --- |
| Frontend | React 19, Vite 8, React Router 7, Tailwind CSS 4, shadcn-style primitives (Radix), Framer Motion, Recharts, lucide-react |
| Backend | Node.js + Express 5 (CommonJS), Multer, fluent-ffmpeg + ffmpeg-static, dotenv, cors |
| AI | Groq SDK — Whisper (`whisper-large-v3`) + Llama (`llama-3.3-70b-versatile`) |
| Data | Supabase (Postgres) — `screenings`, `alerts` tables |
| Messaging | Twilio WhatsApp sandbox (`+14155238886`) |
| Language detection | `franc` |

Exact versions in `backend/package.json` and `frontend/package.json`.

## Architecture

**Web voice path**
```
Browser MediaRecorder (audio/webm)
  → POST /api/upload-audio  (multipart, field "audio")
    → backend/src/routes/upload.routes.js
        multer → uploads/upload-<ts>.webm
        fluent-ffmpeg → .mp3
        services/whisper.service.js   (Groq whisper-large-v3)
        services/llm.service.js       (Groq llama-3.3-70b-versatile)
        services/risk.service.js      (uppercases risk_level)
        services/database.service.js  (insert screenings + alerts)
  ← JSON { transcript, aiResponse, riskData }
```

**WhatsApp path**
```
WhatsApp → Twilio → POST /webhook/whatsapp
  → backend/src/controllers/whatsapp.controller.js
        200 OK fast ack
        axios GET MediaUrl0 (Twilio Basic auth) → uploads/voice-<ts>.ogg
        whisper.service.js (no ffmpeg)
        llm.service.js
        risk.service.js
        database.service.js  (alert insert only if HIGH or CRITICAL)
        twilio.service.js    (reply via WhatsApp)
```

## Repository structure

```
.
├── backend/
│   └── src/
│       ├── server.js          # entry
│       ├── app.js             # express wiring
│       ├── config/            # groq, supabase clients
│       ├── controllers/       # whatsapp, dashboard
│       ├── routes/            # upload, whatsapp, dashboard
│       ├── services/          # llm, whisper, risk, twilio, database
│       └── utils/             # languageDetector (franc)
├── frontend/
│   ├── index.html
│   ├── vite.config.js
│   ├── components.json        # shadcn config
│   └── src/
│       ├── main.jsx, App.jsx
│       ├── pages/             # MobileHome, VoiceScreen, ResultScreen, Dashboard, Alerts, Analytics
│       ├── layouts/AppShell.jsx
│       ├── components/        # MobileBottomNav + ui/* primitives
│       └── services/          # api, screening.service, dashboard.service
├── .env                       # gitignored — see Setup
├── .gitignore
└── README.md
```

## Prerequisites

- Node.js 20.19+ (Vite 8 requirement) or 22.12+.
- npm (`package-lock.json` is the committed lockfile).
- A Groq account and API key — https://console.groq.com
- A Supabase project — https://supabase.com
- A Twilio account with the WhatsApp sandbox enabled — https://www.twilio.com/console/sms/whatsapp/sandbox

ffmpeg is bundled via `ffmpeg-static` (npm postinstall fetches the binary). You do **not** need a system-wide ffmpeg install.

## Setup

### 1. Clone and install

```powershell
git clone <your-fork-or-repo-url> SakhiAi
cd SakhiAi

cd backend
npm install

cd ..\frontend
npm install
```

### 2. Environment variables

There is no `.env.example` in the repo yet. Create a file named `.env` at the **repo root** with the following keys:

```dotenv
# Server
PORT=5000                          # optional, defaults to 5000

# Groq
GROQ_API_KEY=gsk_...               # required — used for Whisper + Llama

# Supabase
SUPABASE_URL=https://<project>.supabase.co   # required
SUPABASE_ANON_KEY=sb_...                     # required

# Twilio (required only if you wire up the WhatsApp path)
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
```

The backend loads this file via `dotenv` with an explicit path (`backend/src/server.js` resolves `../../.env` relative to itself), so you can run the dev server from either the repo root or from `backend/` and the env will be picked up.

The frontend currently uses **no** environment variables. The API base URL is hardcoded to `http://localhost:5000` in `frontend/src/services/api.js`. Edit that file if you need to point at a different backend.

### 3. Supabase tables

No migration SQL is committed. Create two tables manually in the Supabase SQL editor. The columns below are inferred from the code (`backend/src/services/database.service.js`, `backend/src/controllers/dashboard.controller.js`):

```sql
create table screenings (
  id bigserial primary key,
  created_at timestamptz default now(),
  sender text,
  transcript text,
  risk_level text,                 -- LOW | MEDIUM | HIGH | CRITICAL
  possible_concern text,
  recommended_action text,
  response_for_user text,
  warning_signs jsonb              -- array of strings from the LLM
);

create table alerts (
  id bigserial primary key,
  created_at timestamptz default now(),
  sender text,
  transcript text,
  risk_level text,
  possible_concern text,
  recommended_action text,         -- inserted from the web path
  response_for_user text,          -- inserted from the web path
  warning_signs jsonb              -- inserted from the web path
);
```

Adjust types to taste. The backend uses the Supabase anon key, so either disable RLS on these tables for development or add policies that permit insert/select with the anon role.

### 4. Twilio WhatsApp sandbox

1. In the Twilio console, enable the WhatsApp sandbox and join from your phone (send the join code to `+14155238886`).
2. Set the sandbox **"When a message comes in"** webhook to:
   ```
   https://<your-tunnel-host>/webhook/whatsapp    (POST)
   ```
   For local dev, expose port 5000 with a tunnel (e.g. `ngrok http 5000` or `cloudflared tunnel`).
3. Send a voice note to the sandbox number. Watch the backend logs for `[WEBHOOK] TWILIO WEBHOOK HIT`.

The outbound reply uses the same sandbox number, hardcoded in `backend/src/services/twilio.service.js`. Change that string if you graduate to a production WhatsApp number.

## Running locally

Open two terminals from the repo root:

```powershell
# terminal 1 — backend
cd backend
npm run dev          # nodemon, hot reload
# or one-shot:
# node src/server.js
```

```powershell
# terminal 2 — frontend
cd frontend
npm run dev
```

- Frontend dev server: http://localhost:5173
- Backend API:        http://localhost:5000

## Usage

**Web voice screening**

1. Open http://localhost:5173.
2. Tap **Start Screening** → tap the mic → describe symptoms → tap again to stop.
3. The browser POSTs the WebM blob to `POST /api/upload-audio`.
4. Tap **View Result** to see the risk card, transcript, recommended action, warning signs, and patient-facing response.

**WhatsApp screening**

1. Send a voice note to the Twilio sandbox number (after joining the sandbox).
2. Twilio hits `POST /webhook/whatsapp`. The backend acks immediately and processes asynchronously.
3. The patient receives a WhatsApp reply with the AI-generated response.
4. HIGH and CRITICAL cases are inserted into the `alerts` table and appear on the `/alerts` page.

**Dashboard endpoints (used by the frontend)**

```
GET /api/stats        → { totalScreenings, totalAlerts, highRiskCases, mediumRiskCases }
GET /api/screenings   → all screenings, newest first
GET /api/alerts       → all alerts, newest first
```

## Project status

Working end-to-end for the happy path on both web and WhatsApp, assuming `.env` is discoverable and Supabase tables exist. Known unfinished or rough edges:

- No authentication on any endpoint. Anyone who can reach the backend can read every transcript.
- `frontend/src/services/alerts.service.js`, `frontend/src/pages/HistoryScreen.jsx`, and `frontend/src/layouts/DashboardLayout.jsx` are empty placeholders.
- `architecture.md` is empty.
- The Analytics page references `stats.lowRiskCases`, which `GET /api/stats` does not return — the "Low" pie slice is always 0.
- The web upload path inserts a row into `alerts` for **every** screening (regardless of risk level), while the WhatsApp path only inserts HIGH/CRITICAL. Unify before relying on alerts as a high-signal feed.
- CORS is wide open (`app.use(cors())`) and the backend uses the Supabase anon key for inserts.
- `ResultScreen` reads from `react-router` `location.state`; a page refresh loses the result.
- LLM JSON schema example in the system prompt is missing its closing `}` (still parses most of the time).
- No tests, no CI, no Dockerfile, no deploy config.

## Roadmap

- Add a `.env.example` and decide whether `.env` belongs at the repo root or inside `backend/`.
- Wire the frontend to a `VITE_API_URL` env var instead of hardcoding localhost.
- Add auth in front of `/api/screenings`, `/api/alerts`, `/api/stats`.
- Define Supabase RLS policies and switch backend to the service role key.
- Tighten CORS to known origins.
- Add `lowRiskCases` to `GET /api/stats` (Analytics expects it).
- Build out `HistoryScreen` and `/history` route.
- Add retry / persistence on the WhatsApp pipeline so transient failures don't leave the patient without a reply.
- Add SQL migrations (Supabase CLI or a `migrations/` folder).
- Add a Dockerfile and a deploy target for the backend.


## Tags

`#AI` `#HealthTech` `#Hackathon` `#WitchHunt2026` `#ASHA` `#RuralHealthcare` `#VoiceAI` `#Groq` `#Supabase` `#React` `#NodeJS` `#Multilingual` `#IndiaTech` `#LLM`

## License

Not specified. Add a `LICENSE` file before publishing.
