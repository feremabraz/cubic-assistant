export function Floor() {
	return (
		<mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} receiveShadow>
			<planeGeometry args={[20, 20]} />
			<meshStandardMaterial color="#2a2a2a" roughness={0.8} metalness={0.2} />
		</mesh>
	);
}
