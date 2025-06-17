"use client";

import {
	type BodyPose,
	type Expression,
	type Gesture,
	type LookDirection,
	bodyPoseAtom,
	bodyPoseIntensityAtom,
	expressionAtom,
	expressionIntensityAtom,
	gestureAtom,
	isTalkingAtom,
	isWireframeAtom,
	lookDirectionAtom,
} from "@/store/atoms";
import { Edges } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useAtomValue } from "jotai";
import { useMemo, useRef } from "react";
import { BoxGeometry, Euler, MathUtils, Vector3 } from "three";
import type { Group, Mesh } from "three";

function createBeveledBoxGeometry(
	width: number,
	height: number,
	depth: number,
	bevelSize: number,
	bottomScale = 1,
) {
	const geometry = new BoxGeometry(width, height, depth).toNonIndexed();
	const positions = geometry.attributes.position;
	for (let i = 0; i < positions.count; i++) {
		const vector = new Vector3().fromBufferAttribute(positions, i);
		vector.x += Math.sign(vector.x) * bevelSize;
		vector.y += Math.sign(vector.y) * bevelSize;
		vector.z += Math.sign(vector.z) * bevelSize;
		if (vector.y < 0) {
			vector.x *= bottomScale;
			vector.z *= bottomScale;
		}
		positions.setXYZ(i, vector.x, vector.y, vector.z);
	}
	return geometry;
}

interface ExpressionState {
	mouthScale: Vector3;
	mouthPosition: Vector3;
	leftEyebrowRotation: number;
	rightEyebrowRotation: number;
	leftEyebrowPosition: Vector3;
	rightEyebrowPosition: Vector3;
	eyeScale: Vector3;
}

interface BodyPartState {
	position: Vector3;
	rotation: Euler;
	scale: Vector3;
}

interface BodyState {
	leftArm: BodyPartState;
	rightArm: BodyPartState;
	leftLeg: BodyPartState;
	rightLeg: BodyPartState;
	torso: BodyPartState;
}

const expressionStates: Record<Expression, ExpressionState> = {
	neutral: {
		mouthScale: new Vector3(1, 1, 1),
		mouthPosition: new Vector3(0, -0.1, 0.65),
		leftEyebrowRotation: 0,
		rightEyebrowRotation: 0,
		leftEyebrowPosition: new Vector3(-0.2, 0.3, 0.65),
		rightEyebrowPosition: new Vector3(0.2, 0.3, 0.65),
		eyeScale: new Vector3(1, 1, 1),
	},
	happy: {
		mouthScale: new Vector3(1.2, 1.2, 1),
		mouthPosition: new Vector3(0, -0.05, 0.65),
		leftEyebrowRotation: 0.2,
		rightEyebrowRotation: -0.2,
		leftEyebrowPosition: new Vector3(-0.2, 0.32, 0.65),
		rightEyebrowPosition: new Vector3(0.2, 0.32, 0.65),
		eyeScale: new Vector3(1, 0.8, 1),
	},
	sad: {
		mouthScale: new Vector3(0.8, 0.8, 1),
		mouthPosition: new Vector3(0, -0.15, 0.65),
		leftEyebrowRotation: -0.3,
		rightEyebrowRotation: 0.3,
		leftEyebrowPosition: new Vector3(-0.2, 0.28, 0.65),
		rightEyebrowPosition: new Vector3(0.2, 0.28, 0.65),
		eyeScale: new Vector3(1, 0.9, 1),
	},
	surprised: {
		mouthScale: new Vector3(0.8, 1.5, 1),
		mouthPosition: new Vector3(0, -0.1, 0.65),
		leftEyebrowRotation: 0.4,
		rightEyebrowRotation: -0.4,
		leftEyebrowPosition: new Vector3(-0.2, 0.35, 0.65),
		rightEyebrowPosition: new Vector3(0.2, 0.35, 0.65),
		eyeScale: new Vector3(1.2, 1.2, 1),
	},
	angry: {
		mouthScale: new Vector3(0.9, 0.7, 1),
		mouthPosition: new Vector3(0, -0.12, 0.65),
		leftEyebrowRotation: -0.5,
		rightEyebrowRotation: 0.5,
		leftEyebrowPosition: new Vector3(-0.2, 0.25, 0.65),
		rightEyebrowPosition: new Vector3(0.2, 0.25, 0.65),
		eyeScale: new Vector3(0.9, 1.1, 1),
	},
	confused: {
		mouthScale: new Vector3(0.7, 1, 1),
		mouthPosition: new Vector3(0.05, -0.1, 0.65),
		leftEyebrowRotation: 0.3,
		rightEyebrowRotation: -0.1,
		leftEyebrowPosition: new Vector3(-0.2, 0.31, 0.65),
		rightEyebrowPosition: new Vector3(0.2, 0.29, 0.65),
		eyeScale: new Vector3(1, 1, 1),
	},
	excited: {
		mouthScale: new Vector3(1.3, 1.3, 1),
		mouthPosition: new Vector3(0, -0.08, 0.65),
		leftEyebrowRotation: 0.3,
		rightEyebrowRotation: -0.3,
		leftEyebrowPosition: new Vector3(-0.2, 0.33, 0.65),
		rightEyebrowPosition: new Vector3(0.2, 0.33, 0.65),
		eyeScale: new Vector3(1.1, 1.1, 1),
	},
	skeptical: {
		mouthScale: new Vector3(0.8, 0.9, 1),
		mouthPosition: new Vector3(0.05, -0.11, 0.65),
		leftEyebrowRotation: 0,
		rightEyebrowRotation: 0.4,
		leftEyebrowPosition: new Vector3(-0.2, 0.3, 0.65),
		rightEyebrowPosition: new Vector3(0.2, 0.32, 0.65),
		eyeScale: new Vector3(0.9, 1.1, 1),
	},
	smirk: {
		mouthScale: new Vector3(0.9, 1.1, 1),
		mouthPosition: new Vector3(0.08, -0.09, 0.65),
		leftEyebrowRotation: 0,
		rightEyebrowRotation: -0.2,
		leftEyebrowPosition: new Vector3(-0.2, 0.3, 0.65),
		rightEyebrowPosition: new Vector3(0.2, 0.31, 0.65),
		eyeScale: new Vector3(1, 0.9, 1),
	},
};

const bodyStates: Record<BodyPose, BodyState> = {
	standing: {
		leftArm: {
			position: new Vector3(-0.65, 0.45, 0),
			rotation: new Euler(0, 0, 0),
			scale: new Vector3(1, 1, 1),
		},
		rightArm: {
			position: new Vector3(0.65, 0.45, 0),
			rotation: new Euler(0, 0, 0),
			scale: new Vector3(1, 1, 1),
		},
		leftLeg: {
			position: new Vector3(-0.3, -0.5, 0),
			rotation: new Euler(0, 0, 0),
			scale: new Vector3(1, 1, 1),
		},
		rightLeg: {
			position: new Vector3(0.3, -0.5, 0),
			rotation: new Euler(0, 0, 0),
			scale: new Vector3(1, 1, 1),
		},
		torso: {
			position: new Vector3(0, -0.05, 0),
			rotation: new Euler(0, 0, 0),
			scale: new Vector3(1, 1, 1),
		},
	},
	walking: {
		leftArm: {
			position: new Vector3(-0.65, 0.45, 0),
			rotation: new Euler(0.5, 0, 0),
			scale: new Vector3(1, 1, 1),
		},
		rightArm: {
			position: new Vector3(0.65, 0.45, 0),
			rotation: new Euler(-0.5, 0, 0),
			scale: new Vector3(1, 1, 1),
		},
		leftLeg: {
			position: new Vector3(-0.3, -0.5, 0),
			rotation: new Euler(-0.5, 0, 0),
			scale: new Vector3(1, 1, 1),
		},
		rightLeg: {
			position: new Vector3(0.3, -0.5, 0),
			rotation: new Euler(0.5, 0, 0),
			scale: new Vector3(1, 1, 1),
		},
		torso: {
			position: new Vector3(0, -0.05, 0),
			rotation: new Euler(0, 0, 0.1),
			scale: new Vector3(1, 1, 1),
		},
	},
	running: {
		leftArm: {
			position: new Vector3(-0.65, 0.45, 0),
			rotation: new Euler(1, 0, 0),
			scale: new Vector3(1, 1, 1),
		},
		rightArm: {
			position: new Vector3(0.65, 0.45, 0),
			rotation: new Euler(-1, 0, 0),
			scale: new Vector3(1, 1, 1),
		},
		leftLeg: {
			position: new Vector3(-0.3, -0.5, 0),
			rotation: new Euler(-1, 0, 0),
			scale: new Vector3(1, 1, 1),
		},
		rightLeg: {
			position: new Vector3(0.3, -0.5, 0),
			rotation: new Euler(1, 0, 0),
			scale: new Vector3(1, 1, 1),
		},
		torso: {
			position: new Vector3(0, -0.05, 0),
			rotation: new Euler(0.2, 0, 0.2),
			scale: new Vector3(1, 1, 1),
		},
	},
	jumping: {
		leftArm: {
			position: new Vector3(-0.65, 0.45, 0),
			rotation: new Euler(-0.5, 0, -0.5),
			scale: new Vector3(1, 1, 1),
		},
		rightArm: {
			position: new Vector3(0.65, 0.45, 0),
			rotation: new Euler(-0.5, 0, 0.5),
			scale: new Vector3(1, 1, 1),
		},
		leftLeg: {
			position: new Vector3(-0.3, -0.5, 0),
			rotation: new Euler(0.5, 0, 0),
			scale: new Vector3(1, 1, 1),
		},
		rightLeg: {
			position: new Vector3(0.3, -0.5, 0),
			rotation: new Euler(0.5, 0, 0),
			scale: new Vector3(1, 1, 1),
		},
		torso: {
			position: new Vector3(0, 0, 0),
			rotation: new Euler(-0.2, 0, 0),
			scale: new Vector3(1, 1, 1),
		},
	},
};

interface IceCubeCharacterProps {
	position?: [number, number, number];
}

export function IceCubeCharacter({
	position = [0, 0, 0],
}: IceCubeCharacterProps) {
	// biome-ignore lint/style/noNonNullAssertion: These refs are guaranteed to be initialized in the Three.js render cycle
	const group = useRef<Group>(null!);
	// biome-ignore lint/style/noNonNullAssertion: These refs are guaranteed to be initialized in the Three.js render cycle
	const head = useRef<Mesh>(null!);
	// biome-ignore lint/style/noNonNullAssertion: These refs are guaranteed to be initialized in the Three.js render cycle
	const neck = useRef<Mesh>(null!);
	const body = useRef<Group | null>(null);
	// biome-ignore lint/style/noNonNullAssertion: These refs are guaranteed to be initialized in the Three.js render cycle
	const mouth = useRef<Mesh>(null!);
	// biome-ignore lint/style/noNonNullAssertion: These refs are guaranteed to be initialized in the Three.js render cycle
	const leftEyebrow = useRef<Mesh>(null!);
	// biome-ignore lint/style/noNonNullAssertion: These refs are guaranteed to be initialized in the Three.js render cycle
	const rightEyebrow = useRef<Mesh>(null!);
	// biome-ignore lint/style/noNonNullAssertion: These refs are guaranteed to be initialized in the Three.js render cycle
	const leftArm = useRef<Group>(null!);
	// biome-ignore lint/style/noNonNullAssertion: These refs are guaranteed to be initialized in the Three.js render cycle
	const rightArm = useRef<Group>(null!);
	// biome-ignore lint/style/noNonNullAssertion: These refs are guaranteed to be initialized in the Three.js render cycle
	const leftLeg = useRef<Group>(null!);
	// biome-ignore lint/style/noNonNullAssertion: These refs are guaranteed to be initialized in the Three.js render cycle
	const rightLeg = useRef<Group>(null!);
	// biome-ignore lint/style/noNonNullAssertion: These refs are guaranteed to be initialized in the Three.js render cycle
	const leftEye = useRef<Mesh>(null!);
	// biome-ignore lint/style/noNonNullAssertion: These refs are guaranteed to be initialized in the Three.js render cycle
	const rightEye = useRef<Mesh>(null!);

	// Use Jotai atoms instead of local state
	const isTalking = useAtomValue(isTalkingAtom);
	const targetExpression = useAtomValue(expressionAtom);
	const expressionIntensity = useAtomValue(expressionIntensityAtom);
	const targetGesture = useAtomValue(gestureAtom);
	const targetLookDirection = useAtomValue(lookDirectionAtom);
	const isWireframe = useAtomValue(isWireframeAtom);
	const bodyPose = useAtomValue(bodyPoseAtom);
	const bodyPoseIntensity = useAtomValue(bodyPoseIntensityAtom);

	// Local refs for animation state
	const currentExpression = useRef<Expression>("neutral");
	const currentGesture = useRef<Gesture>("none");
	const currentLookDirection = useRef<LookDirection>("center");
	const currentBodyPose = useRef<BodyPose>("standing");

	const headGeometry = useMemo(
		() => createBeveledBoxGeometry(1.2, 0.8, 1.2, 0.05, 0.99),
		[],
	);
	const neckGeometry = useMemo(
		() => createBeveledBoxGeometry(0.4, 0.2, 0.4, 0.02, 0.99),
		[],
	);
	const bodyGeometry = useMemo(
		() => createBeveledBoxGeometry(1, 1.1, 0.6, 0.05, 0.97),
		[],
	);
	const limbGeometry = useMemo(
		() => createBeveledBoxGeometry(0.3, 0.8, 0.3, 0.02, 0.95),
		[],
	);
	const hairGeometry = useMemo(
		() => createBeveledBoxGeometry(1.3, 0.3, 1.3, 0.02, 0.99),
		[],
	);

	useFrame((state, delta) => {
		const t = state.clock.getElapsedTime();
		const lerpFactor = 1 - 0.001 ** delta;

		// Blend between neutral and target expression
		const blendedExpressionState = blendExpressions(
			"neutral",
			targetExpression,
			expressionIntensity,
		);

		// Blend between current and target body pose
		const blendedBodyState = blendBodyStates(
			bodyStates[currentBodyPose.current],
			bodyStates[bodyPose],
			bodyPoseIntensity,
		);

		// Apply blended facial features
		applyFacialFeatures(blendedExpressionState, lerpFactor);

		// Apply blended body pose
		applyBodyPose(blendedBodyState, lerpFactor);

		// Apply talking animation
		if (isTalking) {
			mouth.current.scale.y *= 1 + Math.sin(t * 15) * 0.2;
		}

		// Gesture animations
		applyGestureAnimation(targetGesture, lerpFactor, t);

		// Eye movement animation
		applyEyeMovement(targetLookDirection, lerpFactor);

		// Apply walking animation
		if (bodyPose === "walking") {
			const walkingSpeed = 5;
			const legRotation = Math.sin(t * walkingSpeed) * 0.5;
			const armRotation = Math.sin(t * walkingSpeed + Math.PI) * 0.25;
			const bodyRotation = Math.sin(t * walkingSpeed) * 0.05;

			leftLeg.current.rotation.x = legRotation;
			rightLeg.current.rotation.x = -legRotation;
			leftArm.current.rotation.x = armRotation;
			rightArm.current.rotation.x = -armRotation;
			if (body.current) {
				body.current.rotation.z = bodyRotation;
			}

			// Make sure the character bounces up and down while walking
			group.current.position.y =
				Math.abs(Math.sin(t * walkingSpeed * 2)) * 0.1 + position[1];
		} else if (
			currentBodyPose.current === "walking" &&
			bodyPose === "standing"
		) {
			// Reset to standing pose with smooth transition
			leftLeg.current.rotation.x = MathUtils.lerp(
				leftLeg.current.rotation.x,
				0,
				lerpFactor,
			);
			rightLeg.current.rotation.x = MathUtils.lerp(
				rightLeg.current.rotation.x,
				0,
				lerpFactor,
			);
			leftArm.current.rotation.x = MathUtils.lerp(
				leftArm.current.rotation.x,
				0,
				lerpFactor,
			);
			rightArm.current.rotation.x = MathUtils.lerp(
				rightArm.current.rotation.x,
				0,
				lerpFactor,
			);
			if (body.current) {
				body.current.rotation.z = MathUtils.lerp(
					body.current.rotation.z,
					0,
					lerpFactor,
				);
			}
			group.current.position.y = MathUtils.lerp(
				group.current.position.y,
				position[1],
				lerpFactor,
			);
		} else {
			// Maintain idle animation for standing
			leftLeg.current.rotation.x = MathUtils.lerp(
				leftLeg.current.rotation.x,
				0,
				lerpFactor,
			);
			rightLeg.current.rotation.x = MathUtils.lerp(
				rightLeg.current.rotation.x,
				0,
				lerpFactor,
			);
			leftArm.current.rotation.x =
				MathUtils.lerp(leftArm.current.rotation.x, 0, lerpFactor * 0.5) +
				Math.sin(t * 2) * 0.015;
			rightArm.current.rotation.x =
				MathUtils.lerp(rightArm.current.rotation.x, 0, lerpFactor * 0.5) +
				Math.sin(t * 2 + Math.PI) * 0.015;
			if (body.current) {
				body.current.rotation.z = MathUtils.lerp(
					body.current.rotation.z,
					0,
					lerpFactor,
				);
			}
			group.current.position.y = position[1];
		}

		// Update current states
		currentExpression.current = targetExpression;
		currentGesture.current = targetGesture;
		currentLookDirection.current = targetLookDirection;
		currentBodyPose.current = bodyPose;
	});

	const blendExpressions = (
		baseExpression: Expression,
		targetExpression: Expression,
		intensity: number,
	): ExpressionState => {
		const base = expressionStates[baseExpression];
		const target = expressionStates[targetExpression];
		return {
			mouthScale: base.mouthScale.clone().lerp(target.mouthScale, intensity),
			mouthPosition: base.mouthPosition
				.clone()
				.lerp(target.mouthPosition, intensity),
			leftEyebrowRotation: MathUtils.lerp(
				base.leftEyebrowRotation,
				target.leftEyebrowRotation,
				intensity,
			),
			rightEyebrowRotation: MathUtils.lerp(
				base.rightEyebrowRotation,
				target.rightEyebrowRotation,
				intensity,
			),
			leftEyebrowPosition: base.leftEyebrowPosition
				.clone()
				.lerp(target.leftEyebrowPosition, intensity),
			rightEyebrowPosition: base.rightEyebrowPosition
				.clone()
				.lerp(target.rightEyebrowPosition, intensity),
			eyeScale: base.eyeScale.clone().lerp(target.eyeScale, intensity),
		};
	};

	const blendBodyStates = (
		baseState: BodyState,
		targetState: BodyState,
		intensity: number,
	): BodyState => {
		const blendBodyPart = (
			base: BodyPartState,
			target: BodyPartState,
		): BodyPartState => ({
			position: base.position.clone().lerp(target.position, intensity),
			rotation: new Euler().setFromVector3(
				new Vector3(base.rotation.x, base.rotation.y, base.rotation.z).lerp(
					new Vector3(target.rotation.x, target.rotation.y, target.rotation.z),
					intensity,
				),
			),
			scale: base.scale.clone().lerp(target.scale, intensity),
		});

		return {
			leftArm: blendBodyPart(baseState.leftArm, targetState.leftArm),
			rightArm: blendBodyPart(baseState.rightArm, targetState.rightArm),
			leftLeg: blendBodyPart(baseState.leftLeg, targetState.leftLeg),
			rightLeg: blendBodyPart(baseState.rightLeg, targetState.rightLeg),
			torso: blendBodyPart(baseState.torso, targetState.torso),
		};
	};

	const applyFacialFeatures = (state: ExpressionState, lerpFactor: number) => {
		mouth.current.scale.lerp(state.mouthScale, lerpFactor);
		mouth.current.position.lerp(state.mouthPosition, lerpFactor);
		leftEyebrow.current.rotation.z = MathUtils.lerp(
			leftEyebrow.current.rotation.z,
			state.leftEyebrowRotation,
			lerpFactor,
		);
		rightEyebrow.current.rotation.z = MathUtils.lerp(
			rightEyebrow.current.rotation.z,
			state.rightEyebrowRotation,
			lerpFactor,
		);
		leftEyebrow.current.position.lerp(state.leftEyebrowPosition, lerpFactor);
		rightEyebrow.current.position.lerp(state.rightEyebrowPosition, lerpFactor);
		leftEye.current.scale.lerp(state.eyeScale, lerpFactor);
		rightEye.current.scale.lerp(state.eyeScale, lerpFactor);
	};

	const applyBodyPose = (state: BodyState, lerpFactor: number) => {
		const applyBodyPartState = (part: Group | null, state: BodyPartState) => {
			if (!part) return;
			if (
				bodyPose !== "walking" ||
				(part !== leftLeg.current &&
					part !== rightLeg.current &&
					part !== leftArm.current &&
					part !== rightArm.current &&
					part !== body.current)
			) {
				part.position.lerp(state.position, lerpFactor);
				part.rotation.setFromVector3(
					new Vector3().lerpVectors(
						new Vector3(part.rotation.x, part.rotation.y, part.rotation.z),
						new Vector3(state.rotation.x, state.rotation.y, state.rotation.z),
						lerpFactor,
					),
				);
				part.scale.lerp(state.scale, lerpFactor);
			}
		};

		applyBodyPartState(leftArm.current, state.leftArm);
		applyBodyPartState(rightArm.current, state.rightArm);
		applyBodyPartState(leftLeg.current, state.leftLeg);
		applyBodyPartState(rightLeg.current, state.rightLeg);
		applyBodyPartState(body.current, state.torso);
	};

	const applyGestureAnimation = (
		targetGesture: Gesture,
		lerpFactor: number,
		t: number,
	) => {
		const lerpArmRotation = (
			arm: Group,
			targetRotation: { x?: number; y?: number; z?: number },
		) => {
			arm.rotation.x = MathUtils.lerp(
				arm.rotation.x,
				targetRotation.x || 0,
				lerpFactor,
			);
			arm.rotation.y = MathUtils.lerp(
				arm.rotation.y,
				targetRotation.y || 0,
				lerpFactor,
			);
			arm.rotation.z = MathUtils.lerp(
				arm.rotation.z,
				targetRotation.z || 0,
				lerpFactor,
			);
		};

		switch (targetGesture) {
			case "pointLeft":
				lerpArmRotation(leftArm.current, { y: Math.PI / 4, z: -Math.PI / 2 });
				lerpArmRotation(rightArm.current, { x: 0, y: 0, z: 0 });
				break;
			case "pointRight":
				lerpArmRotation(rightArm.current, { y: -Math.PI / 4, z: Math.PI / 2 });
				lerpArmRotation(leftArm.current, { x: 0, y: 0, z: 0 });
				break;
			case "stretch":
				lerpArmRotation(leftArm.current, { z: -Math.PI / 2 });
				lerpArmRotation(rightArm.current, { z: Math.PI / 2 });
				break;
			case "reachFront":
				lerpArmRotation(leftArm.current, { x: -Math.PI / 2, y: 0, z: 0 });
				lerpArmRotation(rightArm.current, { x: -Math.PI / 2, y: 0, z: 0 });
				break;
			default:
				lerpArmRotation(leftArm.current, { x: 0, y: 0, z: 0 });
				lerpArmRotation(rightArm.current, { x: 0, y: 0, z: 0 });
		}

		// Apply standing animation only when no gesture is active
		if (targetGesture === "none") {
			leftArm.current.rotation.x += Math.sin(t * 2) * 0.015;
			rightArm.current.rotation.x += Math.sin(t * 2 + Math.PI) * 0.015;
		}
	};

	const applyEyeMovement = (
		targetLookDirection: LookDirection,
		lerpFactor: number,
	) => {
		const eyeMovementAmount = 0.03;
		const targetLeftEyePosition = new Vector3(-0.2, 0.1, 0.65);
		const targetRightEyePosition = new Vector3(0.2, 0.1, 0.65);

		switch (targetLookDirection) {
			case "left":
				targetLeftEyePosition.x -= eyeMovementAmount;
				targetRightEyePosition.x -= eyeMovementAmount;
				break;
			case "right":
				targetLeftEyePosition.x += eyeMovementAmount;
				targetRightEyePosition.x += eyeMovementAmount;
				break;
			case "top":
				targetLeftEyePosition.y += eyeMovementAmount;
				targetRightEyePosition.y += eyeMovementAmount;
				break;
			case "bottom":
				targetLeftEyePosition.y -= eyeMovementAmount;
				targetRightEyePosition.y -= eyeMovementAmount;
				break;
		}

		leftEye.current.position.lerp(targetLeftEyePosition, lerpFactor);
		rightEye.current.position.lerp(targetRightEyePosition, lerpFactor);
	};

	return (
		<group ref={group} position={position}>
			{/* Head */}
			<group position={[0, 1.15, 0]}>
				<mesh ref={head} castShadow geometry={headGeometry}>
					<meshStandardMaterial
						color="#fec47f"
						roughness={0.8}
						metalness={0.1}
						wireframe={isWireframe}
					/>
					<Edges threshold={15} renderOrder={1} color="#000000" />
				</mesh>

				{/* Hair */}
				<mesh position={[0, 0.55, 0]} castShadow geometry={hairGeometry}>
					<meshStandardMaterial
						color="#804020"
						roughness={0.8}
						metalness={0.1}
						wireframe={isWireframe}
					/>
					<Edges threshold={15} renderOrder={1} color="#000000" />
				</mesh>

				{/* Eyes */}
				<mesh ref={leftEye} position={[-0.2, 0.1, 0.65]}>
					<boxGeometry args={[0.2, 0.2, 0.05]} />
					<meshStandardMaterial color="#1A1C1C" />
				</mesh>
				<mesh ref={rightEye} position={[0.2, 0.1, 0.65]}>
					<boxGeometry args={[0.2, 0.2, 0.05]} />
					<meshStandardMaterial color="#1A1C1C" />
				</mesh>

				{/* Eyebrows */}
				<mesh ref={leftEyebrow} position={[-0.2, 0.3, 0.65]}>
					<boxGeometry args={[0.25, 0.05, 0.05]} />
					<meshStandardMaterial color="#804020" />
				</mesh>
				<mesh ref={rightEyebrow} position={[0.2, 0.3, 0.65]}>
					<boxGeometry args={[0.25, 0.05, 0.05]} />
					<meshStandardMaterial color="#804020" />
				</mesh>

				{/* Mouth */}
				<mesh ref={mouth} position={[0, -0.1, 0.65]}>
					<boxGeometry args={[0.3, 0.1, 0.05]} />
					<meshStandardMaterial color="#1A1C1C" />
				</mesh>
			</group>

			{/* Neck */}
			<mesh
				ref={neck}
				position={[0, 0.6, 0]}
				castShadow
				geometry={neckGeometry}
			>
				<meshStandardMaterial
					color="#fec47f"
					roughness={0.8}
					metalness={0.1}
					wireframe={isWireframe}
				/>
				<Edges threshold={15} renderOrder={1} color="#000000" />
			</mesh>

			{/* Body */}
			<group ref={body} position={[0, 0, 0]}>
				<mesh
					// position={[0, -0.05, 0]} // Position is now relative to the group
					castShadow
					geometry={bodyGeometry}
				>
					<meshStandardMaterial
						color="#935a46"
						roughness={0.8}
						metalness={0.1}
						wireframe={isWireframe}
					/>
					<Edges threshold={15} renderOrder={1} color="#000000" />
				</mesh>
			</group>

			{/* Arms */}
			<group ref={leftArm} position={[-0.65, 0.45, 0]}>
				<mesh castShadow geometry={limbGeometry} position={[0, -0.4, 0]}>
					<meshStandardMaterial
						color="#935a46"
						roughness={0.8}
						wireframe={isWireframe}
					/>
					<Edges threshold={15} renderOrder={1} color="#000000" />
				</mesh>
				{/* Hand section */}
				<mesh position={[0, -0.8, 0]} castShadow>
					<boxGeometry args={[0.3, 0.1, 0.3]} />
					<meshStandardMaterial
						color="#fec47f"
						roughness={0.8}
						wireframe={isWireframe}
					/>
					<Edges threshold={15} renderOrder={1} color="#000000" />
				</mesh>
			</group>
			<group ref={rightArm} position={[0.65, 0.45, 0]}>
				<mesh castShadow geometry={limbGeometry} position={[0, -0.4, 0]}>
					<meshStandardMaterial
						color="#935a46"
						roughness={0.8}
						wireframe={isWireframe}
					/>
					<Edges threshold={15} renderOrder={1} color="#000000" />
				</mesh>
				{/* Hand section */}
				<mesh position={[0, -0.8, 0]} castShadow>
					<boxGeometry args={[0.3, 0.1, 0.3]} />
					<meshStandardMaterial
						color="#fec47f"
						roughness={0.8}
						wireframe={isWireframe}
					/>
					<Edges threshold={15} renderOrder={1} color="#000000" />
				</mesh>
			</group>

			{/* Legs */}
			<group ref={leftLeg} position={[-0.3, -0.5, 0]}>
				<mesh castShadow geometry={limbGeometry} position={[0, -0.4, 0]}>
					<meshStandardMaterial
						color="#935a46"
						roughness={0.8}
						wireframe={isWireframe}
					/>
					<Edges threshold={15} renderOrder={1} color="#000000" />
				</mesh>
				{/* Boot section */}
				<mesh position={[0, -0.8, 0]} castShadow>
					<boxGeometry args={[0.35, 0.1, 0.35]} />
					<meshStandardMaterial
						color="#1A1C1C"
						roughness={0.8}
						wireframe={isWireframe}
					/>
					<Edges threshold={15} renderOrder={1} color="#000000" />
				</mesh>
			</group>
			<group ref={rightLeg} position={[0.3, -0.5, 0]}>
				<mesh castShadow geometry={limbGeometry} position={[0, -0.4, 0]}>
					<meshStandardMaterial
						color="#935a46"
						roughness={0.8}
						wireframe={isWireframe}
					/>
					<Edges threshold={15} renderOrder={1} color="#000000" />
				</mesh>
				{/* Boot section */}
				<mesh position={[0, -0.8, 0]} castShadow>
					<boxGeometry args={[0.35, 0.1, 0.35]} />
					<meshStandardMaterial
						color="#1A1C1C"
						roughness={0.8}
						wireframe={isWireframe}
					/>
					<Edges threshold={15} renderOrder={1} color="#000000" />
				</mesh>
			</group>
		</group>
	);
}

IceCubeCharacter.displayName = "IceCubeCharacter";
