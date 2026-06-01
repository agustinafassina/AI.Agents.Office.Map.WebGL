import { useEffect } from 'react';
import { useChatStore } from '@/stores/chat.store';

export function useBootstrap() {
  const bootstrap = useChatStore((s) => s.bootstrap);

  useEffect(() => {
    void bootstrap();
  }, [bootstrap]);
}
