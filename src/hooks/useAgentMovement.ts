import { useFrame } from '@react-three/fiber';
import { useEffect } from 'react';
import { useAgentsStore } from '@/stores/agents.store';

export function useAgentMovement() {
  const initialize = useAgentsStore((s) => s.initialize);
  const tick = useAgentsStore((s) => s.tick);

  useEffect(() => {
    initialize();
  }, [initialize]);

  useFrame((_, delta) => {
    tick(delta);
  });
}
