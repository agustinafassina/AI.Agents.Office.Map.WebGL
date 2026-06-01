export function OfficeAmbientZones() {
  return (
    <group>
      {[
        [-2.2, 1.4, -3.8],
        [0.5, 1.5, -3.2],
        [2.4, 1.35, -2.8],
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
