import { Billboard, Text } from '@react-three/drei';
import type { AgentStatus } from '@/types/agent';

interface AgentLabelProps {
  name: string;
  status: AgentStatus;
  accentColor: string;
  selected: boolean;
}

function statusColor(status: AgentStatus): string {
  if (status === 'chatting') return '#6eb5ff';
  if (status === 'walking') return '#e8c66a';
  return '#9aa3b2';
}

export function AgentLabel({ name, status, accentColor, selected }: AgentLabelProps) {
  return (
    <Billboard position={[0, 1.12, 0]} follow lockX lockZ>
      <group>
        {selected && (
          <mesh position={[0, 0.06, -0.02]}>
            <planeGeometry args={[0.55, 0.22]} />
            <meshBasicMaterial color={accentColor} transparent opacity={0.25} />
          </mesh>
        )}
        <Text
          fontSize={0.085}
          color="#f8fafc"
          anchorX="center"
          anchorY="bottom"
          outlineWidth={0.01}
          outlineColor="#4a5568"
          maxWidth={1}
        >
          {name}
        </Text>
        <Text
          position={[0, -0.06, 0]}
          fontSize={0.038}
          color={statusColor(status)}
          anchorX="center"
          anchorY="top"
          letterSpacing={0.04}
        >
          {status}
        </Text>
      </group>
    </Billboard>
  );
}