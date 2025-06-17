"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Toggle } from "@/components/ui/toggle";
import {
	type Expression,
	expressionAtom,
	isTalkingAtom,
	isWalkingAtom,
	lookBottomAtom,
	lookLeftAtom,
	lookRightAtom,
	lookTopAtom,
	pointLeftAtom,
	pointRightAtom,
	reachFrontAtom,
	stretchAtom,
} from "@/store/atoms";
import { useAtom } from "jotai";

export function CharacterControlsCard() {
	const [isTalking, setIsTalking] = useAtom(isTalkingAtom);
	const [isWalking, setIsWalking] = useAtom(isWalkingAtom);
	const [expression, setExpression] = useAtom(expressionAtom);
	const [pointLeft, setPointLeft] = useAtom(pointLeftAtom);
	const [pointRight, setPointRight] = useAtom(pointRightAtom);
	const [stretch, setStretch] = useAtom(stretchAtom);
	const [reachFront, setReachFront] = useAtom(reachFrontAtom);
	const [lookLeft, setLookLeft] = useAtom(lookLeftAtom);
	const [lookRight, setLookRight] = useAtom(lookRightAtom);
	const [lookTop, setLookTop] = useAtom(lookTopAtom);
	const [lookBottom, setLookBottom] = useAtom(lookBottomAtom);

	// Toggle expression
	const toggleExpression = (expr: Expression) => {
		if (expression === expr) {
			setExpression("neutral");
		} else {
			setExpression(expr);
		}
	};

	// Toggle look direction
	const toggleLookDirection = (
		direction: "left" | "right" | "top" | "bottom",
	) => {
		const setters = {
			left: setLookLeft,
			right: setLookRight,
			top: setLookTop,
			bottom: setLookBottom,
		};

		// Get current state
		const currentState = {
			left: lookLeft,
			right: lookRight,
			top: lookTop,
			bottom: lookBottom,
		};

		// If the direction is already active, turn it off
		if (currentState[direction]) {
			setters[direction](false);
		} else {
			// Turn off all directions first
			for (const key of Object.keys(setters)) {
				setters[key as keyof typeof setters](false);
			}
			// Then turn on the selected direction
			setters[direction](true);
		}
	};

	return (
		<Card className="w-72 bg-neutral-800 text-gray-200 z-10">
			<CardHeader>
				<CardTitle>Character Controls</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				<div>
					<h3 className="text-sm font-semibold mb-2">Actions</h3>
					<div className="flex flex-wrap gap-2 mt-1">
						<Toggle
							variant="outline"
							pressed={isTalking}
							className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
							onPressedChange={setIsTalking}
						>
							Talking
						</Toggle>
						<Toggle
							variant="outline"
							pressed={isWalking}
							className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
							onPressedChange={setIsWalking}
						>
							Walking
						</Toggle>
					</div>
				</div>
				<div>
					<h3 className="text-sm font-semibold mb-2">Expressions</h3>
					<div className="flex flex-wrap gap-2 mt-1">
						{["happy", "sad", "surprised", "angry"].map((expr) => (
							<Toggle
								variant="outline"
								className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
								key={expr}
								pressed={expression === expr}
								onPressedChange={() => toggleExpression(expr as Expression)}
							>
								{expr.charAt(0).toUpperCase() + expr.slice(1)}
							</Toggle>
						))}
					</div>
				</div>
				<div>
					<h3 className="text-sm font-semibold mb-2">Gestures</h3>
					<div className="flex flex-wrap gap-2 mt-1">
						<Toggle
							variant="outline"
							className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
							pressed={pointLeft}
							onPressedChange={setPointLeft}
						>
							PointLeft
						</Toggle>
						<Toggle
							variant="outline"
							className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
							pressed={pointRight}
							onPressedChange={setPointRight}
						>
							PointRight
						</Toggle>
						<Toggle
							variant="outline"
							className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
							pressed={stretch}
							onPressedChange={setStretch}
						>
							Stretch
						</Toggle>
						<Toggle
							variant="outline"
							className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
							pressed={reachFront}
							onPressedChange={setReachFront}
						>
							ReachFront
						</Toggle>
					</div>
				</div>
				<div>
					<h3 className="text-sm font-semibold mb-2">Look Direction</h3>
					<div className="flex flex-wrap gap-2 mt-1">
						<Toggle
							variant="outline"
							className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
							pressed={lookLeft}
							onPressedChange={() => toggleLookDirection("left")}
						>
							Left
						</Toggle>
						<Toggle
							variant="outline"
							className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
							pressed={lookRight}
							onPressedChange={() => toggleLookDirection("right")}
						>
							Right
						</Toggle>
						<Toggle
							variant="outline"
							className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
							pressed={lookTop}
							onPressedChange={() => toggleLookDirection("top")}
						>
							Top
						</Toggle>
						<Toggle
							variant="outline"
							className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
							pressed={lookBottom}
							onPressedChange={() => toggleLookDirection("bottom")}
						>
							Bottom
						</Toggle>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
