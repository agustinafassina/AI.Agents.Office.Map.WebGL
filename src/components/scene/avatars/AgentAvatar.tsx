import { useFrame } from '@react-three/fiber';
import { useRef, useMemo } from 'react';
import * as THREE from 'three';
import type { AgentDefinition, AgentRuntimeState } from '@/types/agent';
import { OFFICE_PALETTE } from '@/config/agents.config';
import { useSceneStore } from '@/stores/scene.store';
import { useChatStore } from '@/stores/chat.store';
import { AgentLabel } from './AgentLabel';
import { softColor } from '../materials';

interface AgentAvatarProps {
  definition: AgentDefinition;
  runtime: AgentRuntimeState;
}

const POS_SMOOTH = 9;
const ROT_SMOOTH = 11;
const TARGET = new THREE.Vector3();

function hashPhase(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return (h % 628) / 100;
}

export function AgentAvatar({ definition, runtime }: AgentAvatarProps) {
  const groupRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Group>(null);
  const leftArmRef = useRef<THREE.Mesh>(null);
  const rightArmRef = useRef<THREE.Mesh>(null);
  const headRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const hoverRef = useRef(0);
  const selectedId = useSceneStore((s) => s.selectedAgentId);
  const selectAgent = useSceneStore((s) => s.selectAgent);
  const openChat = useChatStore((s) => s.openChat);
  const isSelected = selectedId === definition.id;
  const phase = useMemo(() => hashPhase(definition.id), [definition.id]);

  const bodyMat = useMemo(
    () =>
      softColor(definition.avatarColor, {
        emissive: definition.avatarColor,
        emissiveIntensity: isSelected ? 0.12 : 0.04,
      }),
    [definition.avatarColor, isSelected],
  );
  const accentMat = useMemo(
    () => softColor(definition.accentColor),
    [definition.accentColor],
  );

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    const [x, , z] = runtime.position;
    TARGET.set(x, 0, z);
    groupRef.current.position.lerp(TARGET, 1 - Math.exp(-POS_SMOOTH * delta));

    groupRef.current.rotation.y = THREE.MathUtils.lerp(
      groupRef.current.rotation.y,
      runtime.rotation,
      1 - Math.exp(-ROT_SMOOTH * delta),
    );

    const t = state.clock.elapsedTime + phase;
    const walking = runtime.status === 'walking';
    const chatting = runtime.status === 'chatting';

    const bob = walking
      ? Math.sin(t * 14) * 0.028
      : chatting
        ? Math.sin(t * 5) * 0.014
        : Math.sin(t * 3.2) * 0.01;

    groupRef.current.position.y = bob;

    if (bodyRef.current) {
      const lean = walking ? Math.sin(t * 14) * 0.06 : chatting ? 0.02 : 0;
      bodyRef.current.rotation.x = THREE.MathUtils.lerp(bodyRef.current.rotation.x, lean, 0.15);
      const sway = walking ? Math.sin(t * 7) * 0.04 : 0;
      bodyRef.current.rotation.z = THREE.MathUtils.lerp(bodyRef.current.rotation.z, sway, 0.12);
    }
    if (leftArmRef.current && rightArmRef.current) {
      const armSwing = walking ? Math.sin(t * 10) * 0.35 : chatting ? Math.sin(t * 4) * 0.12 : 0;
      leftArmRef.current.rotation.x = THREE.MathUtils.lerp(leftArmRef.current.rotation.x, armSwing, 0.2);
      rightArmRef.current.rotation.x = THREE.MathUtils.lerp(rightArmRef.current.rotation.x, -armSwing, 0.2);
    }
    if (headRef.current) {
      const look = chatting ? Math.sin(t * 2.5) * 0.16 : walking ? Math.sin(t * 8) * 0.03 : 0;
      headRef.current.rotation.y = THREE.MathUtils.lerp(headRef.current.rotation.y, look, 0.12);
    }

    if (ringRef.current && isSelected) {
      const pulse = 0.85 + Math.sin(t * 4) * 0.15;
      ringRef.current.scale.setScalar(pulse);
      const mat = ringRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.55 + Math.sin(t * 4) * 0.2;
    }

    hoverRef.current = THREE.MathUtils.lerp(hoverRef.current, 0, 0.1);
    const scale = 1 + hoverRef.current * 0.04;
    if (bodyRef.current) bodyRef.current.scale.setScalar(scale);
  });

  const handleClick = (e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    selectAgent(definition.id);
    openChat(definition.id);
  };

  const handlePointerOver = () => {
    document.body.style.cursor = 'pointer';
    hoverRef.current = 1;
  };

  const status =
    runtime.status === 'chatting'
      ? 'chatting'
      : runtime.status === 'walking'
        ? 'walking'
        : 'idle';

  return (
    <group ref={groupRef} position={definition.spawnPosition} userData={{ blockPan: true }}>
      {isSelected && (
        <>
          <mesh position={[0, 0.012, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.48, 36]} />
            <meshBasicMaterial color={OFFICE_PALETTE.selectionGlow} transparent opacity={0.22} />
          </mesh>
          <mesh
            ref={ringRef}
            position={[0, 0.018, 0]}
            rotation={[-Math.PI / 2, 0, 0]}
          >
            <ringGeometry args={[0.3, 0.38, 36]} />
            <meshBasicMaterial color={OFFICE_PALETTE.terracottaLight} transparent opacity={0.75} />
          </mesh>
        </>
      )}

      <group
        ref={bodyRef}
        onClick={handleClick}
        onPointerOver={handlePointerOver}
        onPointerOut={() => {
          document.body.style.cursor = 'default';
          hoverRef.current = 0;
        }}
      >
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.008, 0]}>
          <circleGeometry args={[0.22, 20]} />
          <meshBasicMaterial color="#1a2820" transparent opacity={0.2} />
        </mesh>

        <mesh position={[0, 0.3, 0]} castShadow material={bodyMat}>
          <capsuleGeometry args={[0.11, 0.2, 6, 10]} />
        </mesh>
        <mesh ref={headRef} position={[0, 0.54, 0]} castShadow material={accentMat}>
          <sphereGeometry args={[0.12, 10, 8]} />
        </mesh>
        <mesh ref={leftArmRef} position={[-0.12, 0.33, 0]} castShadow material={accentMat}>
          <capsuleGeometry args={[0.03, 0.11, 4, 8]} />
        </mesh>
        <mesh ref={rightArmRef} position={[0.12, 0.33, 0]} castShadow material={accentMat}>
          <capsuleGeometry args={[0.03, 0.11, 4, 8]} />
        </mesh>
        <mesh position={[0, 0.38, 0.13]} material={accentMat}>
          <boxGeometry args={[0.07, 0.07, 0.02]} />
        </mesh>
        {runtime.status === 'chatting' && (
          <mesh position={[0.42, 0.5, 0]} rotation={[0, -0.4, 0.2]}>
            <boxGeometry args={[0.12, 0.08, 0.02]} />
            <meshBasicMaterial color="#faf8f4" transparent opacity={0.9} />
          </mesh>
        )}
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