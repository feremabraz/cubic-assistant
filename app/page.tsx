"use client";
import {
	isAIThinkingAtom,
	isAdminModeEnabledAtom,
	showAdminUnlockCardAtom,
	showGizmoAtom,
	showMeasurementsAtom,
	showUnitExplanationAtom,
} from "@/lib/atoms";
import { OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import { useAtomValue } from "jotai";
import { AdminUnlockCard } from "./components/admin-unlock-card";
import { AIAssistantCard } from "./components/ai-assistant-card";
import { CharacterController } from "./components/character-controller";
import { CharacterControlsCard } from "./components/character-controls-card";
import { ChatInputCard } from "./components/chat-input-card";
import { DebugControlsCard } from "./components/debug-controls-card";
import { IceCubeCharacter } from "./components/ice-cube-character";
import { KeyboardShortcuts } from "./components/keyboard-shortcuts";
import { BackdropWalls } from "./components/scene/backdrop-walls";
import { Floor } from "./components/scene/floor";
import { Gizmo } from "./components/scene/gizmo";
import { Lighting } from "./components/scene/lighting";
import { Measurements } from "./components/scene/measurements";
import { Pedestal } from "./components/scene/pedestal";
import { ThinkingIndicator } from "./components/scene/thinking-indicator-simple";
import { UnitExplanationCard } from "./components/unit-explanation-card";

export default function Scene() {
	// Use Jotai atoms for read-only values
	const showGizmo = useAtomValue(showGizmoAtom);
	const showMeasurements = useAtomValue(showMeasurementsAtom);
	const showUnitExplanation = useAtomValue(showUnitExplanationAtom);
	const isAdminModeEnabled = useAtomValue(isAdminModeEnabledAtom);
	const showAdminUnlockCard = useAtomValue(showAdminUnlockCardAtom);
	const isAIThinking = useAtomValue(isAIThinkingAtom);

	return (
		<div className="w-full h-screen bg-[#1a1a1a] flex">
			<KeyboardShortcuts />
			<CharacterController />
			{showAdminUnlockCard && (
				<div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20">
					<AdminUnlockCard />
				</div>
			)}
			{isAdminModeEnabled && (
				<div className="absolute top-4 left-4 z-10">
					<CharacterControlsCard />
				</div>
			)}
			<div className="flex-1">
				<Canvas shadows camera={{ position: [5, 2, 8], fov: 50 }}>
					<color attach="background" args={["#1a1a1a"]} />
					<fog attach="fog" args={["#1a1a1a", 10, 20]} />
					<Lighting />
					<BackdropWalls />
					<Floor />
					<Pedestal />
					<IceCubeCharacter position={[0, 1.35, 0]} />
					{isAIThinking && <ThinkingIndicator />}
					{showGizmo && <Gizmo size={4 / 3} position={[-3, 0, 0]} />}
					{showMeasurements && <Measurements />}
					<EffectComposer>
						<Bloom
							luminanceThreshold={0.1}
							luminanceSmoothing={0.9}
							intensity={3.0}
						/>
					</EffectComposer>
					<OrbitControls
						minPolarAngle={Math.PI / 6}
						maxPolarAngle={Math.PI / 2.5}
						enableZoom={true}
						enablePan={false}
					/>
				</Canvas>
			</div>
			{isAdminModeEnabled && (
				<div className="absolute top-4 right-4">
					<DebugControlsCard />
				</div>
			)}
			{isAdminModeEnabled && showUnitExplanation && (
				<div className="absolute bottom-4 left-4">
					<UnitExplanationCard />
				</div>
			)}
			<div className="absolute bottom-4 w-full flex justify-center">
				<AIAssistantCard />
			</div>
			{isAdminModeEnabled && (
				<div className="absolute bottom-4 right-4">
					<ChatInputCard />
				</div>
			)}
		</div>
	);
}
