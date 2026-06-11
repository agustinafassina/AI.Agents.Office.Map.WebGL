# 🏢 AI Agents Office Map (WebGL)
> **Languages:** English (this file) · [Español](README.es.md) — keep both README files in sync when updating.

Isometric office diorama rendered with **WebGL**. AI agents appear as avatars, move through the office, and open a LiteLLM-powered chat when selected. The app can run fully in mock mode, or connect to a real OpenAI-compatible LiteLLM proxy.

## 🎬 Demo
![Chat with agents, scene commands, peer conversations and live interaction log](docs/demo.gif)

**~75 s flow:** pan the map → chat with an agent → send `ve a tomar cafe` → peer **banner + speech bubbles** → open **View log** → zone lights as avatars move → switch zones.

Use `http://localhost:5173/?demo=1` for faster peer chats while recording. See [docs/DEMO_RECORDING.md](docs/DEMO_RECORDING.md) (or [ES](docs/DEMO_RECORDING.es.md)) to regenerate the GIF and copy a LinkedIn post draft.

## ✨ What It Includes
- **Interactive 3D office:** React Three Fiber + Drei, isometric camera, zones, furniture, avatars and ambient details.
- **Per-agent chat:** one persisted conversation per agent, markdown responses, streaming replies, **Stop** while generating, and model switching from the panel.
- **Peer agent conversations:** nearby idle agents pair by proximity and chat via LLM (alternating turns); a top **banner** and speech bubbles show live text in the scene.
- **Zone occupancy lighting:** area lights brighten when avatars are present in a zone.
- **Interaction log:** live panel in the HUD plus downloadable `.txt` export of agent-to-agent messages.
- **LiteLLM integration:** mock mode by default; live mode uses `/api/litellm` proxy to `/v1/models` and `/v1/chat/completions`.
- **Configurable agents:** names, roles, models, zones, prompts, colors and avatar designs live in `public/agents.json`.
- **Bilingual UI:** English and Spanish UI, roles and prompts.
- **Scene commands:** chat instructions can move agents through the office.
- **Docker-ready runtime:** Vite build served by unprivileged nginx with `/api/litellm` proxy support.

## 🛠️ Tech Stack
- **React 19 + TypeScript + Vite**
- **Three.js** via **React Three Fiber** + **Drei** + **postprocessing**
- **Zustand** for scene, agent and chat state
- **react-markdown** + **remark-gfm** for chat rendering
- **LiteLLM** as OpenAI-compatible model gateway
- **nginx** for the Docker production image
- **Playwright** + **ffmpeg-static** (planned demo GIF capture script)

## 📋 Requirements
- **Node.js 22+** recommended
- **npm** (uses `package-lock.json`)
- **Docker + Docker Compose** if you want the containerized runtime
- Optional: a running **LiteLLM** proxy for live model calls

## 🚀 Quick Start
Run locally in mock mode, no backend needed:

```bash
npm install
npm run dev
```

Open `http://localhost:5173`.

Useful scripts:

```bash
npm run dev       # Vite dev server
npm run build     # TypeScript check + production build
npm run preview   # Preview the built app
npm run lint      # ESLint
npm run demo:gif  # Regenerate docs/demo.gif (requires scripts/capture-demo-gif.mjs)
```

## ⚙️ Environment Variables
Copy `.env.example` to `.env` for local development:

```bash
cp .env.example .env
```

On Windows PowerShell, `Copy-Item .env.example .env` works as well.

Main variables:

- `VITE_USE_MOCK_LITELLM`: `true` uses built-in mock models and responses. Set to `false` for live LiteLLM.
- `VITE_LITELLM_BASE_URL`: browser-facing LiteLLM base URL. Keep `/api/litellm` for local dev and Docker so Vite/nginx can proxy it.
- `VITE_LITELLM_API_KEY`: OpenAI-compatible bearer token used by the frontend client.
- `VITE_AGENTS_CONFIG_URL`: optional URL for the agent roster. Defaults to `/agents.json`.
- `VITE_ENABLE_AGENT_PEER_CHAT`: `true` (default) runs LLM peer conversations when agents pair in the scene; `false` keeps visual-only ambient chats.
- `LITELLM_PROXY_TARGET`: **dev only** — Vite proxy upstream for `/api/litellm`. Defaults to `http://localhost:4000`. Not embedded in the browser bundle.
- `OFFICE_MAP_PORT`: Docker host port for the web app. Defaults to `3000`.
- `LITELLM_UPSTREAM`: **Docker only** — nginx upstream for `/api/litellm`. Defaults to `http://host.docker.internal:4000`.

Important: `VITE_*` variables are embedded in the browser bundle at build time. Rebuild the app or Docker image after changing them. Avoid putting production secrets in `VITE_LITELLM_API_KEY`; for production, prefer enforcing authentication at the proxy/backend layer.

## 🤖 LiteLLM Modes
### Mock Mode
Mock mode is the default:

```env
VITE_USE_MOCK_LITELLM=true
VITE_LITELLM_BASE_URL=/api/litellm
VITE_LITELLM_API_KEY=
```

Use this for UI work, scene changes and demos without a model server.

### Live Mode
Start LiteLLM separately, usually on `localhost:4000`, then configure:

```env
VITE_USE_MOCK_LITELLM=false
VITE_LITELLM_BASE_URL=/api/litellm
VITE_LITELLM_API_KEY=sk-your-key
```

In local dev, Vite proxies `/api/litellm` to `LITELLM_PROXY_TARGET` (default `http://localhost:4000`) via `vite.config.ts`. **Do not** point `VITE_LITELLM_BASE_URL` at `:4000` directly — the browser would hit CORS.

## 🐳 Docker
Build and run the production image:

```bash
docker compose up --build
```

Open `http://localhost:3000`.

Mock mode is the default, so Docker works without LiteLLM. For live LiteLLM running on the host:

```bash
VITE_USE_MOCK_LITELLM=false VITE_LITELLM_API_KEY=sk-your-key docker compose up --build
```

You can also set those values in `.env`; Docker Compose reads it automatically.

Change the exposed app port:

```bash
OFFICE_MAP_PORT=8080 docker compose up --build
```

Change the LiteLLM upstream used by nginx:

```bash
LITELLM_UPSTREAM=http://host.docker.internal:4000 docker compose up --build
```

Docker notes:

- The final image serves static files with `nginxinc/nginx-unprivileged`.
- Container port is `8080`; Compose maps it to `OFFICE_MAP_PORT`.
- nginx proxies `/api/litellm` to `LITELLM_UPSTREAM` and keeps streaming responses unbuffered.
- `VITE_*` values are build args, so changing them requires `docker compose up --build`.

## 👥 Agents, Roles And Models
The default roster is `public/agents.json`. Each agent maps a visible character in the office to a model and role-specific system prompt.

Default agents:

- `backend-agent` — **Max**, Backend, `llama3-local`, center desk, Bob Marley-inspired avatar.
- `ux-agent` — **Lena**, UI/UX, `gemma2-2b-local`, living zone, Shakira-inspired avatar.
- `po-agent` — **Paula**, Product Owner, `qwen2.5-1.5b-local`, wall desks, Freddie Mercury-inspired avatar.
- `qa-agent` — **Quinn**, QA, `llama3.2-1b-local`, wall desks, Michael Jackson-inspired avatar.

Required fields for each agent:

- `id`: stable identifier used for chat history and runtime state.
- `name`: display name.
- `role`: localized object, for example `{ "en": "Backend", "es": "Backend" }`.
- `modelId`: model id expected from LiteLLM `/v1/models`.
- `logoUrl`: public asset path for the HUD/chat logo.
- `avatarColor` and `accentColor`: visual colors.
- `homeZone`: one of `center-desk`, `living`, `cafeteria`, `wall-desks`.
- `systemPrompt`: localized object used as the model system prompt.

Optional fields:

- `avatarDesignId`: one of `bob-marley`, `shakira`, `freddie-mercury`, `michael-jackson`.
- `wallDeskSlot`: `0`, `1` or `2`, only used by agents in `wall-desks`.

To use a custom roster, either edit `public/agents.json` or point `VITE_AGENTS_CONFIG_URL` to another JSON file with the same shape.

## 💬 Scene Commands
Type these in an agent chat to control the avatar:

- `ve a tomar cafe`: walk to the café queue.
- `relajate`: move to the living/relax zone.
- `vuelve al escritorio`: return to the agent's desk.
- `ve al hub`: move to the center hub.

Command parsing lives in `src/utils/chatAgentCommands.ts`; movement is dispatched through `agents.store`.

## 🤝 Peer Agent Conversations
When two idle agents are **close in the scene** (proximity-based pairing, any zone), the app can start an ambient peer chat:

1. `useAmbientAgentConversations` pairs eligible agents and opens a visual conversation link (works even with the user chat panel open — only the active agent is excluded).
2. `agentOrchestrator.service` runs up to four alternating LLM turns (serialized queue); falls back to mock lines if a live call fails.
3. Each turn calls `liteLLMService` with role-specific prompts and shared transcript history.
4. `conversationVisuals.store` drives the top banner and speech bubbles; `agentInteractionLog.store` records every turn.

HUD actions:

- **View log** — slide-up panel with live sessions and turns.
- **Download** — exports `office-agent-log-*.txt`.

Toggle peer LLM chats with `VITE_ENABLE_AGENT_PEER_CHAT`. Append `?demo=1` to the URL for faster pairing while recording demos.

## 📁 Project Structure
```text
public/
  agents.json           # Default agent roster, roles and prompts
  logos/                # Agent role icons
  textures/             # Optional PNG texture overrides
src/
  app/                  # Root app shell
  components/scene/     # WebGL office, furniture, avatars, camera
  components/ui/        # HUD, chat panel and non-WebGL UI
  config/               # Agents, zones, model sizing, avatar designs
  hooks/                # UI/scene hooks
  i18n/                 # EN/ES translations and localized helpers
  services/
    litellm/            # LiteLLM client + service layer
    agentOrchestrator.service.ts  # Peer chat turn queue
  stores/
    agentInteractionLog.store.ts  # Peer log + TXT export
    conversationVisuals.store.ts  # Peer bubbles + user chat visuals
  types/                # Shared TypeScript types
  utils/                # Movement, collision, persistence, chat commands
docker/
  nginx/                # Production nginx template
docs/
  demo.gif              # README demo animation
  architecture.png      # High-level architecture diagram
  DEMO_RECORDING.md     # How to record / regenerate the GIF + LinkedIn drafts (EN)
  DEMO_RECORDING.es.md  # Cómo grabar / regenerar el GIF + LinkedIn (ES)
```

## 🔧 Common Changes
- Add or edit agents: `public/agents.json`
- Change avatar musician designs: `src/config/avatarDesigns.ts`
- Change roles or prompts: `public/agents.json`
- Add chat commands: `src/utils/chatAgentCommands.ts` and `src/stores/chat.store.ts`
- Tune peer chat timing: `src/hooks/useAmbientAgentConversations.ts` and `src/services/agentOrchestrator.service.ts`
- Change interaction log UI: `src/components/ui/AgentLogPanel.tsx`
- Change peer banner or zone lights: `src/components/ui/PeerConversationBanner.tsx`, `src/components/scene/OfficeZoneLights.tsx`
- Add furniture or rooms: `src/components/scene/furniture/`
- Tune movement/collisions: `src/utils/collision.ts`, `src/config/officeObstacles.ts`, `src/stores/agents.store.ts`
- Change translations: `src/i18n/locales/en.json` and `src/i18n/locales/es.json`
- Change Docker proxy behavior: `docker/nginx/default.conf.template`

## 🏗️ Architecture

![Architecture overview](docs/architecture.png)

- **Scene and UI stay separate:** WebGL components do not import chat UI; Zustand stores connect scene actions to UI state.
- **LiteLLM stays isolated:** app code should call `liteLLMService`, not `fetch` directly.
- **Config vs runtime:** agent definitions come from JSON/API; runtime position/status lives in `agents.store`.
- **Per-agent threads:** chat history is keyed by `agentId` and persisted in `localStorage`.
- **Scene context:** each user message includes current agent/scene context from `buildAgentSceneContext`.
- **Peer orchestration:** one peer chat runs at a time through a queue; turns append to an in-memory log (exportable, not persisted across reloads).

## 🔍 Troubleshooting
- **Browser errors calling LiteLLM / CORS:** keep `VITE_LITELLM_BASE_URL=/api/litellm` and run LiteLLM on the host; set `LITELLM_PROXY_TARGET=http://localhost:4000` for dev.
- **Docker opens but live models do not load:** check `VITE_USE_MOCK_LITELLM=false`, rebuild the image, and verify `LITELLM_UPSTREAM`.
- **Changed `.env` but nothing changed:** restart Vite, or rebuild Docker because `VITE_*` variables are build-time values.
- **A model appears unavailable:** make sure `modelId` in `public/agents.json` exactly matches a LiteLLM `/v1/models` id.
- **Streaming is slow or stops:** check the LiteLLM proxy logs and nginx upstream URL; Docker nginx disables buffering for `/api/litellm`.
- **Agent interaction log stays empty:** leave the scene running ~15 s, try `?demo=1`, confirm `VITE_ENABLE_AGENT_PEER_CHAT=true`, and check that LiteLLM is reachable (mock fallback still logs turns if live calls fail).

## 📄 License
By **Agustina Fassina**
