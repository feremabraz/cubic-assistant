import { Line, Text } from "@react-three/drei";
import React, { useMemo } from "react";
import * as THREE from "three";

interface MeasurementProps {
	start: [number, number, number];
	end: [number, number, number];
	label: string;
	color?: string;
	offset?: [number, number, number];
}

function Measurement({
	start,
	end,
	label,
	color = "white",
	offset = [0, 0, 0],
}: MeasurementProps) {
	const linePoints = useMemo(
		() => [
			new THREE.Vector3(...start).add(new THREE.Vector3(...offset)),
			new THREE.Vector3(...end).add(new THREE.Vector3(...offset)),
		],
		[start, end, offset],
	);

	const midpoint = useMemo(() => {
		return new THREE.Vector3(
			(start[0] + end[0]) / 2 + offset[0],
			(start[1] + end[1]) / 2 + offset[1],
			(start[2] + end[2]) / 2 + offset[2],
		);
	}, [start, end, offset]);

	const distance = useMemo(() => {
		return new THREE.Vector3(...start)
			.distanceTo(new THREE.Vector3(...end))
			.toFixed(2);
	}, [start, end]);

	return (
		<>
			<Line points={linePoints} color={color} lineWidth={2} />
			<Text
				position={midpoint.toArray()}
				fontSize={0.1}
				color={color}
				anchorX="center"
				anchorY="middle"
			>
				{`${label}: ${distance}m`}
			</Text>
		</>
	);
}

export function Measurements() {
	// Move measurements 3 units behind the character
	const baseOffset = [0, 0, 3] as [number, number, number];

	return (
		<group position={baseOffset}>
			{/* Whole character */}
			<Measurement
				start={[0, 0, 0]}
				end={[0, 2.8, 0]}
				label="Height"
				color="yellow"
				offset={[0.5, 0, 0]}
			/>
			<Measurement
				start={[-0.65, 1, 0]}
				end={[0.65, 1, 0]}
				label="Width"
				color="red"
				offset={[0, 0.5, 0]}
			/>
			<Measurement
				start={[0, 1, -0.6]}
				end={[0, 1, 0.6]}
				label="Depth"
				color="blue"
				offset={[0.5, 0.5, 0]}
			/>

			{/* Head */}
			<Measurement
				start={[-0.6, 1.6, 0]}
				end={[0.6, 1.6, 0]}
				label="Head Width"
				color="red"
				offset={[0, 0.7, 0]}
			/>
			<Measurement
				start={[0, 1.2, 0]}
				end={[0, 2, 0]}
				label="Head Height"
				color="yellow"
				offset={[0.7, 0, 0]}
			/>

			{/* Body */}
			<Measurement
				start={[-0.5, 0.05, 0]}
				end={[0.5, 0.05, 0]}
				label="Body Width"
				color="red"
				offset={[0, -0.3, 0]}
			/>
			<Measurement
				start={[0, 0.05, 0]}
				end={[0, 1.25, 0]}
				label="Body Height"
				color="yellow"
				offset={[-0.7, 0, 0]}
			/>

			{/* Arms */}
			<Measurement
				start={[-0.65, 0.35, 0]}
				end={[-0.65, 1.15, 0]}
				label="Arm Length"
				color="green"
				offset={[-0.3, 0, 0]}
			/>

			{/* Legs */}
			<Measurement
				start={[-0.3, -0.5, 0]}
				end={[-0.3, 0.3, 0]}
				label="Leg Length"
				color="purple"
				offset={[-0.5, 0, 0]}
			/>
		</group>
	);
}
