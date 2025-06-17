import { Line, Text } from "@react-three/drei";
import React from "react";

interface GizmoProps {
	size?: number;
	position?: [number, number, number];
}

export function Gizmo({ size = 2, position = [0, 0, 0] }: GizmoProps) {
	return (
		<group position={position}>
			{/* X-axis (red) */}
			<Line
				points={[
					[0, 0, 0],
					[size, 0, 0],
				]}
				color="red"
				lineWidth={2}
			/>
			<Text
				position={[size + 0.1, 0, 0]}
				color="red"
				fontSize={0.2}
				anchorX="left"
			>
				X
			</Text>
			<Text
				position={[size / 2, 0.2, 0]}
				color="red"
				fontSize={0.15}
				anchorX="center"
			>
				Width
			</Text>

			{/* Y-axis (yellow) */}
			<Line
				points={[
					[0, 0, 0],
					[0, size, 0],
				]}
				color="yellow"
				lineWidth={2}
			/>
			<Text
				position={[0, size + 0.1, 0]}
				color="yellow"
				fontSize={0.2}
				anchorY="bottom"
			>
				Y
			</Text>
			<Text
				position={[0.2, size / 2, 0]}
				color="yellow"
				fontSize={0.15}
				anchorX="left"
				rotation={[0, 0, Math.PI / 2]}
			>
				Height
			</Text>

			{/* Z-axis (blue) */}
			<Line
				points={[
					[0, 0, 0],
					[0, 0, size],
				]}
				color="blue"
				lineWidth={2}
			/>
			<Text
				position={[0, 0, size + 0.1]}
				color="blue"
				fontSize={0.2}
				anchorX="right"
			>
				Z
			</Text>
			<Text
				position={[0, 0.2, size / 2]}
				color="blue"
				fontSize={0.15}
				anchorX="center"
				rotation={[0, Math.PI / 2, 0]}
			>
				Depth
			</Text>
		</group>
	);
}
