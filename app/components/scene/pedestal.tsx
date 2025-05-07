export function Pedestal() {
	return (
		<mesh position={[0, -0.25, 0]} receiveShadow>
			<boxGeometry args={[2, 0.5, 2]} />
			<meshStandardMaterial color="#2a2a2a" roughness={0.8} metalness={0.2} />
		</mesh>
	);
}
