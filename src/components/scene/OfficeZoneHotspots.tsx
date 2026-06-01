import { Billboard, Text } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useMemo, useRef, useState } from 'react';
import * as THREE from 'three';

type ZoneId = 'hub' | 'lounge' | 'meeting' | 'private';

interface ZoneDef {
  id: ZoneId;
  label: string;
  position: [number, number, number];
  size: [number, number];
  accent: string;
}

const ZONES: ZoneDef[] = [
  {
    id: 'hub',
    label: 'Central Hub',
    position: [0.5, 0.015, 1.05],
    size: [3.2, 2.6],
    accent: '#d4a574',
  },
  {
    id: 'lounge',
    label: 'Coffee Lounge',
    position: [0.0, 0.015, -3.5],
    size: [5.4, 2.9],
    accent: '#9aab9e',
  },
  {
    id: 'meeting',
    label: 'Meeting Area',
    position: [-4.3, 0.015, 0.05],
    size: [2.7, 2.4],
    accent: '#c8ccd0',
  },
  {
    id: 'private',
    label: 'Private Desk',
    position: [5.1, 0.015, 1.9],
    size: [2.2, 2.2],
    accent: '#8fa38c',
  },
];

export function OfficeZoneHotspots() {
  const [hovered, setHovered] = useState<ZoneId | null>(null);
  const ringsRef = useRef<Record<string, THREE.Mesh | null>>({});
  const labels = useMemo(
    () => Object.fromEntries(ZONES.map((z) => [z.id, z.label])),
    [],
  );

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    for (const zone of ZONES) {
      const mesh = ringsRef.current[zone.id];
      if (!mesh) continue;
      const active = hovered === zone.id ? 1 : 0;
      const pulse = 1 + Math.sin(t * 3.5) * 0.06 * active;
      mesh.scale.set(pulse, pulse, pulse);
      const mat = mesh.material as THREE.MeshBasicMaterial;
      mat.opacity = active ? 0.35 + Math.sin(t * 3.5) * 0.12 : 0.1;
    }
  });

  return (
    <group>
      {ZONES.map((zone) => (
        <group key={zone.id} position={zone.position}>
          <mesh
            rotation={[-Math.PI / 2, 0, 0]}
            onPointerOver={(e) => {
              e.stopPropagation();
              setHovered(zone.id);
              document.body.style.cursor = 'pointer';
            }}
            onPointerOut={() => {
              setHovered((current) => (current === zone.id ? null : current));
              document.body.style.cursor = 'default';
            }}
          >
            <planeGeometry args={zone.size} />
            <meshBasicMaterial color={zone.accent} transparent opacity={hovered === zone.id ? 0.1 : 0.02} />
          </mesh>

          <mesh
            ref={(el) => {
              ringsRef.current[zone.id] = el;
            }}
            rotation={[-Math.PI / 2, 0, 0]}
          >
            <ringGeometry args={[0.44, 0.56, 32]} />
            <meshBasicMaterial color={zone.accent} transparent opacity={0.1} />
          </mesh>

          {hovered === zone.id && (
            <Billboard position={[0, 0.7, 0]} follow lockX lockZ>
              <group>
                <mesh position={[0, 0.04, -0.01]}>
                  <planeGeometry args={[1.2, 0.28]} />
                  <meshBasicMaterial color="#21342b" transparent opacity={0.72} />
                </mesh>
                <Text
                  fontSize={0.09}
                  color="#f5f3ef"
                  anchorX="center"
                  anchorY="middle"
                  outlineWidth={0.008}
                  outlineColor="#1f2f27"
                >
                  {labels[zone.id]}
                </Text>
              </group>
            </Billboard>
          )}
        </group>
      ))}
    </group>
  );
}
