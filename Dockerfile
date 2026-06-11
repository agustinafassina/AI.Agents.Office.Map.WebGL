FROM node:22-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm npm ci --no-audit --no-fund

COPY . .

ARG VITE_LITELLM_BASE_URL=/api/litellm
ARG VITE_LITELLM_API_KEY=
ARG VITE_USE_MOCK_LITELLM=true
ARG VITE_ENABLE_AGENT_PEER_CHAT=true
ARG VITE_AGENTS_CONFIG_URL=/agents.json

ENV VITE_LITELLM_BASE_URL=$VITE_LITELLM_BASE_URL \
    VITE_LITELLM_API_KEY=$VITE_LITELLM_API_KEY \
    VITE_USE_MOCK_LITELLM=$VITE_USE_MOCK_LITELLM \
    VITE_ENABLE_AGENT_PEER_CHAT=$VITE_ENABLE_AGENT_PEER_CHAT \
    VITE_AGENTS_CONFIG_URL=$VITE_AGENTS_CONFIG_URL

RUN npm run build

# --- Serve with nginx + LiteLLM proxy ---
FROM nginxinc/nginx-unprivileged:1.27-alpine AS runtime

COPY docker/nginx/default.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build --chown=nginx:nginx /app/dist /usr/share/nginx/html

ENV LITELLM_UPSTREAM=http://host.docker.internal:4000

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://127.0.0.1:8080/healthz > /dev/null || exit 1