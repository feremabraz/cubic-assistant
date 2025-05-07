export function Lighting() {
	return (
		<>
			{/* Key Light */}
			<directionalLight
				position={[5, 5, 5]}
				intensity={1}
				castShadow
				shadow-mapSize-width={2048}
				shadow-mapSize-height={2048}
			/>

			{/* Fill Light */}
			<directionalLight
				position={[-5, 3, -5]}
				intensity={0.5}
				color="#B9D5FF"
			/>

			{/* Back Light */}
			<directionalLight position={[0, 3, -5]} intensity={0.7} color="#FFD5D5" />

			{/* Ambient Light */}
			<ambientLight intensity={0.2} />
		</>
	);
}
