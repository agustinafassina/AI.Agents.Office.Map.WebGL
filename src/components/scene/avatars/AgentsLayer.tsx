import { useAgentsStore } from '@/stores/agents.store';
import { AgentAvatar } from './AgentAvatar';

export function AgentsLayer() {
  const definitions = useAgentsStore((s) => s.definitions);
  const runtime = useAgentsStore((s) => s.runtime);

  return (
    <group>
      {definitions.map((def) => {
        const state = runtime[def.id];
        if (!state) return null;
        return <AgentAvatar key={def.id} definition={def} runtime={state} />;
      })}
    </group>
  );
}
