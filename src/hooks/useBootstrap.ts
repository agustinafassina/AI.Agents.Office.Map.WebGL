import { useEffect } from 'react';
import { useChatStore } from '@/stores/chat.store';
import { useAgentsStore } from '@/stores/agents.store';
import { preloadChatAssets } from '@/utils/preloadChatPanel';

export function useBootstrap() {
  const bootstrap = useChatStore((state) => state.bootstrap);

  useEffect(() => {
    void bootstrap();
  }, [bootstrap]);
}

export function useAgentBootstrap() {
  const connectionStatus = useChatStore((state) => state.connectionStatus);
  const definitions = useAgentsStore((state) => state.definitions);
  const initialize = useAgentsStore((state) => state.initialize);

  useEffect(() => {
    if (connectionStatus === 'idle' || connectionStatus === 'connecting') return;
    if (definitions.length === 0) return;
    initialize();
  }, [connectionStatus, definitions, initialize]);
}

export function useChatPanelPreload() {
  useEffect(() => {
    preloadChatAssets();
  }, []);
}
