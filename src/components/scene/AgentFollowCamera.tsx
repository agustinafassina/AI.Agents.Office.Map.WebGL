import { useFrame } from '@react-three/fiber';
import { useAgentsStore } from '@/stores/agents.store';
import { useSceneStore } from '@/stores/scene.store';
import { isAgentMoving } from '@/utils/agentMovement';

export function AgentFollowCamera() {
  useFrame(() => {
    const { followAgentId, setFollowPan, setFollowAgent } = useSceneStore.getState();
    if (!followAgentId) return;

    const runtime = useAgentsStore.getState().getRuntime(followAgentId);
    if (!runtime || !isAgentMoving(runtime.status)) {
      setFollowAgent(null);
      return;
    }

    const [x, , z] = runtime.position;
    setFollowPan(x, z);
  });

  return null;
}
