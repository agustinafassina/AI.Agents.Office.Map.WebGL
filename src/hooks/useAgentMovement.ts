import { useFrame } from '@react-three/fiber';
import { useAgentBootstrap } from '@/hooks/useBootstrap';
import { useAmbientAgentConversations } from '@/hooks/useAmbientAgentConversations';
import { useAgentsStore } from '@/stores/agents.store';

export function useAgentMovement() {
  useAgentBootstrap();
  useAmbientAgentConversations();
  const tick = useAgentsStore((state) => state.tick);

  useFrame(
    (_, delta) => {
      tick(delta);
    },
    -1,
  );
}