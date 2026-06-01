import { useFrame } from '@react-three/fiber';
import { useRef, useMemo } from 'react';
import * as THREE from 'three';
import type { AgentDefinition, AgentRuntimeState } from '@/types/agent';
import { useSceneStore } from '@/stores/scene.store';
import { useChatStore } from '@/stores/chat.store';
import { AgentLabel } from './AgentLabel';
import { softColor } from '../materials';

interface AgentAvatarProps {
  definition: AgentDefinition;
  runtime: AgentRuntimeState;
}

export function AgentAvatar({ definition, runtime }: AgentAvatarProps) {
  const groupRef = useRef<THREE.Group>(null);
  const selectedId = useSceneStore((s) => s.selectedAgentId);
  const selectAgent = useSceneStore((s) => s.selectAgent);
  const openChat = useChatStore((s) => s.openChat);
  const isSelected = selectedId === definition.id;

  const bodyMat = useMemo(
    () => softColor(definition.avatarColor),
    [definition.avatarColor],
  );
  const accentMat = useMemo(
    () => softColor(definition.accentColor),
    [definition.accentColor],
  );

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    const [x, y, z] = runtime.position;
    groupRef.current.position.lerp(new THREE.Vector3(x, y, z), 1 - Math.exp(-12 * delta));
    groupRef.current.rotation.y = THREE.MathUtils.lerp(
      groupRef.current.rotation.y,
      runtime.rotation,
      1 - Math.exp(-10 * delta),
    );

    const bob =
      runtime.status === 'walking'
        ? Math.sin(performance.now() * 0.012) * 0.02
        : runtime.status === 'chatting'
          ? Math.sin(performance.now() * 0.006) * 0.012
          : Math.sin(performance.now() * 0.004) * 0.008;
    groupRef.current.position.y = y + bob;
  });

  const handleClick = (e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    selectAgent(definition.id);
    openChat(definition.id);
  };

  const status =
    runtime.status === 'chatting'
      ? 'chatting'
      : runtime.status === 'walking'
        ? 'walking'
        : 'idle';

  return (
    <group ref={groupRef} position={definition.spawnPosition}>
      {isSelected && (
        <>
          <mesh position={[0, 0.015, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.42, 32]} />
            <meshBasicMaterial color="#ffe9a8" transparent opacity={0.45} />
          </mesh>
          <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.28, 0.36, 32]} />
            <meshBasicMaterial color="#ffedb8" transparent opacity={0.85} />
          </mesh>
        </>
      )}

      <group onClick={handleClick} onPointerOver={() => (document.body.style.cursor = 'pointer')}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
          <circleGeometry args={[0.2, 16]} />
          <meshBasicMaterial color="#000000" transparent opacity={0.14} />
        </mesh>

        <mesh position={[0, 0.32, 0]} castShadow material={bodyMat}>
          <capsuleGeometry args={[0.12, 0.22, 4, 8]} />
        </mesh>
        <mesh position={[0, 0.56, 0]} castShadow material={accentMat}>
          <sphereGeometry args={[0.13, 8, 6]} />
        </mesh>
        <mesh position={[0, 0.4, 0.14]} material={accentMat}>
          <boxGeometry args={[0.08, 0.08, 0.02]} />
        </mesh>
      </group>

      <AgentLabel
        name={definition.name}
        status={status}
        accentColor={definition.accentColor}
        selected={isSelected}
      />
    </group>
  );
}