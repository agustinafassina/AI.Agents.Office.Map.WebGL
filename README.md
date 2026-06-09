# 🏢 AI Agents Office Map (WebGL)
> **Languages:** English (this file) · [Español](README.es.md) — keep both README files in sync when updating.

Isometric office diorama rendered with **WebGL** (Three.js + React Three Fiber). AI agents appear as avatars, walk autonomously, and open a LiteLLM-powered chat when selected.

## 🎬 Demo
![Select an agent, chat with LiteLLM, send them for coffee](docs/demo.gif)

**~30 s flow:** map pan → click agent → chat message → `ve a tomar cafe` → avatar walks to the café.

## ✨ Features
- **LiteLLM** — agents from `/v1/models`, or mock mode without a backend
- **Per-agent chat** — sidebar history; map zoom on selection
- **Scene commands** — `ve a tomar cafe`, `relajate`, `vuelve al escritorio`
- **Office sim** — coffee breaks, bar queue, zone waypoints, collision-aware movement
- **Procedural textures** — illustrated look without external assets (optional PNGs in `public/textures/`)
- **Bilingual UI** — EN (default) + ES via the language selector in the HUD; agent roles and prompts in `public/agents.json` support both locales

## 🛠️ Stack
- **React 19 + TypeScript + Vite**
- **Three.js** via **React Three Fiber** + **Drei** (WebGL scene)
- **Zustand** — agents, selection, chat state
- **LiteLLM** — OpenAI-compatible API behind `src/services/litellm/`

## 🚀 Quick start
```bash
npm install
npm run dev    # http://localhost:5173
npm run build
npm run preview
```

Mock LiteLLM is on by default — no backend required for a first run.

## 🤖 LiteLLM configuration
1. Copy `.env.example` to `.env`
2. Set `VITE_LITELLM_BASE_URL` (or keep `/api/litellm` for the Vite dev proxy → `localhost:4000`)
3. Set `VITE_LITELLM_API_KEY` and `VITE_USE_MOCK_LITELLM=false`

## 📁 Project structure
```
src/
  components/scene/    # WebGL office, furniture, avatars
  components/ui/       # Chat panel, HUD (no Three.js)
  config/              # Agents, waypoints, obstacles
  services/litellm/    # API client + service layer
  stores/              # agents, scene, chat
  utils/               # Movement, collision, chat commands
docs/                  # demo GIF + recording guide
```

## 🔧 Extending
| Goal | Where |
|------|--------|
| Agents from models | `src/config/agentsFromModels.ts` |
| Chat commands | `src/utils/chatAgentCommands.ts`, `chat.store.ts` |
| Furniture / rooms | `src/components/scene/furniture/` |
| Movement / collision | `src/utils/collision.ts`, `officeObstacles.ts` |
| LiteLLM | `src/services/litellm/` |

## 🏗️ Architecture
- **Scene vs UI** — WebGL components never import chat UI; stores connect them.
- **LiteLLM isolation** — call `liteLLMService`, not `fetch` directly.
- **Config vs runtime** — definitions from config/API; `agents.store` owns positions and status.
- **Per-agent threads** — chat history keyed by `agentId`.

## 📄 License
By **Agustina Fassina**
