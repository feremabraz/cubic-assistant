"use client";

import { isAIThinkingAtom } from "@/store/atoms";
import { useFrame } from "@react-three/fiber";
import { useAtomValue } from "jotai";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import type { Mesh } from "three";

export function ThinkingIndicator() {
	const isAIThinking = useAtomValue(isAIThinkingAtom);
	const cubeRef = useRef<Mesh | null>(null);

	// Log when thinking state changes
	useEffect(() => {
		console.log("Thinking indicator - thinking state:", isAIThinking);
	}, [isAIThinking]);

	// Animation properties
	useFrame((state) => {
		if (!cubeRef.current) return;

		const t = state.clock.getElapsedTime();

		// Always update position and rotation for debugging
		cubeRef.current.position.y = 4 + Math.sin(t * 2) * 0.1;
		cubeRef.current.rotation.y = t * 0.5;
		cubeRef.current.rotation.x = Math.sin(t * 0.5) * 0.2;

		// Update visibility and material properties
		cubeRef.current.visible = isAIThinking;

		// Update material properties for better visibility
		if (cubeRef.current.material instanceof THREE.MeshStandardMaterial) {
			cubeRef.current.material.emissiveIntensity = 5 + Math.sin(t * 3) * 2;
		}
	});

	// Always render the mesh, but control visibility with the visible property
	return (
		<mesh
			ref={cubeRef}
			position={[0, 4, 0]} // Position above the character's head
			scale={[0.5, 0.5, 0.5]} // Larger size for better visibility
			visible={isAIThinking} // Initial visibility based on thinking state
		>
			<boxGeometry args={[1, 1, 1]} />
			<meshStandardMaterial
				color="#ffcc00"
				emissive="#ffcc00"
				emissiveIntensity={10}
				toneMapped={false}
			/>
		</mesh>
	);
}
