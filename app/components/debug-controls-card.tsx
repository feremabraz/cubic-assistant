"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Toggle } from "@/components/ui/toggle";
import {
	isAIThinkingAtom,
	isWireframeAtom,
	showGizmoAtom,
	showMeasurementsAtom,
	showResponseDebugAtom,
	showUnitExplanationAtom,
} from "@/store/atoms";
import { useAtom } from "jotai";
import { Axis3d, Grid2x2, Info, Ruler } from "lucide-react";

export function DebugControlsCard() {
	const [isWireframe, setIsWireframe] = useAtom(isWireframeAtom);
	const [showGizmo, setShowGizmo] = useAtom(showGizmoAtom);
	const [showMeasurements, setShowMeasurements] = useAtom(showMeasurementsAtom);
	const [showUnitExplanation, setShowUnitExplanation] = useAtom(
		showUnitExplanationAtom,
	);
	const [isAIThinking, setIsAIThinking] = useAtom(isAIThinkingAtom);
	const [showResponseDebug, setShowResponseDebug] = useAtom(
		showResponseDebugAtom,
	);

	return (
		<Card className="w-64 bg-neutral-800 text-gray-200">
			<CardHeader>
				<CardTitle>Debug Controls</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="flex items-center space-x-2">
					<Toggle
						variant="outline"
						className="text-white hover:text-black data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
						pressed={isWireframe}
						onPressedChange={setIsWireframe}
					>
						<Grid2x2 className={`h-4 w-4 ${isWireframe ? "text-black" : ""}`} />
					</Toggle>
					<Label htmlFor="wireframe" className="text-gray-200">
						Wireframe Mode
					</Label>
				</div>
				<div className="flex items-center space-x-2 mt-2">
					<Toggle
						variant="outline"
						className="text-white hover:text-black data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
						pressed={showGizmo}
						onPressedChange={setShowGizmo}
					>
						<Axis3d className={`h-4 w-4 ${showGizmo ? "text-black" : ""}`} />
					</Toggle>
					<Label htmlFor="gizmo" className="text-gray-200">
						Show Gizmo
					</Label>
				</div>
				<div className="flex items-center space-x-2 mt-2">
					<Toggle
						variant="outline"
						className="text-white hover:text-black data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
						pressed={showMeasurements}
						onPressedChange={setShowMeasurements}
					>
						<Ruler
							className={`h-4 w-4 ${showMeasurements ? "text-black" : ""}`}
						/>
					</Toggle>
					<Label htmlFor="measurements" className="text-gray-200">
						Show Measurements
					</Label>
				</div>
				<div className="flex items-center space-x-2 mt-2">
					<Toggle
						variant="outline"
						className="text-white hover:text-black data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
						pressed={showUnitExplanation}
						onPressedChange={setShowUnitExplanation}
					>
						<Info
							className={`h-4 w-4 ${showUnitExplanation ? "text-black" : ""}`}
						/>
					</Toggle>
					<Label htmlFor="unitExplanation" className="text-gray-200">
						Show Unit Explanation
					</Label>
				</div>
				<div className="flex items-center space-x-2 mt-4 p-2 rounded bg-neutral-700">
					<Toggle
						variant="outline"
						className="text-white hover:text-black data-[state=on]:bg-yellow-500 data-[state=on]:text-black"
						pressed={isAIThinking}
						onPressedChange={setIsAIThinking}
					>
						<div
							className={`h-4 w-4 rounded-full ${
								isAIThinking ? "bg-yellow-500" : "bg-gray-500"
							}`}
						/>
					</Toggle>
					<Label htmlFor="thinking" className="text-gray-200 font-medium">
						{isAIThinking ? "AI Thinking (ON)" : "AI Thinking (OFF)"}
					</Label>
				</div>
				<div className="flex items-center space-x-2 mt-2">
					<Toggle
						variant="outline"
						className="text-white hover:text-black data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
						pressed={showResponseDebug}
						onPressedChange={setShowResponseDebug}
					>
						<div
							className={`h-4 w-4 rounded-sm ${
								showResponseDebug ? "bg-green-500" : "bg-gray-500"
							}`}
						/>
					</Toggle>
					<Label htmlFor="responseDebug" className="text-gray-200">
						Show Response Debug
					</Label>
				</div>
			</CardContent>
		</Card>
	);
}
