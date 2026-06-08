import { useFrame } from '@react-three/fiber';
import { useRef, useMemo } from 'react';
import * as THREE from 'three';
import type { AgentDefinition, AgentRuntimeState, AgentStatus } from '@/types/agent';
import { OFFICE_PALETTE } from '@/config/agents.config';
import { getAgentChatAnchor, getAgentPuffScale, isNearChatAnchor } from '@/config/agentZones.config';
import { useSceneStore } from '@/stores/scene.store';
import { useChatStore } from '@/stores/chat.store';
import { AgentLabel } from './AgentLabel';
import { AgentRoleLogo } from './AgentRoleLogo';
import { AVATAR_SCALE } from './avatarConstants';
import {
  AgentArmSegment,
  AgentFace,
  AgentShinFoot,
  AgentThigh,
  AgentTorso,
  AVATAR_PANTS,
  AVATAR_SHOE,
  AVATAR_SKIN,
  AVATAR_SOLE,
  type HairVariant,
} from './AgentAvatarVisuals';
import {
  easeSitBlend,
  getSeatStyle,
  getSitPoseTargets,
  lerpSitValue,
  LEG_HIP_STAND_Y,
} from './agentSitPose';
import {
  easeCoffeeBlend,
  getCoffeePoseFrame,
  lerpCoffeeValue,
} from './agentCoffeePose';
import { getWalkPoseFrame } from './agentWalkPose';
import { CoffeeHandCup } from './CoffeeHandCup';
import { ConversationSpeechBubble } from './ConversationSpeechBubble';
import { OUTLINE_COLOR, softColor } from '../materials';
import { clampToWalkable } from '@/utils/collision';
import { lerpAngle } from '@/utils/movement';
import { useConversationVisualsStore } from '@/stores/conversationVisuals.store';
import { useAgentsStore } from '@/stores/agents.store';

interface AgentAvatarProps {
  definition: AgentDefinition;
  runtime: AgentRuntimeState;
}

const POS_SMOOTH = 9;
const ROT_SMOOTH_WALK = 16;
const ROT_SMOOTH_IDLE = 10;
const TARGET = new THREE.Vector3();
const EYE_MAT = softColor('#1e2428');
const EYE_WHITE = softColor('#f7f4ef', { roughness: 0.92 });
const CHEEK_MAT = softColor('#e8a898', { roughness: 0.98, emissive: '#e8a898', emissiveIntensity: 0.08 });
const NOSE_MAT = softColor('#c89080', { roughness: 0.95 });

function hashPhase(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return (h % 628) / 100;
}

function hashVariant(id: string): HairVariant {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 17 + id.charCodeAt(i)) >>> 0;
  return (h % 4) as HairVariant;
}

function lerpArmRotation(
  arm: THREE.Group,
  target: { rotX: number; rotY: number; rotZ: number },
  rate: number,
): void {
  arm.rotation.x = THREE.MathUtils.lerp(arm.rotation.x, target.rotX, rate);
  arm.rotation.y = THREE.MathUtils.lerp(arm.rotation.y, target.rotY, rate);
  arm.rotation.z = THREE.MathUtils.lerp(arm.rotation.z, target.rotZ, rate);
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
  const coffeeBlendRef = useRef(0);
  const walkBlendRef = useRef(0);
  const visualRotRef = useRef<number | null>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const hoverRef = useRef(0);
  const selectedId = useSceneStore((s) => s.selectedAgentId);
  const focusOnAgent = useSceneStore((s) => s.focusOnAgent);
  const openChat = useChatStore((s) => s.openChat);
  const peerPartnerId = useConversationVisualsStore((s) => s.getPeerPartner(definition.id));
  const userChatAgentId = useConversationVisualsStore((s) => s.userChatAgentId);
  const userChatStreaming = useConversationVisualsStore((s) => s.userChatStreaming);
  const peerPosition = useAgentsStore((s) =>
    peerPartnerId ? s.runtime[peerPartnerId]?.position : undefined,
  );
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
        emissiveIntensity: isSelected ? 0.12 : 0.05,
        roughness: 0.82,
      }),
    [definition.avatarColor, isSelected],
  );
  const hairMat = useMemo(() => softColor(definition.accentColor, { roughness: 0.86 }), [definition.accentColor]);
  const accentMat = useMemo(
    () => softColor(definition.accentColor, { roughness: 0.84, metalness: 0.04 }),
    [definition.accentColor],
  );
  const skinMat = useMemo(() => softColor(AVATAR_SKIN, { roughness: 0.9 }), []);
  const pantsMat = useMemo(() => softColor(AVATAR_PANTS, { roughness: 0.93 }), []);
  const shoeMat = useMemo(() => softColor(AVATAR_SHOE, { roughness: 0.8 }), []);
  const soleMat = useMemo(() => softColor(AVATAR_SOLE, { roughness: 0.95 }), []);
  const eyeWhiteMat = useMemo(() => EYE_WHITE.clone(), []);
  const eyeMat = useMemo(() => EYE_MAT.clone(), []);
  const cheekMat = useMemo(() => CHEEK_MAT.clone(), []);
  const noseMat = useMemo(() => NOSE_MAT.clone(), []);

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    const [x, , z] = runtime.position;
    const walking = runtime.status === 'walking';
    const chatting = runtime.status === 'chatting';
    const socialChat = Boolean(peerPartnerId) && !chatting;

    if (walking) {
      groupRef.current.position.x = x;
      groupRef.current.position.z = z;
    } else {
      TARGET.set(x, 0, z);
      groupRef.current.position.lerp(TARGET, 1 - Math.exp(-POS_SMOOTH * delta));
      if (!chatting) {
        const clamped = clampToWalkable([
          groupRef.current.position.x,
          groupRef.current.position.y,
          groupRef.current.position.z,
        ]);
        groupRef.current.position.x = clamped[0];
        groupRef.current.position.z = clamped[2];
      }
    }

    walkBlendRef.current = THREE.MathUtils.lerp(
      walkBlendRef.current,
      walking ? 1 : 0,
      1 - Math.exp(-(walking ? 10 : 7) * delta),
    );

    const rotSmooth = walking ? ROT_SMOOTH_WALK : socialChat ? 8 : ROT_SMOOTH_IDLE;
    if (visualRotRef.current === null) {
      visualRotRef.current = runtime.rotation;
    }

    let targetRotation = runtime.rotation;
    if (socialChat && peerPosition) {
      targetRotation = Math.atan2(peerPosition[0] - x, peerPosition[2] - z);
    }

    visualRotRef.current = lerpAngle(
      visualRotRef.current,
      targetRotation,
      1 - Math.exp(-rotSmooth * delta),
    );
    groupRef.current.rotation.y = visualRotRef.current;

    const t = state.clock.elapsedTime + phase;
    const atCoffee = runtime.status === 'coffee';
    const walkPose = getWalkPoseFrame(t, phase, runtime.moveSpeed, walkBlendRef.current);
    const walkingAnim = walkPose.walkBlend > 0.02;
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

    const coffeeTarget = atCoffee ? 1 : 0;
    coffeeBlendRef.current = THREE.MathUtils.lerp(
      coffeeBlendRef.current,
      coffeeTarget,
      1 - Math.exp(-5.5 * delta),
    );
    const coffeeEase = easeCoffeeBlend(coffeeBlendRef.current);
    const coffeePose = atCoffee ? getCoffeePoseFrame(state.clock.elapsedTime, phase) : null;

    const standBob = walkingAnim
      ? walkPose.bodyBob
      : chatting
        ? Math.sin(t * 5) * 0.016
        : atCoffee
          ? Math.sin(t * 2.8) * 0.008
          : Math.sin(t * 3.2) * 0.012;

    groupRef.current.position.y = lerpSitValue(standBob, 0, sitEase) + sitPose.groupY * sitEase;

    if (bodyRef.current) {
      bodyRef.current.position.x = THREE.MathUtils.lerp(
        bodyRef.current.position.x,
        walkPose.hipOffsetX * (1 - sitEase),
        0.22,
      );
      bodyRef.current.position.y = lerpSitValue(0, sitPose.bodyY, sitEase);
      const walkLean = walkingAnim && sitEase < 0.5 ? walkPose.bodyLeanX : 0;
      const chatLean = chatting && sitEase > 0.6 ? 0.02 : 0;
      const coffeeLean = coffeePose ? coffeePose.bodyRotX * coffeeEase : 0;
      bodyRef.current.rotation.x = lerpSitValue(
        walkLean + chatLean + coffeeLean,
        sitPose.bodyRotX,
        sitEase,
      );
      const sway = walkingAnim && sitEase < 0.35 ? walkPose.bodySwayZ : 0;
      bodyRef.current.rotation.z = lerpSitValue(sway, sitPose.bodyRotZ, sitEase);
    }

    const idleArm = sitting && !walking ? sitPose.armRotX : 0;
    const idleArmSwing =
      socialChat && sitEase < 0.5
        ? Math.sin(t * 4.5) * 0.12
        : chatting && sitEase > 0.5
          ? Math.sin(t * 4) * 0.14
          : atCoffee
            ? Math.sin(t * 3.5) * 0.08
            : 0;
    const leftArmBase = walkingAnim
      ? lerpSitValue(walkPose.leftArmX, idleArm, sitEase)
      : lerpSitValue(idleArmSwing, idleArm, sitEase);
    const rightArmBase = walkingAnim
      ? lerpSitValue(walkPose.rightArmX, idleArm, sitEase)
      : lerpSitValue(-idleArmSwing, idleArm, sitEase);

    const leftArmTarget = {
      rotX: coffeePose
        ? lerpCoffeeValue(leftArmBase, coffeePose.leftArm.rotX, coffeeEase)
        : leftArmBase,
      rotY: coffeePose ? coffeePose.leftArm.rotY * coffeeEase : 0,
      rotZ: coffeePose
        ? coffeePose.leftArm.rotZ * coffeeEase
        : walkingAnim
          ? walkPose.leftArmZ
          : 0,
    };
    const rightArmTarget = {
      rotX: coffeePose
        ? lerpCoffeeValue(rightArmBase, coffeePose.rightArm.rotX, coffeeEase)
        : rightArmBase,
      rotY: coffeePose ? coffeePose.rightArm.rotY * coffeeEase : 0,
      rotZ: coffeePose
        ? coffeePose.rightArm.rotZ * coffeeEase
        : walkingAnim
          ? walkPose.rightArmZ
          : 0,
    };

    if (leftArmRef.current) {
      lerpArmRotation(leftArmRef.current, leftArmTarget, 0.22);
    }
    if (rightArmRef.current) {
      lerpArmRotation(rightArmRef.current, rightArmTarget, 0.22);
    }

    const leftThighX = walkingAnim
      ? lerpSitValue(walkPose.leftThighX, sitPose.thighRotX, sitEase)
      : lerpSitValue(0, sitPose.thighRotX, sitEase);
    const rightThighX = walkingAnim
      ? lerpSitValue(walkPose.rightThighX, sitPose.thighRotX, sitEase)
      : lerpSitValue(0, sitPose.thighRotX, sitEase);
    const leftShinX = walkingAnim
      ? lerpSitValue(walkPose.leftShinX, sitPose.shinRotX, sitEase)
      : lerpSitValue(0, sitPose.shinRotX, sitEase);
    const rightShinX = walkingAnim
      ? lerpSitValue(walkPose.rightShinX, sitPose.shinRotX, sitEase)
      : lerpSitValue(0, sitPose.shinRotX, sitEase);
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
      leftShinRef.current.rotation.x = THREE.MathUtils.lerp(
        leftShinRef.current.rotation.x,
        leftShinX,
        0.22,
      );
    }
    if (rightShinRef.current) {
      rightShinRef.current.rotation.x = THREE.MathUtils.lerp(
        rightShinRef.current.rotation.x,
        rightShinX,
        0.22,
      );
    }

    if (headRef.current) {
      let peerLookY = 0;
      if (socialChat && peerPosition) {
        const dx = peerPosition[0] - x;
        const dz = peerPosition[2] - z;
        peerLookY = THREE.MathUtils.clamp(
          Math.atan2(dx, dz) - groupRef.current.rotation.y,
          -0.42,
          0.42,
        );
      }

      const lookAmp = chatting ? sitPose.headRotYChat : atCoffee ? 0.02 : walkingAnim ? 0.02 : socialChat ? 0.03 : 0.03;
      const look = Math.sin(t * (chatting ? 2.5 : atCoffee ? 1.6 : socialChat ? 3.2 : walkingAnim ? 5 : 1.8)) * lookAmp;
      const coffeeHeadY = coffeePose ? coffeePose.headRotY * coffeeEase : 0;
      const walkHeadY = walkingAnim ? walkPose.headRotY : 0;
      headRef.current.rotation.y = THREE.MathUtils.lerp(
        headRef.current.rotation.y,
        look + coffeeHeadY + walkHeadY + peerLookY,
        0.12,
      );
      const nod = chatting ? Math.sin(t * 3.2) * 0.06 : 0;
      const coffeeNod = coffeePose ? coffeePose.headRotX * coffeeEase : 0;
      const walkNod = walkingAnim ? walkPose.headRotX : 0;
      headRef.current.rotation.x = lerpSitValue(
        nod + coffeeNod + walkNod,
        sitPose.headRotX + nod * 0.5,
        sitEase,
      );
      headRef.current.rotation.z = THREE.MathUtils.lerp(
        headRef.current.rotation.z,
        coffeePose ? coffeePose.headRotZ * coffeeEase : 0,
        0.14,
      );
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
        : runtime.status === 'coffee-queue'
          ? 'coffee-queue'
          : runtime.status === 'walking'
            ? 'walking'
            : 'idle';

  const socialChat = Boolean(peerPartnerId) && runtime.status !== 'chatting';
  const speechVariant =
    runtime.status === 'chatting' && userChatAgentId === definition.id
      ? userChatStreaming
        ? 'user-streaming'
        : 'user-chat'
      : socialChat
        ? 'peer'
        : null;

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
          <circleGeometry args={[0.22, 24]} />
          <meshBasicMaterial color="#1a2820" transparent opacity={0.2} />
        </mesh>

        <group ref={leftLegRef} position={[-0.058, 0.18, 0]}>
          <AgentThigh pantsMat={pantsMat} />
          <group ref={leftShinRef} position={[0, -0.12, 0]}>
            <AgentShinFoot pantsMat={pantsMat} shoeMat={shoeMat} soleMat={soleMat} />
          </group>
        </group>
        <group ref={rightLegRef} position={[0.058, 0.18, 0]}>
          <AgentThigh pantsMat={pantsMat} />
          <group ref={rightShinRef} position={[0, -0.12, 0]}>
            <AgentShinFoot pantsMat={pantsMat} shoeMat={shoeMat} soleMat={soleMat} />
          </group>
        </group>

        <AgentTorso
          shirtMat={shirtMat}
          pantsMat={pantsMat}
          accentMat={accentMat}
          outlineColor={OUTLINE_COLOR}
        />

        <group ref={leftArmRef} position={[-0.135, 0.38, 0]}>
          <AgentArmSegment
            shirtMat={shirtMat}
            skinMat={skinMat}
            accentMat={accentMat}
            side={-1}
          />
        </group>
        <group ref={rightArmRef} position={[0.135, 0.38, 0]}>
          <AgentArmSegment
            shirtMat={shirtMat}
            skinMat={skinMat}
            accentMat={accentMat}
            side={1}
            handAccessory={runtime.status === 'coffee' ? <CoffeeHandCup /> : undefined}
          />
        </group>

        <group ref={headRef} position={[0, 0.525, 0]}>
          <AgentFace
            skinMat={skinMat}
            hairMat={hairMat}
            eyeWhiteMat={eyeWhiteMat}
            eyeMat={eyeMat}
            cheekMat={cheekMat}
            noseMat={noseMat}
            outlineColor={OUTLINE_COLOR}
            variant={hairVariant}
          />
        </group>

        {speechVariant && <ConversationSpeechBubble variant={speechVariant} />}
      </group>

      <AgentRoleLogo logoUrl={definition.logoUrl} accentColor={definition.accentColor} />

      <AgentLabel
        name={definition.name}
        role={definition.role}
        modelId={definition.modelId}
        status={status}
        socialChat={socialChat}
        accentColor={definition.accentColor}
        selected={isSelected}
      />
      </group>
    </group>
  );
}
