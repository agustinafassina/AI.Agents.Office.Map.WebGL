# 🏢 AI Agents Office Map (WebGL)
Interactive isometric office diorama (L-shaped open plan, sage/terracotta palette) where AI agents appear as avatars, walk autonomously, and open a LiteLLM-powered chat when selected.

## 🛠️ Stack
- **React 19 + TypeScript + Vite**
- **Three.js** via **React Three Fiber** and **Drei**
- **Zustand** for predictable, decoupled state
- **LiteLLM** (OpenAI-compatible API) behind a service abstraction

## 🚀 Quick start
```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173). By default **mock LiteLLM** is enabled so you can test without a backend.

## 🤖 LiteLLM configuration
1. Copy `.env.example` to `.env`
2. Point `VITE_LITELLM_BASE_URL` at your LiteLLM instance (or keep `/api/litellm` for the Vite dev proxy)
3. Set `VITE_LITELLM_API_KEY` and `VITE_USE_MOCK_LITELLM=false`

The dev server proxies `/api/litellm` → `http://localhost:4000` (override with `VITE_LITELLM_BASE_URL`).

## 📁 Project structure
```
src/
  app/                 # Root layout
  components/
    scene/             # WebGL office, furniture, avatars, camera
    ui/                # Chat panel, HUD (no Three.js imports)
  config/              # Agents, waypoints, palette, env
  hooks/               # Movement loop, bootstrap
  services/litellm/    # API client + service (swap/extend here)
  stores/              # agents, scene selection, chat
  types/               # Shared TypeScript contracts
  utils/               # Movement math, IDs
```

## 🎨 Textures (illustrative style)
At runtime the app paints **procedural textures** (tiles, plaster walls, wood grain, jute rugs, foliage) so the scene feels hand-illustrated without external assets.

To use your own images (e.g. exports from the reference art), add PNGs under `public/textures/` — see `public/textures/README.md` for filenames. They load automatically when present.

## 🔧 Extending
| Goal | Where to look |
|------|----------------|
| Add agents | `src/config/agents.config.ts` |
| Change models per agent | `modelId` on each agent definition |
| New furniture / rooms | `src/components/scene/furniture/` — L-shaped hub (`LShapedDesk`, `CentralWorkHub`), lounge, meeting, private nook |
| Movement paths | `OFFICE_WAYPOINTS` in `agents.config.ts` |
| LiteLLM behavior | `src/services/litellm/` |
| Chat UI | `src/components/ui/ChatPanel.tsx` |

## 🏗️ Architecture principles
- **Rendering vs UI**: Scene components never import chat UI; stores bridge selection and chat.
- **LiteLLM isolation**: UI and stores call `liteLLMService`, not `fetch` directly.
- **Agent config vs runtime**: Definitions are static; `agents.store` owns positions and status.
- **Per-agent conversations**: History keyed by `agentId` so closing the panel preserves threads.

## ⚡ Scripts
- `npm run dev` — development server
- `npm run build` — production build
- `npm run preview` — preview production build
