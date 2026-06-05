import { Billboard, Text } from '@react-three/drei';

interface AgentChestBadgeProps {
  role: string;
  accentColor: string;
}export function AgentChestBadge({ role, accentColor }: AgentChestBadgeProps) {
  return (
    <Billboard position={[0, 0.36, 0.072]} follow lockX lockZ>
      <mesh position={[0, 0, -0.002]}>
        <planeGeometry args={[0.11, 0.038]} />
        <meshBasicMaterial color={accentColor} transparent opacity={0.92} />
      </mesh>
      <Text
        fontSize={0.026}
        color="#f5f3ef"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.004}
        outlineColor="#2a3d34"
        letterSpacing={0.02}
      >
        {role.toUpperCase()}
      </Text>
    </Billboard>
  );
}
