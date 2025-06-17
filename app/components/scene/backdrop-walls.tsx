import React from "react";
import { DoubleSide, Euler } from "three";

export function BackdropWalls() {
	const wallMaterial = {
		color: "#2a2a2a",
		roughness: 0.8,
		metalness: 0.2,
		side: DoubleSide,
	};

	return (
		<group>
			{/* Back Wall */}
			<mesh position={[0, 2.5, -10]} receiveShadow>
				<planeGeometry args={[20, 10]} />
				<meshStandardMaterial {...wallMaterial} />
			</mesh>

			{/* Left Wall */}
			<mesh
				position={[-10, 2.5, 0]}
				rotation={[0, Math.PI / 2, 0]}
				receiveShadow
			>
				<planeGeometry args={[20, 10]} />
				<meshStandardMaterial {...wallMaterial} />
			</mesh>

			{/* Right Wall */}
			<mesh
				position={[10, 2.5, 0]}
				rotation={new Euler(0, -Math.PI / 2, 0)}
				receiveShadow
			>
				<planeGeometry args={[20, 10]} />
				<meshStandardMaterial {...wallMaterial} />
			</mesh>

			{/* Front Wall */}
			<mesh position={[0, 2.5, 10]} rotation={[0, Math.PI, 0]} receiveShadow>
				<planeGeometry args={[20, 10]} />
				<meshStandardMaterial {...wallMaterial} />
			</mesh>
		</group>
	);
}
