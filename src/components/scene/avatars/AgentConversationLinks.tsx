import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useAgentsStore } from '@/stores/agents.store';
import { useConversationVisualsStore } from '@/stores/conversationVisuals.store';

function ConversationArc({
  from,
  to,
  color,
  opacity,
}: {
  from: [number, number, number];
  to: [number, number, number];
  color: string;
  opacity: number;
}) {
  const materialRef = useRef<THREE.MeshBasicMaterial>(null);
  const geometry = useMemo(() => {
    const a = new THREE.Vector3(from[0], from[1] + 0.75, from[2]);
    const b = new THREE.Vector3(to[0], to[1] + 0.75, to[2]);
    const mid = new THREE.Vector3().addVectors(a, b).multiplyScalar(0.5);
    mid.y += 0.55;
    const curve = new THREE.QuadraticBezierCurve3(a, mid, b);
    return new THREE.TubeGeometry(curve, 24, 0.012, 6, false);
  }, [from, to]);

  useFrame((state) => {
    if (!materialRef.current) return;
    materialRef.current.opacity = opacity * (0.78 + Math.sin(state.clock.elapsedTime * 4.5) * 0.14);
  });

  return (
    <mesh geometry={geometry}>
      <meshBasicMaterial ref={materialRef} color={color} transparent opacity={opacity} />
    </mesh>
  );
}

function UserChatHalo({ position }: { position: [number, number, number] }) {
  const ringRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!ringRef.current) return;
    const pulse = 0.92 + Math.sin(state.clock.elapsedTime * 3.2) * 0.08;
    ringRef.current.scale.setScalar(pulse);
  });

  return (
    <mesh ref={ringRef} position={[position[0], 0.02, position[2]]} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[0.42, 0.52, 32]} />
      <meshBasicMaterial color="#d4a574" transparent opacity={0.28} />
    </mesh>
  );
}

export function AgentConversationLinks() {
  const peerConversations = useConversationVisualsStore((s) => s.peerConversations);
  const userChatAgentId = useConversationVisualsStore((s) => s.userChatAgentId);
  const runtime = useAgentsStore((s) => s.runtime);

  const userChatPos = userChatAgentId ? runtime[userChatAgentId]?.position : null;

  return (
    <group>
      {peerConversations.map((chat) => {
        const posA = runtime[chat.agentA]?.position;
        const posB = runtime[chat.agentB]?.position;
        if (!posA || !posB) return null;
        return (
          <ConversationArc
            key={chat.id}
            from={posA}
            to={posB}
            color="#b8c9a8"
            opacity={0.72}
          />
        );
      })}
      {userChatPos && <UserChatHalo position={userChatPos} />}
    </group>
  );
}
