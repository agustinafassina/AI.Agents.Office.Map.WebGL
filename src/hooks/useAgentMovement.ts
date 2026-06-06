import { useFrame } from '@react-three/fiber';
import { useAgentBootstrap } from '@/hooks/useBootstrap';
import { useAgentsStore } from '@/stores/agents.store';

export function useAgentMovement() {
  useAgentBootstrap();
  const tick = useAgentsStore((state) => state.tick);

  useFrame((_, delta) => {
    tick(delta);
  });
}