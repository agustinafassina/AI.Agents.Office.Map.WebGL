import type { AgentDefinition } from '@/types/agent';
import { useAgentsStore } from '@/stores/agents.store';
import { AgentAvatar } from './AgentAvatar';

interface AgentAvatarEntryProps {
  definition: AgentDefinition;
}

export function AgentAvatarEntry({ definition }: AgentAvatarEntryProps) {
  const runtime = useAgentsStore((state) => state.runtime[definition.id]);
  if (!runtime) return null;
  return <AgentAvatar definition={definition} runtime={runtime} />;
}
