export function OfficeAmbientZones() {
  return (
    <group>
      {[
        [-2.2, 1.4, -4.75],
        [0.5, 1.5, -4.15],
        [2.4, 1.35, -3.75],
        [-4.1, 1.2, 0.2],
        [5.0, 1.3, 1.9],
        [0.5, 1.0, 1.0],
      ].map(([x, y, z], i) => (
        <pointLight
          key={i}
          position={[x, y, z]}
          intensity={i < 3 ? 0.28 : 0.18}
          color="#ffedb8"
          distance={4.5}
          decay={2}
        />
      ))}
    </group>
  );
}
