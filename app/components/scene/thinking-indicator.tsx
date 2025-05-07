"use client";

import { isAIThinkingAtom } from "@/lib/atoms";
import { useFrame } from "@react-three/fiber";
import { useAtomValue } from "jotai";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import type { Mesh } from "three";

export function ThinkingIndicator() {
	const isAIThinking = useAtomValue(isAIThinkingAtom);
	const cubeRef = useRef<Mesh>(null!);

	// Log the thinking state for debugging
	useEffect(() => {
		console.log("AI Thinking state changed:", isAIThinking);
	}, [isAIThinking]);

	// Animation properties
	useFrame((state) => {
		if (!cubeRef.current) return;

		const t = state.clock.getElapsedTime();

		// Use the initial position as a base and only add the animation offset
		// Don't override the base Y position that was set in the JSX
		cubeRef.current.position.y = 3.7 + Math.sin(t * 2) * 0.05;
		cubeRef.current.rotation.y = t * 0.5;
		cubeRef.current.rotation.x = Math.sin(t * 0.5) * 0.2;

		// Update material visibility based on thinking state
		if (cubeRef.current.material instanceof THREE.Material) {
			// When thinking, make fully visible with high emission
			if (isAIThinking) {
				cubeRef.current.visible = true;
				if (cubeRef.current.material instanceof THREE.MeshStandardMaterial) {
					cubeRef.current.material.emissiveIntensity = 10 + Math.sin(t * 3) * 2;
				}
			}
			// When not thinking, hide the cube
			else {
				cubeRef.current.visible = false;
			}
		}
	});

	return (
		<mesh
			ref={cubeRef}
			position={[0, 3.7, 0]} // Much higher above the character's head
			scale={[0.3, 0.3, 0.3]} // Slightly larger for better visibility
			visible={isAIThinking} // Set initial visibility based on thinking state
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
