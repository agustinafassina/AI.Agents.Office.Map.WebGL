import { Billboard, Text } from '@react-three/drei';
import type { AgentStatus } from '@/types/agent';

interface AgentLabelProps {
  name: string;
  role?: string;
  modelId?: string;
  status: AgentStatus;
  socialChat?: boolean;
  accentColor: string;
  selected: boolean;
}

function statusColor(status: AgentStatus, socialChat: boolean): string {
  if (socialChat) return '#a8c4a0';
  if (status === 'chatting') return '#d4a574';
  if (status === 'coffee') return '#c8a882';
  if (status === 'coffee-queue') return '#a8b5a0';
  if (status === 'walking') return '#c8d4a8';
  return '#9aab9e';
}

function statusLabel(status: AgentStatus, socialChat: boolean): string {
  if (socialChat) return 'Talking';
  if (status === 'chatting') return 'In chat';
  if (status === 'coffee') return 'Coffee break';
  if (status === 'coffee-queue') return 'In line';
  if (status === 'walking') return 'Moving';
  return 'Available';
}

export function AgentLabel({ name, status, socialChat = false, accentColor, selected }: AgentLabelProps) {
  return (
    <Billboard position={[0, 1.16, 0]} follow lockX lockZ>
      <group>
        {selected && (
          <mesh position={[0, 0.04, -0.02]}>
            <planeGeometry args={[0.52, 0.2]} />
            <meshBasicMaterial color={accentColor} transparent opacity={0.2} />
          </mesh>
        )}
        <Text
          fontSize={0.08}
          color="#f5f3ef"
          anchorX="center"
          anchorY="bottom"
          outlineWidth={0.008}
          outlineColor="#2a3d34"
          maxWidth={1.2}
        >
          {name}
        </Text>
        <Text
          position={[0, -0.055, 0]}
          fontSize={0.034}
          color={statusColor(status, socialChat)}
          anchorX="center"
          anchorY="top"
          letterSpacing={0.03}
        >
          {statusLabel(status, socialChat)}
        </Text>
      </group>
    </Billboard>
  );
}
