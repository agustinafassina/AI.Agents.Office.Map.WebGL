import { OFFICE_HOTSPOT_ZONES } from '@/config/officeZones';
import { useSceneStore } from '@/stores/scene.store';
import { Billboard, Text } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useMemo, useRef, useState } from 'react';
import * as THREE from 'three';

export function OfficeZoneHotspots() {
  const setView = useSceneStore((s) => s.setView);
  const [hovered, setHovered] = useState<string | null>(null);
  const ringsRef = useRef<Record<string, THREE.Mesh | null>>({});
  const labels = useMemo(
    () => Object.fromEntries(OFFICE_HOTSPOT_ZONES.map((z) => [z.id, z.label])),
    [],
  );

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    for (const zone of OFFICE_HOTSPOT_ZONES) {
      if (!zone.hotspot) continue;
      const mesh = ringsRef.current[zone.id];
      if (!mesh) continue;
      const active = hovered === zone.id ? 1 : 0;
      const pulse = 1 + Math.sin(t * 3.5) * 0.06 * active;
      mesh.scale.set(pulse, pulse, pulse);
      const mat = mesh.material as THREE.MeshBasicMaterial;
      mat.opacity = active ? 0.35 + Math.sin(t * 3.5) * 0.12 : 0.1;
    }
  });

  const focusZone = (id: string) => {
    const zone = OFFICE_HOTSPOT_ZONES.find((z) => z.id === id);
    if (!zone) return;
    setView(zone.pan, zone.zoom);
  };

  return (
    <group>
      {OFFICE_HOTSPOT_ZONES.map((zone) => {
        if (!zone.hotspot) return null;
        const { position, size } = zone.hotspot;
        return (
          <group key={zone.id} position={position}>
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
              onClick={(e) => {
                e.stopPropagation();
                focusZone(zone.id);
              }}
            >
              <planeGeometry args={size} />
              <meshBasicMaterial
                color={zone.accent}
                transparent
                opacity={hovered === zone.id ? 0.1 : 0.02}
              />
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
                    <planeGeometry args={[1.35, 0.28]} />
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
                    {labels[zone.id]} · click to focus
                  </Text>
                </group>
              </Billboard>
            )}
          </group>
        );
      })}
    </group>
  );
}
