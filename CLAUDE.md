# CLAUDE.md

Internal context for Claude Code sessions on this repo. Read this first.

## Project summary

SakhiAI — voice-first AI screening assistant for ASHA workers and rural patients in India. Two input paths (web mic recording, Twilio WhatsApp voice notes) → Groq Whisper transcription → Groq LLM produces a JSON risk assessment → results persisted in Supabase and surfaced on a React dashboard.

## Repo layout

```
.
├── .env                         # root env, gitignored, used by backend (dotenv default cwd)
├── .gitignore
├── architecture.md              # EMPTY placeholder
├── README.md                    # human-facing docs
├── backend/                     # Express 5, CommonJS, npm
│   ├── package.json
│   └── src/
│       ├── server.js            # entry — loads dotenv + app
│       ├── app.js               # Express wiring
│       ├── config/              # groq.js, supabase.js (clients)
│       ├── controllers/         # dashboard.controller.js, whatsapp.controller.js
│       ├── routes/              # upload.routes.js, dashboard.routes.js, whatsapp.routes.js
│       ├── services/            # llm, whisper, risk, twilio, database
│       └── utils/languageDetector.js
└── frontend/                    # Vite 8, React 19, JS (not TS), Tailwind v4, npm
    ├── vite.config.js
    ├── components.json          # shadcn (radix-nova style, lucide icons)
    ├── index.html
    └── src/
        ├── main.jsx, App.jsx
        ├── pages/               # MobileHome, VoiceScreen, ResultScreen, Dashboard, Alerts, Analytics
        ├── layouts/             # AppShell (sidebar + mobile bottom nav)
        ├── components/          # MobileBottomNav + ui/* (shadcn-style primitives)
        ├── services/            # api.js, screening.service.js, dashboard.service.js
        └── lib/utils.js         # cn()
```

## Tech stack (versions from package.json)

**Backend** (`backend/package.json`, `"type": "commonjs"`)
- express ^5.2.1
- @supabase/supabase-js ^2.105.4
- groq-sdk ^1.2.0
- twilio ^6.0.2
- multer ^2.1.1, fluent-ffmpeg ^2.1.3, ffmpeg-static ^5.3.0
- franc ^6.2.0 (language detection)
- axios ^1.16.0, cors ^2.8.6, dotenv ^17.4.2
- nodemon ^3.1.14 (dev)
- ⚠ `fs` and `path` are listed as npm deps — these are Node built-ins; the npm packages are noise (`fs@0.0.1-security` is a placeholder package).

**Frontend** (`frontend/package.json`, `"type": "module"`)
- react ^19.2.6, react-dom ^19.2.6
- react-router-dom ^7.15.0
- vite ^8.0.12, @vitejs/plugin-react ^6.0.1, @tailwindcss/vite ^4.3.0, tailwindcss ^4.3.0
- framer-motion ^12.38.0, lucide-react ^1.14.0, recharts ^3.8.1
- radix-ui ^1.4.3, class-variance-authority, clsx, tailwind-merge
- babel-plugin-react-compiler ^1.0.0 (React Compiler enabled)
- ⚠ `react-mic` and `multer` listed but unused. VoiceScreen uses raw `MediaRecorder`; `multer` is server-only.

No `engines` field; no lockfile-pinned Node version. Tested with Node 20 LTS or newer (Vite 8 requires Node ≥ 20.19/22.12).

## How to run

```powershell
# from repo root
# backend
cd backend; npm install; npm run dev   # nodemon, listens on PORT (5000 default)

# frontend (separate terminal)
cd frontend; npm install; npm run dev  # vite dev server (default :5173)
```

The single `.env` lives at repo root and is loaded by `backend/src/server.js` via `require("dotenv").config()` (no path → uses cwd). Start the backend from the repo root or from `backend/` — `dotenv` resolves from `process.cwd()`. The current scripts are launched from `backend/`, so dotenv looks for `backend/.env`. **The committed convention is `.env` at repo root**, so run the backend from repo root, or move `.env` into `backend/`. See Gotchas.

## Architecture

### Web voice path

```
Browser MediaRecorder (audio/webm)
  → POST /api/upload-audio  (multipart, field "audio")
    → frontend/src/services/screening.service.js
    → backend/src/routes/upload.routes.js
      ├ multer.diskStorage → backend/uploads/upload-<ts>.webm
      ├ fluent-ffmpeg (ffmpeg-static binary) → .mp3
      ├ services/whisper.service.js → groq.audio.transcriptions.create (model: whisper-large-v3)
      ├ services/llm.service.js → groq.chat.completions.create (model: llama-3.3-70b-versatile)
      ├ services/risk.service.js → uppercases risk_level, flags HIGH/CRITICAL
      ├ services/database.service.js → supabase.from("screenings").insert(...)
      └ services/database.service.js → supabase.from("alerts").insert(...)  ← ALWAYS inserts
  → returns { transcript, aiResponse, riskData }
  → ResultScreen receives via react-router location.state (in-memory only)
```

### WhatsApp path

```
WhatsApp user → Twilio sandbox (+14155238886) → POST /webhook/whatsapp
  → backend/src/routes/whatsapp.routes.js
  → backend/src/controllers/whatsapp.controller.js
    ├ res.status(200).send() immediately (fast ack)
    ├ axios GET MediaUrl0 with HTTP Basic (Twilio SID/auth) → backend/uploads/voice-<ts>.ogg
    ├ whisper.service.js (NO ffmpeg conversion — sends .ogg straight to Groq)
    ├ llm.service.js
    ├ risk.service.js
    ├ database.service.js: saveScreening(...) always
    ├ database.service.js: saveAlert(...) ONLY if risk_level is HIGH or CRITICAL
    └ twilio.service.js → client.messages.create({ from: "whatsapp:+14155238886", to: sender, body: response_for_user })
```

Non-audio media and plain text messages are logged and dropped.

## Key modules

| File | Owns |
| --- | --- |
| `backend/src/app.js` | Express app, CORS open, mounts `/api` (uploads + dashboard) and `/webhook` |
| `backend/src/routes/upload.routes.js` | `POST /api/upload-audio` — multer + ffmpeg + full pipeline |
| `backend/src/routes/dashboard.routes.js` | `GET /api/screenings`, `/api/alerts`, `/api/stats` |
| `backend/src/routes/whatsapp.routes.js` | `POST /webhook/whatsapp` |
| `backend/src/controllers/whatsapp.controller.js` | Twilio media download + pipeline + reply |
| `backend/src/controllers/dashboard.controller.js` | Reads from Supabase, counts HIGH/MEDIUM rows |
| `backend/src/services/whisper.service.js` | Groq Whisper (`whisper-large-v3`, text response) |
| `backend/src/services/llm.service.js` | Groq chat (`llama-3.3-70b-versatile`, temp 0.3); large embedded system prompt; returns parsed JSON |
| `backend/src/services/risk.service.js` | Maps `risk_level` string to `{ riskLevel, alertTriggered, timestamp }`; no thresholds — pure passthrough of LLM verdict |
| `backend/src/services/twilio.service.js` | `sendWhatsAppMessage(to, body)` from sandbox number |
| `backend/src/services/database.service.js` | `saveScreening`, `saveAlert` inserts |
| `backend/src/utils/languageDetector.js` | `franc` → label (Hindi/English/Tamil/Telugu/Bengali/Marathi/Kannada/Gujarati/Malayalam/Punjabi; falls back to English) |
| `frontend/src/services/api.js` | axios instance, baseURL **hardcoded** `http://localhost:5000` |
| `frontend/src/pages/VoiceScreen.jsx` | MediaRecorder → uploadScreeningAudio; in-flow IDLE/RECORDING/PROCESSING/COMPLETE |
| `frontend/src/pages/ResultScreen.jsx` | Reads `location.state` from router; no refetch if page reloads |
| `frontend/src/pages/Dashboard.jsx` | Stats cards + Recharts BarChart |
| `frontend/src/pages/Analytics.jsx` | Recharts PieChart + AreaChart; uses `stats.lowRiskCases` which the API does not return |
| `frontend/src/pages/Alerts.jsx` | Groups alerts by HIGH/MEDIUM/LOW |
| `frontend/src/layouts/AppShell.jsx` | Responsive shell — sidebar (lg) + `MobileBottomNav` (mobile) |

## External services

- **Groq** — single SDK client (`backend/src/config/groq.js`). Two endpoints:
  - `audio.transcriptions.create` with `model: "whisper-large-v3"`, `response_format: "text"` → returns a string.
  - `chat.completions.create` with `model: "llama-3.3-70b-versatile"`, `temperature: 0.3`. System prompt enforces a JSON-only schema: `{ risk_level, possible_concern, warning_signs[], recommended_action, response_for_user }`. The code does `JSON.parse(rawResponse)` with no fallback — invalid JSON throws.
- **Supabase** — anon-key client (`backend/src/config/supabase.js`). Tables referenced in code:
  - `screenings` — fields written: `sender`, `transcript`, `risk_level`, `possible_concern`, `recommended_action`, `response_for_user`, `warning_signs`. Read order uses `created_at`, so a timestamp column is assumed.
  - `alerts` — fields written depend on path:
    - From WhatsApp: `sender`, `transcript`, `risk_level`, `possible_concern`.
    - From web upload: ALL screening fields (full `screeningData` object).
  - Read order uses `created_at`.
  - No migrations/SQL in the repo. No RLS policies defined here. Table schema is implicit.
- **Twilio** — sandbox WhatsApp at `whatsapp:+14155238886` (hardcoded in `twilio.service.js`). Inbound webhook expected at `POST /webhook/whatsapp`. Media downloads use HTTP Basic auth with `TWILIO_ACCOUNT_SID` / `TWILIO_AUTH_TOKEN`.

## Environment variables

All read from `process.env`; **no `.env.example` exists**. `.env` is at repo root.

| Var | Used by | Required |
| --- | --- | --- |
| `PORT` | `backend/src/server.js` | optional (default 5000) |
| `GROQ_API_KEY` | `backend/src/config/groq.js` | yes |
| `SUPABASE_URL` | `backend/src/config/supabase.js` | yes |
| `SUPABASE_ANON_KEY` | `backend/src/config/supabase.js` | yes |
| `TWILIO_ACCOUNT_SID` | `backend/src/services/twilio.service.js`, `whatsapp.controller.js` | yes for WhatsApp |
| `TWILIO_AUTH_TOKEN` | same | yes for WhatsApp |

Frontend uses **no** environment variables. The backend URL is hardcoded `http://localhost:5000` in `frontend/src/services/api.js`. If env wiring is added later, the project is Vite, so the prefix is `VITE_` (not `NEXT_PUBLIC_`, not `REACT_APP_`).

## Conventions found in the code

- **Module system**: backend CommonJS (`require`/`module.exports`), frontend ESM (`import`/`export`).
- **No TypeScript**. Frontend is `.jsx`. `jsconfig.json` defines `@/*` → `./src/*`; vite.config.js mirrors the alias.
- **Tailwind v4** — config-less; styles live in `frontend/src/index.css`. shadcn config in `frontend/components.json` (style `radix-nova`, base color `neutral`).
- **Error handling**: services `console.error` + rethrow; route/controller handlers catch and `res.status(500).json({ error })`. The WhatsApp controller logs and swallows so the pipeline failure doesn't reply to the user.
- **Logging**: heavily decorated `━━━` banners with `[STAGE]` tags throughout backend.
- **LLM prompt**: the entire system prompt is inlined as a template string in `backend/src/services/llm.service.js`. The detected language label is interpolated into the prompt. The prompt mandates JSON output and lists HIGH-risk symptoms by name (chest pain, breathing difficulty, seizures, pregnancy complications, etc.). The example JSON schema in the prompt is missing a closing `}` — see Gotchas.
- **Risk thresholds**: there are no numeric thresholds. `risk.service.js` trusts the LLM's `risk_level` string verbatim (uppercased). Only `HIGH` and `CRITICAL` set `alertTriggered = true`.
- **Routing**: backend uses `/api` for app endpoints and `/webhook` for Twilio. Frontend uses BrowserRouter with explicit `<Route>` per page (`/`, `/voice`, `/result`, `/dashboard`, `/alerts`, `/analytics`).

## Gotchas

- **`.env` location vs cwd**: `server.js` does `require("dotenv").config()` with no path. `dotenv` reads `<cwd>/.env`. The committed `.env` lives at repo root. The scripts (`npm run dev`) run from `backend/`, so dotenv looks at `backend/.env` and finds nothing. Either run from repo root (`node backend/src/server.js`) or copy/move `.env` into `backend/`. The dev experience that works today is probably "the developer happens to start from repo root" — verify before assuming the WhatsApp/Groq integration is even reachable.
- **Middleware order**: `app.use("/api", uploadRoutes)` is registered **before** `express.json()` / `express.urlencoded()`. Multer handles its own multipart parsing, so the upload route is fine. The dashboard `/api` GETs don't need body parsing. But any future JSON POST under `/api` will silently get an empty `req.body` unless the order is fixed.
- **CORS**: `app.use(cors())` with no options → allow-all origins. Acceptable for local dev; tighten before deploy.
- **Supabase anon key on the server**: `database.service.js` does INSERTs using `SUPABASE_ANON_KEY`. This only works if the `screenings` and `alerts` tables have permissive RLS or RLS is off. No policy SQL is in the repo. For production, use the service role key on the backend or define RLS.
- **`alerts` insert shape mismatch**: web upload route inserts the full screening payload into `alerts`; WhatsApp controller inserts only 4 columns. Either the `alerts` table accepts both (extra columns are nullable) or one of these paths errors. Verify in Supabase.
- **Web `saveAlert` is unconditional**: the upload route saves an alert for every screening regardless of risk level. WhatsApp controller saves alerts only for HIGH/CRITICAL. The Alerts page assumes alerts are interesting — currently it shows web-flow LOW/MEDIUM screenings too.
- **ffmpeg only on the web path**: WhatsApp audio (`.ogg`/opus) is sent to Groq Whisper directly; web `.webm` is converted to `.mp3` first. If Whisper accepts both, the ffmpeg step is unnecessary; otherwise the WhatsApp path may have edge cases with formats Twilio sends.
- **Stale audio files**: `backend/uploads/` is created on demand; both pipelines `unlink` files at the end, but on error paths the cleanup is skipped. The folder is gitignored.
- **`ResultScreen` state loss**: the result is passed via `react-router` `location.state`. A page refresh on `/result` shows "No result data found." There is no refetch by ID.
- **Frontend hardcoded API URL**: `frontend/src/services/api.js` has `baseURL: "http://localhost:5000"`. Deploying the frontend requires either editing this or adding a `VITE_API_URL` env wire-up.
- **LLM prompt JSON example is malformed**: the schema example in `llm.service.js` (lines 116–122) is missing its closing `}` before "RESPONSE STRUCTURE". The model usually recovers, but it's an inconsistent prompt and the cause of any JSON-parse failures.
- **Twilio media download timeout**: `axios` timeout in `whatsapp.controller.js` is 30s; large audio over slow links will fail silently (Twilio already got its 200).
- **Frontend `multer` and `react-mic` deps**: installed but unused. Safe to remove. `react-mic` exists alongside the actual implementation using raw `MediaRecorder`.
- **Backend `fs` and `path` npm packages**: `package.json` lists them as deps. These are Node built-ins; the npm package `fs@0.0.1-security` is a deprecation placeholder. Remove from deps.

## What is NOT done yet

- `frontend/src/services/alerts.service.js` — empty file (alerts are fetched via `dashboard.service.js#getAlerts`).
- `frontend/src/pages/HistoryScreen.jsx` — empty file. No `/history` route exists in `App.jsx`.
- `frontend/src/layouts/DashboardLayout.jsx` — empty file. `AppShell.jsx` is the actual layout.
- `architecture.md` — empty.
- Root `README.md` — was empty (now written).
- No tests, no CI, no Dockerfile, no deploy config.
- Analytics page references `stats.lowRiskCases` which `getStats` never returns → pie chart's "Low" slice is always 0.
- No auth on any endpoint. `GET /api/screenings`, `/api/alerts`, `/api/stats` expose every patient transcript and risk to anyone who can reach the backend.
- No retry / dead-letter handling for the WhatsApp pipeline. Twilio gets a 200 before transcription starts, so any failure is silent to the sender.
- No idempotency on Twilio webhook (Twilio retries on timeout).
- No environment example file. No setup instructions for the Supabase tables.
