import { Edges } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useRef, useMemo } from 'react';
import * as THREE from 'three';
import type { AgentDefinition, AgentRuntimeState, AgentStatus } from '@/types/agent';
import { OFFICE_PALETTE } from '@/config/agents.config';
import { getAgentChatAnchor, getAgentPuffScale, isNearChatAnchor } from '@/config/agentZones.config';
import { useSceneStore } from '@/stores/scene.store';
import { useChatStore } from '@/stores/chat.store';
import { AgentLabel } from './AgentLabel';
import { AgentChestBadge } from './AgentChestBadge';
import { AVATAR_SCALE } from './avatarConstants';
import {
  easeSitBlend,
  getSeatStyle,
  getSitPoseTargets,
  lerpSitValue,
  LEG_HIP_STAND_Y,
} from './agentSitPose';
import { OUTLINE_COLOR, softColor } from '../materials';

interface AgentAvatarProps {
  definition: AgentDefinition;
  runtime: AgentRuntimeState;
}

const POS_SMOOTH = 9;
const ROT_SMOOTH = 11;
const TARGET = new THREE.Vector3();
const SKIN_TONE = '#e8ceb8';
const PANTS_COLOR = '#4f5d62';
const SHOE_COLOR = '#2e343c';
const EYE_MAT = softColor('#2e343c');
const CHEEK_MAT = softColor('#e8a898', { roughness: 0.98, emissive: '#e8a898', emissiveIntensity: 0.08 });
const NOSE_MAT = softColor('#c89080', { roughness: 0.95 });

function hashPhase(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return (h % 628) / 100;
}

function hashVariant(id: string): 0 | 1 | 2 {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 17 + id.charCodeAt(i)) >>> 0;
  return (h % 3) as 0 | 1 | 2;
}

function SpeechBubble() {
  return (
    <group position={[0.38, 0.58, 0.04]} rotation={[0, -0.35, 0.08]}>
      <mesh>
        <boxGeometry args={[0.16, 0.1, 0.02]} />
        <meshBasicMaterial color="#faf8f4" transparent opacity={0.94} />
      </mesh>
      <mesh position={[-0.06, -0.03, 0]} rotation={[0, 0, 0.55]}>
        <boxGeometry args={[0.04, 0.04, 0.015]} />
        <meshBasicMaterial color="#faf8f4" transparent opacity={0.94} />
      </mesh>
      {[0.04, 0, -0.04].map((x, i) => (
        <mesh key={i} position={[x, 0.01, 0.014]}>
          <sphereGeometry args={[0.012, 6, 6]} />
          <meshBasicMaterial color="#8fa38c" />
        </mesh>
      ))}
    </group>
  );
}

export function AgentAvatar({ definition, runtime }: AgentAvatarProps) {
  const groupRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const leftArmRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);
  const leftLegRef = useRef<THREE.Group>(null);
  const rightLegRef = useRef<THREE.Group>(null);
  const leftShinRef = useRef<THREE.Group>(null);
  const rightShinRef = useRef<THREE.Group>(null);
  const sitBlendRef = useRef(0);
  const ringRef = useRef<THREE.Mesh>(null);
  const hoverRef = useRef(0);
  const selectedId = useSceneStore((s) => s.selectedAgentId);
  const focusOnAgent = useSceneStore((s) => s.focusOnAgent);
  const openChat = useChatStore((s) => s.openChat);
  const isSelected = selectedId === definition.id;
  const phase = useMemo(() => hashPhase(definition.id), [definition.id]);
  const hairVariant = useMemo(() => hashVariant(definition.id), [definition.id]);
  const seatStyle = useMemo(() => getSeatStyle(definition), [definition]);
  const puffScale = useMemo(() => getAgentPuffScale(definition), [definition]);
  const chatAnchor = useMemo(() => getAgentChatAnchor(definition), [definition]);
  const sitPose = useMemo(
    () => getSitPoseTargets(seatStyle, puffScale),
    [seatStyle, puffScale],
  );

  const shirtMat = useMemo(
    () =>
      softColor(definition.avatarColor, {
        emissive: definition.avatarColor,
        emissiveIntensity: isSelected ? 0.1 : 0.03,
      }),
    [definition.avatarColor, isSelected],
  );
  const hairMat = useMemo(() => softColor(definition.accentColor), [definition.accentColor]);
  const accentMat = useMemo(
    () => softColor(definition.accentColor, { roughness: 0.88 }),
    [definition.accentColor],
  );
  const skinMat = useMemo(() => softColor(SKIN_TONE, { roughness: 0.92 }), []);
  const pantsMat = useMemo(() => softColor(PANTS_COLOR, { roughness: 0.94 }), []);
  const shoeMat = useMemo(() => softColor(SHOE_COLOR, { roughness: 0.82 }), []);

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
    const atCoffee = runtime.status === 'coffee';
    const atSeat = isNearChatAnchor(runtime.position, chatAnchor);
    const shouldSit =
      runtime.posture === 'sit' &&
      (runtime.status === 'chatting' || (runtime.status === 'idle' && atSeat));

    const sitTarget = shouldSit ? 1 : 0;
    sitBlendRef.current = THREE.MathUtils.lerp(
      sitBlendRef.current,
      sitTarget,
      1 - Math.exp(-6.5 * delta),
    );
    const sitEase = easeSitBlend(sitBlendRef.current);
    const sitting = sitEase > 0.02;

    const standBob = walking
      ? Math.sin(t * 14) * 0.032
      : chatting
        ? Math.sin(t * 5) * 0.016
        : atCoffee
          ? Math.sin(t * 2.8) * 0.008
          : Math.sin(t * 3.2) * 0.012;

    groupRef.current.position.y = lerpSitValue(standBob, 0, sitEase) + sitPose.groupY * sitEase;

    if (bodyRef.current) {
      bodyRef.current.position.y = lerpSitValue(0, sitPose.bodyY, sitEase);
      const walkLean = walking && sitEase < 0.5 ? Math.sin(t * 14) * 0.05 : 0;
      const chatLean = chatting && sitEase > 0.6 ? 0.02 : 0;
      bodyRef.current.rotation.x = lerpSitValue(
        walkLean + chatLean,
        sitPose.bodyRotX,
        sitEase,
      );
      const sway = walking && sitEase < 0.35 ? Math.sin(t * 7) * 0.035 : 0;
      bodyRef.current.rotation.z = lerpSitValue(sway, sitPose.bodyRotZ, sitEase);
    }

    const armSwing =
      walking && sitEase < 0.25
        ? Math.sin(t * 10) * 0.42
        : chatting && sitEase > 0.5
          ? Math.sin(t * 4) * 0.14
          : atCoffee
            ? Math.sin(t * 3.5) * 0.08
            : 0;
    const legSwing = walking && sitEase < 0.25 ? Math.sin(t * 10) * 0.55 : 0;

    const idleArm = sitting && !walking ? sitPose.armRotX : 0;
    const coffeeArm = atCoffee ? -0.72 + Math.sin(t * 2.6) * 0.06 : 0;
    const leftArmTarget = atCoffee
      ? coffeeArm * 0.35
      : lerpSitValue(armSwing, idleArm, sitEase);
    const rightArmTarget = atCoffee ? coffeeArm : lerpSitValue(-armSwing, idleArm, sitEase);

    if (leftArmRef.current) {
      leftArmRef.current.rotation.x = THREE.MathUtils.lerp(
        leftArmRef.current.rotation.x,
        leftArmTarget,
        0.2,
      );
    }
    if (rightArmRef.current) {
      rightArmRef.current.rotation.x = THREE.MathUtils.lerp(
        rightArmRef.current.rotation.x,
        rightArmTarget,
        0.2,
      );
    }

    const leftThighX = lerpSitValue(-legSwing, sitPose.thighRotX, sitEase);
    const rightThighX = lerpSitValue(legSwing, sitPose.thighRotX, sitEase);
    const shinX = lerpSitValue(0, sitPose.shinRotX, sitEase);
    const spread = sitPose.legSpreadZ * sitEase;
    const legZ = sitPose.legOffsetZ * sitEase;

    const legHipY = lerpSitValue(LEG_HIP_STAND_Y, sitPose.legHipY, sitEase);

    if (leftLegRef.current) {
      leftLegRef.current.position.y = THREE.MathUtils.lerp(leftLegRef.current.position.y, legHipY, 0.2);
      leftLegRef.current.rotation.x = THREE.MathUtils.lerp(leftLegRef.current.rotation.x, leftThighX, 0.22);
      leftLegRef.current.rotation.z = THREE.MathUtils.lerp(leftLegRef.current.rotation.z, spread, 0.2);
      leftLegRef.current.position.z = THREE.MathUtils.lerp(leftLegRef.current.position.z, legZ, 0.2);
    }
    if (rightLegRef.current) {
      rightLegRef.current.position.y = THREE.MathUtils.lerp(rightLegRef.current.position.y, legHipY, 0.2);
      rightLegRef.current.rotation.x = THREE.MathUtils.lerp(rightLegRef.current.rotation.x, rightThighX, 0.22);
      rightLegRef.current.rotation.z = THREE.MathUtils.lerp(
        rightLegRef.current.rotation.z,
        -spread,
        0.2,
      );
      rightLegRef.current.position.z = THREE.MathUtils.lerp(rightLegRef.current.position.z, legZ, 0.2);
    }
    if (leftShinRef.current) {
      leftShinRef.current.rotation.x = THREE.MathUtils.lerp(leftShinRef.current.rotation.x, shinX, 0.22);
    }
    if (rightShinRef.current) {
      rightShinRef.current.rotation.x = THREE.MathUtils.lerp(rightShinRef.current.rotation.x, shinX, 0.22);
    }

    if (headRef.current) {
      const lookAmp = chatting ? sitPose.headRotYChat : atCoffee ? 0.02 : walking ? 0.04 : 0.03;
      const look = Math.sin(t * (chatting ? 2.5 : atCoffee ? 1.6 : walking ? 8 : 1.8)) * lookAmp;
      headRef.current.rotation.y = THREE.MathUtils.lerp(headRef.current.rotation.y, look, 0.12);
      const nod = chatting ? Math.sin(t * 3.2) * 0.06 : atCoffee ? Math.sin(t * 2.2) * 0.04 : 0;
      headRef.current.rotation.x = lerpSitValue(nod, sitPose.headRotX + nod * 0.5, sitEase);
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
    focusOnAgent(definition.id);
    openChat(definition.id);
  };

  const handlePointerOver = () => {
    document.body.style.cursor = 'pointer';
    hoverRef.current = 1;
  };

  const status: AgentStatus =
    runtime.status === 'chatting'
      ? 'chatting'
      : runtime.status === 'coffee'
        ? 'coffee'
        : runtime.status === 'walking'
          ? 'walking'
          : 'idle';

  return (
    <group ref={groupRef} position={runtime.position} userData={{ blockPan: true }}>
      <group scale={AVATAR_SCALE}>
      {isSelected && (
        <>
          <mesh position={[0, 0.012, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.48, 36]} />
            <meshBasicMaterial color={OFFICE_PALETTE.selectionGlow} transparent opacity={0.22} />
          </mesh>
          <mesh ref={ringRef} position={[0, 0.018, 0]} rotation={[-Math.PI / 2, 0, 0]}>
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
          <circleGeometry args={[0.2, 20]} />
          <meshBasicMaterial color="#1a2820" transparent opacity={0.22} />
        </mesh>

        <group ref={leftLegRef} position={[-0.055, 0.18, 0]}>
          <mesh position={[0, -0.06, 0]} castShadow material={pantsMat}>
            <capsuleGeometry args={[0.038, 0.1, 4, 8]} />
          </mesh>
          <group ref={leftShinRef} position={[0, -0.12, 0]}>
            <mesh position={[0, -0.02, 0.02]} castShadow material={pantsMat}>
              <capsuleGeometry args={[0.034, 0.08, 4, 8]} />
            </mesh>
            <mesh position={[0, -0.08, 0.03]} castShadow material={shoeMat}>
              <boxGeometry args={[0.06, 0.04, 0.1]} />
            </mesh>
          </group>
        </group>
        <group ref={rightLegRef} position={[0.055, 0.18, 0]}>
          <mesh position={[0, -0.06, 0]} castShadow material={pantsMat}>
            <capsuleGeometry args={[0.038, 0.1, 4, 8]} />
          </mesh>
          <group ref={rightShinRef} position={[0, -0.12, 0]}>
            <mesh position={[0, -0.02, 0.02]} castShadow material={pantsMat}>
              <capsuleGeometry args={[0.034, 0.08, 4, 8]} />
            </mesh>
            <mesh position={[0, -0.08, 0.03]} castShadow material={shoeMat}>
              <boxGeometry args={[0.06, 0.04, 0.1]} />
            </mesh>
          </group>
        </group>

        <mesh position={[0, 0.34, 0]} castShadow material={shirtMat}>
          <boxGeometry args={[0.2, 0.22, 0.13]} />
          <Edges color={OUTLINE_COLOR} threshold={14} />
        </mesh>
        <mesh position={[0, 0.44, 0.055]} material={accentMat}>
          <boxGeometry args={[0.08, 0.03, 0.02]} />
        </mesh>
        <AgentChestBadge role={definition.role} accentColor={definition.accentColor} />

        <group ref={leftArmRef} position={[-0.13, 0.38, 0]}>
          <mesh position={[0, -0.05, 0]} castShadow material={shirtMat}>
            <capsuleGeometry args={[0.032, 0.1, 4, 8]} />
          </mesh>
          <mesh position={[0, -0.12, 0.01]} castShadow material={skinMat}>
            <sphereGeometry args={[0.034, 7, 6]} />
          </mesh>
        </group>
        <group ref={rightArmRef} position={[0.13, 0.38, 0]}>
          <mesh position={[0, -0.05, 0]} castShadow material={shirtMat}>
            <capsuleGeometry args={[0.032, 0.1, 4, 8]} />
          </mesh>
          <mesh position={[0, -0.12, 0.01]} castShadow material={skinMat}>
            <sphereGeometry args={[0.034, 7, 6]} />
          </mesh>
        </group>

        <group ref={headRef} position={[0, 0.52, 0]}>
          <mesh castShadow material={skinMat}>
            <sphereGeometry args={[0.125, 12, 10]} />
            <Edges color={OUTLINE_COLOR} threshold={12} />
          </mesh>

          {hairVariant === 0 && (
            <mesh position={[0, 0.06, -0.02]} castShadow material={hairMat}>
              <sphereGeometry args={[0.13, 10, 8, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
            </mesh>
          )}
          {hairVariant === 1 && (
            <>
              <mesh position={[0, 0.05, -0.03]} castShadow material={hairMat}>
                <boxGeometry args={[0.24, 0.08, 0.18]} />
              </mesh>
              <mesh position={[0, 0.12, 0.02]} castShadow material={hairMat}>
                <boxGeometry args={[0.06, 0.1, 0.06]} />
              </mesh>
            </>
          )}
          {hairVariant === 2 && (
            <>
              <mesh position={[0, 0.04, -0.04]} castShadow material={hairMat}>
                <boxGeometry args={[0.22, 0.07, 0.16]} />
              </mesh>
              <mesh position={[0.07, 0.02, 0.04]} rotation={[0, 0, -0.35]} castShadow material={hairMat}>
                <boxGeometry args={[0.08, 0.05, 0.06]} />
              </mesh>
            </>
          )}

          <mesh position={[-0.042, 0.01, 0.1]} material={EYE_MAT}>
            <sphereGeometry args={[0.016, 6, 6]} />
          </mesh>
          <mesh position={[0.042, 0.01, 0.1]} material={EYE_MAT}>
            <sphereGeometry args={[0.016, 6, 6]} />
          </mesh>
          <mesh position={[0, -0.03, 0.108]} material={NOSE_MAT}>
            <sphereGeometry args={[0.012, 6, 6]} />
          </mesh>
          <mesh position={[-0.07, -0.01, 0.09]} material={CHEEK_MAT}>
            <sphereGeometry args={[0.014, 6, 6]} />
          </mesh>
          <mesh position={[0.07, -0.01, 0.09]} material={CHEEK_MAT}>
            <sphereGeometry args={[0.014, 6, 6]} />
          </mesh>
        </group>

        {runtime.status === 'chatting' && <SpeechBubble />}

        {runtime.status === 'coffee' && (
          <mesh position={[0.16, 0.36, 0.08]} rotation={[0.15, -0.35, 0]}>
            <cylinderGeometry args={[0.022, 0.026, 0.05, 8]} />
            <meshStandardMaterial color="#f0f2f4" roughness={0.85} />
          </mesh>
        )}
      </group>

      <AgentLabel
        name={definition.name}
        role={definition.role}
        modelId={definition.modelId}
        status={status}
        accentColor={definition.accentColor}
        selected={isSelected}
      />
      </group>
    </group>
  );
}
