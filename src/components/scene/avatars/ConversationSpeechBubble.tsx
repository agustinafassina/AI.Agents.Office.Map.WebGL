import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

type BubbleVariant = 'user-chat' | 'user-streaming' | 'peer';

interface ConversationSpeechBubbleProps {
  variant: BubbleVariant;
}

export function ConversationSpeechBubble({ variant }: ConversationSpeechBubbleProps) {
  const dotsRef = useRef<THREE.Group>(null);
  const scale = variant === 'peer' ? 0.82 : 1;
  const offsetX = variant === 'peer' ? 0.28 : 0.38;
  const offsetY = variant === 'peer' ? 0.5 : 0.58;

  useFrame((state) => {
    if (!dotsRef.current) return;
    const speed = variant === 'user-streaming' ? 9 : variant === 'user-chat' ? 5.5 : 4.2;
    const t = state.clock.elapsedTime * speed;
    dotsRef.current.children.forEach((dot, i) => {
      dot.position.y = Math.sin(t + i * 1.2) * 0.012;
    });
  });

  const bubbleColor = variant === 'peer' ? '#f2efe8' : '#faf8f4';
  const dotColor = variant === 'user-streaming' ? '#e2725b' : '#8fa38c';

  return (
    <group position={[offsetX * scale, offsetY * scale, 0.04 * scale]} rotation={[0, -0.35, 0.08]} scale={scale}>
      <mesh>
        <boxGeometry args={[0.16, 0.1, 0.02]} />
        <meshBasicMaterial color={bubbleColor} transparent opacity={0.94} />
      </mesh>
      <mesh position={[-0.06, -0.03, 0]} rotation={[0, 0, 0.55]}>
        <boxGeometry args={[0.04, 0.04, 0.015]} />
        <meshBasicMaterial color={bubbleColor} transparent opacity={0.94} />
      </mesh>
      <group ref={dotsRef}>
        {[-0.04, 0, 0.04].map((x, i) => (
          <mesh key={i} position={[x, 0.01, 0.014]}>
            <sphereGeometry args={[0.012, 6, 6]} />
            <meshBasicMaterial color={dotColor} />
          </mesh>
        ))}
      </group>
    </group>
  );
}
